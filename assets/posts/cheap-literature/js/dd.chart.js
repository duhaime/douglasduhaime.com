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

  window.dd.chart = function(obj) {
    var _dd = window.dd.init(obj);

    function updateChart(obj) {
      ['ticks', 'domains', 'scales', 'jitter'].forEach(function(d) {
        if (!obj[d]) obj[d] = {}
      })

      _dd.accessors = {
        x: obj.x || 'x',
        y: obj.y || 'y',
        r: obj.r,
        stroke: obj.stroke || function(d) {
          return _dd.scales.color(d[_dd.accessors.x]);
        },
        fill: obj.fill || function(d) {
          return _dd.scales.color(d[_dd.accessors.x]);
        }      
      };

      _dd.data = limitByDomain(obj.data);

      /**
      * Scales
      **/

      _dd = window.dd.scales(obj, _dd);

      /**
      * Grid
      **/

      window.dd.grid(obj, _dd);

      /**
      * Lines
      **/

      window.dd.line(obj, _dd);

      /**
      * Points
      **/

      window.dd.circle(obj, _dd);

      /**
      * Area
      **/

      window.dd.area(obj, _dd);

      /**
      * Axes
      **/

      _dd = window.dd.axes(obj, _dd);

      /**
      * Data helpers
      **/

      // keep data points within specified domains (if any)
      function limitByDomain(data) {
        if (obj.domains) {
          _.keys(obj.domains).map(function(domain) {
            data = _.filter(data, function(d) {
              var val = d[_dd.accessors[domain]],
                  first = obj.domains[domain][0],
                  last = obj.domains[domain][1];

              if (first && last) return val >= first && val <= last;
              if (first) return val >= first;
              return val <= last;
            })
          })
        }
        return data;
      }
    }

    // initialize the chart
    updateChart(obj);

    // return the update function for subsequent changes
    return updateChart;
  } 
})()