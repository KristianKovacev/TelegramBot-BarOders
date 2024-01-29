# Progetto gestione ordinazioni bar

## 1. Analisi dei requisiti

### 1.1 AS IS : Com'è adesso?

Ogni persona della classe deve raccogliere tutte le prenotazioni degli altri compagni. Deve "convertirli" nei vari codici del bar (Es. 2 Pepsi = 2P). Questo può portare a errori e non è immediato farlo ogni volta. Una volta raccolti tutte le prenotazioni la persona addetta dovrà mandare il messaggio su WhatsApp al bar. Il bar molto probabilmente, leggendo i messaggi, si segnerà su carta i vari prodotti da preparare. 



### 1.2 TO BE : Cosa vogliamo ottenere?

Obiettivo del progetto: rendere l'ordinazione più user friendly. Ogni persona ordinerà per proprio conto attraverso Telegram, potrà modificare l'ordine senza essere vincolato. 

Il bar avrà un client dove vedrà tutte le ordinazioni. Li potrà fare un check su quelle già preparate, in modo da avere tutto in modo organizzato. Avendo tante informazioni nel database (le ordinazioni di ogni giorno) fare delle varie statistiche in questo modo si potrà vedere quali sono i prodotti più consumati. 



## 2. Use case

### 2.1 Utente

- LOGIN: l'utente si dovrà loggare la prima volta con la password della classe.
- ORDINARE: l'utente può creare il suo ordine e confermarlo

### 2.2 Utente amministratore

- LOGIN: l'utente si dovrà loggare per poter accedere al sito gestionale.
- MODIFICA: l'utente può fare le varie modifiche sul database

### 2.3 Omino bar

- LETTURA: l'utente potrà solo visualizzare gli ordini.



## 3. Schema fisico

![schema](/00-Progettazione/schema.png)

## 4. Progettazione

**Tecnologie client**: HTML, CSS, Javascript

**Tecnologie server**: Node.js, SQL



### 4.1 Server

Il server dovrà gestire tutte le richieste:

- **Telegram**: l'utente farà una richiesta quando confermerà l'ordine.

- **Sito gestione**: da questo sito potrò aggiungere dei prodotti, modificare le classi, le password, rimuovere gli utenti.

- **Sito web bar**: si potranno vedere le ordinazioni del giorno e le statistiche dei prodotti più ordinati

  

### 4.2 Database

Database utilizzato: **SQL**

La tabella backup di tutti gli ordini mi servirò per fare un'analisi dei dati per vedere quali sono i prodotti maggiormente consumati.





#### 4.2.1 Schema relazionale

![database](/00-Progettazione/database.png)

#### 4.2.2 Schema logico

Classe (<u>Id_classe</u>, classe, password)

Utenti (<u>Id_utente</u>, Id_telegram, Id_classe*, nome_utente)

Ordini (<u>Id_ordine</u>, Id_utente*, data_ordine)

Dettagli_ordini (Id_ordine*, Id_prodotto *, quantità)

Prodotti (<u>Id_prodotto</u>, nome_prodotto, prezzo)



### 4.3 Telegram

Linguaggio utilizzato: **Javascript**.

Pacchetto utilizzato per telegram: **Node-telegram-bot-api**

Comandi telegram: "/start", "/update".

#### 4.3.1 Flusso procedurale

- L'utente al primo accesso dovrà inserire la classe e la **password** e poi il suo nome e cognome. Ogni classe avrà una password. Il suo account telegram verrà associato ad un id, il login verrà effettuato solo una volta.
- Inizialmente ci saranno due bottoni: **ordina** e **visualizza ordine** . 
- Se preme **ordina** compaiono tutte le ordinazioni sotto forma di **bottone**. L'utente preme il bottone, quindi l'ordine, e lo aggiungerà alla sua lista.
- Se preme **visualizza ordine** potrà visualizzare il suo ordine.



### 4.4 Sito gestione

Qui l'utente amministratore da un'interfaccia user friendly potrà:

- Aggiungere/rimuovere i prodotti;
- Cambiare il prezzo dei prodotti;
- Aggiungere/rimuovere le classi (questa funzionalità può servire all'inizio dell'anno);
- Aggiungere/rimuovere le persone (nel caso in cui qualcuno si sia impossessato della password della classe);
- Cambiare password per le classi;



### 4.5 Sito web bar

L'idea è di mettere un computer (raspberry con monitor o un All In One) al bar. Qui girerà il sito web.

Da questo sito web si potrà vedere:

- Le ordinazioni divise per classe o per prodotti ordinati (con le loro quantità)
- Le varie statistiche sui prodotti consumati
- **Check** per dire che l'ordinazione è stata preparata



## 5. Manuale d'uso

### 5.1 Telegram

L'utente per interagire con il bot dovrà scrivere il comando /start. Dopo la fase di login, che avverrà solo la prima volta, avrà a disposizione due bottoni:

![telegram](/00-Progettazione/telegram1.png)

Se preme il bottone ordina compariranno tutti i prodotti che potrà ordinare. Ogni prodotto è rappresentato da un bottone, premendolo lo si aggiungerà ai tuoi ordini.

![telegram2](/00-Progettazione/telegram2.png)

Premendo il bottone "Controlla gli ordini" si potrà vedere quello che si ha ordinato quel giorno:

![telegram3](/00-Progettazione/telegram3.png)

### 5.1 Client amministrazione

Da qui si potrà modificare il database da un'interfaccia grafica

![client-amministrazione1](/00-Progettazione/client-amministrazione1.png)



Premendo su Classi si potrà aggiungere, modificare, eliminare le classi

![client-amministrazione2](/00-Progettazione/client-amministrazione2.png)



Premendo sul bottone Apri classe si potranno vedere gli utenti di quella classe e nel caso eliminarli

![client-amministrazione3](/00-Progettazione/client-amministrazione3.png)



Nella sezione Menù potrò aggiungere, modificare, eliminare i prodotti:

![client-amministrazione4](/00-Progettazione/client-amministrazione4.png)





### 5.2 Client bar

Da qui si potrà visualizzare gli ordini del giorno

![client-bar1](/00-Progettazione/clientbar1.png)



E vedere i prodotti più acquistati

![client-bar2](/00-Progettazione/clientbar2.png)