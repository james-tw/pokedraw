$(document).ready(function() {
    //Current pokemon is kept track of just so that you don't get the same one twice in a row.
    var canSave = true,
        currentPokemon,
        pokedex = generatePokedex(),
        recentPokemon = [],
        sec,
        sharePic,
        $headerSlider = $('.js-header__flickity-slider'),
        $sbpSlider = $('.js-sbp-slider'),
        zazzleURL;
    (function init() {
        $headerSlider.flickity({
            wrapAround: true,
            prevNextButtons: false,
            pageDots: false,
            imagesLoaded: true,
            cellAlign: 'left'
        });
        $sbpSlider.flickity({
            wrapAround: true,
            prevNextButtons: false,
            pageDots: false,
            imagesLoaded: true,
            cellAlign: 'left'
        });

        getRecentDrawings();
        pokedex.forEach(function(item){
            var $option = $('<option value="' + item + '">' + item + '</option>');
            $('.js-sbp__dropdown').append($option);
        }); 
    }());


////////////////////////////////////////////////////////////////
// EVENT HANDLERS
//
    
    $('.js-header__control--hide').on('click', function() {
        $('.header__slider img').css('display', 'none');
        return false;
    });
    $('.js-header__control--refresh').on('click', function() {
        getRecentDrawings();
        return false;
    });

    //Adds an anchor tag to each color choice to make it work with sketch.js
    $('.js-controls__color').append('<a></a>');
    $('.js-controls__color a').each(function(){
        var colorLink = $(this).parent().css('background-color');
        $(this).attr({
            'data-color': colorLink,
            href: '#js-canvas'
        });
    });

    //Allows you to select a color from the list.
    $('.js-controls__color').on('click', function() {
        $(this).siblings().removeClass('controls__color--selected');
        $(this).addClass('controls__color--selected');
    });

    $('.js-new-round').click(function() {

        //Remove the Who's That Pokemon image, and un-dim the canvas.
        $('#js-canvas').css('background', "#fff");
        $('.js-reference-image').attr('src', '').removeClass('intro');

        //This function changes the CSS of the interface during a round.
        setInterfaceActive();
        //These next two lines clear out the saved canvas strokes and redraw it as empty.
        $canvas.sketch().clear();
        $canvas.css('pointer-events', 'auto');
        //Reset the timer and get a new Pokemon to draw.
        sec = 45;
        //If on mobile, Scroll to the canvas element.
        if ($('.pip__container').css('display') === 'block') {
            $('html,body').animate({
                scrollTop: $('#js-canvas').offset().top - 12
            }, 500);
        }
        getNewPokemon();
        ga('send', 'event', 'new-round', 'click');
    });

    $('.js-sbp__dropdown').on("change", function() {
        // If this is not the default option
        if ($(this).val() !== 0) {
            //Remove the "Choose a Pokemon..." option.
            $('.js-sbp__dropdown option[value="0"]').remove();
            var filterOption = $(this).val().toLowerCase();
            //Search for pokemon to populate the SBP section.
            getDrawingsByPokemon(filterOption, 12);
            $('.js-sbp-gallery').slideDown('1000');
        }
    });

    $('.js-save').click(function() {
        //Sets the background of the saved picture to white.
        // TODO: Check if necessary.
        whiteOutCanvasBackground();

        ga('send', 'event', 'save-button', 'click');
    });


//
// END EVENT HANDLERS
////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////
// FUNCTION DECLARATIONS
//

    // Checks whether any lines were drawn on the canvas.
    function canvasContainsDrawing() {
        return $canvas.sketch().actions.length > 0;
    }
    
    //Generates an array of 151 Pokemon on init.
    function generatePokedex () {
        var pokeList = "Bulbasaur Ivysaur Venusaur Charmander Charmeleon Charizard Squirtle Wartortle Blastoise Caterpie Metapod Butterfree Weedle Kakuna Beedrill Pidgey Pidgeotto Pidgeot Rattata Raticate Spearow Fearow Ekans Arbok Pikachu Raichu Sandshrew Sandslash Nidoran♀ Nidorina Nidoqueen Nidoran♂ Nidorino Nidoking Clefairy Clefable Vulpix Ninetales Jigglypuff Wigglytuff Zubat Golbat Oddish Gloom Vileplume Paras Parasect Venonat Venomoth Diglett Dugtrio Meowth Persian Psyduck Golduck Mankey Primeape Growlithe Arcanine Poliwag Poliwhirl Poliwrath Abra Kadabra Alakazam Machop Machoke Machamp Bellsprout Weepinbell Victreebel Tentacool Tentacruel Geodude Graveler Golem Ponyta Rapidash Slowpoke Slowbro Magnemite Magneton Farfetchd Doduo Dodrio Seel Dewgong Grimer Muk Shellder Cloyster Gastly Haunter Gengar Onix Drowzee Hypno Krabby Kingler Voltorb Electrode Exeggcute Exeggutor Cubone Marowak Hitmonlee Hitmonchan Lickitung Koffing Weezing Rhyhorn Rhydon Chansey Tangela Kangaskhan Horsea Seadra Goldeen Seaking Staryu Starmie Mr.Mime Scyther Jynx Electabuzz Magmar Pinsir Tauros Magikarp Gyarados Lapras Ditto Eevee Vaporeon Jolteon Flareon Porygon Omanyte Omastar Kabuto Kabutops Aerodactyl Snorlax Articuno Zapdos Moltres Dratini Dragonair Dragonite Mewtwo Mew";
        return pokeList.split(' ');
    }

    // AJAX call to MongoDB to get most recent <=X drawings by a pokemon's name.
    function getDrawingsByPokemon(name, limit) {
        $.ajax({
            type: "GET",
            url: "/ajax/getDrawingsByPokemon/" + name + "/" + limit
        }).done(function(files) {

            updateSBPDrawings(files);
        });
    }

    // AJAX call to MongoDB to get 12 most recent images.
    function getRecentDrawings(num) {
        var amt = num || 12;
        $.ajax({
            type: "GET",
            url: "/ajax/getDrawingFilenames/" + amt
        }).done(function(files) {
            //no JSON.Parse needed since we set the JSON headers with express :-)
            //On success, send files to another function which updates the jQuery header with the images.
            updateHeaderDrawings(files);
        });
    }

    function getNewPokemon() {
        //Clear list of recent Pokemon if 150+.
        if (recentPokemon.length > 150) {
            recentPokemon = [];
            alert("Congratulations! You drew all 151 Pokemon! Go outside!");
        }
        //If rand already shows up in recent pokemon, reroll until we get a new one.
        var rand = (Math.floor(Math.random() * pokedex.length)+1);
        while (recentPokemon.indexOf(rand) !== -1) {
            rand = (Math.floor(Math.random() * pokedex.length)+1);
        }
        recentPokemon.push(rand);
        var s = "00" + rand;
        var index =  s.substr(s.length-3);
        //Fetches the proper image file for that pokemon.
        $('.js-reference-image').attr('src', "img/" + index + ".png");
        $('.pip').attr('src', "img/" + index + ".png");

        //Start the timer once the image is fully loaded. 
        // TODO: Add loading animation, then remove it in the following function
        $('.js-reference-image__container').waitForImages(function () {
            startTimer();
        });
        //Fetch the proper name from the pokedex object.
        currentPokemon = pokedex[rand-1];
        $('.js-pokemon-name').text(currentPokemon);
    }

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
                var recentDrawingID = response._id;
                //Update the Share link based on the recent drawing.
                updateShareLink(recentDrawingID);
                //Update the Save link so that it downloads the recently drawn file.
                $(".js-save").attr({
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

    function setInterfaceActive() {
        //Hide the hero text once the button has been clicked once.
        $('.hero').slideUp('fast');
        $('.hero h1').hide();
        //If in mq-mobile resolution, don't show the regular timer.
        if ($('.pip__container').css('display') === 'block') {
            $('.hero').css('height', '0px');
        }

        $('.js-new-round.intro').css('display', 'none');
        $('.js-new-round').removeClass('animated bounce');
        $('.js-canvas__timer').text('45')
                              .css({
                                'color': '#666',
                                'display': 'inline'
                              })
                              .fadeIn('fast');
        $('.round-controls').css('display', 'none');
        $('.js-controls__color-list').css('display', 'inline-block');

        hidePurchaseHero();
    }

    function setInterfaceInactive() {
        //As soon as the round is over, change the CTA button to say "Draw a new Pokemon" and change the button css to match.
        $('.js-new-round').css('display', 'block')
                          .text('Draw a new Pokémon!')
                          .removeClass('intro')
                          .prependTo($('.round-controls'));
        var bounceDelay = setInterval(function() {
            $('.js-new-round').addClass('animated bounce');
            clearInterval(bounceDelay);
        }, 3500);
        $canvas.css('pointer-events', 'none');
        $('.round-controls').css('display', 'inline-block').fadeIn('fast');
        $('.js-controls__color-list').css('display', 'none');
        $('.js-canvas__timer').fadeOut('slow').removeClass('animated pulse infinite');

        if (canvasContainsDrawing()) {
            showPurchaseHero();
        }
        
    }

    function hidePurchaseHero() {
        $('.hero__buy-pitch').addClass('hide');

        zazzleURL = undefined;
    }

    function showPurchaseHero() {
        $('.hero__buy-pitch').removeClass('hide');
        $('.hero').slideDown('fast');

        $('.buy-button').on('click', function (e) {
            $buyButton = $(this);
            ga('send', 'event', 'buy-button-click', 'click');

            if (zazzleURL) {
                window.open(zazzleURL, '_blank');
            } else {
                // Show spinner?
                // $buyButton.text('Uploading...');

                // Get dataURL info from canvas
                var imgurDataURL = canvas.toDataURL('image/png', 0.9).split(',')[1];

                // TODO: Create a "LOADING" page rather than taking the user to a blank page.
                var newWindow = window.open('', '_blank');

                // Upload picture to imgur
                $.ajax({
                    url: 'https://api.imgur.com/3/image',
                    type: 'post',
                    headers: {
                        Authorization: 'Client-ID 0179df3db8add13'
                    },
                    data: {
                        image: imgurDataURL
                    },
                    dataType: 'json',
                    success: function(response) {
                        if(response.success) {
                            // build out Zazzle URL using imgur link
                            zazzleURL = getZazzleURL(response.data.link, true);
                            // Open new tab with zazzle url
                            newWindow.location.assign(zazzleURL);
                            ga('send', 'event', 'imgur-upload-success', 'trigger');
                        }
                    },
                    error: function (error) {
                        // Handle error
                    },
                    complete: function () {
                        // Hide spinner?
                        // $buyButton.text('Check it out!');
                    }
                });
            }

           
                
        })
    }

    function getZazzleURL(imageURL, isTemplateBuffet) {
        if (isTemplateBuffet) {
            return 'http://www.zazzle.com/api/create/at-238661179973446865?rf=238661179973446865&ax=DesignBlast&sr=250747147674160458&cg=196659863177995039&t__useQpc=false&ed=true&t__smart=false&continueUrl=http%3A%2F%2Fwww.zazzle.com%2Fpokedraw&fwd=ProductPage&tc=buyHero&ic=&t_image0_iid=' + imageURL;
        } else {
            return 'http://www.zazzle.com/api/create/at-238661179973446865?rf=238661179973446865&ax=Linkover&pd=235436136963403667&fwd=ProductPage&ed=true&tc=buyHero&ic=&t_image0_iid=' + encodeURIComponent(imageURL);
        }
    }

    //Timer function initiated when .js-new-round is clicked.
    function startTimer() {
        var timer = setInterval(function() {
            sec -= 1;
            //Updates the text shown on the timer.
            $('.js-canvas__timer').text(sec);
            if (sec === 5) {
                $('.js-canvas__timer').css('color', '#FF6A62').addClass('animated pulse infinite');
            }
            if (sec === 0) {
                clearInterval(timer);
                //This function sets the CSS of the interface when a round has ended.
                setInterfaceInactive();
                //Automatically select the currentPokemon from the sbp__dropdown input.
                $('.js-sbp__dropdown').val(currentPokemon).change();
                //Only save the image if something has been drawn.
                if (canvasContainsDrawing()) {
                    saveImage(); //Calls getRecentDrawings() in callback.
                }
                ga('send', 'event', 'round-complete', 'trigger');
            }
        }, 1000);
    }

    function updateHeaderDrawings(images) {
        $headerSlider.flickity('remove', $headerSlider.find('img'));
        images.forEach(function(item) {
            var $image = $("<img src='drawings/" + item._id + "'></img>");
            $headerSlider.flickity('append', $image);
        });
        // Once all images have loaded, resize the slider to fit images correctly.
        $headerSlider.waitForImages(function() {
            $headerSlider.flickity('resize');
        });
    }

    // Update the images in the Search By Pokemon (SBP) section.
    function updateSBPDrawings(images) {
        $sbpSlider.slideDown('fast').flickity('remove', $sbpSlider.find('img'));
        images.forEach(function(item) {
            var $image = $("<img src='drawings/" + item._id + "'></img>");
            $sbpSlider.flickity('append', $image);
        });

        // Once all images have loaded, resize the slider to fit images correctly.
        $sbpSlider.waitForImages(function() {
            $sbpSlider.flickity('resize');
        });
    }

    function updateShareLink(fileURL) {
        // sharePic is used by both the Facebook and Twitter share functions
        sharePic = ("http://"+document.domain+ "/drawings/" + fileURL);
        //Update Tweet button URL
        $('.js-share-twitter').attr('href', 'http://twitter.com/share?url=' + sharePic + '&text=I drew this ' + currentPokemon + ' all by myself on pokedraw.net!');
    }

    function whiteOutCanvasBackground() {
        // TODO: Examine which of these is necessary. data, canvas, and compositeOperation are not defined/used
        //get the current ImageData for the canvas.
        // var data = context.getImageData(0, 0, canvas.width, canvas.height);
        //store the current globalCompositeOperation
        // var compositeOperation = context.globalCompositeOperation;
        //set to draw behind current content
        context.globalCompositeOperation = "destination-over";
        //set background color to white
        context.fillStyle = '#fff';
        //draw background / rect on entire canvas
        context.fillRect(0,0,canvas.width, canvas.height);
    }
//
// END FUNCTION DECLARATIONS
////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////
// CANVAS CREATION AND CALIBRATION
//

    var canvas = document.getElementById('js-canvas');
    var $canvas = $('#js-canvas');
    var context = $canvas[0].getContext('2d');

    //Initiate sketch.js
    $canvas.sketch();
    calibrateCanvas();
    //Function for resizing the canvas when the window resizes.
    function calibrateCanvas() {
        $canvas.attr({
            width: $canvas.css('width'),
            height: $canvas.css('height')
        });
        $canvas.sketch().redraw();
        $('.js-reference-image__container').css('height', $canvas.css('height'));
    }
    //Canvas will calibrate each time the window resizes.
    $(window).resize(calibrateCanvas);

//
// END CANVAS CREATION AND CALIBRATION
////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////
// SOCIAL NETWORK SHARING 
//

    // Facebook Share button
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
        $(".js-share-facebook").click(function() {
            FB.login(function(response) {
                if (response.authResponse) {
                    fbShare();
                }
            }, {scope: 'publish_stream'});

            ga('send', 'event', 'share-facebook', 'click');
        });
    })();

    //Twitter Share button
    $('.js-share-twitter').click(function(event) {
        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            url    = this.href,
            opts   = 'status=1' +
                     ',width='  + width  +
                     ',height=' + height +
                     ',top='    + top    +
                     ',left='   + left;

        window.open(url, 'twitter', opts);

        ga('send', 'event', 'share-twitter', 'click');
        return false;
    });

//
// END SOCIAL NETWORK SHARING 
////////////////////////////////////////////////////////////////


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
