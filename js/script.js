
const STORAGE_KEY = 'EcoPlantio_PlayerName';
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


document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('home-screen')) {
        loadAndCheckPlayerName();

        if (btnPlay) {
            btnPlay.addEventListener('click', handlePlayButtonClick);
        }
    }
});