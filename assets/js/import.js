// Stockage des coureurs
let runners = [];

/**
 * Gère l'import du fichier Excel
 */
document.getElementById('import-button').addEventListener('click', function() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Veuillez sélectionner un fichier Excel');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Vérification des colonnes requises
        const requiredColumns = ['DOSSARD', 'NOM', 'PRENOM', 'SEXE', 'ANNEE_NAISSANCE'];
        const columns = Object.keys(jsonData[0] || {});
        
        if (!requiredColumns.every(col => columns.includes(col))) {
            alert('Le fichier doit contenir les colonnes suivantes : DOSSARD, NOM, PRENOM, SEXE, ANNEE_NAISSANCE');
            return;
        }

        // Stockage des données
        runners = jsonData.map(runner => ({
            dossard: runner.DOSSARD,
            nom: runner.NOM,
            prenom: runner.PRENOM,
            sexe: runner.SEXE,
            anneeNaissance: runner.ANNEE_NAISSANCE
        }));

        // Sauvegarde dans le localStorage
        localStorage.setItem('runners', JSON.stringify(runners));

        // Affichage des données
        displayRunners();
        alert('Import réussi !');
    };
    reader.readAsArrayBuffer(file);
});

/**
 * Affiche la liste des coureurs
 */
function displayRunners() {
    const tbody = document.querySelector('#runners-table tbody');
    tbody.innerHTML = '';

    runners.forEach(runner => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${runner.dossard}</td>
            <td>${runner.nom}</td>
            <td>${runner.prenom}</td>
            <td>${runner.sexe}</td>
            <td>${runner.anneeNaissance}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Chargement des données au démarrage
document.addEventListener('DOMContentLoaded', function() {
    const savedRunners = localStorage.getItem('runners');
    if (savedRunners) {
        runners = JSON.parse(savedRunners);
        displayRunners();
    }
}); 