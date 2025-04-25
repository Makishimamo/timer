/**
 * Affiche les détails de la course actuelle
 */
function displayCurrentRace() {
    const currentRace = storageManager.getCurrentRace();
    const container = document.getElementById('current-race-details');

    if (currentRace) {
        container.innerHTML = `
            <div class="race-card current">
                <h3>${currentRace.name}</h3>
                <p>Date: ${new Date(currentRace.date).toLocaleString()}</p>
                <p>Coureurs: ${currentRace.runners.length}</p>
                <p>Tours enregistrés: ${currentRace.laps.length}</p>
                <p>Catégories: ${currentRace.categories.length}</p>
            </div>
        `;
    } else {
        container.innerHTML = '<p>Aucune course en cours</p>';
    }
}

/**
 * Affiche la liste des courses sauvegardées
 */
function displaySavedRaces() {
    const races = storageManager.getAllRaces();
    const container = document.getElementById('races-list');

    if (races.length === 0) {
        container.innerHTML = '<p>Aucune course sauvegardée</p>';
        return;
    }

    container.innerHTML = races.map(race => `
        <div class="race-card" data-id="${race.id}">
            <h3>${race.name}</h3>
            <p>Date: ${new Date(race.date).toLocaleString()}</p>
            <p>Coureurs: ${race.runners.length}</p>
            <p>Tours enregistrés: ${race.laps.length}</p>
            <p>Catégories: ${race.categories.length}</p>
            <div class="race-actions">
                <button onclick="loadRace(${race.id})" class="secondary-btn">Charger</button>
                <button onclick="deleteRace(${race.id})" class="danger-btn">Supprimer</button>
            </div>
        </div>
    `).join('');
}

/**
 * Crée une nouvelle course
 */
function createNewRace() {
    const name = prompt('Nom de la course :');
    if (name) {
        // Réinitialiser les données actuelles
        localStorage.removeItem('runners');
        localStorage.removeItem('laps');
        localStorage.removeItem('categories');
        
        // Créer la nouvelle course
        storageManager.saveRace(name);
        
        // Rafraîchir l'affichage
        displayCurrentRace();
        displaySavedRaces();
    }
}

/**
 * Sauvegarde la course actuelle
 */
function saveCurrentRace() {
    const name = prompt('Nom de la course :');
    if (name) {
        storageManager.saveRace(name);
        displayCurrentRace();
        displaySavedRaces();
    }
}

/**
 * Charge une course sauvegardée
 */
function loadRace(raceId) {
    if (confirm('Voulez-vous charger cette course ? Les données actuelles seront remplacées.')) {
        storageManager.loadRace(raceId);
        displayCurrentRace();
        displaySavedRaces();
    }
}

/**
 * Supprime une course sauvegardée
 */
function deleteRace(raceId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette course ?')) {
        storageManager.deleteRace(raceId);
        displayCurrentRace();
        displaySavedRaces();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('new-race-btn').addEventListener('click', createNewRace);
    document.getElementById('save-current-btn').addEventListener('click', saveCurrentRace);
    
    displayCurrentRace();
    displaySavedRaces();
}); 