
const STORAGE_KEY = 'EcoPlantio_PlayerName';
const LEVEL_STATUS_KEY = 'EcoPlantio_LevelStatus_UnlockedUpTo';
const playerNameInput = document.getElementById('player-name');
const btnPlay = document.getElementById('btn-play');

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
        2: { name: 'Plantio', link: 'fase2.html' },
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
    // Você pode usar esta função `unlockNextLevel()` dentro das suas fases 
    // (ex: no `fase1.html`, ao final do jogo, chamar `unlockNextLevel(2);`)
    if (document.getElementById('levels-screen')) {
        let debugButton = document.getElementById('debug-unlock');
        if (!debugButton) {
            debugButton = document.createElement('button');
            debugButton.id = 'debug-unlock';
            // Estilos simples para o botão de debug
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


// Event Listener Principal (Manter e Adicionar a nova inicialização)
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('home-screen')) {
        loadAndCheckPlayerName();

        if (btnPlay) {
            btnPlay.addEventListener('click', handlePlayButtonClick);
        }
    }

    // NOVO: Inicializa a tela de níveis se for o caso
    if (document.getElementById('levels-screen')) {
        initializeLevelsScreen();
    }
});