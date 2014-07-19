var loadPortion = [];
var imgList = [];
var loadStart = 0;

function initializeGallery() {
  $.ajax({
    type: "POST",
    url: "php/getDrawingFilenames.php"
  }).done(function(files) {
      imgList = JSON.parse(files).slice(0, 1000);
      displayNewDrawings();
  });
}

function displayNewDrawings() {
  loadPortion = imgList.slice(loadStart, loadStart+40);
  loadPortion.forEach(function(val) {
    $(".gallery").append($("<div class='drawing'><img src=drawings/" + val + "></img></div>"));
  });
  $("#loader-button-container").append($('<button class="loader">Load more Pokedraws!</button>'));
  $('.loader').on('click', function(){
    //Remove this from the dom
    $(this).remove();
    //Load new images starting with the previous loadStart+40
    displayNewDrawings();
  })
  loadStart += 40;

}

  $(window).scroll(function() {
     if($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
        $('.loader').remove();
         displayNewDrawings();
     }
  });

initializeGallery();
