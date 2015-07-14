$(document).ready(function() {
    var loadPortion = [],
            imgList = [],
            loadStart = 0,
            pokedex = generatePokedex();


    // REMOVE DRAWINGS
    var imgList = [{"created":"2015-07-13T11:00:04-04:00","pokemon":"cubone","_id":"55a3d2748c864ca0040fc8b2"},{"created":"2015-07-13T11:00:03-04:00","pokemon":"beedrill","_id":"55a3d2738c864ca0040fc8b1"},{"created":"2015-07-13T10:59:57-04:00","pokemon":"blastoise","_id":"55a3d26d8c864ca0040fc8b0"},{"created":"2015-07-13T10:59:56-04:00","pokemon":"krabby","_id":"55a3d26c8c864ca0040fc8af"},{"created":"2015-07-13T10:59:56-04:00","pokemon":"tangela","_id":"55a3d26c8c864ca0040fc8ae"},{"created":"2015-07-13T10:59:55-04:00","pokemon":"parasect","_id":"55a3d26b8c864ca0040fc8ad"},{"created":"2015-07-13T10:59:50-04:00","pokemon":"venonat","_id":"55a3d2668c864ca0040fc8ac"},{"created":"2015-07-13T10:59:48-04:00","pokemon":"ninetales","_id":"55a3d2648c864ca0040fc8ab"},{"created":"2015-07-13T10:59:45-04:00","pokemon":"chansey","_id":"55a3d2618c864ca0040fc8aa"},{"created":"2015-07-13T10:59:39-04:00","pokemon":"ponyta","_id":"55a3d25b8c864ca0040fc8a9"},{"created":"2015-07-13T10:59:39-04:00","pokemon":"electabuzz","_id":"55a3d25b8c864ca0040fc8a8"},{"created":"2015-07-13T10:59:37-04:00","pokemon":"krabby","_id":"55a3d2598c864ca0040fc8a7"}];
            

    (function initGallery() {
        $.ajax({
            type: "GET",
            url: "/ajax/getDrawingFilenames/1000"
        }).done(function(files) {
            imgList = files;
            displayNewDrawings();
        });

        pokedex.forEach(function(item){
            var $option = $('<option value=' + item + '>' + item + '</option>');
            $('.js-sbp__dropdown').append($option);
        });
    }());

////////////////////////////////////////////////////////////////
// EVENT HANDLERS
//

    $('.js-sbp__dropdown').on("change", function() {
        // If this is not the default option
        if ($(this).val() !== 0) {
            $('option[value="0"]').remove();
            var filterOption = $(this).val().toLowerCase();
            loadStart = 0;
            getDrawingsByPokemon(filterOption, 1000);
        }
    });

    $(window).scroll(function() {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
            $('.loader').remove();
            displayNewDrawings();
        }
    });

//
// END EVENT HANDLERS
////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////
// FUNCTION DECLARATIONS
//

    //Generates an array of 151 Pokemon on init.
    function generatePokedex () {
        var pokeList = "Bulbasaur Ivysaur Venusaur Charmander Charmeleon Charizard Squirtle Wartortle Blastoise Caterpie Metapod Butterfree Weedle Kakuna Beedrill Pidgey Pidgeotto Pidgeot Rattata Raticate Spearow Fearow Ekans Arbok Pikachu Raichu Sandshrew Sandslash Nidoran♀ Nidorina Nidoqueen Nidoran♂ Nidorino Nidoking Clefairy Clefable Vulpix Ninetales Jigglypuff Wigglytuff Zubat Golbat Oddish Gloom Vileplume Paras Parasect Venonat Venomoth Diglett Dugtrio Meowth Persian Psyduck Golduck Mankey Primeape Growlithe Arcanine Poliwag Poliwhirl Poliwrath Abra Kadabra Alakazam Machop Machoke Machamp Bellsprout Weepinbell Victreebel Tentacool Tentacruel Geodude Graveler Golem Ponyta Rapidash Slowpoke Slowbro Magnemite Magneton Farfetchd Doduo Dodrio Seel Dewgong Grimer Muk Shellder Cloyster Gastly Haunter Gengar Onix Drowzee Hypno Krabby Kingler Voltorb Electrode Exeggcute Exeggutor Cubone Marowak Hitmonlee Hitmonchan Lickitung Koffing Weezing Rhyhorn Rhydon Chansey Tangela Kangaskhan Horsea Seadra Goldeen Seaking Staryu Starmie Mr.Mime Scyther Jynx Electabuzz Magmar Pinsir Tauros Magikarp Gyarados Lapras Ditto Eevee Vaporeon Jolteon Flareon Porygon Omanyte Omastar Kabuto Kabutops Aerodactyl Snorlax Articuno Zapdos Moltres Dratini Dragonair Dragonite Mewtwo Mew";
        return pokeList.split(' ');
    }

    function displayNewDrawings() {
        //Amount of new drawings to load.
        var loadAmount = 40;
        //Based on how many blocks of (loadAmount) have been loaded, select the appropriate subset of imgList to display.
        loadPortion = imgList.slice(loadStart, loadStart + loadAmount);

        if (loadPortion.length !== 0) {
            loadPortion.forEach(function(item) {
                var capitalizedName = item.pokemon.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                    return letter.toUpperCase();
                });
                //Set the background image of the drawing, add the Pokemon name to the drawing, and add a link to download the drawing.
                var $drawing = $("<div class='drawing'><h1 class='drawing__name'>" + capitalizedName + "</h1><a class='drawing__download' href='drawings/" + item._id + "' download='" + capitalizedName + ".jpeg'><span class='drawing__icon icon-disk'></span></a></div>").css('background-image', 'url(http://pokedraw.net/drawings/' + item._id + ')');
                $(".gallery").append($drawing);
            });

            $(".loader__container").append($('<button class="loader">Load more Pokedraws!</button>'));
            
            $('.loader').on('click', function() {
                //Remove this from the dom
                $(this).remove();
                //Load new images starting with the previous loadStart + loadAmount
                displayNewDrawings();
            });

            loadStart += loadAmount;
        }
    }

    function getDrawingsByPokemon(name, limit) {
        $.ajax({
            type: "GET",
            url: "/ajax/getDrawingsByPokemon/" + name + "/" + limit
        }).done(function(files) {
            $('.gallery').empty();
            imgList = files;
            displayNewDrawings();
        });
    }

//
// END FUNCTION DECLARATIONS
////////////////////////////////////////////////////////////////


});
