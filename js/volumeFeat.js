
var sliderGen = document.getElementById("range-gen");
var outputGen = document.getElementById("value-gen");

var sliderMusic = document.getElementById("range-music");
var outputMusic = document.getElementById("value-music");

outputGen.innerHTML = sliderGen.value;

outputMusic.innerHTML = sliderMusic.value;

sliderGen.oninput = function(){
    
    outputGen.innerHTML = this.value;
}

sliderMusic.oninput = function(){

    outputMusic.innerHTML = this.value;
}

sliderGen.addEventListener("mousemove" , function(){

    var x = sliderGen.value;
    var color = 'linear-gradient(90deg, rgb(100,252,20)' + x + '%, rgb(214,214,214)' + x + '%)';
    sliderGen.style.background = color;
})

sliderMusic.addEventListener("mousemove" , function(){

    var x = sliderMusic.value;
    var color = 'linear-gradient(90deg, rgb(100,252,20)' + x + '%, rgb(214,214,214)' + x + '%)';
    sliderMusic.style.background = color;
})
