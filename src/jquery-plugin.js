/**
 * jQuery support
 */
if(window.jQuery) jQuery.fn.aristochart = function(options, theme) {
  if(this.length > 1) this.each(function(elem) { new Aristochart(this[0], options, theme) });
  else return new Aristochart(this[0], options, theme);
}
