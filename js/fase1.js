
const TIME_LIMIT_F1 = 5 * 60;
const TRACTOR_SPEED = 5;
const OBSTACLE_CLICK_RADIUS = 150; 
const COLLISION_RADIUS = 105;

let timeRemainingF1 = TIME_LIMIT_F1;
let timerIntervalF1 = null;

let tractorX = 5; 
let tractorY = 82;  

let isMoving = false;
let currentDirection = 'right';
let obstaclesRemoved = 0;
let totalObstacles = 0;
let isLevelOver = false;
let isGamePaused = false; 

let tractorContainer = null;
let gameArea = null;
let timerDisplay = null;
let btnPause = null; 
const obstacles = [];

function getTractorCenter() {
    if (!gameArea || !tractorContainer) return { x: 0, y: 0 };
    const gameRect = gameArea.getBoundingClientRect();
    const tractorRect = tractorContainer.getBoundingClientRect();
    
    return {
        x: tractorRect.left + tractorRect.width / 2 - gameRect.left,
        y: tractorRect.top + tractorRect.height / 2 - gameRect.top
    };
}

function updateTractorPosition() {
    if (tractorContainer) {
        tractorContainer.style.left = `${tractorX}%`;
        tractorContainer.style.top = `${tractorY}%`;
        
        tractorContainer.className = '';
        tractorContainer.classList.add(`facing-${currentDirection}`);
    }
}

function checkCollision(newXPercent, newYPercent) {
    if (!gameArea) return false;

    const gameRect = gameArea.getBoundingClientRect();
    const proposedPixelX = (newXPercent / 100) * gameRect.width;
    const proposedPixelY = (newYPercent / 100) * gameRect.height;

    for (const obs of obstacles) {
        if (obs.classList.contains('removed')) continue;

        const obsRect = obs.getBoundingClientRect();
        const obsCenterX = (obsRect.left + obsRect.width / 2) - gameRect.left;
        const obsCenterY = (obsRect.top + obsRect.height / 2) - gameRect.top;
        const dist = Math.sqrt(Math.pow(proposedPixelX - obsCenterX, 2) + Math.pow(proposedPixelY - obsCenterY, 2));

        if (dist < COLLISION_RADIUS) {
            return true;
        }
    }
    return false;
}

function moveTractor(direction) {
    if (isLevelOver || isGamePaused) return; 

    let newX = tractorX;
    let newY = tractorY;

    const gameRect = gameArea.getBoundingClientRect();
    const stepX = (TRACTOR_SPEED / gameRect.width) * 100;
    const stepY = (TRACTOR_SPEED / gameRect.height) * 100;

    switch (direction) {
        case 'up':
        case 'UP':
            newY -= stepY;
            currentDirection = 'up';
            break;
        case 'down':
        case 'DOWN':
            newY += stepY;
            currentDirection = 'down';
            break;
        case 'left':
        case 'LEFT':
            newX -= stepX;
            currentDirection = 'left';
            break;
        case 'right':
        case 'RIGHT':
            newX += stepX;
            currentDirection = 'right';
            break;
    }

    if (newX >= 2 && newX <= 85 && newY >= 2 && newY <= 95) {
        if (!checkCollision(newX, newY)) {
            tractorX = newX;
            tractorY = newY;
            updateTractorPosition();
            checkFinishLine();
        } else {
        }
    }
}

function checkFinishLine() {
    const tractorCenter = getTractorCenter();
    const endMarker = document.getElementById('end-marker');
    if (!endMarker) return;

    const endRect = endMarker.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    const endX = endRect.left + endRect.width / 2 - gameRect.left;
    const endY = endRect.top + endRect.height / 2 - gameRect.top;

    const distance = Math.sqrt(Math.pow(tractorCenter.x - endX, 2) + Math.pow(tractorCenter.y - endY, 2));

    if (distance < 150) { 
        clearInterval(timerIntervalF1);
        endLevelF1(true);
    }
}

function handleObstacleClick(obstacleElement) {
    if (isLevelOver || isGamePaused || obstacleElement.classList.contains('removed')) return;

    const tractorCenter = getTractorCenter();
    const obstacleRect = obstacleElement.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    const obstacleX = obstacleRect.left + obstacleRect.width / 2 - gameRect.left;
    const obstacleY = obstacleRect.top + obstacleRect.height / 2 - gameRect.top;

    const distance = Math.sqrt(Math.pow(tractorCenter.x - obstacleX, 2) + Math.pow(tractorCenter.y - obstacleY, 2));

    if (distance < OBSTACLE_CLICK_RADIUS) {
        obstacleElement.classList.add('removed');
        obstaclesRemoved++;
    } else {
        alert('Chegue mais perto com o trator para remover este obstáculo!');
    }
}

function handleKeyDown(event) {
    if (isLevelOver || isGamePaused) return;

    switch (event.key) {
        case 'w':
        case 'W':
            moveTractor('up');
            break;
        case 's':
        case 'S':
            moveTractor('down');
            break;
        case 'a':
        case 'A':
            moveTractor('left');
            break;
        case 'd':
        case 'D':
            moveTractor('right');
            break;
    }
}

function togglePause() {
    if (isLevelOver) return;

    isGamePaused = !isGamePaused;
    const img = btnPause.querySelector('img');

    if (isGamePaused) {
        clearInterval(timerIntervalF1);
        img.src = 'itens_jogo_img/Play.png';
        img.alt = 'Continuar';
    } else {
        startTimerF1();
        img.src = 'itens_jogo_img/pause.png';
        img.alt = 'Pausar';
    }
}

function startTimerF1() {
    if (!timerDisplay) return;

    if (timerIntervalF1) clearInterval(timerIntervalF1);
    
    timerIntervalF1 = setInterval(() => {
        timeRemainingF1--;
        
        const minutes = String(Math.floor(timeRemainingF1 / 60)).padStart(2, '0');
        const seconds = String(timeRemainingF1 % 60).padStart(2, '0');
        
        timerDisplay.textContent = `${minutes}:${seconds}`;

        if (timeRemainingF1 <= 0) {
            clearInterval(timerIntervalF1);
            endLevelF1(false); 
        }
    }, 1000);
}

function calculateScoreF1(durationSeconds) {
    let stars = 0;
    let performance = "requer atenção redobrada";
    
    if (totalObstacles !== obstaclesRemoved) {
        stars = 0;
        performance = "requer atenção redobrada (obstáculos restantes)";
        return { durationSeconds, obstaclesRemoved, totalObstacles, stars, performance };
    }
    
    if (durationSeconds <= 60) {
        stars = 3;
        performance = "bom";
    } else if (durationSeconds <= 120) { 
        stars = 2;
        performance = "regular";
    } else if (durationSeconds < 300) { 
        stars = 1;
        performance = "necessita acompanhamento";
    }

    return { durationSeconds, obstaclesRemoved, totalObstacles, stars, performance };
}

function endLevelF1(completed) {
    if (isLevelOver) return;
    isLevelOver = true;
    clearInterval(timerIntervalF1);
    document.removeEventListener('keydown', handleKeyDown);

    const durationSeconds = TIME_LIMIT_F1 - timeRemainingF1;
    const { stars, performance } = calculateScoreF1(durationSeconds);

    const playerName = localStorage.getItem('EcoPlantio_PlayerName') || "Jogador Anônimo";

    const statsContent = `
NÍVEL 1 - PREPARO DO SOLO
=========================================
Jogador: ${playerName}
Status: ${completed ? 'Completo' : 'Tempo Esgotado'}
Tempo Total (segundos): ${durationSeconds}
Obstáculos Removidos: ${obstaclesRemoved}/${totalObstacles}
Desempenho: ${performance}
Estrelas Ganhas: ${stars}
=========================================
    `;
    
    const blob = new Blob([statsContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Relatorio_Nivel1_${playerName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (stars > 0) {
        if (typeof unlockNextLevel === 'function') {
            unlockNextLevel(2); 
        }
    }

    alert(`Nível 1 Finalizado!
    Status: ${completed ? 'Chegou ao Fim' : 'Tempo Esgotado'}
    Obstáculos removidos: ${obstaclesRemoved}/${totalObstacles}
    Estrelas: ${stars} (${performance})
    O relatório foi baixado no seu computador.
    Redirecionando para a tela de Níveis...`);

    window.location.href = 'niveis.html';
}

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