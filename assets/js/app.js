// Variables globales
let startTime = null;
let timerInterval = null;
let laps = [];
let isRunning = false;

/**
 * Démarre le chronomètre.
 */
function startTimer() {
    if (isRunning) {
        console.warn("Le chronomètre est déjà en cours !");
        return;
    }
    startTime = Date.now();
    timerInterval = setInterval(updateTimerDisplay, 1000);
    isRunning = true;
    console.log("La course a commencé !");
}

/**
 * Enregistre un LAP.
 */
function recordLap() {
    if (!isRunning) {
        console.error("Le chronomètre n'a pas été démarré !");
        alert("Veuillez démarrer le chronomètre avant d'enregistrer un LAP !");
        return;
    }
    const lapTime = Date.now() - startTime;
    const formattedTime = formatTime(lapTime);
    laps.push(formattedTime);
    displayLapTime(formattedTime);
    console.log(`LAP enregistré : ${formattedTime}`);
}

/**
 * Arrête le chronomètre.
 */
function stopTimer() {
    if (!isRunning) {
        console.warn("Le chronomètre n'est pas en cours !");
        return;
    }
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    console.log("La course est arrêtée !");
}

/**
 * Réinitialise le chronomètre.
 */
function resetTimer() {
    stopTimer();
    startTime = null;
    laps = [];
    document.getElementById("timer-display").textContent = "00:00:00";
    document.getElementById("laps-list").innerHTML = "";
    console.log("Le chronomètre a été réinitialisé !");
}

/**
 * Met à jour l'affichage du chronomètre au format HH:MM:SS.
 */
function updateTimerDisplay() {
    const timerDisplay = document.getElementById("timer-display");
    const elapsedTime = Date.now() - startTime;
    timerDisplay.textContent = formatTime(elapsedTime);
}

/**
 * Formate le temps en HH:MM:SS.
 * @param {number} time - Temps en millisecondes.
 * @returns {string} - Temps formaté.
 */
function formatTime(time) {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
}

/**
 * Ajoute un zéro devant les nombres inférieurs à 10.
 * @param {number} num - Le nombre à formater.
 * @returns {string} - Nombre formaté avec un zéro devant si nécessaire.
 */
function padNumber(num) {
    return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Affiche le temps d'un LAP dans la liste.
 * @param {string} time - Temps formaté HH:MM:SS.
 */
function displayLapTime(time) {
    const lapList = document.getElementById("laps-list");
    const lapElement = document.createElement("li");
    lapElement.textContent = `LAP: ${time}`;
    lapList.appendChild(lapElement);
}

/**
 * Exporte les temps des LAPs dans un fichier Excel.
 * @param {Array<string>} laps - Liste des temps des LAPs.
 */
function exportToExcel(laps) {
    if (laps.length === 0) {
        alert("Aucun temps enregistré à exporter !");
        return;
    }

    const data = laps.map((lap, index) => ({
        "Numéro du LAP": index + 1,
        "Temps (HH:MM:SS)": lap,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Temps LAPs");

    const excelFileName = "laps_temps.xlsx";
    XLSX.writeFile(workbook, excelFileName);

    console.log(`Fichier Excel exporté : ${excelFileName}`);
}

/**
 * Initialisation des événements.
 */
function initializeEventListeners() {
    const startButton = document.getElementById("start-timer");
    const lapButton = document.getElementById("lap-timer");
    const stopButton = document.getElementById("stop-timer");
    const resetButton = document.getElementById("reset-timer");
    const exportButton = document.getElementById("export-button");

    if (!startButton || !lapButton || !stopButton || !resetButton || !exportButton) {
        console.error("Un ou plusieurs boutons sont manquants dans le HTML !");
        return;
    }

    startButton.addEventListener("click", startTimer);
    lapButton.addEventListener("click", recordLap);
    stopButton.addEventListener("click", stopTimer);
    resetButton.addEventListener("click", resetTimer);
    exportButton.addEventListener("click", () => exportToExcel(laps));
}

// Initialisation des événements au chargement de la page
document.addEventListener("DOMContentLoaded", initializeEventListeners);
