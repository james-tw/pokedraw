
var color = $('.selected').css('background-color');

//Construction of the Pokedex
var pokedex = {};
var pokeList = "Bulbasaur Ivysaur Venusaur Charmander Charmeleon Charizard Squirtle Wartortle Blastoise Caterpie Metapod Butterfree Weedle Kakuna Beedrill Pidgey Pidgeotto Pidgeot Rattata Raticate Spearow Fearow Ekans Arbok Pikachu Raichu Sandshrew Sandslash Nidoran♀ Nidorina Nidoqueen Nidoran♂ Nidorino Nidoking Clefairy Clefable Vulpix Ninetales Jigglypuff Wigglytuff Zubat Golbat Oddish Gloom Vileplume Paras Parasect Venonat Venomoth Diglett Dugtrio Meowth Persian Psyduck Golduck Mankey Primeape Growlithe Arcanine Poliwag Poliwhirl Poliwrath Abra Kadabra Alakazam Machop Machoke Machamp Bellsprout Weepinbell Victreebel Tentacool Tentacruel Geodude Graveler Golem Ponyta Rapidash Slowpoke Slowbro Magnemite Magneton Farfetchd Doduo Dodrio Seel Dewgong Grimer Muk Shellder Cloyster Gastly Haunter Gengar Onix Drowzee Hypno Krabby Kingler Voltorb Electrode Exeggcute Exeggutor Cubone Marowak Hitmonlee Hitmonchan Lickitung Koffing Weezing Rhyhorn Rhydon Chansey Tangela Kangaskhan Horsea Seadra Goldeen Seaking Staryu Starmie Mr.Mime Scyther Jynx Electabuzz Magmar Pinsir Tauros Magikarp Gyarados Lapras Ditto Eevee Vaporeon Jolteon Flareon Porygon Omanyte Omastar Kabuto Kabutops Aerodactyl Snorlax Articuno Zapdos Moltres Dratini Dragonair Dragonite Mewtwo";
var pokeArray = pokeList.split(' ');
for (var i = 1; i < 151; i++) {
  pokedex[i] = pokeArray[i-1];
}
console.log(pokedex);

//Allows you to select a color from the list.
$('.controls').on('click', 'li', function(){
  $(this).siblings().removeClass('selected');
  $(this).addClass('selected');
  color = $(this).css('background-color');
});

//Changes the color of the newly created color when the sliders are moved.
$('input[type=range]').change(changeColor);
function changeColor() {
  var r = $('#red').val();
  var g = $('#green').val();
  var b = $('#blue').val();
  
  $('#newColor').css('background-color', 'rgb(' + r + ',' + g + ',' + b + ')');
}

//Adds the newly created color the the color list and selects it immediately.
$('#addNewColor').click(function() {
  var $newColor = $('<li></li>');
  var $newColorLink = $('<a></a>');
  $newColor.append($newColorLink);
  var colorVal = $('#newColor').css('background-color')
  $newColor.css('background-color', colorVal );
  $newColorLink.attr({
    'data-color': colorVal,
    href: '#canvas' 
  });
  $('.controls ul').append($newColor);
  $newColorLink.click();
});

//Creation of the canvas and context.
var $canvas = $('#canvas');
var context = $('canvas')[0].getContext('2d');
//Initiate sketch.js
$(function(){$canvas.sketch()});
//Function for resizing the canvas when the window resizes.
function calibrateCanvas(){
  $canvas.attr({
    width: $canvas.css('width'),
    height: $canvas.css('height')
  });
  $canvas.sketch().redraw();
  $('#imageContainer').css('height', $canvas.css('height'));
}
//Canvas will calibrate each time the window resizes.
$(window).resize(calibrateCanvas);
//Initial calibration of canvas size.
$(function(){calibrateCanvas();});

//Adds an anchor tag to each color choice to make it work with sketch.js
$('.controls ul li').append('<a></a>');
$('.controls ul li a').each(function(){
  var colorLink = $(this).parent().css('background-color');
  $(this).attr({
    'data-color': colorLink,
    href: '#canvas' 
  })
});

//Timer function initiated when #newRound is clicked.
function startTimer() {
  var timer = setInterval(function() { 
    $('#timer').text(--sec);
    if (sec == 0) {
    //$('#timer').fadeOut('fast');
    clearInterval(timer);
    $('#newRound').attr('disabled', false);
    $canvas.css('pointer-events', 'none');
    } 
  }, 1000);
}
//Current pokemon is kept track of just so that you don't get the same one twice in a row.
var currentPokemon;

//Generates a random number 001-150.
function getNewPokemon() {
  var rand = (Math.floor(Math.random() * 150)+1);
  var s = "00" + rand;
  var index =  s.substr(s.length-3);
  //Fetches the proper image file for that pokemon.
  $('#imageContainer img').attr('src', "img/" + index + ".png");
  //Fetched the proper name from the pokedex object.
  $('#pokemonName').text(pokedex[rand]);
}

$('#newRound').click(function(){
  sec = 45
  $(this).attr('disabled', true);
  $('#timer').text('45');
  $canvas.sketch().actions = [];
  $canvas.sketch().redraw();
  $canvas.css('pointer-events', 'auto');
  startTimer();
  getNewPokemon();
});


