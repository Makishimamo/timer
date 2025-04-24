// Éléments du DOM
const fileInput = document.getElementById('fileInput');
const importBtn = document.getElementById('importBtn');
const runnersTable = document.getElementById('runners-table').getElementsByTagName('tbody')[0];

// Fonction pour importer les données Excel
function importExcelData() {
    const file = fileInput.files[0];
    if (!file) {
        alert('Veuillez sélectionner un fichier Excel');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Vérification des colonnes requises
        const requiredColumns = ['DOSSARD', 'NOM', 'PRENOM', 'SEXE', 'ANNEE_NAISSANCE'];
        const headers = Object.keys(jsonData[0] || {});
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
            alert(`Colonnes manquantes : ${missingColumns.join(', ')}`);
            return;
        }

        // Traitement des données
        const runners = jsonData.map(row => ({
            dossard: row.DOSSARD.toString(),
            nom: row.NOM,
            prenom: row.PRENOM,
            sexe: row.SEXE,
            anneeNaissance: row.ANNEE_NAISSANCE
        }));

        // Sauvegarde dans le localStorage
        localStorage.setItem('runners', JSON.stringify(runners));
        
        // Affichage des données
        displayRunners(runners);
        
        alert('Importation réussie !');
    };
    reader.readAsArrayBuffer(file);
}

// Fonction pour afficher les coureurs dans le tableau
function displayRunners(runners) {
    runnersTable.innerHTML = '';
    runners.forEach(runner => {
        const row = runnersTable.insertRow();
        row.innerHTML = `
            <td>${runner.dossard}</td>
            <td>${runner.nom}</td>
            <td>${runner.prenom}</td>
            <td>${runner.sexe}</td>
            <td>${runner.anneeNaissance}</td>
        `;
    });
}

// Chargement des coureurs existants
function loadExistingRunners() {
    const runners = JSON.parse(localStorage.getItem('runners') || '[]');
    displayRunners(runners);
}

// Initialisation des événements
function initializeEventListeners() {
    importBtn.addEventListener('click', importExcelData);
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadExistingRunners();
}); 