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
      // var gradient = this.ctx.createLinearGradient((this.box.x + this.box.x1) / 2, this.box.y, (this.box.x * 2 + this.box.x1) / 3, this.box.y1);
      var gradient = this.ctx.createLinearGradient((this.box.x + this.box.x1) / 2, this.box.y, (this.box.x + this.box.x1) / 2, this.box.y1);
      gradient.addColorStop(0, style.line.fillGradient[0]);
      gradient.addColorStop(0.5, style.line.fillGradient[1]);
      gradient.addColorStop(0.9, style.line.fillGradient[2]);
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

      if (type === 'x') {
        if (text) {
          if (text[0] === '#') {
            text = text.substring(1);
          }
          this.ctx.fillText(text, x, y);
        }
      } else if (type === 'y') {
        text = text.toFixed(style.label.y.precision || 2);
        text += style.label.y.suffix || '';
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
    // console.log('render.text:', style, text, x, y, type);
    this.ctx.save();

    if(type == "x") y += style.title.x.offsetY,
      x += style.title.x.offsetX;

    if (type === "y") {
      y += style.title.y.offsetY;
      x += style.title.y.offsetX;
    }

    this.ctx.font = style.title.fontStyle + " " + (style.title.fontSize*this.resolution) + "px " + style.title.font;
    this.ctx.fillStyle = style.title.color;

    this.ctx.translate(x, y);
    // this.ctx.translate(300, 300);
    // if(type == "y") this.ctx.rotate(Math.PI/2);

    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
  }
}
