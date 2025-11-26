// Constantes do Nível 1
const TIME_LIMIT_F1 = 5 * 60; // 5 minutos em segundos
const TRACTOR_SPEED = 5; // Pixels por movimento
const OBSTACLE_CLICK_RADIUS = 70; // Raio de proximidade para remover obstáculo (em pixels)
const FINISH_LINE_POS_X = 50; // Posição X da linha de chegada (em pixels do lado esquerdo)
const FINISH_LINE_POS_Y = 50; // Posição Y da linha de chegada (em pixels do topo)

let timeRemainingF1 = TIME_LIMIT_F1;
let timerIntervalF1 = null;
let startTimeF1 = null;
let tractorX = 10; // Posição inicial X (em %)
let tractorY = 50; // Posição inicial Y (em %)
let isMoving = false;
let currentDirection = 'up'; // Direção inicial para aplicar as classes CSS
let obstaclesRemoved = 0;
let totalObstacles = 0;
let isLevelOver = false;

// Elementos DOM
const tractorContainer = document.getElementById('tractor-container');
const gameArea = document.getElementById('game-area-fase1');
const timerDisplay = document.getElementById('timer-display');
const obstacles = [];

function getTractorCenter() {
    if (!gameArea || !tractorContainer) return { x: 0, y: 0 };
    const gameRect = gameArea.getBoundingClientRect();
    const tractorRect = tractorContainer.getBoundingClientRect();
    
    // Calcula o centro do trator na área de jogo
    return {
        x: tractorRect.left + tractorRect.width / 2 - gameRect.left,
        y: tractorRect.top + tractorRect.height / 2 - gameRect.top
    };
}

function updateTractorPosition() {
    if (tractorContainer) {
        tractorContainer.style.left = `${tractorX}%`;
        tractorContainer.style.top = `${tractorY}%`;
        
        // Atualiza a classe de direção para o CSS
        tractorContainer.className = '';
        tractorContainer.classList.add(`facing-${currentDirection}`);
    }
}

function moveTractor(direction) {
    if (isLevelOver) return;

    let newX = tractorX;
    let newY = tractorY;

    // Converte % para pixels temporariamente para verificação de limites
    const gameRect = gameArea.getBoundingClientRect();
    const stepX = (TRACTOR_SPEED / gameRect.width) * 100;
    const stepY = (TRACTOR_SPEED / gameRect.height) * 100;

    switch (direction) {
        case 'up':
            newY -= stepY;
            currentDirection = 'up';
            break;
        case 'down':
            newY += stepY;
            currentDirection = 'down';
            break;
        case 'left':
            newX -= stepX;
            currentDirection = 'left';
            break;
        case 'right':
            newX += stepX;
            currentDirection = 'right';
            break;
    }

    // Verifica Limites (0% a 100% da área de jogo)
    if (newX >= 5 && newX <= 95 && newY >= 5 && newY <= 95) {
        tractorX = newX;
        tractorY = newY;
        updateTractorPosition();
        checkFinishLine();
    }
}

function checkFinishLine() {
    const tractorCenter = getTractorCenter();
    const endMarker = document.getElementById('end-marker');
    if (!endMarker) return;

    const endRect = endMarker.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    // Centro do marcador de FIM (absoluto na área de jogo)
    const endX = endRect.left + endRect.width / 2 - gameRect.left;
    const endY = endRect.top + endRect.height / 2 - gameRect.top;

    // Distância do trator para o FIM
    const distance = Math.sqrt(Math.pow(tractorCenter.x - endX, 2) + Math.pow(tractorCenter.y - endY, 2));

    // Se a distância for pequena e todos os obstáculos foram removidos
    if (distance < 50 && totalObstacles === obstaclesRemoved) { 
        clearInterval(timerIntervalF1);
        endLevelF1(true);
    }
}


function handleObstacleClick(obstacleElement) {
    if (isLevelOver || obstacleElement.classList.contains('removed')) return;

    const tractorCenter = getTractorCenter();
    const obstacleRect = obstacleElement.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    // Centro do obstáculo (absoluto na área de jogo)
    const obstacleX = obstacleRect.left + obstacleRect.width / 2 - gameRect.left;
    const obstacleY = obstacleRect.top + obstacleRect.height / 2 - gameRect.top;

    // Distância do trator para o obstáculo
    const distance = Math.sqrt(Math.pow(tractorCenter.x - obstacleX, 2) + Math.pow(tractorCenter.y - obstacleY, 2));

    if (distance < OBSTACLE_CLICK_RADIUS) {
        obstacleElement.classList.add('removed');
        obstaclesRemoved++;
        console.log(`Obstáculo removido! Total removido: ${obstaclesRemoved}/${totalObstacles}`);
    } else {
        alert('Você precisa estar mais perto do obstáculo para removê-lo!');
    }
}

function handleKeyDown(event) {
    if (isLevelOver) return;

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

function startTimerF1() {
    if (!timerDisplay) return;

    startTimeF1 = Date.now();
    
    timerIntervalF1 = setInterval(() => {
        timeRemainingF1--;
        
        const minutes = String(Math.floor(timeRemainingF1 / 60)).padStart(2, '0');
        const seconds = String(timeRemainingF1 % 60).padStart(2, '0');
        
        timerDisplay.textContent = `${minutes}:${seconds}`;

        if (timeRemainingF1 <= 0) {
            clearInterval(timerIntervalF1);
            endLevelF1(false); // Termina por tempo esgotado
        }
    }, 1000);
}

function calculateScoreF1(durationSeconds) {
    let stars = 0;
    let performance = "requer atenção redobrada";
    
    // Tempo limite é 300 segundos (5 minutos)
    if (durationSeconds <= 60 && totalObstacles === obstaclesRemoved) { // 1 minuto
        stars = 3;
        performance = "bom";
    } else if (durationSeconds <= 120 && totalObstacles === obstaclesRemoved) { // 2 minutos
        stars = 2;
        performance = "regular";
    } else if (durationSeconds < 300 && totalObstacles === obstaclesRemoved) { // 3 a 5 minutos
        stars = 1;
        performance = "necessita acompanhamento";
    }
    
    if (totalObstacles !== obstaclesRemoved) {
        stars = 0;
        performance = "requer atenção redobrada";
    }

    return { durationSeconds, obstaclesRemoved, totalObstacles, stars, performance };
}

function endLevelF1(completed) {
    if (isLevelOver) return;
    isLevelOver = true;
    clearInterval(timerIntervalF1);
    document.removeEventListener('keydown', handleKeyDown);

    const durationSeconds = completed ? Math.round((Date.now() - startTimeF1) / 1000) : TIME_LIMIT_F1;
    const { stars, performance } = calculateScoreF1(durationSeconds);

    // 1. Gera o conteúdo do arquivo TXT (Estatísticas Detalhadas)
    const statsContent = `
NÍVEL 1 - PREPARO DO SOLO
=========================================
Status: ${completed ? 'Completo' : 'Tempo Esgotado'}
Tempo Total (segundos): ${durationSeconds}
Obstáculos Removidos: ${obstaclesRemoved}/${totalObstacles}
Desempenho: ${performance}
Estrelas Ganhas: ${stars}
=========================================
    `;
    
    // 2. Simula o download do arquivo TXT (Função de script.js)
    console.log("Estatísticas do Nível 1 geradas:", statsContent);
    downloadStatsFile(statsContent, 'estatisticas_nivel1.txt');

    // 3. Simula o avanço de nível (Desbloqueia o Nível 2)
    // Note: A função 'unlockNextLevel' está no script.js
    if (stars > 0) {
        unlockNextLevel(2); 
    }

    alert(`Nível 1 Finalizado!
    Status: ${completed ? 'Completo' : 'Tempo Esgotado'}
    Obstáculos removidos: ${obstaclesRemoved}/${totalObstacles}
    Estrelas: ${stars} (${performance})
    Redirecionando para a tela de Níveis...`);

    // Redireciona para a tela de Níveis
    window.location.href = 'niveis.html';
}

function initializePlowingScreen() {
    if (!document.getElementById('plowing-screen')) return;

    // Inicializa a posição do trator
    updateTractorPosition();
    
    // Coleta e configura os obstáculos
    const obstacleElements = document.querySelectorAll('.obstacle');
    totalObstacles = obstacleElements.length;

    obstacleElements.forEach(obs => {
        obs.addEventListener('click', () => handleObstacleClick(obs));
        obstacles.push(obs);
        
        // Aplica o background da imagem original para simular o obstáculo (pedra ou graveto)
        if (obs.getAttribute('data-type') === 'rock') {
             // Placeholder: Adicione uma imagem real de pedra se tiver
        } else if (obs.getAttribute('data-type') === 'stick') {
             // Placeholder: Adicione uma imagem real de graveto se tiver
        }
    });

    // Configura os controles de teclado
    document.addEventListener('keydown', handleKeyDown);
    
    // Inicia o temporizador
    startTimerF1();
}

// Inicializa a fase 1 quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
    initializePlowingScreen();
});