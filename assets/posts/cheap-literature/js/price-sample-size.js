(function() {

  var state = {
    group: 'priced'
  }

  var height = 400,
      width = 650;

  var margin = {
    top: 20,
    right: 40,
    bottom: 40,
    left: 50
  }

  var chart = {
    container: '#price-sample-size',
    height: height - margin.top - margin.bottom,
    width: width - margin.right - margin.left,
    data: '/assets/posts/cheap-literature/data/price-sample-size.json'
  }

  var svg = d3.select(chart.container).append('svg')
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chart.height + ')')

  g.append('g')
    .attr('class', 'y axis')

  function updateChart(data) {
    var data = _.filter(data, function(d) {
      return d.group === state.group
    })

    var nest = d3.nest()
      .key(function(d) {return d.size})
      .entries(data)

    // sort the nest to control order of elems in chart
    var order = ['2', '4', '12', '8'];
    nest.sort(function(a, b) {
      return order.indexOf(a.key) - order.indexOf(b.key)
    })

    var stack = d3.layout.stack()
      .offset('zero')
      .values(function(d) {return d.values})
      .x(function(d) {return d.year})
      .y(function(d) {return d.count})

    var datastack = stack(nest);
    var lastlayer = datastack[datastack.length-1].values;

    var x = d3.scale.ordinal()
      .domain(_.map(data, 'year'))
      .rangeBands([0, chart.width])

    var y = d3.scale.linear()
      .domain([0, d3.max(lastlayer, function(d) {return d.y + d.y0}) ])
      .range([chart.height, 0])

    var colors = ['#1f77b4', '#aec7e8', '#ee6559', '#e7ba52'];

    /**
    * Update bars
    **/

    var groups = g.selectAll('.group').data(datastack)

    groups.exit()
      .remove()

    groups.transition()
      .duration(500)
      .attr('fill', function(d, i) { return colors[i] })
      .attr('stroke', function(d, i) { return colors[i] })

    groups.enter()
      .append('g')
      .attr('class', 'group')
      .attr('fill', function(d, i) { return colors[i] })
      .attr('stroke', function(d, i) { return colors[i] })

    var bars = groups.selectAll('rect').data(function(d) {
      return d.values
    });

    bars.enter()
      .append('rect')
      .attr('x', function(d) { return x(d.year) })
      .attr('y', function(d) { return y(d.y + d.y0) })
      .attr('height', function(d) { return y(d.y0) - y(d.y + d.y0) })
      .attr('width', function(d) { return x.rangeBand() })

    bars.transition()
      .duration(500)
      .delay(function(d, i) { return i*2 })
      .attr('x', function(d) { return x(d.year) })
      .attr('y', function(d) { return y(d.y + d.y0) })
      .attr('height', function(d) { return y(d.y0) - y(d.y + d.y0) })
      .attr('width', function(d) { return x.rangeBand() })

    bars.exit()
      .remove()

    /**
    * Update axes
    **/

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickValues(x.domain().filter(function(d, i) {
        return !(i % 5);
      }));

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    svg.select('.x.axis')
      .call(xAxis)

    svg.select('.y.axis').transition()
      .duration(500)
      .call(yAxis)

    d3.select('.x.axis').selectAll('text')
      .style('text-anchor', 'start')
      .attr('dx', 5)
      .attr('dy', 2)
      .attr('transform', 'rotate(45)')
  }

  /**
  * Add event listeners
  **/

  function handleClick(e) {
    activateButton(e.target.id);
    updateTitle(e.target.id);
    state.group = e.target.id;
    d3.json(chart.data, updateChart);
  }

  function activateButton(id) {
    for (var i=0; i<buttons.length; i++) {
      var elem = buttons[i];
      elem.className = elem.id === id ? 'active': ''
    }
  }

  function updateTitle(id) {
    title.textContent = id === 'priced' ?
        'ESTC Records with Advertised Prices, 1700-1800'
      : 'All ESTC Records, 1700-1800'
  }

  var container = document.querySelector('.price-sample-size .buttons'),
      buttons = container.querySelectorAll('button'),
      title = document.querySelector('#price-sample-size-title');

  for (var i=0; i<buttons.length; i++) {
    var elem = buttons[i];
    elem.addEventListener('click', handleClick)
  }
  
  /**
  * Initialize chart
  **/

  buttons[0].click();
})()