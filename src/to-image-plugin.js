/**
 * Converts canvas to image
 * @return {Image} Image element with base64 encoded canvas
 */
Aristochart.prototype.toImage = function() {
  var img = new Image();
  img.src = this.canvas.toDataURL("image/png");
  return img;
};
