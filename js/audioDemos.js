// ===============================
// 🔊 CONTROLE DO ÁUDIO DOS VÍDEOS (NARRAÇÃO)
// ===============================
const NARR_VOLUME_KEY = "EcoPlantio_NarracaoVolume";
const MASTER_VOLUME_KEY = "masterVolume";

// -------------------------------
// Lê volume da narração (0–1)
// -------------------------------
function getNarrVolume() {
    const v = localStorage.getItem(NARR_VOLUME_KEY);
    return v !== null ? parseFloat(v) : 1;
}

// -------------------------------
// Lê Master Volume (0–1)
// -------------------------------
function getMasterVolume() {
    const v = localStorage.getItem(MASTER_VOLUME_KEY);
    return v !== null ? parseFloat(v) : 1;
}

// -------------------------------
// Salva volume da narração
// -------------------------------
function setNarrVolume(value) {
    localStorage.setItem(NARR_VOLUME_KEY, value);
    aplicarVolumeNarracao();
}

// -------------------------------
// Aplica volume ao vídeo (NARRAÇÃO * MASTER)
// -------------------------------
function aplicarVolumeNarracao() {
    const video = document.getElementById("demo-video");
    if (video) {
        const finalVol = getNarrVolume() * getMasterVolume();
        video.volume = Math.min(1, finalVol);
    }
}

// ===============================
// 🎚️ SLIDER DE NARRAÇÃO
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    aplicarVolumeNarracao(); // Aplica ao carregar

    const sliderNarr = document.getElementById("range-narr");
    const outputNarr = document.getElementById("value-narr");

    if (sliderNarr && outputNarr) {

        // Valor inicial baseado SOMENTE na narração (não mexe no master)
        sliderNarr.value = getNarrVolume() * 100;
        outputNarr.innerText = sliderNarr.value;

        sliderNarr.oninput = () => {
            const vol = sliderNarr.value / 100;
            setNarrVolume(vol);   // Salva e aplica
            aplicarVolumeNarracao();
            outputNarr.innerText = sliderNarr.value;
        };

        sliderNarr.addEventListener("mousemove", () => {
            const x = sliderNarr.value;
            sliderNarr.style.background =
                `linear-gradient(90deg, rgb(100,252,20) ${x}%, rgb(214,214,214) ${x}%)`;
        });
    }
});
