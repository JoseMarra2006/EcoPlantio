function renderStarsImage(container, count) {
    container.innerHTML = ""; // Limpa o container

    if(count == 1){

        const star = document.createElement("img");
        star.src = "itens_jogo_img/starNível.png";
        star.classList.add("star-icon");
        container.appendChild(star); 
    
    } else if(count == 2) {

        const star = document.createElement("img");
        star.src = "itens_jogo_img/starNivel2.png";
        star.classList.add("star-icon");
        container.appendChild(star); 

    } else if(count == 3) {

        const star = document.createElement("img");
        star.src = "itens_jogo_img/starNivel3.png";
        star.classList.add("star-icon");
        container.appendChild(star); 
    }

    for (let i = count; i < 3; i++) {
        const emptyStar = document.createElement("img");
        emptyStar.src = ""; // imagem para estrela vazia (opcional)
        emptyStar.classList.add("star-icon");
        container.appendChild(emptyStar);
    }
}

function renderLevelStars() {
    for (let level = 1; level <= 4; level++) {
        const stars = Number(localStorage.getItem(`EcoPlantio_Level_${level}_Stars`)) || 0;

        const container = document.getElementById(`stars-${level}`);
        if (container) {
            renderStarsImage(container, stars);
        }
    }
}

document.addEventListener("DOMContentLoaded", renderLevelStars);