/**
 * Calcule l'âge d'un coureur
 */
function calculateAge(birthYear) {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
}

/**
 * Détermine la catégorie d'un coureur
 */
function getRunnerCategory(runner, categories) {
    const age = calculateAge(runner.anneeNaissance);
    return categories.find(category => age >= category.minAge && age <= category.maxAge);
}

/**
 * Affiche le classement par catégorie
 */
function displayCategoriesRanking() {
    const container = document.getElementById('categories-ranking');
    container.innerHTML = '';

    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const runners = JSON.parse(localStorage.getItem('runners') || '[]');
    const laps = JSON.parse(localStorage.getItem('laps') || '[]');

    // Création des classements par catégorie
    categories.forEach(category => {
        // Filtrage des coureurs de la catégorie
        const categoryRunners = runners.filter(runner => {
            const age = calculateAge(runner.anneeNaissance);
            return age >= category.minAge && age <= category.maxAge;
        });

        // Création du classement
        const ranking = laps
            .filter(lap => categoryRunners.some(runner => runner.dossard == lap.dossard))
            .map(lap => {
                const runner = runners.find(r => r.dossard == lap.dossard);
                return {
                    dossard: lap.dossard,
                    nom: runner.nom,
                    prenom: runner.prenom,
                    temps: lap.time
                };
            })
            .sort((a, b) => convertTimeToMs(a.temps) - convertTimeToMs(b.temps))
            .slice(0, 3); // Garder seulement les 3 premiers

        // Création de la carte de classement
        const categoryCard = document.createElement('div');
        categoryCard.style.background = 'white';
        categoryCard.style.padding = '20px';
        categoryCard.style.borderRadius = '8px';
        categoryCard.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        categoryCard.className = 'category-card';

        categoryCard.innerHTML = `
            <h2 style="text-align: center; margin-top: 0; color: #9b59b6;">${category.name}</h2>
            <table style="width: 100%;">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Dossard</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Temps</th>
                    </tr>
                </thead>
                <tbody>
                    ${ranking.map((runner, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${runner.dossard}</td>
                            <td>${runner.nom}</td>
                            <td>${runner.prenom}</td>
                            <td>${runner.temps}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.appendChild(categoryCard);
    });
}

/**
 * Exporte le classement en PDF
 */
async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const container = document.getElementById('categories-ranking');
    
    // Capture de chaque carte de catégorie
    const cards = container.getElementsByClassName('category-card');
    let yOffset = 20;

    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        
        // Capture de la carte en image
        const canvas = await html2canvas(card);
        const imgData = canvas.toDataURL('image/png');
        
        // Ajout de l'image au PDF
        doc.addImage(imgData, 'PNG', 20, yOffset, 170, 0);
        
        // Ajout d'une nouvelle page si nécessaire
        yOffset += canvas.height * 0.2645833333; // Conversion pixels -> mm
        if (yOffset > 250 && i < cards.length - 1) {
            doc.addPage();
            yOffset = 20;
        }
    }

    // Sauvegarde du PDF
    doc.save('classement_categories.pdf');
}

// Conversion du temps en millisecondes
function convertTimeToMs(time) {
    const [hours, minutes, seconds] = time.split(':');
    const [sec, ms] = seconds.split('.');
    return (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(sec)) * 1000 + parseInt(ms);
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    displayCategoriesRanking();
    document.getElementById('export-pdf').addEventListener('click', exportToPDF);
    
    // Mise à jour toutes les secondes
    setInterval(displayCategoriesRanking, 1000);
}); 