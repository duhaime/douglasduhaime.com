(function() {
  window.dd = window.dd || {};
  window.dd.axes = function(obj, _dd) {

    /**
    * Axes
    **/

    _dd.xAxis = d3.svg.axis()
      .scale(_dd.scales.x)
      .orient('bottom');

    _dd.yAxis = d3.svg.axis()
      .scale(_dd.scales.y)
      .orient('left');

    if (obj.ticks) {
      _dd.xAxis.tickFormat(obj.ticks.x);
      _dd.yAxis.tickFormat(obj.ticks.y);
    }

    _dd.svg.select('.x.axis')
      .call(_dd.xAxis);

    _dd.svg.select('.y.axis').transition()
      .duration(500)
      .call(_dd.yAxis);

    /**
    * Title
    **/

    if (obj.title) {
      _dd.svg.select('.title').append('rect')
        .attr('fill', '#ccc')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', _dd.chart.width)
        .attr('height', _dd.chart.titleHeight)
      
      _dd.svg.select('.title').append('text')
        .attr('x', _dd.chart.width/2)
        .attr('y', _dd.margin.top - _dd.chart.titleHeight)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '400')
        .html(obj.title)
    }

    /**
    * Axis labels
    **/

    if (obj.xLabel) {
      var offset = obj.xLabelOffset ?
          _dd.height - obj.xLabelOffset
        : _dd.height - 15

      _dd.svg.append('text')
        .html(obj.xLabel)
        .attr('transform', 'translate(' + _dd.width/2 + ',' + offset + ')')
        .style('text-anchor', 'middle')

    }

    if (obj.yLabel) {
      var offset = obj.yLabelOffset ?
          obj.yLabelOffset
        : 15;

      _dd.svg.append('text')
        .html(obj.yLabel)
        .attr('transform', 'translate(' + offset + ',' + 
          (_dd.margin.top + _dd.chart.height/2) + ') rotate(270)')
        .style('text-anchor', 'middle')
    }

    return _dd;
  }
})()