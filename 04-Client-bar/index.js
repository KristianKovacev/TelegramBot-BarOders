var table;

async function returnOrdersTable(ok) {
    var ordiniTabella = [];
    // Faccio la chiamata per farmi ritornare tutti i prodotti con i loro prezzi
    await fetch('http://localhost:52714/ordini/bar').then((response) => {
        return response.json();
    }).then((values) => {
        // Dato che la prima riga è occupata dalle intestazioni della tabella devo partire da 1
        var i = 1;
        // Aggiungo ogni prodotto all'array che verrà stampato sulla tabella
        values.forEach(function(value) {
            // Bottoni delete e edit
            let buttons = '<button class="btn btn-primary btn-sm btn-block" id="' + value.nome_prodotto + '" data-toggle="modal" data-target="#modal_change_product" onclick="getIdButton(this.id)"><i class="far fa-edit"></i> Fatto</button>';
            ordiniTabella.push([i, value.Classe, value.nome_prodotto, value.qty, buttons]);
            i++;
        });

        if (ok) {
            table.destroy();
        }
        table = $('#dataTable').DataTable({
            data: ordiniTabella,
            // Lunghezza menu 
            "lengthMenu": [
                [10, 25, 50, 100, -1],
                [10, 25, 50, 100, "All"]
            ]
        });
    }).catch((error) => console.log(error))
}