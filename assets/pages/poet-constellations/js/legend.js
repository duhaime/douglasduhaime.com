(function() {

    /************************
    * Create a chart legend *
    ************************/

    var legend = d3.select('#legend').append('svg')
        .attr('width', 330)
        .attr('height', 40)

    legend.append('path')
        .attr('d', interpolatePath({x: 150, y:20}, {x: 220, y: 20}))
        .attr('class', 'poet-friends')

    legend.append('circle')
        .attr('cx', 10)
        .attr('cy', 20)
        .attr('r', 5)
        .attr('fill', '#bbd4eb')

    legend.append('text')
        .attr('x', 20)
        .attr('y', 24)
        .text('poet')

    legend.append('circle')
        .attr('cx', 150)
        .attr('cy', 20)
        .attr('r', 5)
        .attr('fill', '#f7ba39')

    legend.append('circle')
        .attr('cx', 220)
        .attr('cy', 20)
        .attr('r', 5)
        .attr('fill', '#f7ba39')

    legend.append('text')
        .attr('x', 230)
        .attr('y', 24)
        .text('poet friends')

    function interpolatePath(source, target) {
      var dx = target.x - source.x,
          dy = target.y - source.y,
          dr = Math.sqrt(dx * dx + dy * dy);

      return 'M' + source.x + ',' + source.y + 
        'A' + dr + ',' + dr + ' 0 0,1 ' + 
        target.x + ',' + target.y;
    }

})()