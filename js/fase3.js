const STORAGE_KEY = 'EcoPlantio_PlayerName';
const LEVEL_STATUS_KEY = 'EcoPlantio_LevelStatus_UnlockedUpTo';

const playerNameInput = document.getElementById('player-name');
const btnPlay = document.getElementById('btn-play');

// Configurações da Fase 3
const TOTAL_HOLES = 20;
const TIME_LIMIT = 5 * 60; // 5 minutos
const HOLE_IMAGE_SRC = 'itens_jogo_img/nivel_3/plantinha.png'; 
const MOUND_IMAGE_SRC = 'itens_jogo_img/nivel_3/planta_molhada.png';

let selectedItemType = null; 
let holesStatus = []; 
let timerInterval = null;
let timeRemaining = TIME_LIMIT;
let startTime = null;
let isGamePaused = false; 

// --- Funções de Sistema ---
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

// --- Funções da Fase 3 ---

function createPlantGrid() {
    const grid = document.getElementById('plant-grid'); 
    if (!grid) return;
    
    holesStatus = Array(TOTAL_HOLES).fill('empty');
    grid.innerHTML = ''; 

    for (let i = 0; i < TOTAL_HOLES; i++) {
        const plantButton = document.createElement('button');
        plantButton.classList.add('plant-slot'); 
        plantButton.setAttribute('data-index', i);
        plantButton.innerHTML = `<img src="${HOLE_IMAGE_SRC}" alt="Planta para Adubar">`;
        
        plantButton.addEventListener('click', () => handleAdubation(i, plantButton));
        grid.appendChild(plantButton);
    }
}

function handleAdubation(index, buttonElement) {
    if (isGamePaused) return; 

    if (holesStatus[index] !== 'empty') {
        return;
    }
    
    if (!selectedItemType) {
        alert('Selecione um item (Adubo ou Agrotóxico) na barra lateral primeiro!');
        return;
    }

    holesStatus[index] = selectedItemType;

    buttonElement.classList.add('planted');
    buttonElement.innerHTML = `<img src="${MOUND_IMAGE_SRC}" alt="Planta Adubada">`;

    const treatedCount = holesStatus.filter(status => status !== 'empty').length;
    if (treatedCount === TOTAL_HOLES) {
        clearInterval(timerInterval);
        endLevel(true); 
    }
}

function handleItemSelection() {
    const itemButtons = document.querySelectorAll('.plant-button');
    
    itemButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (isGamePaused) return; 
            
            itemButtons.forEach(b => b.classList.remove('selected'));
            
            button.classList.add('selected');
            
            selectedItemType = button.getAttribute('data-type');
        });
    });
}

// --- Pausa e Timer ---

function togglePause() {
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

// --- Pontuação e Finalização ---

function calculateScore() {
    const treated = holesStatus.filter(status => status !== 'empty').length;
    const badItems = holesStatus.filter(status => status === 'ruim').length;
    const missing = TOTAL_HOLES - treated;
    
    let stars = 0;
    let performance = "requer atenção redobrada";
    
    if (badItems === 0 && missing === 0) {
        stars = 3;
        performance = "bom";
    } else if (badItems <= 2 && missing <= 2) {
        stars = 2;
        performance = "regular";
    } else if (badItems < 10 && missing < 10) {
        stars = 1;
        performance = "necessita acompanhamento";
    }
    
    return { treated, badItems, missing, stars, performance };
}

function downloadStatsFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }, 100);
}

function saveLevelStars(level, stars) {
    const key = `EcoPlantio_Level_${level}_Stars`;
    localStorage.setItem(key, stars);
}

function endLevel(completed) {
    const durationSeconds = TIME_LIMIT - timeRemaining;
    const { treated, badItems, missing, stars, performance } = calculateScore();

    saveLevelStars(3, stars);

    const playerName = localStorage.getItem(STORAGE_KEY) || 'Jogador';

    const statsContent = `
NÍVEL 3 - ADUBAÇÃO
=========================================
Jogador: ${playerName}
Tempo Total: ${durationSeconds}s
Plantas Tratadas: ${treated}
Agrotóxicos: ${badItems}
Faltando: ${missing}
Desempenho: ${performance}
Estrelas: ${stars}
=========================================
    `;
    
    downloadStatsFile(statsContent, `Relatorio_Nivel3_${playerName}.txt`);

    if (stars > 0) {
        unlockNextLevel(4);
    }

    // CORREÇÃO AQUI: Trocado 'badSeeds' por 'badItems'
    alert(`Nível 3 Finalizado!
    Status: ${completed ? 'Completo' : 'Tempo Esgotado'}
    Agrotóxicos Usados: ${badItems}
    Plantas Faltando: ${missing}
    Estrelas: ${stars} (${performance})
    Verifique o console para o arquivo de estatísticas.
    Redirecionando para a tela de Níveis...`);
    
    window.location.href = 'niveis.html';
}

function initializeAdubationScreen() {
    createPlantGrid();
    handleItemSelection();
    
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) btnPause.addEventListener('click', togglePause);
    
    startTimer();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('watering-screen')) {
        initializeAdubationScreen();
    }
});

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