
var color = $('.selected').css('background-color');

$('.controls').on('click', 'li', function(){
  $(this).siblings().removeClass('selected');
  $(this).addClass('selected');
  color = $(this).css('background-color');
});

function changeColor() {
  var r = $('#red').val();
  var g = $('#green').val();
  var b = $('#blue').val();
  
  $('#newColor').css('background-color', 'rgb(' + r + ',' + g + ',' + b + ')');
}
                     
$('input[type=range]').change(changeColor);

$('#addNewColor').click(function() {
  var $newColor = $('<li></li>');
  $newColor.css('background-color', $('#newColor').css('background-color') );
  $('.controls ul').append($newColor);
  $newColor.click();
});

var $canvas = $('canvas');
var context = $('canvas')[0].getContext('2d');

var lastEvent;
var mouseDown = false;

$(window).resize(calibrateCanvas);

function calibrateCanvas(){
  console.log($canvas.css('width'));
  $canvas.attr({
    width: $canvas.css('width'),
    height: $canvas.css('height')
  });
}

$canvas.mousedown(function(e){
  lastEvent = e;
  mouseDown = true;
}).mousemove(function(e){
  if(mouseDown) {
    context.beginPath();
    context.moveTo(lastEvent.offsetX, lastEvent.offsetY);
    context.lineTo(e.offsetX, e.offsetY);
    context.strokeStyle = color;
    context.lineWidth = 4;
    context.lineJoin = 'round';
    context.stroke();
    lastEvent = e;
  }
}).mouseup(function(){
  mouseDown = false;
}).mouseleave(function(){
  $canvas.mouseup();
});


