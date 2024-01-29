const sql = require("mssql/msnodesqlv8");

// Equivalente alla ConnectionString di ADO.NET
// NOTA BENE: utilizza SQL Auth!
const config = {
    server: 'localhost',
    database: 'Bar_itis',
    options: {
        trustedConnection: true
    }
};

// Ritornano tutti i prodotti del bar
async function getProductsforTelegram() {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .query("SELECT nome_prodotto + ' - €' + convert(varchar(30), prezzo, 1) " +
                "AS prodotto FROM dbo.Prodotti");
        // Ritonano con questa formattazione: Panino cotoletta - €2.20
        return result.recordset;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

// ritornano tutte le sezioni di quell'anno scolastico
// Questa query verrà eseguita una volta all'anno
async function getClasses() {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .query("SELECT DISTINCT Sezione FROM dbo.Classi");
        return result.recordset;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

async function checkUser(IdTelegram) {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .input("Id_telegram", sql.NVarChar(50), IdTelegram)
            .query("SELECT COUNT(*) AS UtentiTrovati FROM dbo.Utenti " +
                "WHERE Id_telegram = @Id_telegram");

        return result.recordset;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

// Inserisco il nuovo utente quando si registra
async function insertUser({ Classe, Id_telegram, username_telegram }) {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .input("Classe", sql.NVarChar(50), Classe)
            .input("Id_telegram", sql.NVarChar(60), Id_telegram)
            .input("username_telegram", sql.NVarChar(60), username_telegram)
            .query("INSERT INTO dbo.Utenti (Id_classe, Id_telegram, username_telegram) " +
                "VALUES ((SELECT Id_classe FROM dbo.Classi WHERE CONCAT(Classe, Sezione) = @Classe), " +
                "@Id_telegram, @username_telegram)");

        return result.rowsAffected;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

async function checkLogin(classe, password) {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .input("classe", sql.NVarChar(50), classe)
            .input("password", sql.NVarChar(50), password)
            .query("SELECT COUNT(*) AS ClassiTrovate FROM dbo.Classi " +
                "WHERE CONCAT(Classe, Sezione) = @Classe AND password = @password");

        return result.recordset;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

async function insertOrder(prodotto, id_telegram) {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        // Il prodotto mi arriva scritto in questo modo: Panino cotoletta - €2.20
        // Prendo solo il nome del prodotto
        var index = prodotto.indexOf("-");
        prodotto = prodotto.substring(0, index - 1);

        var result = await cnn.request()
            .input("id_telegram", sql.NVarChar(60), id_telegram)
            // Controllo se l'utente ha già fatto un'ordine
            .query("SELECT COUNT(*) AS numeroOrdini, Id_ordine FROM dbo.Ordini " +
                "INNER JOIN dbo.Utenti ON Ordini.Id_utente = Utenti.Id_utente " +
                "WHERE Id_telegram = @id_telegram AND " +
                "0 = (SELECT DATEDIFF(day, data_ordine, GETDATE())) " +
                "GROUP BY Id_ordine");

        // Controllo se ha un ordine o no:
        if (result.recordset[0] == null) {
            // Aggiungo l'ordine
            result = await cnn.request()
                // ! Devo creare l'ordine
                .input("id_telegram", sql.NVarChar(60), id_telegram)
                .query("INSERT INTO dbo.Ordini (Id_utente, data_ordine) " +
                    "VALUES ((SELECT Id_utente FROM dbo.Utenti WHERE Id_telegram = @id_telegram), GETDATE())");
        }

        result = await cnn.request()
            .input("prodotto", sql.NVarChar(50), prodotto)
            .input("id_telegram", sql.NVarChar(60), id_telegram)
            .query("INSERT INTO dbo.DettagliOrdine (Id_ordine, Id_prodotto) " +
                "VALUES ((SELECT Id_Ordine FROM dbo.Ordini " +
                "INNER JOIN dbo.Utenti ON Ordini.Id_utente = Utenti.Id_utente " +
                "WHERE Id_telegram = @id_telegram AND 0 = (SELECT DATEDIFF(day, data_ordine, GETDATE()))), " +
                "(SELECT Id_prodotto FROM dbo.Prodotti " +
                "WHERE nome_prodotto = @prodotto))");

        return result.recordset;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

async function getUserOrders(id_telegram) {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .input("id_telegram", sql.NVarChar(50), id_telegram)
            .query("SELECT nome_prodotto FROM dbo.Utenti " +
                "INNER JOIN dbo.Ordini ON Utenti.Id_utente = Ordini.Id_utente " +
                "INNER JOIN dbo.DettagliOrdine ON Ordini.Id_ordine = DettagliOrdine.Id_ordine " +
                "INNER JOIN dbo.Prodotti ON DettagliOrdine.Id_prodotto = Prodotti.Id_prodotto " +
                "WHERE Utenti.Id_telegram = @id_telegram AND 0 = (SELECT DATEDIFF(day, data_ordine, GETDATE()))");

        return result.recordset;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

async function getClassesInformation() {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .query("SELECT (CONVERT(varchar(2), Classe) +Sezione) AS Classi, Password, COUNT(Id_utente) AS numeroUtenti " +
                "FROM dbo.Utenti " +
                "RIGHT JOIN dbo.Classi ON Utenti.Id_classe = Classi.Id_classe " +
                "GROUP BY Classe, Sezione, Password");
        return result.recordset;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

async function getProducts() {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .query("SELECT nome_prodotto, prezzo FROM dbo.Prodotti");
        // Ritonano con questa formattazione: Panino cotoletta - €2.20
        return result.recordset;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

// Quando viene inserito un nuovo prodotto
async function insertProduct({ prodotto, prezzo }) {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .input("prodotto", sql.NVarChar(50), prodotto)
            .input("prezzo", sql.Money, prezzo)
            .query("INSERT INTO dbo.Prodotti (nome_prodotto, prezzo) " +
                "VALUES (@prodotto, @prezzo)");

        return result.rowsAffected;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}


// Quando viene inserito un nuovo prodotto
async function deleteProduct(prodotto) {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .input("prodotto", sql.NVarChar(50), prodotto)
            .query("DELETE FROM dbo.Prodotti " +
                "WHERE nome_prodotto = @prodotto");

        return result.rowsAffected;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

async function updateProduct({ nuovo_prodotto, nuovo_prezzo, prodotto }) {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .input("nuovo_prodotto", sql.NVarChar(50), nuovo_prodotto)
            .input("nuovo_prezzo", sql.NVarChar(50), nuovo_prezzo)
            .input("prodotto", sql.NVarChar(50), prodotto)
            .query("UPDATE dbo.Prodotti " +
                "SET nome_prodotto = @nuovo_prodotto, prezzo=@nuovo_prezzo " +
                "WHERE nome_prodotto = @prodotto");

        return result.rowsAffected;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}


async function getUsers(Classe) {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .input("Classe", sql.NVarChar(50), Classe)
            .query("SELECT username_telegram, Id_telegram " +
                "FROM dbo.Utenti " +
                "INNER JOIN dbo.Classi ON Utenti.Id_classe = Classi.Id_classe " +
                "WHERE (CONVERT(varchar(2), Classe) +Sezione)= @Classe");

        return result.recordset;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}


async function insertClass({ classe, password }) {
    const cnn = new sql.ConnectionPool(config);
    try {
        var cls = classe.substring(0, 1);
        var sezione = classe.substring(1, classe.length);

        await cnn.connect();
        const result = await cnn.request()
            .input("cls", sql.Int, cls)
            .input("sezione", sql.NVarChar(50), sezione)
            .input("password", sql.NVarChar(60), password)
            .query("INSERT INTO dbo.Classi (Classe, Sezione, Password) " +
                "VALUES (@cls, @sezione, @password)");

        return result.rowsAffected;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

async function deleteClass(classe) {
    const cnn = new sql.ConnectionPool(config);
    try {
        // Cancello la classe e tutti gli utenti legati a quella classe
        await cnn.connect();
        var result = await cnn.request()
            .input("classe", sql.NVarChar(50), classe)
            .query("DELETE dbo.Utenti " +
                "WHERE Id_classe IN " +
                "(SELECT Classi.Id_classe FROM dbo.Classi " +
                "INNER JOIN dbo.Utenti ON Classi.Id_classe = Utenti.Id_classe " +
                "WHERE (CONVERT(varchar(2), Classe) + Sezione) = @classe)");

        result = await cnn.request()
            .input("classe", sql.NVarChar(50), classe)
            .query("DELETE FROM dbo.Classi " +
                "WHERE (CONVERT(varchar(2), Classe) + Sezione) = @classe");

        return result.rowsAffected;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

async function deleteUser(id_telegram) {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .input("id_telegram", sql.NVarChar(50), id_telegram)
            .query("DELETE FROM dbo.Utenti " +
                "WHERE Id_telegram = @id_telegram");

        return result.rowsAffected;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

async function updateClass({ nuova_classe, nuova_password, classe }) {
    const cnn = new sql.ConnectionPool(config);
    try {
        var cls = nuova_classe.substring(0, 1);
        var sezione = nuova_classe.substring(1, classe.length);

        await cnn.connect();
        const result = await cnn.request()
            .input("cls", sql.Int, cls)
            .input("sezione", sql.NVarChar(50), sezione)
            .input("nuova_password", sql.NVarChar(50), nuova_password)
            .input("classe", sql.NVarChar(50), classe)
            .query("UPDATE dbo.Classi " +
                "SET Classe = @cls, Sezione = @sezione, Password = @nuova_password " +
                "WHERE (CONVERT(varchar(2), Classe) + Sezione) = @classe");

        return result.rowsAffected;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

// Prendo gli ordini del giorno (Per il client del bar)
async function getOrders() {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .query("SELECT (CONVERT(varchar(2), Classe) + Sezione) AS Classe, nome_prodotto, COUNT(*) AS qty " +
                "FROM dbo.Prodotti " +
                "INNER JOIN dbo.DettagliOrdine ON Prodotti.Id_prodotto = DettagliOrdine.Id_prodotto " +
                "INNER JOIN dbo.Ordini ON DettagliOrdine.Id_ordine = Ordini.Id_ordine " +
                "INNER JOIN dbo.Utenti ON Ordini.Id_utente = Utenti.Id_utente  " +
                "INNER JOIN dbo.Classi ON Utenti.Id_classe = Classi.Id_classe " +
                "WHERE 0 = (SELECT DATEDIFF(day, data_ordine, GETDATE())) " +
                "GROUP BY Sezione, Classe, nome_prodotto");

        return result.recordset;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}

async function getStatics() {
    const cnn = new sql.ConnectionPool(config);
    try {
        await cnn.connect();
        const result = await cnn.request()
            .query("SELECT nome_prodotto, COUNT(DettagliOrdine.Id_prodotto) AS qty " +
                "FROM dbo.Prodotti " +
                "LEFT JOIN dbo.DettagliOrdine ON Prodotti.Id_prodotto = DettagliOrdine.Id_prodotto " +
                "GROUP BY nome_prodotto");

        return result.recordset;
    } catch (err) {
        console.error(`SQL Error: ${err}`);
        throw err;
    } finally {
        cnn.close();
    }
}


// Esporta la funzione, in modo che sia visible in altri file
module.exports = {
    getProductsforTelegram,
    getClasses,
    insertUser,
    checkUser,
    checkLogin,
    insertOrder,
    getOrders,
    getClassesInformation,
    getProducts,
    insertProduct,
    deleteProduct,
    updateProduct,
    getUsers,
    insertClass,
    deleteClass,
    deleteUser,
    updateClass,
    getUserOrders,
    getStatics
};