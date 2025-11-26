const STORAGE_KEY = 'EcoPlantio_PlayerName';
const LEVEL_STATUS_KEY = 'EcoPlantio_LevelStatus_UnlockedUpTo';
const playerNameInput = document.getElementById('player-name');
const btnPlay = document.getElementById('btn-play');

const TOTAL_HOLES = 20;
const TIME_LIMIT = 5 * 60; 
const HOLE_IMAGE_SRC = 'itens_jogo_img/nivel_2/buraco.png';
const MOUND_IMAGE_SRC = 'itens_jogo_img/nivel_2/montinho_terra.png'; 

let selectedSeedType = null;
let holesStatus = []; 
let timerInterval = null;
let timeRemaining = TIME_LIMIT;
let startTime = null;
let isGamePaused = false; 
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
    

    holesStatus = Array(TOTAL_HOLES).fill('empty');
    
    for (let i = 0; i < TOTAL_HOLES; i++) {
        const holeButton = document.createElement('button');
        holeButton.classList.add('hole-slot');
        holeButton.setAttribute('data-index', i);
        holeButton.innerHTML = `<img src="${HOLE_IMAGE_SRC}" alt="Cova para Plantio">`;
        
        holeButton.addEventListener('click', () => handlePlanting(i, holeButton));
        grid.appendChild(holeButton);
    }
}

function handlePlanting(index, buttonElement) {
    if (isGamePaused) return; 

    if (holesStatus[index] !== 'empty') {
        return;
    }
    
    if (!selectedSeedType) {
        alert('Selecione um saco de sementes (bom ou ruim) primeiro!');
        return;
    }

    holesStatus[index] = selectedSeedType;

    buttonElement.classList.add('planted');
    buttonElement.innerHTML = `<img src="${MOUND_IMAGE_SRC}" alt="Cova Plantada">`;

    if (holesStatus.filter(status => status !== 'empty').length === TOTAL_HOLES) {
        clearInterval(timerInterval);
        endLevel(true); 
    }
}

function handleSeedSelection() {
    const seedButtons = document.querySelectorAll('.seed-button');
    seedButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (isGamePaused) return; 
            
            seedButtons.forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
            selectedSeedType = button.getAttribute('data-type');
        });
    });
}

function togglePause() {

    isGamePaused = !isGamePaused;
    const btnPause = document.getElementById('btn-pause');
    const img = btnPause ? btnPause.querySelector('img') : null;

    if (isGamePaused) {

        if (timerInterval) {
            clearInterval(timerInterval);
        }

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

    startTime = Date.now();
    
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
    const planted = holesStatus.filter(status => status !== 'empty').length;
    const badSeeds = holesStatus.filter(status => status === 'ruim').length;
    const missing = TOTAL_HOLES - planted;
    let stars = 0;
    let performance = "requer atenção redobrada";
    
    // Critérios de Estrelas
    if (badSeeds === 0 && missing === 0) {
        stars = 3;
        performance = "bom";
    } else if ((badSeeds <= 2 && missing <= 2) && !(badSeeds === 0 && missing === 0)) {
        stars = 2;
        performance = "regular";
    } else if (badSeeds >= 3 || missing >= 3) {
        stars = 1;
        performance = "necessita acompanhamento";
    }
    
    if (badSeeds >= 10 || missing >= 10) {
         stars = 0;
         performance = "requer atenção redobrada";
    }


    return { planted, badSeeds, missing, stars, performance };
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
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationSeconds = Math.round(durationMs / 1000);

    const { planted, badSeeds, missing, stars, performance } = calculateScore();

    const playerName = localStorage.getItem(STORAGE_KEY) || 'Jogador Desconhecido';

    const statsContent = `
NÍVEL 2 - PLANTIO
=========================================
Jogador: ${playerName}
Tempo Total (segundos): ${durationSeconds}
Covas Preenchidas: ${planted}
Sementes Ruins Plantadas: ${badSeeds}
Covas Faltando: ${missing}
Desempenho: ${performance}
Estrelas Ganhas: ${stars}
=========================================
    `;
    
    console.log("Estatísticas do Nível 2 geradas:", statsContent);
    downloadStatsFile(statsContent, 'estatisticas_nivel2.txt');

    if (stars > 0) {
        unlockNextLevel(3);
    }

    alert(`Nível 2 Finalizado!
    Status: ${completed ? 'Completo' : 'Tempo Esgotado'}
    Sementes Ruins: ${badSeeds}
    Covas Faltando: ${missing}
    Estrelas: ${stars} (${performance})
    Redirecionando para a tela de Níveis...`);

    window.location.href = 'niveis.html';
}


function initializePlantingScreen() {
    createHoleGrid();
    handleSeedSelection();
    
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
        btnPause.addEventListener('click', togglePause);
    }

    startTimer();
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('planting-screen')) {
        initializePlantingScreen();
    }
});