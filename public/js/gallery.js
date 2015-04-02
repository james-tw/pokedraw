var loadPortion = [];
var imgList = [];
var loadStart = 0;

//Create a pokedex
var pokeList = "Bulbasaur Ivysaur Venusaur Charmander Charmeleon Charizard Squirtle Wartortle Blastoise Caterpie Metapod Butterfree Weedle Kakuna Beedrill Pidgey Pidgeotto Pidgeot Rattata Raticate Spearow Fearow Ekans Arbok Pikachu Raichu Sandshrew Sandslash Nidoran♀ Nidorina Nidoqueen Nidoran♂ Nidorino Nidoking Clefairy Clefable Vulpix Ninetales Jigglypuff Wigglytuff Zubat Golbat Oddish Gloom Vileplume Paras Parasect Venonat Venomoth Diglett Dugtrio Meowth Persian Psyduck Golduck Mankey Primeape Growlithe Arcanine Poliwag Poliwhirl Poliwrath Abra Kadabra Alakazam Machop Machoke Machamp Bellsprout Weepinbell Victreebel Tentacool Tentacruel Geodude Graveler Golem Ponyta Rapidash Slowpoke Slowbro Magnemite Magneton Farfetchd Doduo Dodrio Seel Dewgong Grimer Muk Shellder Cloyster Gastly Haunter Gengar Onix Drowzee Hypno Krabby Kingler Voltorb Electrode Exeggcute Exeggutor Cubone Marowak Hitmonlee Hitmonchan Lickitung Koffing Weezing Rhyhorn Rhydon Chansey Tangela Kangaskhan Horsea Seadra Goldeen Seaking Staryu Starmie Mr.Mime Scyther Jynx Electabuzz Magmar Pinsir Tauros Magikarp Gyarados Lapras Ditto Eevee Vaporeon Jolteon Flareon Porygon Omanyte Omastar Kabuto Kabutops Aerodactyl Snorlax Articuno Zapdos Moltres Dratini Dragonair Dragonite Mewtwo Mew";
var pokedex = pokeList.split(' ');


function initializeGallery() {
  $.ajax({
    type: "GET",
    url: "/ajax/getDrawingFilenames/1000"
  }).done(function(files) {
      imgList = files;
      displayNewDrawings();
  });
}

function displayNewDrawings() {
  loadPortion = imgList.slice(loadStart, loadStart+40);
  if (loadPortion.length !== 0) {
    loadPortion.forEach(function(val) {
      var capitalizedName = val.pokemon.toLowerCase().replace(/\b[a-z]/g, function(letter) {
          return letter.toUpperCase();
      });
      //Set the background image of the drawing, add the Pokemon name to the drawing, and add a link to download the drawing.
      var $drawing = $("<div class='drawing'><h1>" + capitalizedName + "</h1><a href='drawings/" + val._id + "' download='" + capitalizedName + ".jpeg'><span class='icon-disk'></span></a></div>").css('background-image', 'url(drawings/' + val._id + ')');
      $(".gallery").append($drawing);
    });
    $("#loader-button-container").append($('<button class="loader">Load more Pokedraws!</button>'));
    $('.loader').on('click', function(){
      //Remove this from the dom
      $(this).remove();
      //Load new images starting with the previous loadStart+40
      displayNewDrawings();
    });
    loadStart += 40;
  }
}

function getDrawingsByPokemon(name) {
  $.ajax({
    type: "GET",
    url: "/ajax/getDrawingsByPokemon/" + name
  }).done(function(files) {
    $('.gallery').empty();
    imgList = files;
    displayNewDrawings();
  });
}

pokedex.forEach(function(val){
  var $option = $('<option>' + val + '</option>');
  $('.options .pokemon-list').append($option);
});

$('.pokemon-list').on("change", function() {
  // If this is not the default option
  if ($(this).val() != 0) {
    $('option[value="0"]').remove();
    var filterOption = $('.pokemon-list').val().toLowerCase();
    loadStart = 0;
    getDrawingsByPokemon(filterOption);
  }
});

$(window).scroll(function() {
  if($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
    $('.loader').remove();
    displayNewDrawings();
  }
});

initializeGallery();
