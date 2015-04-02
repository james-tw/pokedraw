$(document).ready(function(){
	var color = $('.selected').css('background-color');
	var recentDrawingID;
	//Construction of the Pokedex
	var pokeList = "Bulbasaur Ivysaur Venusaur Charmander Charmeleon Charizard Squirtle Wartortle Blastoise Caterpie Metapod Butterfree Weedle Kakuna Beedrill Pidgey Pidgeotto Pidgeot Rattata Raticate Spearow Fearow Ekans Arbok Pikachu Raichu Sandshrew Sandslash Nidoran♀ Nidorina Nidoqueen Nidoran♂ Nidorino Nidoking Clefairy Clefable Vulpix Ninetales Jigglypuff Wigglytuff Zubat Golbat Oddish Gloom Vileplume Paras Parasect Venonat Venomoth Diglett Dugtrio Meowth Persian Psyduck Golduck Mankey Primeape Growlithe Arcanine Poliwag Poliwhirl Poliwrath Abra Kadabra Alakazam Machop Machoke Machamp Bellsprout Weepinbell Victreebel Tentacool Tentacruel Geodude Graveler Golem Ponyta Rapidash Slowpoke Slowbro Magnemite Magneton Farfetchd Doduo Dodrio Seel Dewgong Grimer Muk Shellder Cloyster Gastly Haunter Gengar Onix Drowzee Hypno Krabby Kingler Voltorb Electrode Exeggcute Exeggutor Cubone Marowak Hitmonlee Hitmonchan Lickitung Koffing Weezing Rhyhorn Rhydon Chansey Tangela Kangaskhan Horsea Seadra Goldeen Seaking Staryu Starmie Mr.Mime Scyther Jynx Electabuzz Magmar Pinsir Tauros Magikarp Gyarados Lapras Ditto Eevee Vaporeon Jolteon Flareon Porygon Omanyte Omastar Kabuto Kabutops Aerodactyl Snorlax Articuno Zapdos Moltres Dratini Dragonair Dragonite Mewtwo Mew";
	var pokedex = pokeList.split(' ');

	console.log(pokedex);
	var introMode = true;
	var recentPokemon = [],
			sec,
			rounds = 0;
	$('.hide-drawings').on('click', function() {
		$('.recentDrawing').css('display', 'none');
		return false;
	});
	$('.refresh-drawings').on('click', function() {
		getRecentDrawings();
		return false;
	});
	//Adds an anchor tag to each color choice to make it work with sketch.js
	$('.controls ul li').append('<a></a>');
	$('.controls ul li a').each(function(){
		var colorLink = $(this).parent().css('background-color');
		$(this).attr({
			'data-color': colorLink,
			href: '#canvas'
		});
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
		var colorVal = $('#addNewColor').css('background-color');
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
	$(function(){$canvas.sketch();});
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

	var canSave = true;
	function saveImage() {
		if (canSave) {
			//Sets the background of the saved canvas to white.
			whiteOutCanvasBackground();
			//encode the drawing, send to saveImage.php which saves the image to ../drawings.
			var dataURL = canvas.toDataURL('image/jpeg');
			$.ajax({
				type: "POST",
				url: "/ajax/saveImage",
				data: {
					imgBase64: dataURL,
					pokemon: currentPokemon,
					browser: browser.name,
					browser_version: browser.version
				}
			}).done(function(response) {
				recentDrawingID = response._id;
				//Update the Share link based on the recent drawing.
				updateShareLink(recentDrawingID); //Todo: The save feature should return an image ID, not this.
				//Update the Save link so that it downloads the recently drawn file.
				$("#save").attr({
					href: "drawings/" + recentDrawingID,
					download: currentPokemon + ".jpeg"
				});
				getRecentDrawings();
			});
			canSave = false;
			setTimeout(function() {
				canSave = true;
			}, 40000);
		}
	}

	//Timer function initiated when #newRound is clicked.
	function startTimer() {
		alert('timer started!');
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
				$('#pip-timer').css('color', '#FF6A62').addClass('animated pulse infinite');
			}
			if (sec === 0) {
				clearInterval(timer);
				//This function sets the CSS of the interface when a round has ended.
				setInactiveInterface();
				if ($canvas.sketch().actions.length > 0) {
					saveImage(); //Calls getRecentDrawings() in callback.
				}
		  	ga('send', 'event', 'round-complete', 'trigger');
			}
		}, 1000);
	}
	//Current pokemon is kept track of just so that you don't get the same one twice in a row.
	var currentPokemon;

	//Generates a random number 001-151.
	function getNewPokemon() {
		//Clear list of recent Pokemon if 149+.
		if (recentPokemon.length >= 149) {
			recentPokemon = [];
		}
		//If rand already shows up in recent pokemon, reroll until we get a new one.
		var rand = (Math.floor(Math.random() * 151)+1);
		while (recentPokemon.indexOf(rand) !== -1) {
			rand = (Math.floor(Math.random() * 151)+1);
		}
		recentPokemon.push(rand);
		var s = "00" + rand;
		var index =  s.substr(s.length-3);
		//Fetches the proper image file for that pokemon.
		$('#imageContainer img').attr('src', "img/" + index + ".png");
		$('#pip img').attr('src', "img/" + index + ".png")

		$('#imageContainer').waitForImages(startTimer()); //Start the timer once the image is fully loaded.
		//Fetched the proper name from the pokedex object.
		currentPokemon = pokedex[rand-1];
		$('#pokemonName').text(currentPokemon);
	}

	function setActiveInterface() {
		//Hide the hero text once the button has been clicked once.
		$('h1').slideUp('fast');
		//If in mq-mobile resolution, don't show the regular timer.
		if ($('#pip').css('display') == 'block') {
			$('h1').css('height', '0px');
		}
		$('#newRound.intro').css('display', 'none');
		$('#newRound').removeClass('animated bounce');
		$('#timer').text('45').css('color', '#fff');
		$('#pip-timer').text('45').css({
			'color': '#666',
			'display': 'inline'}).fadeIn('fast');
		$('.round-controls').css('display', 'none');
		$('.controls ul').css('display', 'inline-block');
	}
	function setInactiveInterface() {
		//As soon as the round is over, change the CTA button to say "Draw a new Pokemon" and change the button css to match.
		$('#newRound').css('display', 'block')
									.text('Draw a new Pokémon!')
									.removeClass('intro')
									.prependTo($('.round-controls'));
		var bounceDelay = setInterval(function() {
			$('#newRound').addClass('animated bounce');
			clearInterval(bounceDelay);
		}, 3500);
		$canvas.css('pointer-events', 'none');
		$('.round-controls').css('display', 'inline-block').fadeIn('fast');
		$('.controls ul').css('display', 'none');
		$('#pip-timer').fadeOut('slow').removeClass('animated pulse infinite');
	}

	$('#newRound').click(function(){
		//If this is the first time #newRound is being clicked...
		if (introMode) {
			//Remove the Who's That Pokemon image, and un-dim the canvas.
			$('#canvas').css('background', "#fff");
			$('#imageContainer img').attr('src', '').removeClass('intro');
		}
		//This function changes the CSS of the interface during a round.
		setActiveInterface();
		//These next two lines clear out the saved canvas strokes and redraw it as empty.
		$canvas.sketch().clear();
		$canvas.css('pointer-events', 'auto');
		//Reset the timer and get a new Pokemon to draw.
		sec = 8;
		getNewPokemon();
		//If on mobile, Scroll to the canvas element.
		if ($('#pip').css('display') == 'block') {
			var target = $('#canvas');
			if (target.length) {
				$('html,body').animate({
					scrollTop: target.offset().top - 12
				}, 500);
				return false;
			}
		}
  	ga('send', 'event', 'new-round', 'click');
	});

	$('#save').click(function(){
		//Sets the background of the saved picture to white.
		whiteOutCanvasBackground();


		ga('send', 'event', 'save-button', 'click');
	});

	function getRecentDrawings() {
		var imgList = [];
		$.ajax({
			type: "GET",
			url: "/ajax/getDrawingFilenames/12"
		}).done(function(files) {
		// console.log(files);
				imgList = files; //no JSON.Parse needed since we set the JSON headers with express :-)
				//On success, send imgList to another function which updates the jQuery header with the images.
				updateHeaderDrawings(imgList);
				$("recentDrawing").error(function(){$(this).hide();});
		});
	}
	var sharePic;
	function updateShareLink(fileURL) {
		sharePic = ("http://"+document.domain+ "/drawings/" + fileURL);
		//Update Tweet button URL
		$('.share-twitter').attr('href', 'http://twitter.com/share?url=' + sharePic + '&text=I drew this ' + currentPokemon + ' all by myself on pokedraw.net!');
	}
	function updateHeaderDrawings(images) {
		// console.log(images);
		$('header .recentDrawing').fadeOut('fast').remove();
		images.forEach(function(val, i) {
			$("header").append($("<img class='recentDrawing' src=drawings/" + val._id + "></img>").fadeIn('fast'));
		});
	}
	// console.log('getting recent drawings...');
	getRecentDrawings();


// Search By Pokemon on Homepage
var $galleryButton = $('<div class="gallery-button-container"><a class="gallery-button" href="gallery.html">See more<br/>in the Gallery!</a><div>');
var SBPimageList = [];
function displayNewDrawings() {
  loadPortion = SBPimageList.slice(0, 10);
  if (loadPortion.length !== 0) {
		loadPortion.forEach(function(val, i) {
			$(".mini-gallery").prepend($("<img class='recentDrawing' src=drawings/" + val._id + "></img>").fadeIn('fast'));
		});
		$('.mini-gallery').prepend($galleryButton);
  }
}

function getDrawingsByPokemon(name) {
  $.ajax({
    type: "GET",
    url: "/ajax/getDrawingsByPokemon/" + name
  }).done(function(files) {
    $('.mini-gallery').empty();
    SBPimageList = files;
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
		//Remove the "Choose a Pokemon..." option.
	  $('option[value="0"]').remove();
    var filterOption = $('.pokemon-list').val().toLowerCase();
		//Search for 1500 pokemon to populate the SBP section.
		getDrawingsByPokemon(filterOption);
		$('.mini-gallery').slideDown('1000');
  }
});

// Facebook sharing button
		(function() {
			var fbShare = function() {
				FB.ui({
					method: "feed",
					link: "http://pokedraw.net/",
					caption: "I drew this Pokemon all by myself!!!!",
					description: "Think you can draw a Pokemon better than this? Click here to try. It only takes 45 seconds.",
					picture: sharePic
				});
			};
			$(".share-facebook").click(function() {
			FB.login(function(response) {
					if (response.authResponse) {
						fbShare();
				 }
				}, {scope: 'publish_stream'});
		  	ga('send', 'event', 'share-facebook', 'click');
			});
	})();

	//Twitter Share button

	$('.share-twitter').click(function(event) {
    var width  = 575,
        height = 400,
        left   = ($(window).width()  - width)  / 2,
        top    = ($(window).height() - height) / 2,
        url    = this.href,
        //text   = "!!!!!!!!!!!!!!",
        opts   = 'status=1' +
                 ',width='  + width  +
                 ',height=' + height +
                 ',top='    + top    +
                 ',left='   + left;

    window.open(url, 'twitter', opts);

		ga('send', 'event', 'share-twitter', 'click');
    return false;
  });

	// leanModal v1.1 by Ray Stone - http://finelysliced.com.au
	// Dual licensed under the MIT and GPL
	(function($){$.fn.extend({leanModal:function(options){var defaults={top:100,overlay:0.5,closeButton:null};var overlay=$("<div id='lean_overlay'></div>");$("body").append(overlay);options=$.extend(defaults,options);return this.each(function(){var o=options;$(this).click(function(e){var modal_id=$(this).attr("href");$("#lean_overlay").click(function(){close_modal(modal_id)});$(o.closeButton).click(function(){close_modal(modal_id)});var modal_height=$(modal_id).outerHeight();var modal_width=$(modal_id).outerWidth();
	$("#lean_overlay").css({"display":"block",opacity:0});$("#lean_overlay").fadeTo(200,o.overlay);$(modal_id).css({"display":"block","position":"fixed","opacity":0,"z-index":11000,"left":50+"%","margin-left":-(modal_width/2)+"px","top":o.top+"px"});$(modal_id).fadeTo(200,1);e.preventDefault()})});function close_modal(modal_id){$("#lean_overlay").fadeOut(200);$(modal_id).css({"display":"none"})}}})})(jQuery);

	$(".nav-update").leanModal({ top : 120, overlay : 0.6, closeButton: ".modal-close" });


	//Analytics for miscellaneous events
	$('#dropdownDonateButton').click(function(){
		ga('send', 'event', 'donation-button', 'click');
	});
});

/*! waitForImages jQuery Plugin 2015-02-25 */
!function(a){var b="waitForImages";a.waitForImages={hasImageProperties:["backgroundImage","listStyleImage","borderImage","borderCornerImage","cursor"],hasImageAttributes:["srcset"]},a.expr[":"].uncached=function(b){if(!a(b).is('img[src][src!=""]'))return!1;var c=new Image;return c.src=b.src,!c.complete},a.fn.waitForImages=function(){var c,d,e,f=0,g=0,h=a.Deferred();if(a.isPlainObject(arguments[0])?(e=arguments[0].waitForAll,d=arguments[0].each,c=arguments[0].finished):1===arguments.length&&"boolean"===a.type(arguments[0])?e=arguments[0]:(c=arguments[0],d=arguments[1],e=arguments[2]),c=c||a.noop,d=d||a.noop,e=!!e,!a.isFunction(c)||!a.isFunction(d))throw new TypeError("An invalid callback was supplied.");return this.each(function(){var i=a(this),j=[],k=a.waitForImages.hasImageProperties||[],l=a.waitForImages.hasImageAttributes||[],m=/url\(\s*(['"]?)(.*?)\1\s*\)/g;e?i.find("*").addBack().each(function(){var b=a(this);b.is("img:uncached")&&j.push({src:b.attr("src"),element:b[0]}),a.each(k,function(a,c){var d,e=b.css(c);if(!e)return!0;for(;d=m.exec(e);)j.push({src:d[2],element:b[0]})}),a.each(l,function(c,d){var e,f=b.attr(d);return f?(e=f.split(","),void a.each(e,function(c,d){d=a.trim(d).split(" ")[0],j.push({src:d,element:b[0]})})):!0})}):i.find("img:uncached").each(function(){j.push({src:this.src,element:this})}),f=j.length,g=0,0===f&&(c.call(i[0]),h.resolveWith(i[0])),a.each(j,function(e,j){var k=new Image,l="load."+b+" error."+b;a(k).one(l,function m(b){var e=[g,f,"load"==b.type];return g++,d.apply(j.element,e),h.notifyWith(j.element,e),a(this).off(l,m),g==f?(c.call(i[0]),h.resolveWith(i[0]),!1):void 0}),k.src=j.src})}),h.promise()}}(jQuery);

//Browser detection function by StackOverflow users kennebec & Hermann Ingjaldsson
function get_browser_info(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name:'IE ',version:(tem[1]||'')};
        }
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
 }
var browser = get_browser_info();
