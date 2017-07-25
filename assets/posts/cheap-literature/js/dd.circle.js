(function() {

  /**
  * Circles
  **/

  window.dd.circle = function(obj, _dd) {
    if (obj.drawPoints) {
      var points = _dd.g.selectAll('circle').data(_dd.data);

      // exit old points
      points.exit()
        .remove()

      // enter new points
      points.enter()
        .append('circle')

      // transition all points
      points.transition()
        .duration(obj.duration || 500)
        .attr('cx', function(d) { 
          return _dd.scales.x( d[_dd.accessors.x] ); 
        })
        .attr('cy', function(d) {
          return _dd.scales.y( d[_dd.accessors.y] );
        })
        .attr('r', function(d) {
          return d[_dd.accessors.r] || 4;
        })
        .attr('stroke', _dd.accessors.stroke)
        .attr('fill', _dd.accessors.fill)
    }
  }
})()