const STORAGE_KEY = 'EcoPlantio_PlayerName';
const LEVEL_STATUS_KEY = 'EcoPlantio_LevelStatus_UnlockedUpTo';
const playerNameInput = document.getElementById('player-name');
const btnPlay = document.getElementById('btn-play');

// --- Funções de Tela Inicial ---

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

// --- Funções de Controle de Nível (Globais) ---

function getUnlockedLevel() {
    const unlockedLevel = localStorage.getItem(LEVEL_STATUS_KEY);
    return parseInt(unlockedLevel) || 1; 
}

function unlockNextLevel(levelNumber) {
    const currentMax = getUnlockedLevel();
    if (levelNumber > currentMax) {
        localStorage.setItem(LEVEL_STATUS_KEY, levelNumber);
    }

    // Apenas recarrega se estiver na tela de níveis
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
    
    
}


// Event Listener Principal para a Home e Níveis
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
});