(function() {

	/**
  * Lines
  **/

  window.dd.line = function(obj, _dd) {
    if (obj.drawLines) {
      var line = d3.svg.line()
        .x(function(d) { return _dd.scales.x(d[_dd.accessors.x]); })
        .y(function(d) { return _dd.scales.y(d[_dd.accessors.y]); })
        .interpolate(obj.interpolate || 'linear')

      var nest = getNest(_dd.data);
      var nest = jitterNest(nest);

      var lines = _dd.g.selectAll('.line').data(nest, function(d, i) {
        return d.key;
      });

      lines.exit()
        .remove()

      lines.enter()
        .append('path')
        .attr('class', 'line')

      lines.transition()
        .attr('d', function(d) { return line(d.values); })
        .attr('stroke', _dd.accessors.stroke)
        .attr('fill', _dd.accessors.fill)
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

    // jitter the points consistently for each key if requested
    function jitterNest(nest) {
      if (obj.jitter.y) {
        nest.forEach(function(level) {
          var yOffset = _.random(-obj.jitter.y, obj.jitter.y);
          level.values.forEach(function(d) {
            d[_dd.accessors.y] += yOffset;
            if (d[_dd.accessors.y] < _dd.domains.y[0]) {
              d[_dd.accessors.y] = _dd.domains.y[0];
            };
            if (d[_dd.accessors.y] >_dd.domains.y[1]) {
              d[_dd.accessors.y] = _dd.domains.y[1];
            };
          })
        })
      }
      return nest;
    }

  }
})()