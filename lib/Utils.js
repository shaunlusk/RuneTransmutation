var RuneTx = RuneTx || {};

RuneTx.random = function(max) {
  return Math.floor(Math.random() * (max + 1));
};

RuneTx.createCanvas = function(div, width, height) {
  var canvas = document.createElement("CANVAS");
  div.appendChild(canvas);
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = "absolute";
  return canvas;
};

RuneTx.removeAllElementsFromGfxLayer = function(layer) {
  layer._elements.forEach(function(element) {
    layer.removeElement(element);
  });
};
