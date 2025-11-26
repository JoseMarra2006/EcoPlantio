// js/fase2.js (Fase 2: Plantio Logic)

// --- Constantes Globais de Nível e Armazenamento ---
const LEVEL_STATUS_KEY = 'EcoPlantio_LevelStatus_UnlockedUpTo'; 
const TOTAL_HOLES = 20;
const TIME_LIMIT = 5 * 60; // 5 minutos em segundos
const HOLE_IMAGE_SRC = 'itens_jogo_img/nivel_2/buraco.png';
const MOUND_IMAGE_SRC = 'itens_jogo_img/nivel_2/montinho_terra.png'; 

let selectedSeedType = null;
let holesStatus = []; // Array para rastrear o estado de cada cova: 'empty', 'boa', 'ruim'
let timerInterval = null;
let timeRemaining = TIME_LIMIT;
let startTime = null;
let isGamePaused = false;

// --- Funções de Progresso Mínimas (Para auto-suficiência do Nível) ---
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

// --- Funções Específicas da Fase 2: Plantio ---

function createHoleGrid() {
    const grid = document.getElementById('hole-grid');
    if (!grid) return;
    
    // Inicializa o estado das 20 covas como 'empty'
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
    // Altera o estado de pausa
    isGamePaused = !isGamePaused;
    const btnPause = document.getElementById('btn-pause');
    const img = btnPause ? btnPause.querySelector('img') : null;

    if (isGamePaused) {
        // Pausa o timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        // Muda o ícone para Play
        if (img) {
            img.src = 'itens_jogo_img/Play.png';
            img.alt = 'Continuar';
        }
    } else {
        // Continua o timer
        startTimer();
        // Muda o ícone para Pause
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
    
    // 1. Cria a URL do objeto Blob
    link.href = URL.createObjectURL(blob);
    // 2. Define o nome do arquivo a ser baixado
    link.download = filename;
    
    // 3. Adiciona o link ao corpo do documento (necessário para o Firefox)
    document.body.appendChild(link); 
    
    // 4. CLICA NO LINK PARA INICIAR O DOWNLOAD
    link.click(); 

    // 5. Limpa a URL e remove o elemento após um pequeno atraso (para garantir o início do download)
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

    const statsContent = `
NÍVEL 2 - PLANTIO
=========================================
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

// Inicialização da Fase 2
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('planting-screen')) {
        initializePlantingScreen();
    }
});