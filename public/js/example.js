// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This function is called by common.js when the NaCl module is
// loaded.
function moduleDidLoad() {
  // Once we load, hide the plugin. In this example, we don't display anything
  // in the plugin, so it is fine to hide it.
  common.hideModule();

  // After the NaCl module has loaded, common.naclModule is a reference to the
  // NaCl module's <embed> element.
  //
  // postMessage sends a message to it.
  // common.naclModule.postMessage('hello');
}

// This function is called by common.js when a message is received from the
// NaCl module.
function handleMessage(message) {
  var logEl = document.getElementById('log');
  logEl.textContent += message.data;
}

var canvas, context;
$(function() {
  canvas = $("#imgcanvas")[0];
  context = canvas.getContext('2d');

  var image = new Image();
  image.src = 'obama.jpg';
  image.height = 681;
  image.width = 500;
  canvas.height = image.height;
  canvas.width = image.width;

  image.onload = function() {
    context.drawImage(image, 0, 0);
  }
});

function getImage() {

  dataURL = canvas.toDataURL();

  var blobBin = atob(dataURL.split(',')[1]);
  var array = [];
  for(var i = 0; i < blobBin.length; i++) {
    array.push(blobBin.charCodeAt(i));
  }
  var file=new Blob([new Uint8Array(array)], {type: 'image/png'});
  // return dataURL;
  return file;
}
