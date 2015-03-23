var loadPortion = [];
var imgList = [];
var loadStart = 0;

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

$(window).scroll(function() {
  if($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
    $('.loader').remove();
    displayNewDrawings();
  }
});

initializeGallery();
