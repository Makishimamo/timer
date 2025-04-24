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
function displayCategoryRankings() {
    const maleCategoriesContainer = document.getElementById('male-categories');
    const femaleCategoriesContainer = document.getElementById('female-categories');
    maleCategoriesContainer.innerHTML = '';
    femaleCategoriesContainer.innerHTML = '';

    const laps = JSON.parse(localStorage.getItem('laps') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');

    // Filtrer les tours avec dossard et info coureur
    const validLaps = laps.filter(lap => lap.dossard && lap.runnerInfo);

    categories.forEach(category => {
        // Filtrer les tours par catégorie et par sexe
        const maleLaps = validLaps.filter(lap => {
            const age = new Date().getFullYear() - lap.runnerInfo.anneeNaissance;
            return lap.runnerInfo.sexe === 'M' && 
                   age >= category.minAge && 
                   age <= category.maxAge;
        });

        const femaleLaps = validLaps.filter(lap => {
            const age = new Date().getFullYear() - lap.runnerInfo.anneeNaissance;
            return lap.runnerInfo.sexe === 'F' && 
                   age >= category.minAge && 
                   age <= category.maxAge;
        });

        // Créer les tableaux de classement pour chaque sexe
        const maleRanking = createCategoryTable(category.name, maleLaps);
        const femaleRanking = createCategoryTable(category.name, femaleLaps);

        // Ajouter les classements aux conteneurs respectifs
        if (maleLaps.length > 0) {
            maleCategoriesContainer.appendChild(maleRanking);
        }
        if (femaleLaps.length > 0) {
            femaleCategoriesContainer.appendChild(femaleRanking);
        }
    });
}

function createCategoryTable(categoryName, laps) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-ranking';
    
    const categoryTitle = document.createElement('h3');
    categoryTitle.textContent = categoryName;
    categoryDiv.appendChild(categoryTitle);

    // Trier les tours par temps et prendre les 3 premiers
    const topThreeLaps = laps
        .sort((a, b) => {
            const timeA = convertTimeToMs(a.time);
            const timeB = convertTimeToMs(b.time);
            return timeA - timeB;
        })
        .slice(0, 3);

    const table = document.createElement('table');
    table.innerHTML = `
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
            ${topThreeLaps.map((lap, index) => `
                <tr class="${index < 3 ? 'podium' : ''}">
                    <td>${index + 1}</td>
                    <td>${lap.dossard}</td>
                    <td>${lap.runnerInfo.nom}</td>
                    <td>${lap.runnerInfo.prenom}</td>
                    <td>${lap.time}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    categoryDiv.appendChild(table);
    return categoryDiv;
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
    displayCategoryRankings();
    document.getElementById('export-pdf').addEventListener('click', exportToPDF);
    
    // Mise à jour toutes les secondes
    setInterval(displayCategoryRankings, 1000);
}); 