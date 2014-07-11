function getRecentDrawings() {
  var dir = "drawings/";
  var fileextension = ".jpeg";
  var imgList = [];
  $.ajax({
    //This will retrieve the contents of the folder if the folder is configured as 'browsable'
    url: dir,
    success: function (data) {
      //
      $(data).find("a[href*='.jpeg']").each(function (i) {
        var filename = this.href.replace(window.location.host, "").replace("http:///", "").replace("pokedraw/", "").replace("drawings/", "");
        imgList.unshift(filename);
        //$("body").append($("<img src=" + dir + filename + "></img>"));
      });
    }
  }).done(function(o) {
    //Only keep the 150 most recent URLs.
    imgList = imgList.slice(0,90);
    //On success, send imgList to another function which updates the page body with the images.
    displayDrawings(imgList);
  });;
}
function displayDrawings(images) {
  images.forEach(function(val, i) {
    $(".gallery").append($("<div class='drawing'><img src=drawings/" + val + "></img></div>"));
  })
}

getRecentDrawings();