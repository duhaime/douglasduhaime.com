(function() {

  /**
  * Area
  **/

  window.dd.area = function(obj, _dd) {
    if (obj.drawArea) {

      var area = d3.svg.area()
        .x(function(d) { return _dd.scales.x(d[_dd.accessors.x]); })
        .y0(_dd.chart.height)
        .y1(function(d) { return _dd.scales.y(d[_dd.accessors.y]); })

      var nest = getNest(_dd.data);

      var areas = _dd.g.selectAll('.area').data(nest, function(d, i) {
        return d.key;
      });

      areas.exit()
        .remove()

      areas.enter()
        .append('path')
        .attr('class', 'area')

      areas.transition()
        .attr('d', function(d, i) {
          return area( _.sortBy(d.values, _dd.accessors.x) );
        })
        .attr('stroke', _dd.accessors.stroke)
        .style('fill', _dd.accessors.fill)
    }

    /**
    * Line helpers
    **/

    function getNest(data) {
      return obj.key ?
          d3.nest()
            .key(obj.key)
            .entries(_dd.data)
        : [{'key': 'hello', 'values': _dd.data}]
    }
  }
})()