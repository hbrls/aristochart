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
