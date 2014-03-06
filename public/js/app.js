var canvas, backCanvas, context, backContext, webcam, lastData, circles, littleCanvas, littleContext;

var faceCoords = [];
var faceCheck = 9;
var scale = 3;

var drawAllFaces = false;

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
    faceCoords.push(JSON.parse(response));
    faceCoords[faceCoords.length - 1].map(function(obj, index) {
      for (key in obj) {
        obj[key] = obj[key] * scale;
      }
    });
  });
}

function filterNoResults() {
  return faceCoords.filter(function(obj, index){return obj.length > 0;});
}

function distance(obj1, obj2) {
  return Math.sqrt(Math.pow((obj1.x - obj2.x), 2) + Math.pow((obj1.y - obj2.y), 2));
}

function closestFace(faces, newFace) {
  sorted = faces.sort(function(a, b) {
    return distance(a, newFace) - distance(b, newFace);
  });
  return sorted[0];
}

var Faces = function() {
  this.faces = [];
}

Array.max = function( array ){
    return Math.max.apply( Math, array );
};

Faces.prototype.calculateCertainties = function() {
  var avgMaxLocations = (this.faces.reduce(function(a, b) {
    return a + b.locations.length;
  }, 0) / this.faces.length);
  var maxLocations = Array.max(this.faces.map(function(face, index) {
    return face.locations.length;
  }));
  this.faces.map(function(face, index) {
    face.calculateCertainty(maxLocations);
  });
}

var Face = function(x, y, wxh) {
  this.x = x;
  this.y = y;
  this.area = wxh;
  this.avg = {x: x, y: y, area: wxh}
  this.locations = [];
  this.locations.push({x: x, y: y, area: wxh});
  this.certainty = 0;
}

Face.prototype.newPosition = function(x, y, wxh) {
  this.locations.push({x: x, y: y, area: wxh});
  this.x = x;
  this.y = y;
  this.area = wxh;
}

Face.prototype.averageArea = function() {
  var avgArea = (this.locations.reduce(function(a, b, c, d) {
    return a + b.area;
  }, 0) / this.locations.length);
  return avgArea;
}

Face.prototype.standardDeviation = function() {
  var avg = this.averageArea()
  var distances = this.locations.map(function(obj, index) {
    return Math.pow(avg - obj.area, 2);
  });
  var variance = distances.reduce(function(a, b) {
    return a + b;
  }, 0) / distances.length;
  return Math.sqrt(variance);
}

Face.prototype.calculateCertainty = function(maxLocations) {
  this.certainty = this.locations.length / maxLocations;
}


function findFaces() {
  window.faceCollection = new Faces();
  faceCoords.forEach(function(obj, index) {
    obj.forEach(function(face, index) {
      if (faceCollection.faces.length == 0) {
        faceCollection.faces.push(new Face(face.x, face.y, face.width * face.height));
      }
      if (faceCollection.faces.length > 0) {
        possibleMatch = closestFace(faceCollection.faces, face);
        if (distance(possibleMatch, face) < Math.sqrt(possibleMatch.area) / 5) {
          if (possibleMatch.area - (face.width * face.height) < possibleMatch.standardDeviation()) {
            possibleMatch.newPosition(face.x, face.y, face.width * face.height);
          }
        }
        else {
          faceCollection.faces.push(new Face(face.x, face.y, face.width * face.height));
        }
      }
    });
  });
  faceCollection.calculateCertainties();
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
    if (drawAllFaces) {
      findFaces();
      // if (typeof faceCollection == 'undefined') {
      //   findFaces();
      // }
      faceCollection.faces.forEach(function(face, index) {
        context.strokeStyle = 'rgba(255, 255, 255,' + face.certainty + ')';
        context.lineWidth = 3;
        context.strokeRect(face.x, face.y, Math.sqrt(face.area), Math.sqrt(face.area));
      });

    }
    else if (faceCoords.length > 0) {
      faceCoords[faceCoords.length - 1].forEach(function(coord, index) {
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
