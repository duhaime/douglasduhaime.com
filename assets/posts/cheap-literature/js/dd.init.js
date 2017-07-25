/**
* obj.attributes:
*   {str} container: css selector for the chart container
*   {int} height: the height of the chart
*   {int} width: the width of the chart
*   {obj} margin: with up, right, bottom, left subattributes,
*     each of which has an integer value for the given margin
*   {arr} data: an array of data points
*   {str} x: data attribute to be used for x-axis values
*   {str} y: data attribute to be used for y-axis values
*   {func} key: a function that receives d, i as arguments and
*     returns a data key for the given datum
*   {int} r: the radius size of each point
*   {obj} domains: an object with x, y subattributes, each indicating
*     the domain to use for that dimension (if any)
*   {func} stroke: function handling stroke coloring
*   {func} fill: function handling fill coloring
*   {bool} drawLines: should we also plot data lines on the chart?
*   {str} interpolate: interpolation to use for the line
*   {bool} grid: should we draw a background grid?
*   {str} xLabel: label for the x axis
*   {str} yLabel: label for the y axis
*   {int} xLabelOffset: the x-axis offset for the x axis label
*   {int} yLabelOffset: the y-axis offset for the y axis label
*   {obj} ticks: an object with x, y subattributes, each of
*     which is a function that handles tickmarks on the x,y axes
*   {int} duration: duration of animations
**/

(function() {
  window.dd = window.dd || {};

  window.dd.init = function(obj) {
    var _dd = {};

    obj.margin = obj.margin || {};

    _dd.height = obj.height || 400,
    _dd.width = obj.width || 700;

    _dd.margin = {
      top: obj.margin.top || 40,
      right: obj.margin.right || 40,
      bottom: obj.margin.bottom || 40,
      left: obj.margin.left || 40,
    }

    _dd.chart = {
      container: obj.container,
      height: _dd.height - _dd.margin.top - _dd.margin.bottom,
      width: _dd.width - _dd.margin.right - _dd.margin.left,
      titleHeight: 22
    }

    _dd.svg = d3.select(_dd.chart.container).append('svg');

    if (obj.autoResize === false) {
      _dd.svg.attr({
        'width': _dd.width,
        'height': _dd.height
      })
    } else {
      _dd.svg.attr({
        'preserveAspectRatio': 'xMidYMid meet',
        'viewBox': '0 0 ' + _dd.width + ' ' + _dd.height
      })
    }

    _dd.g = _dd.svg.append('g')
      .attr('transform', 'translate(' + 
        _dd.margin.left + ',' + _dd.margin.top + ')')

    if (obj.grid) {
      _dd.grid = _dd.g.append('g')
        .attr('class', 'grid')

      _dd.grid.append('rect')
        .attr('class', 'grid-background')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', _dd.chart.width)
        .attr('height', _dd.chart.height)
    }  

    _dd.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + _dd.chart.height + ')')

    _dd.g.append('g')
      .attr('class', 'y axis')

    _dd.svg.append('g')
      .attr('transform', 'translate(' + _dd.margin.left + ',' + 
        (_dd.margin.top-_dd.chart.titleHeight) +')')
      .attr('class', 'title')

    return _dd;
  } 
})()