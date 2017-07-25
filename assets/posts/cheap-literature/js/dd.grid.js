(function() {

	/**
  * Grid
  **/

  window.dd.grid = function(obj, _dd) {
    if (obj.grid) {
      _dd.grid.selectAll('.horizontal-grid').data(_dd.scales.y.ticks()).enter()
        .append('line')
          .attr('class', 'horizontal-grid')
          .attr('x1', 0)
          .attr('x2', _dd.chart.width)
          .attr('y1', function(d) { return _dd.scales.y(d); })
          .attr('y2', function(d) { return _dd.scales.y(d); })
          .attr('stroke', '#fff')

      _dd.grid.selectAll('.vertical-grid').data(_dd.scales.x.ticks()).enter()
        .append('line')
          .attr('class', 'vertical-grid')
          .attr('x1', function(d) { return _dd.scales.x(d); })
          .attr('x2', function(d) { return _dd.scales.x(d); })
          .attr('y1', 0)
          .attr('y2', _dd.chart.height)
          .attr('stroke', '#fff')
    }
  }
})()