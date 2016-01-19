/**
 * @theme Modern
 * @author hbrls <shuaizhexu@gmail.com> (http://lisite.de)
 * @license MIT
 */

Aristochart.themes.modern = {
  width: 640,
  height: 400,
  margin: 70,
  padding: 0,
  render: true,

  fill: {
    index: 0,
    render: Aristochart.line.fill,
    fillToBaseLine: true,
  },

  axis: {
    index: 1,
    render: Aristochart.axis.line,

    x: {
      steps: 5,
      render: Aristochart.axis.line,
    },

    y: {
      steps: 5,
      render: Aristochart.axis.line,
    }
  },

  tick: {
    index: 2,
    render: Aristochart.tick.line
  },

  line: {
    index: 3,
    render: Aristochart.line.line
  },

  point: {
    index: 4,
    render: Aristochart.point.circle
  },

  label: {
    index: 5,
    render: Aristochart.label.text,
    x: {
      step: 1
    },
    y: {
      step: 1
    }
  },

  title: {
    index: 6,
    render: Aristochart.title.text,
    x: 'x',
    y: 'y',
  },

  style: {
    default: {
      point: {
        visible: false
      },

      line: {
        stroke: '#e64742',
        width: 2,
        fillGradient: [
          'rgba(246, 168, 168, 1)',
          'rgba(246, 168, 168, 0.9)',
          'rgba(246, 168, 168, 0.1)',
          'rgba(246, 168, 168, 0)',
        ],
        visible: true
      },

      axis: {
        stroke: '#ccc',
        width: 1,
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
        align: 'outside',
        stroke: '#ccc',
        width: 1,
        minor: 4,
        major: 8,
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
          font: 'Helvetica',
          fontSize: 12,
          fontStyle: 'normal',
          color: '#7f7f7f',
          align: 'center',
          baseline: 'bottom',
          offsetY: 20,
          offsetX: 3,
          visible: true,
          fixed: true
        },

        y: {
          font: 'Helvetica',
          fontSize: 12,
          fontStyle: 'normal',
          color: '#7f7f7f',
          align: 'center',
          baseline: 'bottom',
          offsetY: 8,
          offsetX: 12,
          visible: true,
          fixed: true
        }
      },

      title: {
        color: '#777',
        font: 'georgia',
        fontSize: '16',
        fontStyle: 'italic',
        visible: false,

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
