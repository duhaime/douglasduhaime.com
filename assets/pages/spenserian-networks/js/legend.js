(function() {

    /************************
    * Create a chart legend *
    ************************/

    var legend = d3.select('#legend').append('svg')
        .attr('viewBox', '0 0 465 40')
        .attr('preserveAspectRatio', 'xMidYMid meet');

    legend.append('path')
        .attr('d', interpolatePath({x: 290, y:20}, {x: 360, y: 20}))
        .attr('class', 'poet-friends')

    // male poet
    legend.append('circle')
        .attr('cx', 10)
        .attr('cy', 20)
        .attr('r', 5)
        .attr('fill', '#ffffff')

    legend.append('text')
        .attr('x', 20)
        .attr('y', 24)
        .text('male poet')

    // female poet
    legend.append('circle')
        .attr('cx', 142)
        .attr('cy', 20)
        .attr('r', 5)
        .attr('fill', '#e45656')

    legend.append('text')
        .attr('x', 152)
        .attr('y', 24)
        .text('female poet')

    // poet friends
    legend.append('circle')
        .attr('cx', 290)
        .attr('cy', 20)
        .attr('r', 5)
        .attr('fill', '#f7ba39')

    legend.append('circle')
        .attr('cx',360)
        .attr('cy', 20)
        .attr('r', 5)
        .attr('fill', '#f7ba39')

    legend.append('text')
        .attr('x', 370)
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