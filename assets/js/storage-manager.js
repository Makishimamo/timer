/**
 * Gestionnaire de stockage des courses
 */
class StorageManager {
    constructor() {
        this.RACES_KEY = 'saved_races';
        this.CURRENT_RACE_KEY = 'current_race';
    }

    /**
     * Sauvegarde une nouvelle course
     */
    saveRace(raceName = null) {
        const currentRace = {
            id: new Date().getTime(),
            name: raceName || `Course du ${new Date().toLocaleDateString()}`,
            date: new Date().toISOString(),
            runners: JSON.parse(localStorage.getItem('runners') || '[]'),
            laps: JSON.parse(localStorage.getItem('laps') || '[]'),
            categories: JSON.parse(localStorage.getItem('categories') || '[]')
        };

        // Récupérer les courses existantes
        const races = JSON.parse(localStorage.getItem(this.RACES_KEY) || '[]');
        races.push(currentRace);

        // Sauvegarder
        localStorage.setItem(this.RACES_KEY, JSON.stringify(races));
        localStorage.setItem(this.CURRENT_RACE_KEY, JSON.stringify(currentRace));

        return currentRace;
    }

    /**
     * Charge une course spécifique
     */
    loadRace(raceId) {
        const races = JSON.parse(localStorage.getItem(this.RACES_KEY) || '[]');
        const race = races.find(r => r.id === raceId);

        if (race) {
            localStorage.setItem('runners', JSON.stringify(race.runners));
            localStorage.setItem('laps', JSON.stringify(race.laps));
            localStorage.setItem('categories', JSON.stringify(race.categories));
            localStorage.setItem(this.CURRENT_RACE_KEY, JSON.stringify(race));
            return race;
        }
        return null;
    }

    /**
     * Récupère toutes les courses sauvegardées
     */
    getAllRaces() {
        return JSON.parse(localStorage.getItem(this.RACES_KEY) || '[]');
    }

    /**
     * Récupère la course actuelle
     */
    getCurrentRace() {
        return JSON.parse(localStorage.getItem(this.CURRENT_RACE_KEY) || 'null');
    }

    /**
     * Supprime une course
     */
    deleteRace(raceId) {
        let races = JSON.parse(localStorage.getItem(this.RACES_KEY) || '[]');
        races = races.filter(r => r.id !== raceId);
        localStorage.setItem(this.RACES_KEY, JSON.stringify(races));

        // Si c'est la course actuelle, on la supprime aussi
        const currentRace = this.getCurrentRace();
        if (currentRace && currentRace.id === raceId) {
            localStorage.removeItem(this.CURRENT_RACE_KEY);
        }
    }
}

// Export de l'instance
window.storageManager = new StorageManager(); 