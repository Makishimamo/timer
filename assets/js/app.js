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
        console.error("Le chronomètre est déjà en cours !");
        return;
    }
    startTime = Date.now();
    timerInterval = setInterval(updateTimerDisplay, 10); // Mise à jour toutes les 10ms pour plus de précision
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
    const lapData = {
        time: formatTime(lapTime),
        dossard: ""
    };
    laps.push(lapData);
    displayLapTime(lapData, laps.length - 1);
    console.log(`LAP enregistré : ${lapData.time}`);
}

/**
 * Arrête le chronomètre.
 */
function stopTimer() {
    if (!isRunning) {
        console.error("Le chronomètre n'est pas en cours !");
        alert("Le chronomètre n'a pas été démarré !");
        return;
    }
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    console.log("La course est arrêtée !");
}

/**
 * Met à jour l'affichage du chronomètre au format HH:MM:SS.mmm.
 */
function updateTimerDisplay() {
    const timerDisplay = document.getElementById("timer-display");
    const elapsedTime = Date.now() - startTime;
    timerDisplay.textContent = formatTime(elapsedTime);
}

/**
 * Formate le temps en HH:MM:SS.mmm.
 * @param {number} time - Temps en millisecondes.
 * @returns {string} - Temps formaté.
 */
function formatTime(time) {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}.${padNumber(milliseconds)}`;
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
 * @param {string} time - Temps formaté HH:MM:SS.mmm.
 */
function displayLapTime(lapData, index) {
    const lapList = document.getElementById("laps-list");
    const lapElement = document.createElement("li");
    lapElement.style.display = "flex";
    lapElement.style.alignItems = "center";
    lapElement.style.gap = "10px";
    
    const lapInfo = document.createElement("span");
    lapInfo.textContent = `LAP ${index + 1}: ${lapData.time}`;
    
    const dossardInput = document.createElement("input");
    dossardInput.type = "number";
    dossardInput.min = "1";
    dossardInput.placeholder = "Numéro de dossard";
    dossardInput.style.padding = "5px";
    dossardInput.style.width = "100px";
    
    dossardInput.addEventListener("change", function() {
        laps[index].dossard = this.value;
        console.log(`Dossard ${this.value} ajouté pour le LAP ${index + 1}`);
    });
    
    lapElement.appendChild(lapInfo);
    lapElement.appendChild(dossardInput);
    lapList.appendChild(lapElement);
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
    if (isRunning) {
        stopTimer();
    }
    startTime = null;
    timerInterval = null;
    laps = [];
    isRunning = false;
    
    // Réinitialiser l'affichage
    document.getElementById("timer-display").textContent = "00:00:00.00";
    document.getElementById("laps-list").innerHTML = "";
    
    console.log("Application réinitialisée");
}

/**
 * Initialisation des événements.
 */
function initializeEventListeners() {
    document.getElementById("start-timer").addEventListener("click", startTimer);
    document.getElementById("lap-timer").addEventListener("click", recordLap);
    document.getElementById("stop-timer").addEventListener("click", stopTimer);
    document.getElementById("export-button").addEventListener("click", exportToExcel);
    document.getElementById("reset-timer").addEventListener("click", resetTimer);
}

// Initialisation des événements au chargement de la page
document.addEventListener("DOMContentLoaded", initializeEventListeners);
