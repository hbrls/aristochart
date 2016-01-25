/**
 * @theme Modern
 * @author hbrls <shuaizhexu@gmail.com> (http://lisite.de)
 * @license MIT
 */

H5C.themes.modern = {
  width: 640,
  height: 400,
  padding: 0,
  render: true,

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
      steps: 5,
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
          'rgba(246, 168, 168, 0.9)',
          'rgba(246, 168, 168, 0.4)',
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
          fixed: true,
          suffix: null,
        },
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
          fixed: true,
          precision: 2,
          suffix: null,
        }
      },

      title: {
        color: '#777',
        font: 'georgia',
        fontSize: '16',
        fontStyle: 'normal',
        visible: true,

        x: {
          offsetX: 0,
          offsetY: 120,
          visible: false
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
