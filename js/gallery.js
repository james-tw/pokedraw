var loadPortion = [];
var imgList = [];
var loadStart = 0;
function initializeGallery() {
  $.ajax({
    type: "POST",
    url: "php/getDrawingFilenames.php"
  }).done(function(files) {
      imgList = JSON.parse(files).slice(0, 640);
      displayNewDrawings();
  });
}
function displayNewDrawings() {

  //Only keep the X most recent URLs.
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



initializeGallery();