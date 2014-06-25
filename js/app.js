
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
  var $newColorLink = $('<a></a>');
  $newColor.append($newColorLink);
  var colorVal = $('#newColor').css('background-color')
  $newColor.css('background-color', colorVal );
  $newColorLink.attr({
    'data-color': colorVal,
    href: '#canvas' 
  });
  $('.controls ul').append($newColor);
  $newColorLink.click();
});


var $canvas = $('#canvas');
$(function(){$canvas.sketch()});

$(window).resize(calibrateCanvas);

function calibrateCanvas(){
  $canvas.attr({
    width: $canvas.css('width'),
    height: $canvas.css('height')
  });
  $.sketch.redraw();
}

$('.controls ul li').append('<a></a>');
$('.controls ul li a').each(function(){
  var colorLink = $(this).parent().css('background-color');
  $(this).attr({
    'data-color': colorLink,
    href: '#canvas' 
  })
})