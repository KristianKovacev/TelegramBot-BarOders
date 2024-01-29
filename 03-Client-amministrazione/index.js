var table;

async function returnProductTable(ok) {
    var prodottiTabella = [];
    // Faccio la chiamata per farmi ritornare tutti i prodotti con i loro prezzi
    await fetch('http://localhost:52714/prodotti').then((response) => {
        return response.json();
    }).then((values) => {
        // Dato che la prima riga è occupata dalle intestazioni della tabella devo partire da 1
        var i = 1;
        // Aggiungo ogni prodotto all'array che verrà stampato sulla tabella
        values.forEach(function(value) {
            // Bottoni delete e edit
            let buttons = '<button class="btn btn-primary btn-sm btn-block" id="' + value.nome_prodotto + '" data-toggle="modal" data-target="#modal_change_product" onclick="getIdButton(this.id)"><i class="far fa-edit"></i> Modifica</button> ' +
                '<button class="btn btn-danger btn-sm btn-block mt-2" id="' + value.nome_prodotto + '" data-toggle="modal" data-target="#modal_delete_product" onclick="getIdButton(this.id)"><i class="fas fa-trash"></i> Elimina</button>';
            prodottiTabella.push([i, value.nome_prodotto, value.prezzo, buttons]);
            i++;
        });

        if (ok) {
            table.destroy();
        }
        table = $('#dataTable').DataTable({
            data: prodottiTabella,
            // Lunghezza menu 
            "lengthMenu": [
                [10, 25, 50, 100, -1],
                [10, 25, 50, 100, "All"]
            ]
        });
    }).catch((error) => console.log(error))
}


async function returnClassesTable(ok) {
    var classiTabella = [];
    // Faccio la chiamata per farmi ritornare tutti i prodotti con i loro prezzi
    await fetch('http://localhost:52714/classi').then((response) => {
        return response.json();
    }).then((values) => {
        // Dato che la prima riga è occupata dalle intestazioni della tabella devo partire da 1
        var i = 1;
        // Aggiungo ogni prodotto all'array che verrà stampato sulla tabella
        values.forEach(function(value) {
            // Bottoni delete e edit
            let buttons = '<button class="btn btn-primary btn-sm btn-block" id="' + value.Classi + '" data-toggle="modal" data-target="#modal_change_class" onclick="getIdButton(this.id)"><i class="far fa-edit"></i> Modifica</button> ' +
                '<a href="utenti.html" class="btn btn-info btn-sm btn-block" id="' + value.Classi + '" onclick="getIdButton(this.id)"><i class="far fa-edit"></i> Apri classe</a> ' +
                '<button class="btn btn-danger btn-sm btn-block mt-2" id="' + value.Classi + '" data-toggle="modal" data-target="#modal_delete_class" onclick="getIdButton(this.id)"><i class="fas fa-trash"></i> Elimina</button>';
            classiTabella.push([i, value.Classi, value.Password, value.numeroUtenti, buttons]);
            i++;
        });

        if (ok) {
            table.destroy();
        }
        table = $('#dataTable').DataTable({
            data: classiTabella,
            // Lunghezza menu 
            "lengthMenu": [
                [10, 25, 50, 100, -1],
                [10, 25, 50, 100, "All"]
            ]
        });
    }).catch((error) => console.log(error))
}

async function returnUsersTable(ok, classe) {
    var utentiTabella = [];
    var idClasse = sessionStorage.getItem("id") || classe;
    // Faccio la chiamata per farmi ritornare tutti i prodotti con i loro prezzi
    await fetch('http://localhost:52714/utente?classe=' + idClasse).then((response) => {
        return response.json();
    }).then((values) => {
        // Dato che la prima riga è occupata dalle intestazioni della tabella devo partire da 1
        var i = 1;
        // Aggiungo ogni prodotto all'array che verrà stampato sulla tabella
        values.forEach(function(value) {
            // Bottoni delete e edit
            let buttons = '<button class="btn btn-danger btn-sm btn-block mt-2" id="' + value.Id_telegram + '" data-toggle="modal" data-target="#modal_delete_user" onclick="getIdButton(this.id)"><i class="fas fa-trash"></i> Elimina</button>';

            utentiTabella.push([i, value.username_telegram, value.Id_telegram, buttons]);
            i++;
        });

        if (ok) {
            table.destroy();
        }
        table = $('#dataTable').DataTable({
            data: utentiTabella,
            // Lunghezza menu 
            "lengthMenu": [
                [10, 25, 50, 100, -1],
                [10, 25, 50, 100, "All"]
            ]
        });
    }).catch((error) => console.log(error))
}

// Aggiungo un prodotto
function addProduct() {
    // Prendo i dati inseriti dall'utente
    var product = document.getElementById('idProdotto').value;
    var price = document.getElementById('idPrezzo').value;

    // Le textbox di input non devono essere vuote!!!
    if (product == "" || price == "" || price.length > 5)
        alert("Non hai inserito correttamente i dati!");
    else {
        var data = {
            prodotto: product,
            prezzo: price
        };
        // Chiamata che mi inserisce i dati nel db
        fetch('http://localhost:52714/prodotti/inserisci', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                returnProductTable(true);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    // Pulisco le textbox da quello che ho scritto
    clearPopup();
}

// Cancello le textbox di input, così quando il popup per aggiungere i prodotti
// viene riaperto sono pulite
function clearPopup() {
    // document.getElementsByClassName('inputTextbox').value = "";
    document.getElementById('idProdotto').value = "";
    document.getElementById('idPrezzo').value = "";
    document.getElementById('idProdottoCambiato').value = "";
    document.getElementById('idPrezzoCambiato').value = "";
    document.getElementById('idClasse').value = "";
    document.getElementById('idPassword').value = "";
}

// Cancello il prodotto
async function deleteProduct() {
    await fetch('http://localhost:52714/prodotti/elimina?prodotto=' + id)
        .then(response => response.json())
        .then(data => {
            console.log('Success:');
        })
        .catch((error) => {
            console.error('Error:');
        });
    returnProductTable(true);
}

function changeProduct() {
    // Prendo i dati inseriti dall'utente
    var new_product = document.getElementById('idProdottoCambiato').value;
    var new_price = document.getElementById('idPrezzoCambiato').value;
    console.log(new_product);
    console.log(new_price);
    // Le textbox di input non devono essere vuote!!!
    if (new_product == "" || new_price == "" || new_price.length > 5)
        alert("Non hai inserito correttamente i dati!");
    else {
        var data = {
            nuovo_prodotto: new_product,
            nuovo_prezzo: new_price,
            prodotto: id
        };
        // Chiamata che mi inserisce i dati nel db
        fetch('http://localhost:52714/prodotti/aggiorna', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                returnProductTable(true);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    // Pulisco le textbox da quello che ho scritto
    clearPopup();
}

function addClass() {
    // Prendo i dati inseriti dall'utente
    var classe = document.getElementById('idClasse').value;
    var password = document.getElementById('idPassword').value;
    console.log("Classe: " + classe + ", password: " + password);
    // Le textbox di input non devono essere vuote!!!
    if (classe == "" || password == "")
        alert("Non hai inserito correttamente i dati!");
    else {

        var data = {
            classe: classe,
            password: password
        };
        // Chiamata che mi inserisce i dati nel db
        fetch('http://localhost:52714/classe/inserisci', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                returnClassesTable(true);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    // Pulisco le textbox da quello che ho scritto
    clearPopup();
}

async function deleteClass() {
    await fetch('http://localhost:52714/classe/elimina?classe=' + id)
        .then(response => response.json())
        .then(data => {
            console.log('Success:');
        })
        .catch((error) => {
            console.error('Error: ' + error);
        });
    returnClassesTable(true);
}

function addUser() {
    // Prendo i dati inseriti dall'utente
    var classe = document.getElementById('idClasse').value;
    var id_telegram = document.getElementById('idTelegram').value;
    var username = document.getElementById('idUsername').value;
    // Le textbox di input non devono essere vuote!!!
    if (classe == "" || id_telegram == "" || username == "")
        alert("Non hai inserito correttamente i dati!");
    else {
        var data = {
            Classe: classe,
            Id_telegram: id_telegram,
            username_telegram: username
        };

        console.log(data);
        // Chiamata che mi inserisce i dati nel db
        fetch('http://localhost:52714/utente/inserisci', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                returnUsersTable(true, classe);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    // Pulisco le textbox da quello che ho scritto
    clearPopup();
}

async function deleteUser() {
    await fetch('http://localhost:52714/utente/elimina?id_telegram=' + id)
        .then(response => response.json())
        .then(data => {
            console.log('Success:');
            returnUsersTable(true);
        })
        .catch((error) => {
            console.error('Error:');
        });

}

function changeClass() {
    // Prendo i dati inseriti dall'utente
    var classe = document.getElementById('idClasseCambiata').value;
    var password = document.getElementById('idPasswordCambiata').value;
    var vecchiaclasse = id;
    // Le textbox di input non devono essere vuote!!!
    if (classe == "" || password == "")
        alert("Non hai inserito correttamente i dati!");
    else {
        var data = {
            nuova_classe: classe,
            nuova_password: password,
            classe: id
        };
        // Chiamata che mi inserisce i dati nel db
        fetch('http://localhost:52714/classe/aggiorna', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                returnClassesTable(true);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    // Pulisco le textbox da quello che ho scritto
    clearPopup();
}

// L'id del bottone corrisponde all'id del prodotto nella tabella HTML
var id;

function getIdButton(clicked_id) {
    // Ogni bottone ha un id che corrisponde alla propria riga
    // In questo modo posso prendere i vari dati
    id = clicked_id;
    // Quando passo da una pagina HTML a un altra "perdo" tutti i dati
    sessionStorage.setItem("id", id);
}