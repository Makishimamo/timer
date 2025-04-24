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
                <span class="lap-number">Tour ${index + 1}</span>
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
 * Initialisation des événements.
 */
function initializeEventListeners() {
    startBtn.addEventListener('click', startTimer);
    lapBtn.addEventListener('click', recordLap);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
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
document.addEventListener("DOMContentLoaded", initializeEventListeners);

// Initialisation
resetTimer();
