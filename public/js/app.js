var canvas, motionCanvas, backCanvas, context, motionContext, backContext, webcam, lastData, circles;

var faceCoords = [];
var faceCheck = 10;
var toggles = {
};

window.onload = function() {
  canvas = document.getElementById('animation');
  canvas.height = $(window).height();
  canvas.width = $(window).width();
  context = Context = canvas.getContext('2d');
  motionCanvas = document.getElementById('motionCanvas');
  motionCanvas.height = $('#video').height() / 4;
  motionCanvas.width = $('#video').width() / 4;
  motionContext = Context = motionCanvas.getContext('2d');
  backCanvas = document.createElement('canvas');
  backContext = canvas.getContext('2d');
  webcam = document.getElementById('video');
}

function checkFace() {
  var dataURL = canvas.toDataURL();
  var blobBin = atob(dataURL.split(',')[1]);
  var array = [];
  for(var i = 0; i < blobBin.length; i++) {
    array.push(blobBin.charCodeAt(i));
  }
  var file=new Blob([new Uint8Array(array)], {type: 'image/png'});

  var formdata = new FormData();
  formdata.append("upload", file);
  $.ajax({
    url: "/",
    type: "POST",
    data: formdata,
    processData: false,
    contentType: false,
  }).done(function(response){
    faceCoords = JSON.parse(response);
  });
}

function clearWindow() {
  canvas.width = canvas.width;
}

function isRunning() {
  if (webcam && video.src) {
    return true;
  }
  return false;
}

function draw() {
  if (isRunning()) {
    clearWindow();
    // backContext.translate(canvas.width, 0);
    // backContext.scale(-1, 1);
    backContext.drawImage(webcam,0,0);
    // context.translate(canvas.width, 0);
    // context.scale(-1, 1);
    if (faceCoords.length > 0) {
      faceCoords.forEach(function(coord, index) {
        context.strokeRect(coord.x, coord.y, coord.width, coord.height);
      });
    }
  }
}

function update() {
  if (isRunning()) {
    faceCheck--;
    if (faceCheck == 0) {
      checkFace();
      faceCheck = 10;
    }
  }
}

function main() {
  draw();
  update();
  window.requestAnimationFrame(main)
    // setTimeout(main, 30);
}

window.requestAnimationFrame(main)


  // GET USER MEDIA
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var constraints = {
    audio: false, 
    video: {
      mandatory: {
        minWidth: 1280,
        minHeight: 720
      }
    }
  };

function successCallback(stream) {
  window.stream = stream; // stream available to console
  if (window.URL) {
    webcam.src = window.URL.createObjectURL(stream);
  } else {
    webcam.src = stream;
  }
  webcam.play();
  // document.getElementById('background').play();
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

navigator.getUserMedia(constraints, successCallback, errorCallback);
