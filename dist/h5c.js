/**
 * H5C's constructor.
 *
 * @param {Object} element The DOM element container or canvas to use
 * @param {Object} options See Options.
 * @param {Object} theme A theme object. See H5C.themes.
 */
var H5C = function(element, options, theme) {
  // Sort out the default parameters
  if(!element || !element.DOCUMENT_NODE) options = element, element = document.createElement("canvas");

  // Make sure all good options are there
  if(!options || !options.data) throw new Error("Please provide some data to plot.");
  if(!options.data.y || !options.data.x) throw new Error("Please provide some data.x and data.y");

  // Edit some options
  if(options.width && !options.height) options.height = Math.floor(options.width * 0.67);

  //Set the defaults
  this.defaults = H5C.themes.default;

  // Bind the parameters to the instance
  this.options = options;
  this.canvas = element;
  this.theme = theme;
  this.data = this.options.data;

  // Merge the theme with the options.
  if(this.theme) this.defaults = H5C._deepMerge(this.defaults, this.theme);

  // Merge the options with the defaults
  for(var key in this.defaults) this.options = H5C._deepMerge(this.defaults, this.options);

  // Merge all the styles with the default style
  for(var style in this.options.style)
    for(var key in this.options.style["default"])
      this.options.style[style] = H5C._deepMerge(this.options.style["default"], this.options.style[style]);

  // Sort out indexes
  this.indexes = [], that = this;
  ["fill", "axis", "tick", "line", "point", "label", "title"].forEach(function(feature) {
    //Set the feature in the array at it's index
    if(that.indexes[that.options[feature].index]) throw new Error("Conflicting indexes in H5C");
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
H5C._deepMerge = function(defaults, options) {
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
H5C.prototype._normalize = function (x, y) {
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
 * H5C theme object
 * @type {Object}
 */
H5C.themes = {};

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

/**
 * Render the graph and data
 * @return {null}
 */
H5C.prototype.render = function() {
  var that = this;
  var lines = this.lines;
  var origin = this.origin;
  var axis = this.axis;
  var defaults = that.options.style.default;

  // Clear the canvas
  this.canvas.width = this.canvas.width;

  // ** Use Data.ticks instead of options.axis.x.steps
  // var stepX = Math.floor(this.options.axis.x.steps);
  var tick = this.data.tick;
  var stepX = tick.length;
  var tickXCount = tick.length;
  var tickXIntervalCount = tickXCount - 1;
  var stepY = Math.floor(this.options.axis.y.steps);
  var tickYCount = stepY + 1;
  var tickYIntervalCount = stepY;

  // Create some temporary caching variables
  var padding = this.options.padding;
  var box = this.box;
  var ox = origin.x;
  var oy = origin.y;

  // // debug {
  // this.ctx.save();
  // this.ctx.strokeStyle ='blue'
  // this.ctx.lineWidth = 4;
  // this.ctx.beginPath();
  // this.ctx.moveTo(140, 140);
  // this.ctx.lineTo(1140, 660);
  // this.ctx.stroke();
  // this.ctx.restore();
  //
  // this.ctx.save();
  // this.ctx.strokeStyle ='green'
  // this.ctx.lineWidth = 4;
  // this.ctx.beginPath();
  // this.ctx.moveTo(0, 0);
  // this.ctx.lineTo(200, 200);
  // this.ctx.stroke();
  // this.ctx.restore();
  // // } debug

  // console.log(box);

  // Iterate over indexes and render the features in order
  this.indexes.forEach(function(feature) {
    switch (feature) {
      case "point":
        // for(var line in lines)
        //   if((that.options.style[line] || defaults).point.visible)
        //     lines[line].forEach(function(obj) {
        //       that.options.point.render.call(that, that.options.style[line] || defaults, obj.rx, obj.ry, obj.x, obj.y, obj.graph);
        //     });
        break;

      case "axis":
        if (defaults.axis.visible) {
          if (defaults.axis.x.visible) {
            that.options.axis.x.render.call(
              that,
              defaults,
              axis.x.x,
              defaults.axis.y.fixed ? axis.x.y : oy,
              axis.x.x1,
              defaults.axis.y.fixed ? axis.x.y1 : oy,
              'x');
          }

          if (defaults.axis.y.visible) {
            that.options.axis.y.render.call(
              that,
              defaults,
              (defaults.axis.x.fixed) ? axis.y.x : ox,
              axis.y.y,
              (defaults.axis.x.fixed) ? axis.y.x1 : ox,
              axis.y.y1,
              'y');
          }
        }
      break;

      case "line":
        Object.keys(lines).forEach(function (key) {
          var style = that.options.style[key] || defaults;
          if (style.line.visible) {
            that.options.line.render.call(that, style, lines[key]);
          }
        })
        break;

      case 'tick':
        if (defaults.tick.visible) {
          var disX = (box.x1 - box.x) / tickXIntervalCount;
          var disY = (box.y1 - box.y) / stepY;

          for (var i = 0; i < tickXCount; i++) {
            var canvasXY = that._normalize(disX * i, null);
            that.options.tick.render.call(
              that,
              defaults,
              canvasXY[0],
              defaults.tick.x.fixed ? axis.x.y1 : oy,
              'x',
              i,
              tick[i] === null ? 'none' : (tick[i][0] === '#' ? 'major': 'minor'));
          }

          for (var i = 0; i < (stepY + 1); i++) {
            var canvasXY = that._normalize(null, disY * i);
            that.options.tick.render.call(
              that,
              defaults,
              defaults.tick.y.fixed ? axis.y.x1 : ox,
              canvasXY[1],
              'y',
              i,
              i % 2 === 0 ? 'major': 'minor');
          }
        }
        break;

      case 'label':
        var disX = (box.x1 - box.x) / tickXIntervalCount;
        var disY = (box.y1 - box.y) / tickYIntervalCount;

        if (defaults.label.x.visible) {
          for (var i = 0; i < (stepX + 1); i++) {
            var canvasXY = that._normalize(disX * i, null);
            that.options.label.render.call(
              that,
              defaults,
              tick[i],
              canvasXY[0],
              (defaults.label.x.fixed) ? axis.x.y1 : oy,
              'x',
              i);
          }
        }

        if (defaults.label.y.visible) {
          for(var i = 0; i < tickYCount; i++) {
            var label = that.y.min + that.y.range / tickYIntervalCount * i;
            var canvasXY = that._normalize(null, disY * i);
            that.options.label.render.call(
              that,
              defaults,
              label,
              defaults.label.y.fixed ? axis.y.x1 : ox,
              canvasXY[1],
              'y',
              i);
          }
        }

        break;

      case 'fill':
        Object.keys(lines).forEach(function (line) {
          var style = that.options.style[line] || defaults;
          if (style.line.fill || style.line.fillGradient) {
            that.options.fill.render.call(that, style, lines[line]);
          }
        });
        break;

      case 'title':
        if (defaults.title.visible) {
          var xLabel = that.options.title.x;
          var yLabel = that.options.title.y;

          if (defaults.title.x.visible) {
            that.options.title.render.call(
              that,
              defaults,
              xLabel,
              (that.box.x*2 + that.box.x1)/2,
              that.box.y + that.box.y1,
              "x");
          }
          if(defaults.title.y.visible) that.options.title.render.call(that, defaults, yLabel, (that.box.x), (that.box.y*2 + that.box.y1)/2, "y");
        }
        break;

      default:
        throw new Error('invalid feature!');
        break;
    }
  });
};

/**
 * H5C's default render functions
 */
H5C.point = {
  circle: function(style, rx, ry, x, y, graph) {
    this.ctx.save();
    this.ctx.strokeStyle = style.point.stroke;
    this.ctx.lineWidth = style.point.width * this.resolution;
    this.ctx.fillStyle = style.point.fill;
    this.ctx.beginPath();
    this.ctx.arc(rx, ry, style.point.radius * this.resolution, 0, Math.PI*2, true);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }
};

H5C.line = {
  line: function(style, points) {
    this.ctx.save();
    this.ctx.strokeStyle = style.line.stroke;
    this.ctx.lineWidth = style.line.width * this.resolution;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].rx, points[0].ry);
    var that = this;
    points.forEach(function(point) {
      that.ctx.lineTo(point.rx, point.ry);
    });
    this.ctx.stroke();
    this.ctx.restore();
  },

  fill: function(style, points) {
    this.ctx.save();

    if (style.line.fillGradient) {
      var gradient = this.ctx.createLinearGradient((this.box.x + this.box.x1) / 2, this.box.y, (this.box.x * 2 + this.box.x1) / 3, this.box.y1);
      gradient.addColorStop(0, style.line.fillGradient[0]);
      gradient.addColorStop(0.2, style.line.fillGradient[1]);
      gradient.addColorStop(0.75, style.line.fillGradient[2]);
      gradient.addColorStop(1, style.line.fillGradient[3]);
      this.ctx.fillStyle = gradient;
    } else {
      this.ctx.fillStyle = style.line.fill;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].rx, points[0].ry);
    var that = this;
    points.forEach(function(point) {
      that.ctx.lineTo(point.rx, point.ry);
    });

    //Find bounding box
    this.ctx.lineTo(points[points.length - 1].rx, this.box.y1 + ((style.line.fillToBaseLine) ? this.options.padding : 0));
    this.ctx.lineTo(points[0].rx, this.box.y1 + ((style.line.fillToBaseLine) ? this.options.padding : 0));
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }
};

H5C.tick = {
  line: function(style, x, y, type, i, tickType) {
    this.ctx.save();
    this.ctx.strokeStyle = style.tick.stroke;
    this.ctx.lineWidth = style.tick.width * this.resolution;
    this.ctx.beginPath();

    var length = 0;
    if (tickType === 'major') {
      length = style.tick.major;
    } else if (tickType === 'minor') {
      length = style.tick.minor;
    }

    if (length > 0) {
      length *= this.resolution;

      // Sort out the alignment
      var mx = x;
      var my = y;
      switch(style.tick.align) {
        case "middle":
          if(type == "x") my = y - (length/2);
          if(type == "y") mx = x - (length/2);
        break;

        case "inside":
          if(type == "x") my = y - length;
          mx = x;
        break;

        case "outside":
          if (type == "x") my = y;
          if (type == "y") mx = x - length;
          break;
      }

      // console.log(mx, my, length);
      this.ctx.moveTo(mx, my);

      if (type === 'x') {
        // console.log(mx, my + length);
        this.ctx.lineTo(mx, my + length);
      } else if (type === 'y') {
        this.ctx.lineTo(mx + length, my);
      }
      this.ctx.stroke();
      this.ctx.restore();
    }
  }
};

H5C.axis = {
  line: function(style, x, y, x1, y1, type) {
    // console.log('axis: ', type, x, y, x1, y1);
    this.ctx.save();
    this.ctx.strokeStyle = style.axis.stroke;
    this.ctx.lineWidth = style.axis.width * this.resolution;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
    this.ctx.restore();
  }
};

H5C.label = {
  text: function(style, text, x, y, type, i) {
    if(i % this.options.label[type].step == 0) {
      var label = style.label[type];
      if(type == "x") y = y + (style.tick.major + label.offsetY)*this.resolution;
      if(type == "y") x = x - (style.tick.major + label.offsetX)*this.resolution, y += label.offsetY*this.resolution;

      this.ctx.font = label.fontStyle + " " + (label.fontSize*this.resolution) + "px " + label.font;
      this.ctx.fillStyle = label.color;
      this.ctx.textAlign = label.align;
      this.ctx.textBaseline = label.baseline;

      // console.log(text);

      if (text) {
        if (text[0] === '#') {
          text = text.substring(1);
        }
        this.ctx.fillText(text, x, y);
      }

      // var REG_TEXT = /^~(.*)/;
      // var REG_NUM = /(\-?\d+(\.\d)?)/;

      // var substr = '';
      // if (REG_TEXT.test(text)) {
      //   substr = [text.substring(1)];
      // } else if (REG_NUM.test(text)) {
      //   substr = REG_NUM.exec(text);
      // } else {
      //   substr = [];
      // }
      // this.ctx.fillText(substr[0], x, y);
    }
  }
};

H5C.title = {
  text: function(style, text, x, y, type) {
    this.ctx.save();

    if(type == "x") y += style.title.x.offsetY,
      x += style.title.x.offsetX;
    if(type == "y") y += style.title.y.offsetY,
      x += style.title.y.offsetX;

    this.ctx.font = style.title.fontStyle + " " + (style.title.fontSize*this.resolution) + "px " + style.title.font;
    this.ctx.fillStyle = style.title.color;

    this.ctx.translate(x, y);
    if(type == "y") this.ctx.rotate(Math.PI/2);

    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
  }
}

/**
 * @theme Default
 * @author Adrian Cooney <cooney.adrian@gmail.com> (http://adriancooney.ie)
 * @license http://opensource.org/licenses/MIT
 */

//Given as an example. This is already included in H5C.js
H5C.themes.default = {
	width: 640,
	height: 400,
	margin: 70,
	padding: 20,
	render: true, //Automatically render

	fill: {
		index: 0,
		render: H5C.line.fill,
		fillToBaseLine: true,
	},

	axis: {
		index: 1,
		render: H5C.axis.line,

		x: {
			steps: 5,
			render: H5C.axis.line,
		},

		y: {
			steps: 10,
			render: H5C.axis.line,
		}
	},

	tick: {
		index: 2,
		render: H5C.tick.line
	},

	line: {
		index: 3,
		render: H5C.line.line
	},

	point: {
		index: 4,
		render: H5C.point.circle
	},

	label: {
		index: 5,
		render: H5C.label.text,
		x: {
			step: 1
		},
		y: {
			step: 1
		}
	},

	title: {
		index: 6,
		render: H5C.title.text,
		x: "x",
		y: "y"
	},

	style: {
		default: {
			point: {
				stroke: "#000",
				fill: "#fff",
				radius: 4,
				width: 3,
				visible: true
			},

			line: {
				stroke: "#298281",
				width: 3,
				fill: "rgba(150, 215, 226, 0.4)",
				visible: true
			},

			axis: {
				stroke: "#ddd",
				width: 3,
				visible: true,

				x: {
					visible: true,
					fixed: true
				},

				y: {
					visible: true,
					fixed: true
				}
			},

			tick: {
				align: "middle", //"outside", "inside",
				stroke: "#ddd",
				width: 2,
				minor: 10,
				major: 15,
				visible: true,

				x: {
					fixed: true
				},

				y: {
					fixed: true
				}
			},

			label: {
				x: {
					font: "Helvetica",
					fontSize: 14,
					fontStyle: "normal",
					color: "#000",
					align: "center",
					baseline: "bottom",
					offsetY: 8,
					offsetX: 3,
					visible: true,
					fixed: true
				},

				y: {
					font: "Helvetica",
					fontSize: 10,
					fontStyle: "normal",
					color: "#000",
					align: "center",
					baseline: "bottom",
					offsetY: 8,
					offsetX: 8,
					visible: true,
					fixed: true
				}
			},

			title: {
				color: "#777",
				font: "georgia",
				fontSize: "16",
				fontStyle: "italic",
				visible: true,

				x: {
					offsetX: 0,
					offsetY: 120,
					visible: true
				},

				y: {
					offsetX: -135,
					offsetY: 10,
					visible: true
				}
			}
		}
	}
};
