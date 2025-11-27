const STORAGE_KEY = 'EcoPlantio_PlayerName';
const LEVEL_STATUS_KEY = 'EcoPlantio_LevelStatus_UnlockedUpTo';
const playerNameInput = document.getElementById('player-name');
const btnPlay = document.getElementById('btn-play');

const TOTAL_HOLES = 20;
const TIME_LIMIT = 5 * 60; 
const MATURE_PLANT_IMG = 'itens_jogo_img/nivel_4/repolho.png';
const EMPTY_HOLE_IMG = 'itens_jogo_img/nivel_2/buraco.png';

let holesStatus = []; 
let selectedHoleIndex = null;
let timerInterval = null;
let timeRemaining = TIME_LIMIT;
let startTime = null;
let isGamePaused = false;
let isLevelOver = false;

function getUnlockedLevel() {
    const unlockedLevel = localStorage.getItem(LEVEL_STATUS_KEY);
    return parseInt(unlockedLevel) || 1; 
}

function unlockNextLevel(levelNumber) {
    const currentMax = getUnlockedLevel();
    if (levelNumber > currentMax) {
        localStorage.setItem(LEVEL_STATUS_KEY, levelNumber);
    }
}

function createHoleGrid() {
    const grid = document.getElementById('hole-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    holesStatus = Array(TOTAL_HOLES).fill('mature'); 
    
    for (let i = 0; i < TOTAL_HOLES; i++) {
        const holeButton = document.createElement('button');
        holeButton.classList.add('hole-slot');
        holeButton.setAttribute('data-index', i);
        holeButton.innerHTML = `<img src="${MATURE_PLANT_IMG}" alt="Planta Madura">`;
        
        holeButton.addEventListener('click', () => selectHole(i, holeButton));
        grid.appendChild(holeButton);
    }
}

function selectHole(index, buttonElement) {
    if (isGamePaused || isLevelOver) return;
    if (holesStatus[index] === 'harvested') return; 

    selectedHoleIndex = index;

    const allSlots = document.querySelectorAll('.hole-slot');
    allSlots.forEach(slot => slot.style.border = 'none'); 
    
    buttonElement.style.border = '4px solid #0082fc';
    buttonElement.style.borderRadius = '15px';
}

function attemptHarvest() {
    if (isGamePaused || isLevelOver || selectedHoleIndex === null) return;

    if (holesStatus[selectedHoleIndex] === 'mature') {
        harvestPlant(selectedHoleIndex);
    }
}

function harvestPlant(index) {
    const buttonElement = document.querySelector(`.hole-slot[data-index="${index}"]`);
    if (!buttonElement) return;

    holesStatus[index] = 'harvested';
    buttonElement.innerHTML = `<img src="${EMPTY_HOLE_IMG}" alt="Cova Vazia">`;
    buttonElement.classList.add('planted'); 
    buttonElement.style.border = 'none'; 
    
    selectedHoleIndex = null;

    // Verifica vitória
    const harvestedCount = holesStatus.filter(status => status === 'harvested').length;
    if (harvestedCount === TOTAL_HOLES) {
        clearInterval(timerInterval);
        endLevel(true); 
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'c') {
        attemptHarvest();
    }
});

function togglePause() {
    if (isLevelOver) return;

    isGamePaused = !isGamePaused;
    const btnPause = document.getElementById('btn-pause');
    const img = btnPause ? btnPause.querySelector('img') : null;

    if (isGamePaused) {
        if (timerInterval) clearInterval(timerInterval);
        if (img) {
            img.src = 'itens_jogo_img/Play.png';
            img.alt = 'Continuar';
        }
    } else {
        startTimer();
        if (img) {
            img.src = 'itens_jogo_img/pause.png';
            img.alt = 'Pausar';
        }
    }
}

function startTimer() {
    const timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay || isGamePaused) return;

    if (!startTime) startTime = Date.now();

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeRemaining--;
        
        const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
        const seconds = String(timeRemaining % 60).padStart(2, '0');
        
        timerDisplay.textContent = `${minutes}:${seconds}`;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endLevel(false); 
        }
    }, 1000);
}

function calculateScore() {
    const harvested = holesStatus.filter(status => status === 'harvested').length;
    const missing = TOTAL_HOLES - harvested;
    
    let stars = 0;
    let performance = "requer atenção redobrada";

    if (missing === 0) {
        stars = 3;
        performance = "bom";
    } else if (missing <= 2) {
        stars = 2;
        performance = "regular";
    } else if (missing >= 10) {
        stars = 0;
        performance = "requer atenção redobrada";
    } else if (missing >= 3) {
        stars = 1;
        performance = "necessita acompanhamento";
    }

    return { harvested, missing, stars, performance };
}

function downloadStatsFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link); 
    link.click(); 
    setTimeout(() => {
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
    }, 100); 
}

function endLevel(completed) {
    isLevelOver = true;
    const endTime = Date.now();
    const durationSeconds = TIME_LIMIT - timeRemaining; 

    const { harvested, missing, stars, performance } = calculateScore();
    const playerName = localStorage.getItem(STORAGE_KEY) || 'Jogador Desconhecido';

    const statsContent = `
NÍVEL 4 - COLHEITA
=========================================
Jogador: ${playerName}
Tempo Total (segundos): ${durationSeconds}
Plantas Colhidas: ${harvested}
Plantas Faltando: ${missing}
Desempenho: ${performance}
Estrelas Ganhas: ${stars}
=========================================
    `;
    
    console.log("Estatísticas do Nível 4 geradas.");
    downloadStatsFile(statsContent, `Relatorio_Nivel4_${playerName}.txt`);; 

    let statusMsg = completed ? 'Todas as plantas colhidas!' : 'O tempo acabou!';
    
    alert(`Nível 4 Finalizado!
    Status: ${statusMsg}
    Plantas Colhidas: ${harvested}/${TOTAL_HOLES}
    Estrelas: ${stars} (${performance})
    
    Obrigado por jogar EcoPlantio!`);

    window.location.href = 'tela_final.html'; 
}

function initializeHarvestScreen() {
    createHoleGrid();
    
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
        btnPause.addEventListener('click', togglePause);
    }

    startTimer();
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('planting-screen') || document.querySelector('script[src*="fase4.js"]')) {
        initializeHarvestScreen();
    }
});

function initializePlowingScreen() {
    const plowingScreen = document.getElementById('plowing-screen');
    if (!plowingScreen) return;
    
    tractorContainer = document.getElementById('tractor-container');
    gameArea = document.getElementById('game-area-fase1');
    timerDisplay = document.getElementById('timer-display');
    btnPause = document.getElementById('btn-pause');
    
    if (btnPause) {
        btnPause.addEventListener('click', togglePause);
    }

    updateTractorPosition();
    
    const obstacleElements = document.querySelectorAll('.obstacle');
    totalObstacles = obstacleElements.length;

    obstacleElements.forEach(obs => {
        obs.addEventListener('click', () => handleObstacleClick(obs));
        obstacles.push(obs);
    });

    document.addEventListener('keydown', handleKeyDown);
    
    startTimerF1();
}

document.addEventListener('DOMContentLoaded', () => {
    initializePlowingScreen();
});

document.addEventListener('DOMContentLoaded', () => {

    const video = document.getElementById('demo-video');
    const btnPlayPause = document.getElementById('btn-play-pause');
    
    if (video && btnPlayPause) {
        const icon = btnPlayPause.querySelector('img');

        btnPlayPause.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                icon.src = 'itens_jogo_img/pause.png'; 
                icon.alt = 'Pausar';
            } else {
                video.pause();
                icon.src = 'itens_jogo_img/Play.png'; 
                icon.alt = 'Reproduzir';
            }
        });
        
        video.addEventListener('ended', () => {
            icon.src = 'itens_jogo_img/Play.png';
            icon.alt = 'Reproduzir';
        });
    }
});