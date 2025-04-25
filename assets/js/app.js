// Variables globales
let startTime;
let elapsedTime = 0;
let timerInterval;
let isRunning = false;
let laps = [];

// Éléments du DOM
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const calculateBtn = document.getElementById('calculateBtn');
const lapsList = document.getElementById('lapsList');

/**
 * Démarre le chronomètre.
 */
function startTimer() {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateTimer, 10);
        isRunning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        lapBtn.disabled = false;
        console.log("La course a commencé !");
    }
}

/**
 * Enregistre un LAP.
 */
function recordLap() {
    if (isRunning) {
        const lapTime = formatTime(elapsedTime);
        laps.unshift({
            time: lapTime,
            dossard: '',
            runnerInfo: null
        });
        displayLaps();
        console.log(`LAP enregistré : ${lapTime}`);
        
        // Sauvegarde dans le localStorage
        localStorage.setItem('laps', JSON.stringify(laps));
    }
}

/**
 * Arrête le chronomètre.
 */
function stopTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        lapBtn.disabled = true;
        console.log("La course est arrêtée !");

        // Sauvegarde automatique de la course en cours
        if (laps.length > 0) {
            const currentRace = storageManager.getCurrentRace();
            if (!currentRace) {
                storageManager.saveRace(`Course du ${new Date().toLocaleDateString()}`);
            }
        }
    }
}

/**
 * Met à jour l'affichage du chronomètre au format HH:MM:SS.mmm.
 */
function updateTimer() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    timerDisplay.textContent = formatTime(elapsedTime);
}

/**
 * Formate le temps en HH:MM:SS.mmm.
 * @param {number} time - Temps en millisecondes.
 * @returns {string} - Temps formaté.
 */
function formatTime(ms) {
    const date = new Date(ms);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Affiche les LAPs dans la liste.
 */
function displayLaps() {
    lapsList.innerHTML = '';
    laps.forEach((lap, index) => {
        const lapElement = document.createElement('div');
        lapElement.className = 'lap-item';
        lapElement.innerHTML = `
            <div class="lap-info">
                <span class="lap-number">LAP ${laps.length - index}</span>
                <span class="lap-time">${lap.time}</span>
            </div>
            <div class="lap-runner">
                <input type="text" class="dossard-input" placeholder="N° dossard" value="${lap.dossard}">
                <span class="runner-name">${lap.runnerInfo ? `${lap.runnerInfo.nom} ${lap.runnerInfo.prenom}` : ''}</span>
            </div>
        `;

        const dossardInput = lapElement.querySelector('.dossard-input');
        dossardInput.addEventListener('change', function() {
            const dossard = this.value;
            
            // Vérifier si le dossard est déjà utilisé dans un autre tour
            const isDossardUsed = laps.some((otherLap, otherIndex) => 
                otherIndex !== index && otherLap.dossard === dossard
            );

            if (isDossardUsed) {
                alert('Ce dossard a déjà été utilisé pour un autre tour');
                this.value = '';
                return;
            }

            const runners = JSON.parse(localStorage.getItem('runners') || '[]');
            const runner = runners.find(r => r.dossard == dossard);

            if (runner) {
                lap.dossard = dossard;
                lap.runnerInfo = runner;
                displayLaps();
                localStorage.setItem('laps', JSON.stringify(laps));
            } else {
                alert('Dossard non trouvé');
                this.value = '';
            }
        });

        lapsList.appendChild(lapElement);
    });
}

/**
 * Exporte les temps des LAPs dans un fichier Excel.
 */
function exportToExcel() {
    if (laps.length === 0) {
        alert("Aucun temps enregistré à exporter !");
        return;
    }

    const data = laps.map((lap, index) => ({
        "Numéro du LAP": index + 1,
        "Temps (HH:MM:SS.mmm)": lap.time,
        "Numéro de dossard": lap.dossard
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Temps LAPs");

    const excelFileName = `laps_temps_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(workbook, excelFileName);

    console.log(`Fichier Excel exporté : ${excelFileName}`);
}

/**
 * Réinitialise l'application.
 */
function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    timerDisplay.textContent = formatTime(0);
    laps = [];
    displayLaps();
    
    // Supprimer les données du localStorage
    localStorage.removeItem('laps');
    
    console.log("Application réinitialisée");
}

/**
 * Calcule le classement des coureurs.
 */
function calculateRanking() {
    if (laps.length === 0) {
        alert("Aucun temps enregistré pour calculer le classement !");
        return;
    }

    // Vérifier que tous les tours ont un dossard associé
    const incompleteLaps = laps.filter(lap => !lap.dossard);
    if (incompleteLaps.length > 0) {
        alert("Certains tours n'ont pas de dossard associé. Veuillez compléter tous les tours avant de calculer le classement.");
        return;
    }

    // Trier les tours par temps
    const sortedLaps = [...laps].sort((a, b) => {
        const timeA = convertTimeToMs(a.time);
        const timeB = convertTimeToMs(b.time);
        return timeA - timeB;
    });

    // Sauvegarder le classement dans le localStorage
    localStorage.setItem('ranking', JSON.stringify(sortedLaps));
    
    // Rediriger vers la page de classement
    window.location.href = 'classement.html';
}

/**
 * Convertit un temps formaté en millisecondes.
 * @param {string} time - Temps au format HH:MM:SS.mmm
 * @returns {number} - Temps en millisecondes
 */
function convertTimeToMs(time) {
    const [hours, minutes, seconds] = time.split(':');
    const [sec, ms] = seconds.split('.');
    return (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(sec)) * 1000 + parseInt(ms);
}

/**
 * Initialisation des événements.
 */
function initializeEventListeners() {
    startBtn.addEventListener('click', startTimer);
    lapBtn.addEventListener('click', recordLap);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
    calculateBtn.addEventListener('click', calculateRanking);
    document.getElementById("export-button").addEventListener("click", exportToExcel);

    // Touche espace pour démarrer/arrêter
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (isRunning) {
                stopTimer();
            } else {
                startTimer();
            }
        }
    });

    // Touche L pour enregistrer un tour
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyL' && isRunning) {
            e.preventDefault();
            recordLap();
        }
    });
}

// Initialisation des événements au chargement de la page
document.addEventListener("DOMContentLoaded", function() {
    initializeEventListeners();
    
    // Charger la course en cours s'il y en a une
    const currentRace = storageManager.getCurrentRace();
    if (currentRace) {
        laps = currentRace.laps;
        displayLaps();
    }
    
    resetTimer();
});
