/**
 * Aristochart's default render functions
 */
Aristochart.point = {
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

Aristochart.line = {
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
    this.ctx.fillStyle = style.line.fill;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].rx, points[0].ry);
    var that = this;
    points.forEach(function(point) {
      that.ctx.lineTo(point.rx, point.ry);
    });

    //Find bounding box
    this.ctx.lineTo(points[points.length - 1].rx, this.box.y + this.box.y1 + ((style.line.fillToBaseLine) ? this.options.padding : 0));
    this.ctx.lineTo(points[0].rx, this.box.y + this.box.y1 + ((style.line.fillToBaseLine) ? this.options.padding : 0));
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

  }
};

Aristochart.tick = {
  line: function(style, x, y, type, i) {
    this.ctx.save();
    this.ctx.strokeStyle = style.tick.stroke;
    this.ctx.lineWidth = style.tick.width * this.resolution;
    this.ctx.beginPath();

    var length = (i % 2 == 0) ? style.tick.major : style.tick.minor;
      length *= this.resolution;

    // Sort out the alignment
    var mx = x, my = y;
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
        if(type == "x") my = y;
        if(type == "y") mx = x - length;
      break;
    }

    this.ctx.moveTo(mx, my)

    if(type == "x") this.ctx.lineTo(mx, my + length);
    else this.ctx.lineTo(mx + length, my);
    this.ctx.stroke();
    this.ctx.restore();
  }
};

Aristochart.axis = {
  line: function(style, x, y, x1, y1, type) {
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

Aristochart.label = {
  text: function(style, text, x, y, type, i) {
    if(i % this.options.label[type].step == 0) {
      var label = style.label[type];
      if(type == "x") y = y + (style.tick.major + label.offsetY)*this.resolution;
      if(type == "y") x = x - (style.tick.major + label.offsetX)*this.resolution, y += label.offsetY*this.resolution;

      this.ctx.font = label.fontStyle + " " + (label.fontSize*this.resolution) + "px " + label.font;
      this.ctx.fillStyle = label.color;
      this.ctx.textAlign = label.align;
      this.ctx.textBaseline = label.baseline;

      var REG_TEXT = /^~(.*)/;
      var REG_NUM = /(\-?\d+(\.\d)?)/;

      var substr = '';
      if (REG_TEXT.test(text)) {
        substr = [text.substring(1)];
      } else if (REG_NUM.test(text)) {
        substr = REG_NUM.exec(text);
      } else {
        substr = [];
      }
      this.ctx.fillText(substr[0], x, y);
    }
  }
};

Aristochart.title = {
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
