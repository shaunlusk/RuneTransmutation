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

RuneTx.createElementFromRune = function(runeTile, screenContext, targetLayer, extraProps) {
  extraProps = extraProps || {};
  var props = {
    pixPathArray : RuneTx.runes[runeTile.getRune()],
    pixRenderer : extraProps.pixRenderer,
    defaultPalette : [runeTile.getColor()]
  };
  RuneTx.shallowCopyProps(props, extraProps);
  var element = new C64Style.PixElement(screenContext, targetLayer, props);
  targetLayer.addElement(element);
  return element;
};

RuneTx.shallowCopyProps = function(to, from) {
  var keys = Object.keys(from);
  keys.forEach(function(key) {
    to[key] = from[key];
  });
};
