(function() {

  var state = {
    data: {
      nodes: null
    },
    domains: {
      x: null,
      values: null
    },
    scales: {
      x: null,
      y: null,
      color: null
    }
  }

  var width = 650,
      height = 760;

  var margin = {
    top: 30,
    right: 30,
    bottom: 30,
    left: 140
  }

  var chart = {
    container: '#discrete-scatterplot',
    tooltip: '#discrete-scatterplot-tooltip',
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
    levelHeight: 37,
    jitterVal: 8,
    data: {
      dir: 'https://s3.amazonaws.com/duhaime/blog/spenserian-networks/relationship-deltas/'
    }
  }

  var svg = d3.select(chart.container).append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('viewBox', '0 0 ' + width + ' ' + height);

  var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var grid = g.append('rect')
    .attr('class', 'grid')
    .attr('fill', '#e7e7e7')
    .attr('width', chart.width)
    .attr('height', chart.height);

  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chart.height + ')');

  g.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(0,0)');

  var neutral = g.append('line')
    .attr('class', 'neutral-line');

  function updateChart(data) {
    var xLevels = data.levels.x;
    var yLevels = data.levels.y;
    var values = [];
    var nodes = [];

    data.observations.map(function(d) {
      values.push(d.value);
      nodes.push({
        xLevel: xLevels[d.x],
        yLevel: yLevels[d.y],
        value: d.value
      })
    })

    chart.height = yLevels.length * chart.levelHeight;
    height = chart.height + margin.top + margin.bottom;

    var valueDomain = d3.extent(values);

    var x = getXScale(xLevels, valueDomain);

    var y = d3.scale.ordinal()
      .domain(yLevels)
      .rangeBands([0, chart.height]);

    var positiveColors = d3.scale.quantize()
      .domain([0, valueDomain[1]])
      .range(['#52beda', '#3691a8', '#206d81']);

    var negativeColors = d3.scale.linear()
      .domain([0, valueDomain[0]])
      .range(['#fc8e80', '#d53a26', '#be311f']);

    var xAxis = d3.svg.axis()
      .scale(x)
      .innerTickSize(-chart.height)
      .tickPadding(10)
      .ticks(8)
      .orient('bottom');

    var yAxis = d3.svg.axis()
      .scale(y)
      .innerTickSize(-chart.width)
      .tickPadding(10)
      .orient('left');

    /**
    * Cache scales, data, and domains for checkbox callbacks
    **/

    state.scales = {
      x: x,
      y: y,
      color: {
        positive: positiveColors,
        negative: negativeColors
      }
    }

    state.data = {
      nodes: nodes,
    };

    state.domains = {
      x: xLevels,
      values: valueDomain
    }

    /**
    * Transition elems
    **/

    svg.transition()
      .attr('viewBox', '0 0 ' + width + ' ' + height);

    grid.transition()
      .attr('width', chart.width)
      .attr('height', chart.height);

    g.select('.x.axis').transition()
      .attr('transform', 'translate(0,' + chart.height + ')')
      .call(xAxis);

    g.select('.y.axis').transition()
      .call(yAxis);

    neutral.transition()
      .attr('x1', x(0))
      .attr('x2', x(0))
      .attr('y1', 0)
      .attr('y2', chart.height);

    // update all points with discretized styles if necessary
    handleDiscretize();

    /**
    * Transition nodes
    **/

    var node = g.selectAll('.node').data(nodes);

    node.exit()
      .remove();

    node.enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 5)
      .style('opacity', 0)
      .on('mousemove', handleMousemove)
      .on('mouseout', handleMouseout)

    node.transition()
      .delay(function(d, i) { return i*3 })
      .duration(500)
      .attr('cx', getXPosition)
      .attr('cy', getYPosition)
      .attr('stroke', getStroke)
      .attr('fill', getFill)
      .style('opacity', 1);
  }

  function getXScale(xLevels, valueDomain) {
    return discretize.checked ?
      d3.scale.ordinal()
        .domain(xLevels)
        .rangeBands([0, chart.width])

    : d3.scale.linear()
      .domain([valueDomain[0] - 0.015, valueDomain[1] + 0.015])
      .range([0, chart.width]);
  }

  function getXPosition(d, i) {
    return discretize.checked ?
        state.scales.x(d.xLevel) + state.scales.x.rangeBand()/2
      : state.scales.x(d.value)
    }

  function getYPosition(d, i) {
    var position = state.scales.y(d.yLevel) + 
        state.scales.y.rangeBand()/2;

    if (jitter.checked) {
      return i%2 === 0 ?
          position + Math.random()*chart.jitterVal
        : position - Math.random()*chart.jitterVal
    } else {
      return position;
    }
  }

  function getStroke(d) {
    return d.value >= 0 ?
        d3.rgb(state.scales.color.positive(d.value)).darker(.5)
      : d3.rgb(state.scales.color.negative(d.value)).darker(.5)
  }

  function getFill(d) {
    return d.value >= 0 ?
        d3.rgb(state.scales.color.positive(d.value))
      : d3.rgb(state.scales.color.negative(d.value))
  }

  /**
  * Checkbox callbacks
  **/

  function handleJitter() {
    d3.selectAll('.node').data(state.data.nodes).transition()
      .delay(function(d, i) {return i*3})
      .attr('cy', getYPosition)
  }

  function handleDiscretize() {
    state.scales.x = getXScale(state.domains.x, state.domains.values)

    margin.bottom = discretize.checked ? 140 : 30;
    height = chart.height + margin.top + margin.bottom;

    svg.transition()
      .attr('viewBox', '0 0 ' + width + ' ' + height);

    var xAxis = d3.svg.axis()
      .scale(state.scales.x)
      .innerTickSize(-chart.height)
      .tickPadding(10)
      .ticks(8)
      .orient('bottom');

    g.select('.x.axis').transition()
      .attr('transform', 'translate(0,' + chart.height + ')')
      .call(xAxis);

    svg.select('.x.axis').selectAll('text').transition()
      .style('text-anchor', function() {
        return discretize.checked ? 'start' : 'middle'
      })
      .attr('transform', function() {
        return discretize.checked ? 'rotate(90)' : 'rotate(0)'
      })
      .attr('dx', function() {
        return discretize.checked ? '0.5em' : 0
      })
      .attr('dy', function() {
        return discretize.checked ? -8 : '.71em'
      })

    d3.selectAll('.node').transition()
      .delay(function(d, i) {return i*3})
      .attr('cx', getXPosition)

    d3.select('.neutral-line').transition()
      .style('opacity', function() {
        return discretize.checked ? 0 : 1
      });
  }

  /**
  * Tooltip handlers
  **/

  var tooltip = d3.select(chart.tooltip);

  function handleMousemove(d, i) {
    var mousePosition = d3.mouse(this);

    tooltip
      .style('left', mousePosition[0] - 60 + 'px')
      .style('top', mousePosition[1] - 50 + 'px')
      .style('opacity', 1)
      .style('z-index', 10);

    tooltip.select('.y-level').html(d.yLevel)
    tooltip.select('.x-level').html(d.xLevel + ': ')
    tooltip.select('.value').html(parseInt(d.value*100) + '%')
    tooltip.select('.value').style('color', function() {
      return d.value >= 0 ?
          state.scales.color.positive(d.value)
        : state.scales.color.negative(d.value)
    })
  }

  function handleMouseout(d, i) {
    tooltip
      .style('opacity', 0)
      .style('z-index', -1)

    d3.select(chart.container).selectAll('.node')
      .style('opacity', 1)
  }

  /**
  * Bind data loaders to the controls
  **/

  var container = document.querySelector('#discrete-scatterplot-selects'),
      rows = container.querySelector('#scatterplot-rows'),
      points = container.querySelector('#scatterplot-points'),
      jitter = container.querySelector('#jitterbug-perfume'),
      discretize = container.querySelector('#discretize'),
      selects = container.querySelectorAll('select');

  for (var i=0; i<selects.length; i++) {
    var elem = selects[i];
    elem.addEventListener('change', redraw);
  }

  jitter.addEventListener('change', handleJitter)
  discretize.addEventListener('change', handleDiscretize)

  /**
  * Function to return path to the current data
  **/

  function getDatafilePath() {
    var y = rows.value;
    var x = points.value;
    return chart.data.dir + y + '_' + x + '.json';
  }

  /**
  * Main function that triggers chart updates
  **/

  function redraw() {
    d3.json(getDatafilePath(), updateChart);
  };

  // initialize the chart
  redraw();

})()