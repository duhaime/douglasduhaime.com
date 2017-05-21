(function() {

  /**
  * Configure the chart
  **/

  var nodes = {
    r: 4,            // radius of observation
    boxSize: 12,     // h,w of the waffle point 'container'
  }

  var columns = {
    points: 20,      // observations per column
    margin: 100       // px between columns
  }

  var margin = {
    top: 30,
    right: 30,
    bottom: 15,
    left: 20
  }

  var chart = {
    width: 760,
    height: 280,
    datafile: '/assets/posts/poet-constellations/json/normalized_metadata_frequencies.json',
    fill: d3.scale.category20(),
    container: '#waffle-chart'
  }

  /**
  * Make the clicked button active
  **/

  var activateButton = function(level) {
    document.querySelector('.waffle-button-container')
      .querySelectorAll('.button')
      .forEach(function(d) {
        d.className = 'button'
      })

    document.getElementById(level).className = 'button active'
  }

  /**
  * Create an array of observations for charting
  **/

  var getObservations = function(json, factor) {
    var data = [];
    _.keys(json[factor])
      .forEach(function(l, i) {
        
        // estalish a new index for each level of the factor
        var frequency = json[factor][l] * 100;
        
        // add a multiplier so each plot circle represents n writers
        _.times(frequency * 5, function(idx) {
          data.push({
            idx: idx,
            level: l,
            levelIdx: i,
            value: frequency
          })
        })
      })

    return data;
  }

  /**
  * Identify the number of columns required for each level of a factor
  **/

  var getLevelToColumns = function(data) {
    // compute the number of columns required for each level
    var levelToObservations = _.groupBy(data, function(d) {return d.level})
    var levelToColumns = {}
    _.keys(levelToObservations)
      .map(function(l) {
        var cols = levelToObservations[l].length/columns.points;
        levelToColumns[l] = Math.ceil(cols);
      })

    return levelToColumns
  }

  /**
  * Compute the width required by each level of the visualized factor
  **/

  var getLevelToStart = function(data) {
    var levelToColumns = getLevelToColumns(data)

    // find the positions along the x axis where each level should start
    var levelToStart = {};
    var cumulative = 0;
    _.keys(levelToColumns)
      .map(function(l, i) {
        levelToStart[l] = cumulative;
        cumulative += (levelToColumns[l] * nodes.boxSize) + columns.margin
      })

    return levelToStart;
  }

  /**
  * Compute the full chart width
  **/

  var getChartWidth = function(data) {
    var levelToColumns = getLevelToColumns(data);
    var totalColumns = _.sum(_.values(levelToColumns));
    return margin.left + margin.right +
      (totalColumns * nodes.boxSize) + 
      ( _.keys(levelToColumns).length * columns.margin );
  }

  /**
  * Draw the chart foundation
  **/

  var initializeChart = function(data, factor) {

    var svg = d3.select(chart.container).append('svg')
      .attr('width', chart.width)
      .attr('height', chart.height);

    var g = svg.append('g')
      .attr('class', 'waffle-container')
      .attr('transform', 'translate(' + margin.left + ',' + 
        margin.top + ')')

    g.selectAll('circle')
      .data(data)
      .enter()
        .append('circle')
        .attr('cx', function() {return Math.random() * chart.width})
        .attr('cy', function() {return Math.random() * chart.height})
        .attr('r', 0)

    updateChart(data, factor)
  }

  /**
  * Update the chart
  **/

  var updateChart = function(data, factor) {

    var levelToStart = getLevelToStart(data);

    /**
    * Update svg width
    **/

    d3.select(chart.container).select('svg')
      .transition()
      .duration(2000)
      .attr('width', getChartWidth(data))

    /**
    * Update points
    **/
  
    var selection = d3.select('.waffle-container').selectAll('circle')
      .data(data)

    selection.enter()
      .append('circle')

    selection.transition()
      .duration(1200)
        .delay(function(d, i) {
          return i
        })
        .attr('class', 'node')
        .attr('r', nodes.r)
        // ~~(x/y) returns the number of times y is divisible by x (rounded)
        .attr('cx', function(d, i) {
          var factorOffset = levelToStart[d.level];
          var obsOffset = ~~(d.idx / columns.points) * nodes.boxSize
          return factorOffset + obsOffset
        })
        // ensure there are only columns.points observations per column
        .attr('cy', function(d, i) {
          return ((d.idx % columns.points) * nodes.boxSize)
        })
        .style('fill', function(d) {
          return chart.fill(d.levelIdx);
        })
        .style('stroke', function(d) {
          return d3.rgb(chart.fill(d.id)).darker(2);
        });

    selection.exit()
      .transition()
      .duration(1000)
      .remove()

    /**
    * Update labels
    **/

    var text = d3.select(chart.container).select('svg').selectAll('text')
      .data(_.keys(levelToStart))

    text.enter()
      .append('text')

    text.transition()
      .duration(1000)
      .text(function(d) {return d})
      .attr('x', function(d) {return levelToStart[d] + margin.left - 5})
      .attr('y', function(d) {return 15})
      .attr('font-family', 'courier')
      .attr('font-size', 13)
      .attr('fill', '#666')

    text.exit()
      .remove()

  }

  /**
  * Initialize the chart
  **/

  d3.json(chart.datafile, function(json) {
    
    // find the currently active factor
    var initialFactor = document.querySelector('.waffle-button-container')
        .querySelector('.button.active').id;

    var data = getObservations(json, initialFactor)
    initializeChart(data, initialFactor)
  })

  /**
  * Add public api that's called when users click a new factor
  **/

  window.waffle = window.waffle || {}
 
  window.waffle.loadJson = function(e) {
    var level = e.target.id;
    if (level) {
      activateButton(level);

      d3.json(chart.datafile, function(json) {
        var data = getObservations(json, level)
        updateChart(data, level)
      })
    }
  }

})()
