$(document).ready(function(){
  
var color = $('.selected').css('background-color');

//Construction of the Pokedex
var pokedex = {};
var pokeList = "Bulbasaur Ivysaur Venusaur Charmander Charmeleon Charizard Squirtle Wartortle Blastoise Caterpie Metapod Butterfree Weedle Kakuna Beedrill Pidgey Pidgeotto Pidgeot Rattata Raticate Spearow Fearow Ekans Arbok Pikachu Raichu Sandshrew Sandslash Nidoran♀ Nidorina Nidoqueen Nidoran♂ Nidorino Nidoking Clefairy Clefable Vulpix Ninetales Jigglypuff Wigglytuff Zubat Golbat Oddish Gloom Vileplume Paras Parasect Venonat Venomoth Diglett Dugtrio Meowth Persian Psyduck Golduck Mankey Primeape Growlithe Arcanine Poliwag Poliwhirl Poliwrath Abra Kadabra Alakazam Machop Machoke Machamp Bellsprout Weepinbell Victreebel Tentacool Tentacruel Geodude Graveler Golem Ponyta Rapidash Slowpoke Slowbro Magnemite Magneton Farfetchd Doduo Dodrio Seel Dewgong Grimer Muk Shellder Cloyster Gastly Haunter Gengar Onix Drowzee Hypno Krabby Kingler Voltorb Electrode Exeggcute Exeggutor Cubone Marowak Hitmonlee Hitmonchan Lickitung Koffing Weezing Rhyhorn Rhydon Chansey Tangela Kangaskhan Horsea Seadra Goldeen Seaking Staryu Starmie Mr.Mime Scyther Jynx Electabuzz Magmar Pinsir Tauros Magikarp Gyarados Lapras Ditto Eevee Vaporeon Jolteon Flareon Porygon Omanyte Omastar Kabuto Kabutops Aerodactyl Snorlax Articuno Zapdos Moltres Dratini Dragonair Dragonite Mewtwo";
var pokeArray = pokeList.split(' ');
for (var i = 1; i < 151; i++) {
  pokedex[i] = pokeArray[i-1];
}
var introMode = true;
var recentPokemon = [];

//Adds an anchor tag to each color choice to make it work with sketch.js
$('.controls ul li').append('<a></a>');
$('.controls ul li a').each(function(){
  var colorLink = $(this).parent().css('background-color');
  $(this).attr({
    'data-color': colorLink,
    href: '#canvas' 
  })
});

//Allows you to select a color from the list.
$('.controls').on('click', 'li', function(){
  $(this).siblings().removeClass('selected');
  $(this).addClass('selected');
  color = $(this).css('background-color');
});

//Changes the color of the newly created color when the sliders are moved.
$('input[type=range]').change(changeColor);

//Darkens/lightens the given color by the given percent.
function shadeColor(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function changeColor() {
  var r = parseInt($('#red').val());
  var g = parseInt($('#green').val());
  var b = parseInt($('#blue').val());
  var newColor = rgbToHex(r,g,b);
  var shadowColor = shadeColor(newColor,-0.5);
  $('#addNewColor').css({
    'background-color': newColor,
    'text-shadow': "0 1px " + shadowColor
  });
}

//Adds the newly created color the the color list and selects it immediately.
$('#addNewColor').click(function() {
  var $newColor = $('<li></li>');
  var $newColorLink = $('<a></a>');
  $newColor.append($newColorLink);
  var colorVal = $('#addNewColor').css('background-color')
  $newColor.css('background-color', colorVal );
  $newColorLink.attr({
    'data-color': colorVal,
    href: '#canvas' 
  });
  $('.controls ul').append($newColor);
  $newColorLink.click();
});


/////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////

function whiteOutCanvasBackground() {
  //get the current ImageData for the canvas.
  var data = context.getImageData(0, 0, canvas.width, canvas.height);
  //store the current globalCompositeOperation
  var compositeOperation = context.globalCompositeOperation;
  //set to draw behind current content
  context.globalCompositeOperation = "destination-over";
  //set background color to white
  context.fillStyle = '#fff';
  //draw background / rect on entire canvas
  context.fillRect(0,0,canvas.width, canvas.height);
}

function saveImage() {
    //Sets the background of the saved canvas to white.
    whiteOutCanvasBackground();
    //encode the drawing, send to saveImage.php which saves the image to ../drawings.
    var dataURL = canvas.toDataURL('image/jpeg');
    $.ajax({
      type: "POST",
      url: "/ajax/saveImage", //just save to same location as others for now
      data: { 
         imgBase64: dataURL
      }
    }).done(function(newImg) {
      console.log('Image saved. Refreshing header.'); 
      getRecentDrawings(newImg);
      // If you want the file to be visible in the browser 
      // - please modify the callback in javascript. All you
      // need is to return the url to the file, you just saved 
      // and than put the image in your browser.
    });
}

//Timer function initiated when #newRound is clicked.
function startTimer() {
  var timer = setInterval(function() { 
    //If in mq-mobile resolution, don't show the regular timer.
    if ($('#pip').css('display') !== 'block') {
      $('#timer').css('display','block');
    } else {
      $('#timer').css('display','hidden');
    }
    //Updates the text shown on the timer.
    $('#timer').text(--sec);
    $('#pip-timer').text(sec);
    if (sec == 5) {
      $('#timer').css('color', '#FF6A62');
      $('#pip-timer').css('color', '#FF6A62');
    }
    if (sec == 0) {
      clearInterval(timer);
      //This function sets the CSS of the interface when a round has ended.
      setInactiveInterface();
      saveImage(); //Calls getRecentDrawings() in callback.
    } 
  }, 1000);
}
//Current pokemon is kept track of just so that you don't get the same one twice in a row.
var currentPokemon;

//Generates a random number 001-150.
function getNewPokemon() {
  //Clear list of recent Pokemon if 149+.
  if (recentPokemon.length >= 149) {
    recentPokemon = [];
  }
  //If rand already shows up in recent pokemon, reroll until we get a new one.
  var rand = (Math.floor(Math.random() * 150)+1);
  while (recentPokemon.indexOf(rand) !== -1) {
    rand = (Math.floor(Math.random() * 150)+1);
  }  
  recentPokemon.push(rand);
  var s = "00" + rand;
  var index =  s.substr(s.length-3);
  //Fetches the proper image file for that pokemon.
  $('#imageContainer img').attr('src', "img/" + index + ".png");
  $('#pip img').attr('src', "img/" + index + ".png");
  //Fetched the proper name from the pokedex object.
  $('#pokemonName').text(pokedex[rand]);
}

function setActiveInterface() {
  //Hide the hero text once the button has been clicked once.
  $('h1').css('visibility', 'hidden');
  //If in mq-mobile resolution, don't show the regular timer.
  if ($('#pip').css('display') == 'block') {
    $('h1').css('height', '0px');
  }
  $('#newRound').attr('disabled', true);
  $('#timer').text('45').css('color', 'white');
  $('#pip-timer').text('45').css('color', '#666');
  $('#share').css('display', 'none');
  $('#save').css('display', 'none');
}
function setInactiveInterface() {
  //As soon as the round is over, change the CTA button to say "Draw a new Pokemon" and change the button css to match.
  $('#newRound').attr('disabled', false)
                .text('Draw a new Pokémon!')
                .css({
                 'font-size': '24px',
                 'padding': '5px'
                });
  $canvas.css('pointer-events', 'none');
  $('#save').css('display', 'inline-block').fadeIn('fast');
}

$('#newRound').click(function(){
  //If this is the first time #newRound is being clicked...
  if (introMode) {
    //Remove the Who's That Pokemon image, and un-dim the canvas.
    $('#canvas').css('background', "#fff");
    $('#imageContainer').css('background', '#fff');
    $('#imageContainer img').attr('src', '').css('padding', '20px');
  }
  //This function changes the CSS of the interface during a round.
  setActiveInterface();
  //These next two lines clear out the saved canvas strokes and redraw it as empty.
  $canvas.sketch().clear();
  $canvas.css('pointer-events', 'auto');
  //Reset the timer and get a new Pokemon to draw.
  sec = 45;
  startTimer();
  getNewPokemon();
  //If on mobile, Scroll to the canvas element.
  if ($('#pip').css('display') == 'block') {
    var target = $('#canvas');
    if (target.length) {
      $('html,body').animate({
        scrollTop: target.offset().top
      }, 500);
      return false;
    }
  }
});

$('#save').click(function(){
  //Sets the background of the saved picture to white.
  whiteOutCanvasBackground();
});


function getRecentDrawings(filename) {
  var dir = "img/kidpics/";
  var fileextension = ".jpeg";
  var imgList = ["img/kidpics/2014062708334353ad8ed754ada.jpeg","img/kidpics/2014062708343453ad8f0af3bad.jpeg", "img/kidpics/2014062708352853ad8f40eeaa8.jpeg", "img/kidpics/2014062708362553ad8f790de4c.jpeg", "img/kidpics/2014062708374053ad8fc464955.jpeg", "img/kidpics/2014062708385553ad900f65570.jpeg", "img/kidpics/2014070715091853bb1a8e44318.jpeg", "img/kidpics/2014070715110353bb1af78d1ed.jpeg", "img/kidpics/2014070806521953bbf79323587.jpeg", "img/kidpics/2014070806541053bbf802c8475.jpeg"];
  if (filename) {
    imgList.unshift("drawings/" + filename);
  };

  imgList = imgList.slice(0,10);
  //On success, send imgList to another function which updates the jQuery header with the images.
  updateHeaderDrawings(imgList);

}
function updateHeaderDrawings(images) {
  console.log(images);
  $('header .recentDrawing').fadeOut('fast').remove();
  images.forEach(function(val, i) {
    $("header").append($("<img class='recentDrawing' src=" + val + "></img>").fadeIn('fast'));
  })
}
console.log('getting recent drawings...');
getRecentDrawings();
})