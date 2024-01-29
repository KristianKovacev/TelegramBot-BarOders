require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const rp = require('request-promise');
const bot = new TelegramBot(process.env.TOKEN, { polling: true });


// ! Usare un JSON TEMPORANEO
// Diventerà true solo quando l'utente dovrà loggarsi
var login = false;
// L'utente quando seleziona la classe viene usata questa stringa per concatenare
var classeSelezionata = "";
var classi = ["1", "2", "3", "4", "5"];
var sezioni = [];
var listaProdotti = [];

// L'utente selezionerà la classe quando scrive /start
bot.onText(/\/start/, async function(msg, match) {
    // Faccio la richiesta mandando l'id telegram dell'utente
    // Controllo che l'utente sia loggato
    await doGetRequest('http://localhost:52714/utente/controlloLogin?IdTelegram=' +
        msg.from.id).then(function(response) {
        if (response != null) {
            // Se l'utente è già loggato salto la parte della registrazione
            if (response[0].UtentiTrovati == 1) {
                var opzioniBottoni = ['Ordina', 'Controlla gli ordini'];

                const opts = { reply_markup: getButtonsName(opzioniBottoni), };
                // Mando il messaggio con il testo e i bottoni
                bot.sendMessage(msg.from.id, 'Seleziona:', opts);
                // Se non è registrato lo faccio registrare
            } else {
                const opts = { reply_markup: getButtonsName(classi), };
                // Mando il messaggio con il testo e i bottoni
                bot.sendMessage(msg.from.id, 'Seleziona la classe', opts);
            }
        } else {
            text = "C'è stato un'errore, scrivi /start ❗";
        }
    })
});


// Per evitare di fare delle richieste inutili
// Certe variabili verranno aggiornate solo quando verrà scritto questo update
bot.onText(/\/update/, async function(msg, match) {
    // ! Aggiungere una password

    sezioni = [];
    listaProdotti = [];
    await doGetRequest('http://localhost:52714/sezioni').then(function(response) {
        if (response != null) {
            response.forEach(function(x) {
                sezioni.push(x.Sezione);
            });
        } else {
            text = "C'è stato un'errore, scrivi /start ❗";
        }
    })

    //Chiamo una funzione che mi fa la richiesta, gli passo l'url
    // Questa richiesta mi ritorna i prodotti che possono essere ordinati
    await doGetRequest('http://localhost:52714/prodottiTelegram')
        .then(function(response) {
            if (response != null) {
                // Gli oggetti del mio JSON li metto in un array
                response.forEach(function(product) {
                    listaProdotti.push(product.prodotto);
                });
                listaProdotti.push('Indietro 🔙');

                // Nel caso in cui ci fossero degli errori!
            } else {
                text = "C'è stato un'errore, scrivi /start ❗";
            }
        });
});


bot.on('message', async function(msg) {
    // Dato che ogni volta che l'utente scrive un messaggio entra dentro
    // questa funzione uso le variabili booleane per controllare
    // Se l'utente deve inserire la password login sarà true
    if (login == true) {

        await doGetRequest('http://localhost:52714/utente/login?classe=' +
                classeSelezionata.toLowerCase() + '&password=' + msg.text)
            .then(async function(response) {
                if (response != null) {
                    // Se il login avviene correttamente
                    if (response[0].ClassiTrovate == 1) {
                        // Aggiungo l'utente nel database così la non dovrà più loggarsi
                        body = {
                            Classe: classeSelezionata.toLowerCase(),
                            Id_telegram: msg.from.id,
                            username_telegram: msg.from.username,
                        }

                        await doPostRequest('http://localhost:52714/utente/inserisci', body)
                            .then(function(response) {
                                bot.sendMessage(msg.from.id, 'Sei stato registrato, la prossima volta non dovrai più loggarti!');
                            })

                        var opzioniBottoni = ['Ordina', 'Controlla gli ordini'];

                        const opts = { reply_markup: getButtonsName(opzioniBottoni), };
                        // Mando il messaggio con il testo e i bottoni
                        bot.sendMessage(msg.from.id, 'Seleziona:', opts);
                        // Se non è registrato lo faccio registrare
                    } else {
                        bot.sendMessage(msg.from.id, 'Password o classe sbagliata');
                        const opts = { reply_markup: getButtonsName(classi), };
                        // Mando il messaggio con il testo e i bottoni
                        bot.sendMessage(msg.from.id, 'Seleziona la classe', opts);
                    }
                } else {
                    text = "C'è stato un'errore, scrivi /start ❗";
                }
            })

        // Ripristino le variabili
        classeSelezionata = "";
        login = false;
    }
});

// Callback: risposta di quando preme il bottone
bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    // Action: è il callback_data del bottone cliccato
    const action = callbackQuery.data;
    // Message: contiene tutte le informazioni del messaggio
    const msg = callbackQuery.message;
    var opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        // Per i bottoni
        reply_markup: ""
    };
    // Messaggio che verrà inviato, ha questo testo nel caso ci fosse un errore!
    var text;

    // Seleziona la classe, dopo bisogna selezionare la sezione
    if (classi.includes(action)) {

        text = "Seleziona la sezione";
        opts.reply_markup = getButtonsName(sezioni);

        classeSelezionata += action;

        bot.editMessageText(text, opts);

    } else if (sezioni.includes(action)) {
        // Concatenazione per creare la classe (es. "1a")
        classeSelezionata += action;
        login = true;
        // Password
        text = "Inserisci la password:";
        bot.editMessageText(text, opts);

        // Visualizzo tutti i prodotti disponibili sotto forma di bottone
    } else if (action == 'Ordina') {
        // Stampo la lista dei prodotti sotto forma di bottone
        opts.reply_markup = getButtonsName(listaProdotti);
        text = 'Seleziona il prodotto:';

        bot.editMessageText(text, opts);

    } else if (action == 'Indietro 🔙') {
        // Home
        var opzioniBottoni = ['Ordina', 'Controlla gli ordini'];
        text = 'Seleziona: ';
        opts.reply_markup = getButtonsName(opzioniBottoni);
        bot.editMessageText(text, opts);

        // Visualizzo gli ordini che sono stati fatti
    } else if (action == 'Controlla gli ordini') {
        var listaOrdini = [];
        // Stampo tutti 
        await doGetRequest('http://localhost:52714/ordini?id_telegram=' + msg.chat.id)
            .then(function(response) {
                if (response != null) {
                    // Gli oggetti del mio JSON li metto in un array
                    response.forEach(function(ordine) {
                        listaOrdini.push(ordine.nome_prodotto);
                    });
                    listaOrdini.push('Indietro 🔙');
                    opts.reply_markup = getButtonsName(listaOrdini);
                    text = 'Ecco il tuo ordine:';
                    // Nel caso in cui ci fossero degli errori!
                } else {
                    text = "C'è stato un'errore, scrivi /start ❗";
                }
            });
        bot.editMessageText(text, opts);

        // Se viene selezionato un prodotto
    } else if (listaProdotti.includes(action)) {
        // Faccio una get che manda il prodotto
        let url = 'http://localhost:52714/ordini/inserisci?prodotto=' + action + '&id_telegram=' + msg.chat.id;
        // FAccio l'encode perchè abbia questo l'euro
        let encodedUrl = encodeURI(url);
        await doGetRequest(encodedUrl).then(function(response) {
            console.log("Prodotto aggiunto");
        })
    }
    // Il messaggio precedente viene sostituito da quello nuovo
    // bot.editMessageText(text, opts);
});

function doGetRequest(url) {
    return rp(url)
        .then(function(repos) {
            return JSON.parse(repos);
        })
        .catch(function(err) {
            console.error("Errore: " + err);
        });
}

function doPostRequest(url, datiBody) {
    var options = {
        method: 'POST',
        uri: url,
        body: datiBody,
        json: true
    };

    return rp(options)
        .then(function(repos) {
            return repos;
        })
        .catch(function(err) {
            console.error("Errore: " + err);
        });
}

// Mando la lista dei bottoni che devono essere visualizzati
// mi ritorna una stringa che verrà messa nell'oggetto options
// in reply_markup
function getButtonsName(listOfButtons) {
    return JSON.stringify({
        resize_keyboard: true,
        inline_keyboard: listOfButtons.map((x) => ([{
            text: x,
            callback_data: x,
        }])),
    })
}

