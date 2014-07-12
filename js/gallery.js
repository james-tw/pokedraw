var loadPortion = [];
var imgList = [];
var loadStart = 0;
function initializeGallery() {
  var dir = "drawings/?C=M;O=D";
  var fileextension = ".jpeg";
  $.ajax({
    type: "GET",
    //This will retrieve the contents of the folder if the folder is configured as 'browsable'
    url: dir,
    success: function (data) {
      console.log(data);
      $(data).find("a[href*='.jpeg']").each(function (i) {
        var filename = this.href.replace(window.location.host, "").replace("http:///", "").replace("pokedraw/", "").replace("drawings/", "");
        //Build an array of all the image filenames in the directory.
        imgList.push(filename);
        if (i > 640) {
          console.log("Found the most recent 640 Pokedraws for you!");
          return false;
        }
      });
    }
  }).done(function(o) {
    //On success, send loadPortion to another function which updates the page body with the images.
    displayNewDrawings();
    console.log(imgList.length);
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