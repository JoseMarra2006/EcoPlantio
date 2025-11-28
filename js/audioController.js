// Caminho da música
const MUSIC_SRC = "audio_jogo/musica_fundo.mp3";

// ===============================
// 🔊 CRIA O ÁUDIO GLOBAL (UMA VEZ)
// ===============================
if (!window.globalAudio) {

    const savedTime = Number(localStorage.getItem("musicTime") || 0);
    const savedVolume = Number(localStorage.getItem("musicVolume") || 0.4);
    const isMuted = localStorage.getItem("musicMuted") === "true";

    window.globalAudio = new Audio(MUSIC_SRC);
    window.globalAudio.loop = true;
    window.globalAudio.volume = savedVolume;
    window.globalAudio.currentTime = savedTime;
    window.globalAudio.muted = isMuted;

    // Autoplay só depois do primeiro clique
    const startMusic = () => {
        window.globalAudio.play().catch(() => {});
        document.removeEventListener("click", startMusic);
    };
    document.addEventListener("click", startMusic);

    // Salvar progresso da música
    setInterval(() => {
        localStorage.setItem("musicTime", window.globalAudio.currentTime);
    }, 800);
}

// ===============================
// 🎚️ SLIDER DE VOLUME DA MÚSICA
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    const sliderMusic = document.getElementById("range-music");
    const outputMusic = document.getElementById("value-music");

    if (sliderMusic && outputMusic) {
        sliderMusic.value = window.globalAudio.volume * 100;
        outputMusic.innerText = sliderMusic.value;

        sliderMusic.oninput = () => {
            const vol = sliderMusic.value / 100;
            window.globalAudio.volume = vol;
            localStorage.setItem("musicVolume", vol);
            outputMusic.innerText = sliderMusic.value;
        };

        sliderMusic.addEventListener("mousemove", () => {
            const x = sliderMusic.value;
            sliderMusic.style.background =
                `linear-gradient(90deg, rgb(100,252,20) ${x}%, rgb(214,214,214) ${x}%)`;
        });
    }
});

// ===============================
// 🎚️ MASTER VOLUME (controla música + narração)
// ===============================

// --- Recupera volume master salvo (0 a 1)
function getMasterVolume() {
    const v = localStorage.getItem("masterVolume");
    return v !== null ? parseFloat(v) : 1;
}

// --- Aplica o master volume ao áudio da narração (se existir um vídeo na tela)
function aplicarVolumeNarracao_Master() {
    const video = document.getElementById("demo-video");
    if (video) {
        const narrVol = parseFloat(localStorage.getItem("EcoPlantio_NarracaoVolume") || 1);
        video.volume = narrVol * getMasterVolume();
    }
}

// ===============================
// 🎚️ SLIDER DO MASTER VOLUME
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    const slider = document.getElementById("range-gen");
    const label = document.getElementById("value-gen");

    if (!slider || !label) return;

    // Valor inicial
    slider.value = getMasterVolume() * 100;
    label.innerText = slider.value;

    slider.oninput = () => {
        const masterVol = slider.value / 100;

        // Salva
        localStorage.setItem("masterVolume", masterVol);

        // --- Atualiza volume da música ---
        const musicVol = Number(localStorage.getItem("musicVolume") || 0.4);
        window.globalAudio.volume = musicVol * masterVol;

        // --- Atualiza volume da narração ---
        aplicarVolumeNarracao_Master();

        label.innerText = slider.value;
    };

    // Estética do slider (barra verde)
    slider.addEventListener("mousemove", () => {
        const x = slider.value;
        slider.style.background =
            `linear-gradient(90deg, rgb(100,252,20) ${x}%, rgb(214,214,214) ${x}%)`;
    });
});


// ===============================
// 🔇 Mudar mute
// ===============================
function toggleMusic() {
    window.globalAudio.muted = !window.globalAudio.muted;
    localStorage.setItem("musicMuted", window.globalAudio.muted);
}
