const STORAGE_KEY = 'EcoPlantio_PlayerName';
const LEVEL_STATUS_KEY = 'EcoPlantio_LevelStatus_UnlockedUpTo';
const playerNameInput = document.getElementById('player-name');
const btnPlay = document.getElementById('btn-play');

// Constantes da Fase 2
const TOTAL_HOLES = 20;
const TIME_LIMIT = 5 * 60; // 5 minutos em segundos
const HOLE_IMAGE_SRC = 'itens_jogo_img/nivel_2/buraco.png';
const MOUND_IMAGE_SRC = 'itens_jogo_img/nivel_2/montinho_terra.png'; // Imagem do montículo de terra

let selectedSeedType = null;
let holesStatus = []; // Array para rastrear o estado de cada cova: 'empty', 'boa', 'ruim'
let timerInterval = null;
let timeRemaining = TIME_LIMIT;
let startTime = null;

function loadAndCheckPlayerName() {
    if (playerNameInput && btnPlay) {
        const savedName = localStorage.getItem(STORAGE_KEY);
        
        if (savedName) {
            playerNameInput.value = savedName;
        }
    
        checkPlayButtonState();
    
        playerNameInput.addEventListener('input', checkPlayButtonState);
    }
}

function checkPlayButtonState() {
    if (btnPlay && playerNameInput) {
        const name = playerNameInput.value.trim();
        const isNameValid = name.length > 0;
        
        btnPlay.disabled = !isNameValid;
        
        if (isNameValid) {
            localStorage.setItem(STORAGE_KEY, name);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

function handlePlayButtonClick() {
    if (btnPlay && !btnPlay.disabled) {
        window.location.href = 'niveis.html';
    }
}

function getUnlockedLevel() {
    const unlockedLevel = localStorage.getItem(LEVEL_STATUS_KEY);
    return parseInt(unlockedLevel) || 1; 
}

function unlockNextLevel(levelNumber) {
    const currentMax = getUnlockedLevel();
    if (levelNumber > currentMax) {
        localStorage.setItem(LEVEL_STATUS_KEY, levelNumber);
    }

    if (document.getElementById('levels-screen')) {
         window.location.reload(); 
    }
}

function initializeLevelsScreen() {
    const unlockedUpTo = getUnlockedLevel();
    const totalLevels = 4;
    const baseImagePath = 'itens_jogo_img/nivel_';
    
    const levelData = {
        1: { name: 'Preparo do Solo', link: 'fase1.html' },
        2: { name: 'Plantio', link: 'demo_fase2.html' },
        3: { name: 'Adubação', link: 'fase3.html' },
        4: { name: 'Colheita', link: 'fase4.html' }
    };
    
    for (let i = 1; i <= totalLevels; i++) {
        const levelButton = document.querySelector(`.level-button[data-level="${i}"]`);
        const levelImage = document.getElementById(`img-level-${i}`);
        
        if (levelButton && levelImage) {
            if (i <= unlockedUpTo) {
                let levelPath;
                if (i === 1) {
                    levelPath = '1/layoutNível1.png';
                } else {
                    levelPath = `${i}/nível${i}Liberado.png`;
                }
                
                levelImage.src = `${baseImagePath}${levelPath}`;
                levelImage.alt = `Nível ${i}: ${levelData[i].name}`;
                levelButton.classList.remove('locked');
                levelButton.disabled = false;
                
                levelButton.addEventListener('click', () => {
                    window.location.href = levelData[i].link;
                });
                
            } else {
                levelImage.src = `${baseImagePath}${i}/layoutNível${i}Block.png`;
                levelImage.alt = `Nível ${i}: ${levelData[i].name} Bloqueado`;
                levelButton.classList.add('locked');
                levelButton.disabled = true;
            }
        }
    }
    
    // DEBUG: Botão para simular o desbloqueio do próximo nível.
    if (document.getElementById('levels-screen')) {
        let debugButton = document.getElementById('debug-unlock');
        if (!debugButton) {
            debugButton = document.createElement('button');
            debugButton.id = 'debug-unlock';
            debugButton.style.padding = '10px';
            debugButton.style.borderRadius = '5px';
            debugButton.style.backgroundColor = 'white';
            debugButton.style.border = '2px solid green';
            debugButton.style.cursor = 'pointer';
            debugButton.style.position = 'absolute';
            debugButton.style.bottom = '10px';
            debugButton.style.right = '10px';
            document.getElementById('levels-screen').appendChild(debugButton);
        }

        if (unlockedUpTo < totalLevels) {
            debugButton.textContent = `[DEBUG] Desbloquear Nível ${unlockedUpTo + 1}`;
            debugButton.onclick = () => {
                unlockNextLevel(unlockedUpTo + 1);
            };
            debugButton.disabled = false;
            debugButton.style.display = 'block';
        } else {
            debugButton.textContent = `[DEBUG] Todos os Níveis Desbloqueados`;
            debugButton.disabled = true;
            debugButton.style.display = 'block';
        }
    }
}

// ------------------------------------
// Funções para a Fase 2: Plantio
// ------------------------------------

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
    if (holesStatus[index] !== 'empty') {
        // Cova já plantada
        return;
    }
    
    if (!selectedSeedType) {
        alert('Selecione um saco de sementes (bom ou ruim) primeiro!');
        return;
    }

    // Marca a cova como plantada com o tipo de semente selecionado
    holesStatus[index] = selectedSeedType;

    // Atualiza o visual da cova (Feedback: Montículo de terra)
    buttonElement.classList.add('planted');
    buttonElement.innerHTML = `<img src="${MOUND_IMAGE_SRC}" alt="Cova Plantada">`;

    // Verifica se o nível terminou
    if (holesStatus.filter(status => status !== 'empty').length === TOTAL_HOLES) {
        clearInterval(timerInterval);
        endLevel(true); // Termina por completar
    }
}

function handleSeedSelection() {
    const seedButtons = document.querySelectorAll('.seed-button');
    seedButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove a classe 'selected' de todos os botões
            seedButtons.forEach(b => b.classList.remove('selected'));
            
            // Adiciona a classe 'selected' ao botão clicado
            button.classList.add('selected');
            
            // Atualiza a semente selecionada
            selectedSeedType = button.getAttribute('data-type');
        });
    });
}

function startTimer() {
    const timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay) return;

    startTime = Date.now();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        
        const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
        const seconds = String(timeRemaining % 60).padStart(2, '0');
        
        timerDisplay.textContent = `${minutes}:${seconds}`;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endLevel(false); // Termina por tempo esgotado
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
    // Caso contrário (10+ erros ou faltas), stars = 0, performance = "requer atenção redobrada" (já inicializado)
    
    if (badSeeds >= 10 || missing >= 10) {
         stars = 0;
         performance = "requer atenção redobrada";
    }


    return { planted, badSeeds, missing, stars, performance };
}

function saveLevelStars(level, stars) {
    const key = `EcoPlantio_Level_${level}_Stars`;
    localStorage.setItem(key, stars);
}


function endLevel(completed) {
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationSeconds = Math.round(durationMs / 1000);

    const { planted, badSeeds, missing, stars, performance } = calculateScore();

    saveLevelStars(2, stars);

    // 1. Gera o conteúdo do arquivo TXT (Estatísticas Detalhadas)
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
    
    // 2. Simula o download do arquivo TXT
    console.log("Estatísticas do Nível 2 geradas:", statsContent);
    downloadStatsFile(statsContent, 'estatisticas_nivel2.txt');

    // 3. Simula o avanço de nível (Desbloqueia o Nível 3)
    if (stars > 0) {
        unlockNextLevel(3);
    }

    alert(`Nível 2 Finalizado!
    Status: ${completed ? 'Completo' : 'Tempo Esgotado'}
    Sementes Ruins: ${badSeeds}
    Covas Faltando: ${missing}
    Estrelas: ${stars} (${performance})
    Verifique o console para o arquivo de estatísticas.
    Redirecionando para a tela de Níveis...`);

    // Redireciona para a tela de Níveis (para ver o Nível 3 desbloqueado, se for o caso)
    window.location.href = 'niveis.html';
}

function downloadStatsFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    // Simula o clique para iniciar o download
    // link.click();
    document.body.removeChild(link);
}


function initializePlantingScreen() {
    createHoleGrid();
    handleSeedSelection();
    startTimer();
}


// Event Listener Principal (Manter e Adicionar a nova inicialização)
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('home-screen')) {
        loadAndCheckPlayerName();

        if (btnPlay) {
            btnPlay.addEventListener('click', handlePlayButtonClick);
        }
    }

    if (document.getElementById('levels-screen')) {
        initializeLevelsScreen();
    }
    
    // NOVO: Inicializa a tela de plantio se for o caso
    if (document.getElementById('planting-screen')) {
        initializePlantingScreen();
    }
});