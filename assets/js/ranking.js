/**
 * Affiche le classement
 */
function displayRanking() {
    const tbody = document.querySelector('#ranking-table tbody');
    tbody.innerHTML = '';

    // Récupération des données
    const runners = JSON.parse(localStorage.getItem('runners') || '[]');
    const laps = JSON.parse(localStorage.getItem('laps') || '[]');

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