var canvas, backCanvas, context, backContext, webcam, lastData, circles, littleCanvas, littleContext;

var faceCoords = [];
var faceCheck = 9;
var scale = 3;

window.onload = function() {
  canvas = document.getElementById('main');
  context = Context = canvas.getContext('2d');
  webcam = document.getElementById('video');
  littleCanvas = document.getElementById('little');
  littleContext = littleCanvas.getContext('2d');
}

var dataURL;
function checkFace() {
  dataURL = littleCanvas.toDataURL();
  // dataURL = canvas.toDataURL();

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
    faceCoords.map(function(obj, index) {
      for (key in obj) {
        obj[key] = obj[key] * scale;
      }
    });
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
    context.drawImage(webcam,0,0);
    littleContext.drawImage(webcam,0,0, littleCanvas.width, littleCanvas.height);
    // context.translate(canvas.width, 0);
    // context.scale(-1, 1);
    if (faceCoords.length > 0) {
      faceCoords.forEach(function(coord, index) {
        context.strokeStyle = "#fff";
        context.lineWidth = 3;
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
      faceCheck = 15;
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
  webcam.addEventListener('play', function(e) {
    canvas.height = $(video).height();
    canvas.width = $(video).width();

    littleCanvas.height = $(video).height() / scale;
    littleCanvas.width = $(video).width() / scale;

    backCanvas = document.createElement('canvas');
    backContext = canvas.getContext('2d');
  });
  webcam.play();
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

navigator.getUserMedia(constraints, successCallback, errorCallback);
