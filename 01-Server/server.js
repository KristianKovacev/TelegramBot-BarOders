const express = require("express");
const cors = require("cors");
const db = require("./db"); // Aggiungere

// Avvia il server sulla porta indicata, oppure 52714 di default
const PORT = process.env.PORT || 52714;

// Creo il server
const server = express();

// Attiva CORS (necessario per comunicare con altre web app)
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Ritornano tutti i prodotti del bar
server.get("/prodottiTelegram", async(req, res) => {
    try {
        const list = await db.getProductsforTelegram();
        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

// Controllo se l'utente è già loggato
// La query sarà /utente/controlloLogin?IdTelegram=xxx
server.get("/utente/controlloLogin", async(req, res) => {
    try {
        const list = await db.checkUser(req.query.IdTelegram);
        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});


// ritornano tutte le sezioni di quell'anno scolastico
server.get("/sezioni", async(req, res) => {
    try {
        const list = await db.getClasses();
        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

// Inserisco il nuovo utente quando si registra
server.post("/utente/inserisci", async(req, res) => {
    try {
        await db.insertUser(req.body);
        res.status(200).json("OK");
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

// Login viene mandata la password e lo classe
server.get("/utente/login", async(req, res) => {
    try {
        const list = await db.checkLogin(req.query.classe, req.query.password);
        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

// Inserisco il nuovo utente quando si registra
server.get("/ordini/inserisci", async(req, res) => {
    try {
        const list = await db.insertOrder(req.query.prodotto, req.query.id_telegram);

        res.status(200).json("OK");
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

server.get("/ordini", async(req, res) => {
    try {
        const list = await db.getOrders(req.query.id_telegram);

        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

server.get("/classi", async(req, res) => {
    try {
        const list = await db.getClassesInformation();

        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

server.get("/prodotti", async(req, res) => {
    try {
        const list = await db.getProducts();
        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

server.post("/prodotti/inserisci", async(req, res) => {
    try {
        await db.insertProduct(req.body);
        res.status(200).json("OK");
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

// Elimino un prodotto, quello che ricevo è il nome del prodotto
server.get("/prodotti/elimina", async(req, res) => {
    try {
        await db.deleteProduct(req.query.prodotto);
        res.status(200).json("OK");
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

server.put("/prodotti/aggiorna", async(req, res) => {
    try {
        await db.updateProduct(req.body);
        res.status(200).json("OK");
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

server.get("/utente", async(req, res) => {
    try {
        const list = await db.getUsers(req.query.classe);
        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});


server.post("/classe/inserisci", async(req, res) => {
    try {
        await db.insertClass(req.body);
        res.status(200).json("OK");
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

server.get("/classe/elimina", async(req, res) => {
    try {
        const list = await db.deleteClass(req.query.classe);
        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

server.get("/utente/elimina", async(req, res) => {
    try {
        const list = await db.deleteUser(req.query.id_telegram);
        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

server.put("/classe/aggiorna", async(req, res) => {
    try {
        await db.updateClass(req.body);
        res.status(200).json("OK");
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

server.get("/ordini/bar", async(req, res) => {
    try {
        const list = await db.getOrders();
        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});

server.get("/statistiche", async(req, res) => {
    try {
        const list = await db.getStatics();
        res.json(list);
    } catch (e) {
        res.status(500).json("Errore DB");
    }
});



server.listen(PORT, function() {
    console.log(`API attivata! (localhost:${PORT})`);
});