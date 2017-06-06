(function() {

  var state = {
    'norm': null // 'x'|'y'
  }

  var chart = {
    container: '#correlation-chart',
    width: 700,
    height: 700
  }

  var margin = {
    top: 140,
    right: 20,
    bottom: 10,
    left: 140
  }

  var colors = {
    first: '#6ac8e0',
    last: '#0c4351' 
  }

  var cells = {
    size: 20,
    container: 'correlation-container'
  }

  var labels = {
    x: {
      container: 'x-labels-container'
    },
    y: {
      container: 'y-labels-container'
    }
  }

  var initializeChart = function(data) {
    var svg = d3.select(chart.container).append('svg')
      .attr('width', chart.width)
      .attr('height', chart.height)
      
    svg.append('g')
      .attr('class', cells.container)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    svg.append('g')
      .attr('class', labels.x.container)
      .attr('transform', 'translate(' + 
        (margin.left + cells.size - 7) + ',' + (margin.top - 5) + ') ' +
        ' rotate(-90)')

    svg.append('g')
      .attr('class', labels.y.container)
      .attr('transform', 'translate(' + 
        (margin.left - 6) + ',' + (margin.top + 14) + ')')

    updateChart(data)
  }

  /**
  * Run the general update pattern on the chart
  **/

  var updateChart = function(data) {

    var color = d3.scale.linear()
      .domain(d3.extent(_.map(data.observations, 'value')))
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb(colors.first), d3.rgb(colors.last)]);

    var selection = d3.select(chart.container)
      .select('.' + cells.container)
      .selectAll('rect')
      .data(data.observations)

    var colorScales = getColorScales(data);

    /**
    * Update svg size
    **/

    d3.select(chart.container).select('svg').transition()
      .attr('width', function() {
        return data.levels.x.length * cells.size + margin.top + margin.bottom;
      })
      .attr('height', function() {
        return data.levels.y.length * cells.size + margin.top + margin.bottom;
      })

    /**
    * Update cells
    **/

    selection.enter()
      .append('rect')
      .attr('width', cells.size)
      .attr('height', cells.size)
      .attr('stroke', '#fff')
      .attr('fill', colors.first)
      .attr('transform', function(d, i) {
        return 'translate(' + 0 + ',' + Math.random() * cells.size + ')'
      })

    selection.transition()
      .duration(1000)
      .delay(function(d, i) { return d.y * 20; })
      .attr('fill', function(d) {
        return colorScales[d[state.norm]](d.value)
      })
      .attr('transform', function(d, i) {
        return 'translate(0,' + d.y * cells.size + ')'
      })
      .delay(function(d, i) { return d.x * 20; })
      .attr('transform', function(d, i) {
        return 'translate(' + d.x * cells.size + ',' + d.y * cells.size + ')'
      })

    selection.exit()
      .remove()

    /**
    * Update x-axis labels
    **/

    var xText = d3.select(chart.container)
      .select('.' + labels.x.container)
      .selectAll('.x-text')
      .data(data.levels.x);

    xText.enter()
      .append('text')
      .attr('class', 'x-text')

    xText.transition()
      .duration(1000)
      .text(function(d) { return d })
      .attr('y', function(d, i) {return i * cells.size })
      .attr('x', 0)
      .style('text-anchor', 'start')
      .attr('font-family', 'courier')
      .attr('font-size', 13)
      .attr('fill', '#666')
      
    xText.exit()
      .remove()

    /**
    * Update y-axis labels
    **/

    var yText = d3.select(chart.container)
      .select('.' + labels.y.container)
      .selectAll('.y-text')
      .data(data.levels.y);

    yText.enter()
      .append('text')
      .attr('class', 'y-text')

    yText.transition()
      .duration(1000)
      .text(function(d) { return d })
      .attr('x', 0)
      .attr('y', function(d, i) {return i * cells.size })
      .style('text-anchor', 'end')
      .attr('font-family', 'courier')
      .attr('font-size', 13)
      .attr('fill', '#666')
      
    yText.exit()
      .remove()
  }

  /**
  * Compute one scale per row/column level if user has indicated
  * they wish to normalize by row/column values
  **/

  function getColorScales(data) {
    var norm = document.querySelector('#correlation-normalize').value;
    state.norm = norm;

    // structure the data as d[level] = [val, val]
    // nb: the the x,y values in data.observations are indicated
    // in terms of the index position the given level has within
    // data.levels; e.g. a point with observation {x: 1, y:0, value:9}
    // has the 1st x level and the 0th y level within data.levels
    var levelVals = {};
    data.observations.forEach(function(d) {
      d[norm] in levelVals ?
          levelVals[ d[norm] ].push(d.value)
        : levelVals[ d[norm] ] = [d.value]
    })

    // create a new color scale for each row|column
    var colorScales = {};
    for (level in levelVals) {
      colorScales[level] = d3.scale.linear()
          .domain(d3.extent(levelVals[level]))
          .interpolate(d3.interpolateHcl)
          .range([d3.rgb(colors.first), d3.rgb(colors.last)]);
    }

    return colorScales;
  }

  /**
  * Helper that returns the path to the currently-selected x, y variables
  **/

  function getDatafilePath() {
    var x = document.getElementById('correlation-x').value;
    var y = document.getElementById('correlation-y').value;

    // build the path to the appropriate data file
    var dir = '';
    dir += 'https://s3.amazonaws.com/duhaime/blog/';
    dir += 'spenserian-networks/poet-metadata-cooccurrence/'
    return dir + x + '_' + y + '_cooccurrence.json';
  }

  /**
  * Initialize the chart
  **/

  d3.json(getDatafilePath(), initializeChart)

  /**
  * Add event listeners
  **/

  var selectsContainer = document.querySelector('#correlation-selects');
  var selects = selectsContainer.querySelectorAll('select');
  selects.forEach(function(d) {
    d.addEventListener('change', function() {
      d3.json(getDatafilePath(), updateChart)
    })
  })

})()