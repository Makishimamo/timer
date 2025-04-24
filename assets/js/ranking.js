/**
 * Affiche le classement
 */
function displayRanking() {
    const tbody = document.querySelector('#ranking-table tbody');
    tbody.innerHTML = '';

    // Récupération des données
    const laps = JSON.parse(localStorage.getItem('laps') || '[]');

    // Création du classement
    const ranking = laps.map(lap => {
        return {
            dossard: lap.dossard,
            nom: lap.runnerInfo ? lap.runnerInfo.nom : 'Inconnu',
            prenom: lap.runnerInfo ? lap.runnerInfo.prenom : '',
            sexe: lap.runnerInfo ? lap.runnerInfo.sexe : '',
            anneeNaissance: lap.runnerInfo ? lap.runnerInfo.anneeNaissance : '',
            temps: lap.time
        };
    }).filter(lap => lap.dossard); // Ne garder que les LAPs avec un dossard

    // Tri par temps
    ranking.sort((a, b) => {
        const timeA = convertTimeToMs(a.temps);
        const timeB = convertTimeToMs(b.temps);
        return timeA - timeB;
    });

    // Affichage
    ranking.forEach((runner, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${runner.dossard}</td>
            <td>${runner.nom}</td>
            <td>${runner.prenom}</td>
            <td>${runner.sexe}</td>
            <td>${runner.anneeNaissance}</td>
            <td>${runner.temps}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Convertit un temps au format HH:MM:SS.mmm en millisecondes
 */
function convertTimeToMs(time) {
    const [hours, minutes, seconds] = time.split(':');
    const [sec, ms] = seconds.split('.');
    return (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(sec)) * 1000 + parseInt(ms);
}

// Mise à jour du classement toutes les secondes
setInterval(displayRanking, 1000);

// Affichage initial
document.addEventListener('DOMContentLoaded', displayRanking);

/**
 * Exporte le classement en Excel
 */
function exportRankingToExcel() {
    const runners = JSON.parse(localStorage.getItem('runners') || '[]');
    const laps = JSON.parse(localStorage.getItem('laps') || '[]');

    if (laps.length === 0) {
        alert("Aucun temps enregistré à exporter !");
        return;
    }

    // Création du classement
    const ranking = laps.map(lap => {
        const runner = runners.find(r => r.dossard == lap.dossard);
        return {
            dossard: lap.dossard,
            nom: runner ? runner.nom : 'Inconnu',
            prenom: runner ? runner.prenom : '',
            sexe: runner ? runner.sexe : '',
            anneeNaissance: runner ? runner.anneeNaissance : '',
            temps: lap.time
        };
    });

    // Tri par temps
    ranking.sort((a, b) => {
        const timeA = convertTimeToMs(a.temps);
        const timeB = convertTimeToMs(b.temps);
        return timeA - timeB;
    });

    // Préparation des données pour l'export
    const data = ranking.map((runner, index) => ({
        "Position": index + 1,
        "Dossard": runner.dossard,
        "Nom": runner.nom,
        "Prénom": runner.prenom,
        "Sexe": runner.sexe,
        "Année de naissance": runner.anneeNaissance,
        "Temps": runner.temps
    }));

    // Création du fichier Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Classement Scratch");

    // Export
    const excelFileName = `classement_scratch_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(workbook, excelFileName);

    console.log(`Classement exporté : ${excelFileName}`);
}

// Ajout de l'événement pour le bouton d'export
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('export-ranking').addEventListener('click', exportRankingToExcel);
    displayRanking();
}); 