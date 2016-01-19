/**
 * Aristochart's constructor.
 *
 * @param {Object} element The DOM element container or canvas to use
 * @param {Object} options See Options.
 * @param {Object} theme A theme object. See Aristochart.themes.
 */
var Aristochart = function(element, options, theme) {
  // Sort out the default parameters
  if(!element || !element.DOCUMENT_NODE) options = element, element = document.createElement("canvas");

  // Make sure all good options are there
  if(!options || !options.data) throw new Error("Please provide some data to plot.");
  if(!options.data.y || !options.data.x) throw new Error("Please provide some data.x and data.y");

  // Edit some options
  if(options.width && !options.height) options.height = Math.floor(options.width * 0.67);

  //Set the defaults
  this.defaults = Aristochart.themes.default;

  // Bind the parameters to the instance
  this.options = options;
  this.canvas = element;
  this.theme = theme;
  this.data = this.options.data;

  // Merge the theme with the options.
  if(this.theme) this.defaults = Aristochart._deepMerge(this.defaults, this.theme);

  // Merge the options with the defaults
  for(var key in this.defaults) this.options = Aristochart._deepMerge(this.defaults, this.options);

  // Merge all the styles with the default style
  for(var style in this.options.style)
    for(var key in this.options.style["default"])
      this.options.style[style] = Aristochart._deepMerge(this.options.style["default"], this.options.style[style]);

  // Sort out indexes
  this.indexes = [], that = this;
  ["fill", "axis", "tick", "line", "point", "label", "title"].forEach(function(feature) {
    //Set the feature in the array at it's index
    if(that.indexes[that.options[feature].index]) throw new Error("Conflicting indexes in Aristochart");
    else that.indexes[that.options[feature].index] = feature;
  });

  //Compress the array to just the indexes
  this.indexes = this.indexes.filter(function(val) {
    if(val) return true;
  });

  // Set the canvas
  if(this.canvas.getContext) this.ctx = this.canvas.getContext("2d");
  else {
    var canvas = document.createElement("canvas");
    this.canvas.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  // Set the width and height of the canvas
  this.canvas.height = this.options.height;
  this.canvas.width = this.options.width;

  // Fix for retina and other screen resolutions
  if(window.devicePixelRatio > 1) {
    this.canvas.style.height = this.canvas.height + "px";
    this.canvas.style.width = this.canvas.width + "px";
    this.canvas.height = this.canvas.height * window.devicePixelRatio;
    this.canvas.width = this.canvas.width * window.devicePixelRatio;
  }

  // Set the resolution
  this.resolution = window.devicePixelRatio || 1;

  if ('development' === 'development') {
    // ** Be explicit and make this lib as tiny as possible.
    var that = this;

    console.assert(
      'x' in this.data &&
      'tick' in this.data &&
      'y' in this.data &&
      Object.keys(this.data).every(function (key) {
        return /(x|tick|y(\d*))/.test(key);
      }),
      "data should be like: {x, tick, y, y1, y2, ..., yn}");

    console.assert(
      Object.keys(this.data).every(function (key) {
        if (key === 'x' || key === 'tick') {
          return true;
        } else {
          return that.data[key].length === that.data.tick.length;
        }
      }),
      'the number of ticks should only be determined by data.tick');

    console.assert(
      this.data.tick.length < 1000,
      'not ready for huge data');

    console.assert(
      this.data.tick.every(function (t) {
        return t === null || typeof t === 'string';
      }),
      'ticks should be null or \'\' or \'string\'');

    console.assert(
      Object.keys(this.data).every(function (key) {
        if (key === 'x' || key === 'tick') {
          return true;
        } else {
          return that.data[key].every(function (value) {
            return typeof value === 'number';
          });
        }
      }),
      'y should be numbers');

    console.assert(
      typeof this.data.x === 'number' || Array.isArray(this.data.x) && this.data.x.length === 2,
      'data.x should be like: {x: 10} or {x: [0, 10]}');
  }

  //Update/initlize the graph variables
  this.update()

  // And render this bitch
  if(this.options.render) this.render();
};


/**
 * Deep merge two object a and b
 *
 * @private
 * @param  {Object} a The object to merge with
 * @param  {Object} b The recipient of the merge or the object to be merged into
 * @return {object}   The merged objects
 */
Aristochart._deepMerge = function(defaults, options) {
  // Used "defaults" and "options" to help with the concept in my head
  return (function recur(defaults, options) {
    for(var key in defaults) {
      if(options[key] == undefined) options[key] = defaults[key];
      else if(defaults[key] instanceof Object) options[key] = recur(defaults[key], options[key]);
    }
    return options;
  })(defaults, options)
};

/**
 * The coordinate of canvas is from top-left to bottom-right.
 * And the box has margins.
 * Translate the human readable (x, y) to its canvas position.
 * @return [canvasX, canvasY]
 */
Aristochart.prototype._normalize = function (x, y) {
  var canvasX = null;
  var canvasY = null;

  if (x !== null) {
    canvasX = this.box.x + x;
  }

  if (y !== null) {
    canvasY = this.box.y1 - y;
  }

  return [canvasX, canvasY];
};

/**
 * Aristochart theme object
 * @type {Object}
 */
Aristochart.themes = {};
