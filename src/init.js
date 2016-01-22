H5C.prototype.initBox = function () {
  this.box = {
    x: this.options.margin,
    y: this.options.margin,
    x1: this.options.width - this.options.margin,
    y1: this.options.height - this.options.margin,
  };
};

/**
 * Calculate x: {min, max, range}, y: {min, max, range}
 */
H5C.prototype.initRange = function() {
  // ** Since you can have multiple Y lines, we have to iterate through and get the absolute max and min.
  var data = this.data;
  var values = [];
  Object.keys(data).forEach(function (key) {
    if (key[0] === 'y') {
      values = values.concat(data[key]);
    }
  })
  values.sort();

  var yMax = values.slice(-1)[0];
  var yMin = values[0];

  this.y = {
    // ** Check if manually overrided
    max: (this.options.axis.y.max === undefined) ? yMax : this.options.axis.y.max,
    min: (this.options.axis.y.min === undefined) ? yMin : this.options.axis.y.min,
  };

  this.y.range = this.y.max - this.y.min;

  // ** Only one x axis and evenly distributed.
  if (typeof data.x === 'number') {
    this.x = {
      min: 0,
      max: data.x
    };
  } else if (data.x.length === 2) {
    this.x = {
      min: data.x[0],
      max: data.x[1],
    }
  }

  this.x.range = this.x.max - this.x.min;
}


/**
 * Update the axis dimensions
 */
H5C.prototype.initAxis = function () {
  var padding = this.options.padding;
  var box = this.box;

  // ** Let's assume that padding === 0
  this.axis = {
    x: {
      x: box.x - padding, // bottom-left
      y: box.y1 + padding,
      x1: box.x1 + padding, // bottom-right
      y1: box.y1 + padding,
    },

    y: {
      x: box.x - padding, // top-left
      y: box.y - padding,
      x1: box.x - padding, // bottom-left
      y1: box.y1 + padding,
    }
  };
};


/**
 * Get the points from each graph and returns the <line> vs x.
 * @param  {Function} callback (optional) Run a function over a point.
 * @return {Object}   The lines store <name> : <point array> where a point is {rx (raster x), ry, x (actual x point), y}
 */
H5C.prototype.initPoints = function() {
  // ** Caching these variables in case of large datasets
  var lines = {};
  var Xmax = this.x.max;
  var Xmin = this.x.min;
  var Xrange = this.x.range;
  var Ymax = this.y.max;
  var yMin = this.y.min;
  var Yrange = this.y.range;
  var bx = this.box.x;
  var by = this.box.y;
  var bx1 = this.box.x1;
  var by1 = this.box.y1;
  var Yorigin = by + ((by1/Yrange) * Ymax);
  var Xorigin = bx + ((bx1/Xrange) * Math.abs(Xmin));
  var tick = this.data.tick;

  var that = this;

  var xCountOfIntervals = tick.length - 1;
  var xLengthOfUnit = (this.box.x1 - this.box.x) / xCountOfIntervals;

  var yLengthOf1 = (this.box.y1 - this.box.y) / this.y.range;

  // ** Iterate over y1, y2, ..., yn lines
  Object.keys(this.data).forEach(function (key) {
    if (key[0] === 'y') {
      var value = that.data[key];

      var points = value.map(function (v, index) {
        var x = xLengthOfUnit * index; // ** because x are continous integers
        var y = (v - yMin) * yLengthOf1;

        var canvasXY = that._normalize(x, y);

        return {
          x: x,
          y: y,
          rx: canvasXY[0],
          ry: canvasXY[1],
        };
      });

      lines[key] = points;
    }
  });

  this.lines = lines;
  this.origin = {
    x: Xorigin,
    y: Yorigin
  };
};


/**
 * Updates H5C's variables such as maxes and mins of the graphs
 * @return {null}
 */
H5C.prototype.update = function() {
  // Apply the resolution to all the dimensions
  var resolution = this.resolution;
  this.options.margin *= resolution;
  this.options.padding *= resolution;
  this.options.width *= resolution;
  this.options.height *= resolution;

  this.initBox();
  this.initRange();
  this.initAxis();
  this.initPoints();
};
