/**
 * Render the graph and data
 * @return {null}
 */
Aristochart.prototype.render = function() {
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

  // debug {
  this.ctx.save();
  this.ctx.strokeStyle ='blue'
  this.ctx.lineWidth = 4;
  this.ctx.beginPath();
  this.ctx.moveTo(140, 140);
  this.ctx.lineTo(1140, 660);
  this.ctx.stroke();
  this.ctx.restore();

  this.ctx.save();
  this.ctx.strokeStyle ='green'
  this.ctx.lineWidth = 4;
  this.ctx.beginPath();
  this.ctx.moveTo(0, 0);
  this.ctx.lineTo(200, 200);
  this.ctx.stroke();
  this.ctx.restore();
  // } debug

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
