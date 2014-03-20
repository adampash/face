var canvas, backCanvas, context, backContext, webcam, lastData, circles, littleCanvas, littleContext, facesCollection;

var faceCoords = [];
var faceCheck = 9;
var scale = 3;

var drawAllFaces = true;

window.onload = function() {
  canvas = document.getElementById('main');
  context = Context = canvas.getContext('2d');
  webcam = document.getElementById('video');
  littleCanvas = document.getElementById('little');
  littleContext = littleCanvas.getContext('2d');
  backCanvas = document.createElement('canvas');
  backContext = canvas.getContext('2d');

  faceCollection = new Faces();
}

var dataURL;
function checkFace() {
  dataURL = littleCanvas.toDataURL();

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

Faces.prototype.length = function() {
  return this.faces.length;
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
    backContext.drawImage(webcam,0,0);
    littleContext.drawImage(webcam,0,0, littleCanvas.width, littleCanvas.height);

    // if (drawAllFaces) {
    //   findFaces();
    //   // if (typeof faceCollection == 'undefined') {
    //   //   findFaces();
    //   // }
    //   faceCollection.faces.forEach(function(face, index) {
    //     context.strokeStyle = 'rgba(255, 255, 255,' + face.certainty + ')';
    //     context.lineWidth = 3;
    //     context.strokeRect(face.x, face.y, Math.sqrt(face.area), Math.sqrt(face.area));
    //   });

    // }
    if (faceCoords.length > 0) {
      faceCoords[faceCoords.length - 1].forEach(function(coord, index) {
        context.strokeStyle = "#fff";
        context.lineWidth = 3;
        context.strokeRect(coord.x, coord.y, coord.width, coord.height);
      });
    }

    // Grab the pixel data from the backing canvas
    var idata = backContext.getImageData(0,0,canvas.width,canvas.height);
    var data = idata.data;


    // Loop through the pixels
    for(var i = 0; i < data.length; i+=4) {
      var r = data[i];
      var g = data[i+1];
      var b = data[i+2];
      // green screen
      // if (toggles.greenScreen) {
      //   if (g > greenScreenData.g && b/g < greenScreenData.b && r/g < greenScreenData.r) {
      //     data[i+3] = 0;
      //   }
      // }

      // black and white
      if (true) {
        // 255 * 3 = 765
        if (faceCollection.length() > 0) {
          var brightness = (r + g + b)/3;
          data[i] = brightness;
          data[i+1] = brightness;
          data[i+2] = brightness;
        }
      }
      // big blur
      // if (toggles.bigBlur) {
      //   if (lastData) {
      //     data[i]   = r+lastData[i]  *3 / 4;
      //     data[i+1] = g+lastData[i+1]*3 / 4;
      //     data[i+2] = b+lastData[i+2]*3 / 4;
      //     // data[i+3] = r+lastData[i+3]*2 / 3;
      //   }
      // }
      // average images/mini-blur
      // if (toggles.smallBlur) {
      //   if (lastData) {
      //     // data[i] = r+lastData[i] / 2;
      //     // data[i+1] = g+lastData[i+1] / 2;
      //     // data[i+2] = b+lastData[i+2] / 2;
      //     data[i+3] = r+lastData[i+3]*2 / 3;
      //   }
      // }
      // cut out background
      // if (toggles.noBG) {
      //   if (g > 100) {
      //     data[i+3] = 0;
      //   }
      // }
      // inverse
      // if (toggles.inverse) {
      //   data[i] = 255 - data[i];
      //   data[i+1] = 255 - data[i+1];
      //   data[i+2] = 255 - data[i+2];
      // }
      // white screen
      // if (toggles.whiteScreen) {
      //   if (g > 200 && b > 200 && r > 200) {
      //     data[i+3] = 0;
      //   }
      // }
    }
    idata.data = data;
    lastData = data;
    context.putImageData(idata, 0, 0);
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
