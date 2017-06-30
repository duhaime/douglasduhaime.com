(function() {

  var state = {
    factor: 'occupations'
  }

  var width = 600;
  var height = 650;

  var margin = {
    top: 30,
    right: 30,
    bottom: 50,
    left: 150
  }

  var chart = {
    container: '#bar-chart',
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom
  }

  var buttons = {
    container: '#bar-chart-buttons',
    elem: '.factor-button'
  }

  var data = {
    dir: '/assets/posts/spenserian-networks/json/',
    file: 'raw_metadata_frequencies.json'
  }

  // scales
  var x = d3.scale.linear().range([0, chart.width]);
  var y = d3.scale.ordinal().rangeRoundBands([chart.height, 0], .05)

  // axes
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('top')
    .tickFormat(d3.format('d'));;

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .ticks(10);

  var svg = d3.select(chart.container).append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('viewBox', '0 0 ' + width + ' ' + height)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chart.height + ')')
      .append('text')
        .attr('x', chart.width/2)
        .attr('y', 10)
        .style('font-size', '16')
        .html('Poets')

  svg.append('g')
    .attr('class', 'y axis')

  // main drawing function
  function redraw() {
    d3.json(data.dir + data.file, function(json) {      
      var data = [];
      _.keys(json[state.factor]).forEach(function(k) {
        data.push({
          level: k,
          observations: json[state.factor][k]
        })
      })

      // sort by descending order
      data = _.sortBy(data, 'observations')

      // domains
      x.domain([0, _.max(_.map(data, 'observations'))]);
      y.domain(_.map(data, 'level'));

      d3.select(chart.container).select('.x.axis').call(xAxis)
        .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '.85em')
          .attr('dy', '1.9em')

      d3.select(chart.container).select('.y.axis').call(yAxis)

      var bars = svg.selectAll('rect').data(data)

      bars.exit()
        .transition()
        .duration(300)
        .attr('fill-opacity', 0)
        .remove()

      bars.transition()
        .duration(300)
        .attr('width', function(d) { return x(d.observations); })
        .attr('y', function(d) { return y(d.level); })
        .attr('height', y.rangeBand());

      bars.enter().append('rect')
        .style('fill', '#43a5be')
        .attr('x', 0)
        .attr('width', function(d) { return x(d.observations); })
        .attr('y', function(d) { return y(d.level); })
        .attr('height', y.rangeBand());
    })
  }

  /**
  * Add event listeners to buttons
  **/

  function selectButton(target) {    
    for (var i=0; i<containerButtons.length; i++) {
      var elem = containerButtons[i];
      elem.classList.remove('active');
      if (elem.dataset['id'] === target.dataset['id']) {
        elem.className += ' active';
        state.factor = target.dataset['id'];
        redraw()
      }
    }
  }

  var container = document.querySelector(buttons.container),
      containerButtons = container.querySelectorAll(buttons.elem);

  for (var i=0; i<containerButtons.length; i++) {
    var elem = containerButtons[i];
    elem.addEventListener('click', function(e) {
      var elem = e.target;
      while (!elem.dataset['id']) {
        var elem = elem.parentNode;
      }
      selectButton(elem)
    })
  }

  redraw()

})()