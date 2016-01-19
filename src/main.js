/**
 * Refresh the graph y bounds from the supplied data.
 * @return {null}
 */
Aristochart.prototype.refreshBounds = function() {
  // Since you can have multiple Y lines, we have to iterate through and
  // get the max.
  // Get absolute max
  var yMax = -Infinity;
  var yMin = Infinity;
  for(var key in this.data) {
    if(key !== "x") {
      var max = -Infinity, min = Infinity;
      this.data[key].forEach(function(v) { if(v > max) max = v; if(v < min) min = v; });
      yMax = (max > yMax) ? max : yMax;
      yMin = (min < yMin) ? min : yMin;
    }
  }

  this.y = {
    //Check if manually overrided
    max: (this.options.axis.y.max == undefined) ? yMax : this.options.axis.y.max,
    min: (this.options.axis.y.min == undefined) ? yMin : this.options.axis.y.min,
  };

  this.y.range = this.y.max - this.y.min;

  //Now x. Only one x line.
  if(this.data.x.length == 1 || typeof this.data.x == "number") this.x = {min: 0, max: this.data.x[0] || this.data.x };
  else this.x = {min: this.data.x[0], max: this.data.x[this.data.x.length - 1] };

  this.x.range = this.x.max - this.x.min;
}

/**
 * Updates Aristochart's variables such as maxes and mins of the graphs
 * @return {null}
 */
Aristochart.prototype.update = function() {

  // Apply the resolution to all the dimensions
  var resolution = this.resolution;
  this.options.margin *= resolution;
  this.options.padding *= resolution;
  this.options.width *= resolution;
  this.options.height *= resolution;

  // Calculate the bounding box
  this.box = {
    x: this.options.margin,
    y: this.options.margin,
    x1: this.options.width - (2*this.options.margin),
    y1: this.options.height - (2*this.options.margin)
  };

  // Refresh the bounds of the graph
  this.refreshBounds();

  //Get the data set the lines and origin properties
  var data = this.getPoints();
  this.lines = data.lines;
  this.origin = data.origin;

  //Update the axis dimensions
  var padding = this.options.padding,
    box = this.box;

  this.axis = {
    x: {
      x: box.x - padding,
      y: (box.y + box.y1 + padding),
      x1: that.box.x + box.x1 + padding,
      y1: (box.y + box.y1+ padding)
    },

    y: {
      x: (box.x - padding),
      y: box.y - padding,
      x1: (box.x - padding),
      y1: box.y + box.y1 + padding
    }
  };
};

/**
 * Render the graph and data
 * @return {null}
 */
Aristochart.prototype.render = function() {
  var that = this,
    lines = this.lines,
    origin = this.origin,
    axis = this.axis,
    defaults = that.options.style.default;

  // Clear the canvas
  this.canvas.width = this.canvas.width;

  //Can't have floating steps now can we..
  var stepX = Math.floor(this.options.axis.x.steps),
    stepY = Math.floor(this.options.axis.y.steps);

  //Create some temporary caching variables
  var padding = this.options.padding,
    box = this.box,
    ox = origin.x,
    oy = origin.y;

  // Iterate over indexes and render the features in order
  this.indexes.forEach(function(feature) {
    switch(feature) {
      case "point":
        for(var line in lines)
          if((that.options.style[line] || defaults).point.visible)
            lines[line].forEach(function(obj) {
              that.options.point.render.call(that, that.options.style[line] || defaults, obj.rx, obj.ry, obj.x, obj.y, obj.graph);
            });
      break;

      case "axis":
        if(defaults.axis.visible) {
          if(defaults.axis.x.visible) {
            that.options.axis.x.render.call(that, defaults, axis.x.x, (defaults.axis.y.fixed) ? axis.x.y : oy, axis.x.x1, (defaults.axis.y.fixed) ? axis.x.y1 : oy, "x");
          }

          if(defaults.axis.y.visible) {
            that.options.axis.y.render.call(that, defaults, (defaults.axis.x.fixed) ? axis.y.x : ox, axis.y.y, (defaults.axis.x.fixed) ? axis.y.x1 : ox, axis.y.y1, "y");
          }
        }
      break;

      case "line":
        for(var line in lines) {
          var style = that.options.style[line] || defaults;
          if(style.line.visible) that.options.line.render.call(that, style, lines[line]);
        }
      break;

      case "tick":
        if(defaults.tick.visible) {
          var disX = that.box.x1/(stepX),
            disY = that.box.y1/(stepY);

          for(var i = 0; i < (stepX + 1); i++) that.options.tick.render.call(that, defaults, that.box.x  + (disX * i), (defaults.tick.x.fixed) ? axis.x.y1 : oy, "x", i);
          for(var i = 0; i < (stepY + 1); i++) that.options.tick.render.call(that, defaults, (defaults.tick.y.fixed) ? axis.y.x1 : ox, that.box.y + (disY * i), "y", i);
        }
      break;

      case "label":
          var disX = that.box.x1/(stepX),
            disY = that.box.y1/(stepY);

          if(defaults.label.x.visible)
            for(var i = 0; i < (stepX + 1); i++)
              that.options.label.render.call(that, defaults, that.x.min + (((that.x.max - that.x.min)/stepX) * i), that.box.x  + (disX * i),  (defaults.label.x.fixed) ? axis.x.y1 : oy, "x", i);

          if(defaults.label.y.visible)
            for(var i = 0; i < (stepY + 1); i++) {
              var pos = stepY - i,
                label = that.y.min + ((that.y.max - that.y.min)/stepY) * pos; // Label sorting algorithm
              that.options.label.render.call(that, defaults, label, (defaults.label.y.fixed) ? axis.y.x1 : ox, that.box.y + (disY * i), "y", i);
            }

      break;

      case "fill":
          for(var line in lines) {
            var style = that.options.style[line] || defaults;
            if(style.line.fill) that.options.fill.render.call(that, style, lines[line]);
          }
      break;

      case "title":
        if(defaults.title.visible) {
          // X an y title
          var xLabel = that.options.title.x,
            yLabel = that.options.title.y;

          if(defaults.title.x.visible) that.options.title.render.call(that, defaults, xLabel, (that.box.x*2 + that.box.x1)/2, that.box.y + that.box.y1, "x");
          if(defaults.title.y.visible) that.options.title.render.call(that, defaults, yLabel, (that.box.x), (that.box.y*2 + that.box.y1)/2, "y");
        }
      break;
    }
  });
};

/**
 * Get the points from each graph and returns the <line> vs x.
 * @param  {Function} callback (optional) Run a function over a point.
 * @return {Object}            The lines store <name> : <point array> where a point is {rx (raster x), ry, x (actual x point), y}
 */
Aristochart.prototype.getPoints = function(callback) {
  var lines = {},
    Xmax = this.x.max,
    Xmin = this.x.min,
    Xrange = this.x.range,
    Ymax = this.y.max,
    Ymin = this.y.min,
    Yrange = this.y.range,
    bx = this.box.x,
    by = this.box.y,
    bx1 = this.box.x1,
    by1 = this.box.y1, //Caching these variables in case of large datasets

    Yorigin = by + ((by1/Yrange) * Ymax),
    Xorigin = bx + ((bx1/Xrange) * Math.abs(Xmin));

  //Iterate over y1, y2 etc. lines
  for(var key in this.data) {
    if(key == "x") continue;

    lines[key] = [];

    var currArr = this.data[key],
      length = currArr.length,
      factor = 1;

    // Compensate for HUGE data set, only take a few data points
    if(length > 1000) factor = 5;
    if(length > 10000) factor = 50;
    if(length > 100000) factor = 5000;

    var count = length/factor;

    for(var i = 0; i < count; i++) {
      var x = ((Xrange/(count - 1)) * i) + Xmin,
        y = currArr[i],

        // Calculate the raster points
        rx = Xorigin + ((bx1/Xrange) * x),
        ry = Yorigin - ((by1/Yrange) * y);

      lines[key].push({x: x, y: y, rx: rx, ry: ry});

      if(callback) callback(rx, ry, x, y, key);
    }
  }

  return {
    lines: lines,
    origin: {
      x: Xorigin,
      y: Yorigin
    }
  }
};
