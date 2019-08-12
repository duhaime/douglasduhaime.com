(function() {
  // config
  var layers = [6,4,2,4,6],
      r = 20,
      container = d3.select('#auto-diagram');

  // main
  var maxLayer = d3.max(layers),
      dy = (r*2+10), // space between y layers
      dx = 100; // space between x layers

  var svg = container.append('svg')
    .attr('viewBox', '0 0 ' +
      dx * (layers.length+1) + ' ' +
      dy * maxLayer)

  var g = svg.append('g').attr('transform',
    'translate(' + dx + ',' + ((dy*maxLayer/2) + dy/2) + ')');

  g.append('text')
    .text('Encoder')
    .attr('dx', 100)
    .attr('dy', 400)
    .attr('fill', '#666')

  var data = [];
  for (var i=0; i<layers.length; i++) {
    for (var j=0; j<layers[i]; j++) {
      data.push({
        x: dx * i,
        y: (j*dy) - (layers[i]*dy/2),
        layer: i, // layer index in network
        idx: j, // node index in layer
        letter: i == 0 // i=input; o=output; h=hidden
          ? 'i'
          : i == layers.length-1
            ? 'o'
            : 'h'
      })
    }
  }

  data.forEach(function(d) {
    // edges
    var next = data.filter(function(i) { return i.layer == d.layer+1 })
    next.forEach(function(n) {
      g.append('line')
        .attr('x1', d.x)
        .attr('x2', n.x)
        .attr('y1', d.y)
        .attr('y2', n.y)
        .attr('stroke', 'lightgray')
    })

    // node
    var n = g.append('g')
      .attr('transform', 'translate(' + d.x + ',' + d.y + ')')

    n.append('circle')
      .attr('r', r)
      .attr('fill', '#d53a26')

    var t = n.append('text')
      .attr('fill', '#fff')
      .attr('font-family', 'courier')
      .attr('dx', '-0.7em')
      .attr('dy', '0.15em')

    t.append('tspan').text(d.letter + d.layer)
    t.append('tspan').text(d.idx)
      .attr('baseline-shift', 'sub')
      .attr('font-size', '0.7em')
  })

})()