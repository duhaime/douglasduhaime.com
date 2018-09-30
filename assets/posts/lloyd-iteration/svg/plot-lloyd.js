(function() {

  var w = 700,
      h = 600,
      svg = d3.select('#lloyd-target')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('viewBox', '0 0 ' + w + ' ' + h);

  d3.json('/assets/posts/lloyd-iteration/svg/positions.json', function(data) {
    draw(data)
  })

  var targets = ['before', 'after'],
      target = targets[0];

  function draw(data) {

    var colors = [
      '#3366cc', '#dc3912', '#ff9900', '#109618', '#990099',
      '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395',
      '#994499', '#22aa99', '#aaaa11', '#6633cc', '#e67300',
      '#8b0707', '#651067', '#329262', '#5574a6', '#3b3eac'
    ]

    var x = d3.scaleLinear()
      .domain(d3.extent(data[target], function(d) { return d[0]; }))
      .range([10, w-10])

    var y = d3.scaleLinear()
      .domain(d3.extent(data[target], function(d) { return d[1]; }))
      .range([10, h-10])

    svg.selectAll('circle').data(data[target]).enter()
      .append('circle')
      .attr('r', 4)
      .attr('cx', function(d) { return x(d[0]); })
      .attr('cy', function(d) { return y(d[1]); })
      .attr('fill', function(d, idx) {
        return colors[data.groups[idx]]
      })

    window.data = data;
    window.scales = {
      x: x,
      y: y
    }
  }

  function getColor() {
    function rand() { return parseInt(Math.random() * 255); }
    return 'rgb(' + rand() + ',' + rand() + ',' + rand() + ')';
  }

  function redraw() {
    target = target == targets[0] ? targets[1] : targets[0];
    svg.selectAll('circle').data(data[target]).transition()
      .duration(1000)
      .attr('cx', function(d) { return scales.x(d[0]); })
      .attr('cy', function(d) { return scales.y(d[1]); })
    var elem = document.querySelector('#target');
    elem.innerHTML = target;
  }

  window.addEventListener('click', redraw)

})();