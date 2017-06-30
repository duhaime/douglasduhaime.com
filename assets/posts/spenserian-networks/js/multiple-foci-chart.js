(function() {

  var state = {};

  var width = 500,
      height = 400;

  var margin = {
    top: 80,
    right: 30,
    bottom: 125,
    left: 30
  }

  var controls = {
    startInterval: '#start-sampling',
    stopInterval: '#stop-sampling',
    restartInterval: '#restart-sampling',
    totalSamples: '#total-samples'
  }

  var chart = {
    width: width - margin.right - margin.left,
    height: height - margin.top - margin.bottom,
    container: '#multiple-foci',
    samplesDiv: '#observed-samples',
    factor: 'education',
    bars: {
      width: 80,
      margin: 5,
      fill: '#52beda'
    },
    data: {
      dir: '/assets/posts/spenserian-networks/json/',
      file: 'normalized_metadata_frequencies.json'
    },
  }

  var svg = d3.select(chart.container).append('svg')
      .attr('width', width)
      .attr('height', height)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  var labels = svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chart.height + ')')

  var legend = svg.append('g')
    .attr('class', 'legend')

  function drawChart(json) {
    var data = parseData(json);
    initializeStateSamples(data);

    var x = d3.scale.ordinal()
      .domain(_.map(data, 'level'))
      .rangeBands([0, chart.width])

    var y = d3.scale.linear()
      .domain([0, d3.max(_.map(data, 'value')) ])
      .range([0, chart.height])

    var xAxis = d3.svg.axis()
      .scale(x);

    /**
    * Add legend
    **/

    legend.append('rect')
      .attr('x', 350)
      .attr('y', -70)
      .attr('width', 20)
      .attr('height', 20)
      .attr('stroke', 'black')
      .attr('stroke-dasharray', '3,3')
      .attr('fill', '#fff')

    legend.append('text')
      .attr('x', 375)
      .attr('y', -55)
      .html('Expected')

    legend.append('rect')
      .attr('x', 350)
      .attr('y', -45)
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', '#52beda')

    legend.append('text')
      .attr('x', 375)
      .attr('y', -30)
      .html('Observed')

    /**
    * Add rects
    **/

    svg.selectAll('.filled-rect').data(data).enter()
      .append('rect')
        .attr('class', 'filled-rect')
        .attr('width', x.rangeBand() - chart.bars.margin)
        .attr('height', 0)
        .attr('fill', '#52beda')
        .attr('x', function(d) {
          return x(d.level);
        })
        .attr('y', chart.height);

    svg.selectAll('.rect-outline').data(data).enter()
      .append('rect')
        .attr('class', 'rect-outline')
        .attr('width', x.rangeBand() - chart.bars.margin)
        .attr('height', function(d) {
          return y(d.value);
        })
        .attr('fill', 'none')
        .attr('x', function(d) {
          return x(d.level);
        })
        .attr('y', function(d) {
          return chart.height - y(d.value);
        })
        .attr('stroke', 'black')
        .attr('stroke-dasharray', '3,3')

    labels.call(xAxis)

    svg.select('.x.axis').selectAll('text')
      .attr('transform', 'rotate(45)')
      .style('text-anchor', 'start')
      .attr('x', 10)

    /**
    * Get one observation per level with level and value keys
    *
    * @args:
    *   {obj} json: an object with the structure: d[factor][level] = value
    * @returns:
    *   [arr] : an array with structure [{level: value: cumulative:}]
    *     where cumulative maps to the cumulative sum of all values
    *     for the given factor leading up to the given level 
    **/

    function parseData(json) {
      var data = [];
      for (level in json[chart.factor]) {
        data.push({
          level: level,
          value: json[chart.factor][level],
        })
      }

      data = _.sortBy(data, 'value').reverse();

      var cumulative = 0;
      data.forEach(function(d) {
        d.cumulative = cumulative;
        cumulative += d.value;
      })
      return data;
    }

    /**
    * Functions to start, stop, or totally end sampling
    **/

    function startSampling() {
      setTotalSamples();
      startDiv.disabled = true;
      stopDiv.disabled = false;
      restartDiv.disabled = true;
      totalSamples.disabled = true;
      state.interval = setInterval(addSample, 70);
    }

    function stopSampling() {
      startDiv.disabled = false;
      stopDiv.disabled = true;
      restartDiv.disabled = false;
      clearInterval(state.interval);
    }

    function concludeSampling() {
      startDiv.disabled = true;
      stopDiv.disabled = true;
      restartDiv.disabled = false;
      totalSamples.disabled = false;
      clearInterval(state.interval);
    }

    function restartSampling() {
      setInitialState();
      initializeStateSamples(data);
      removeBarHeight();
      setTimeout(startSampling, 500);
    }

    /**
    * Generate nodes
    **/

    function addSample() { 
      if (state.collectedSamples == state.totalSamples) {
        concludeSampling();
        return;
      }

      var sample = getWeightedSample();
      state.samples[sample.level] += 1;
      state.collectedSamples += 1;

      d3.select(chart.samplesDiv).html(state.collectedSamples);

      var points = svg.selectAll('.point').data([sample], function(d) {
        return Math.random();
      });

      points.enter().append('circle')
          .attr('r', 8)
          .attr('cx', chart.width/2)
          .attr('cy', -margin.top + 10)
          .attr('class', 'point')
          .attr('fill', '#0c4351')
        .transition()
          .duration(900)
          .attr('cx', function(d) { return d.x; })
          .attr('cy', function(d) { return d.y })
        .transition()
          .duration(300)
          .style('fill-opacity', 0)
        .remove()

      svg.selectAll('.filled-rect').data(_.keys(state.samples)).transition()
        .duration(500)
        .attr('height', function(d) {
          return y(state.samples[d]/state.totalSamples);
        })
        .attr('y', function(d) {
          return chart.height - y(state.samples[d]/state.totalSamples);
        })
    }

    /**
    * Simulate a weighted random sample -- requires data to be
    * ordered with increasing d.cumulative values
    **/

    function getWeightedSample() {
      var random = _.random(0, 99);
      var selected = null;
      data.forEach(function(d, i) {
        if (d.cumulative*100 < random) selected = d;
      })

      // edge case where we select the tail of the distribution
      if (!selected) selected = data[data.length-1];
      
      // add attributes that specify the x,y destination of this point
      selected.x = x(selected.level) + x.rangeBand()/2;
      selected.y = chart.height;
      return selected;
    }

    /**
    * Set state.samples[level] = 0 for each level and create
    * a new scale for each level so that the given level needs
    * n observations to reach the top of its bar, where n =
    * the probability of the level (stored in d.value) times
    * the total number of samples we'll make in the simulation
    * 
    * @args:
    *   [arr] data: an array of objects, each with structure:
    *     {level: value: cumulative:}
    **/

    function initializeStateSamples(data) {
      data.forEach(function(d) {
        state.samples[d.level] = 0;
      });
    }

    /**
    * Helper to store in state the total number of samples to take
    **/

    function setTotalSamples() {
      state.totalSamples = parseInt(totalSamples.value);
    }

    /**
    * Helper to remove all bar height from the sample bars
    **/

    function removeBarHeight() {
      svg.selectAll('.filled-rect').transition()
        .duration(500)
        .attr('height', 0)
    }

    /**
    * Bind event listeners to start/stop the interval
    **/

    var startDiv = document.querySelector(controls.startInterval);
    var stopDiv = document.querySelector(controls.stopInterval);
    var restartDiv = document.querySelector(controls.restartInterval);
    var totalSamples = document.querySelector(controls.totalSamples);

    startDiv.addEventListener('click', startSampling);
    stopDiv.addEventListener('click', stopSampling);
    restartDiv.addEventListener('click', restartSampling);
  }

  /**
  * Get initial view state
  **/

  function setInitialState() {
    state = {
      samples: {},
      collectedSamples: 0,
      totalSamples: 500,
      interval: null
    };
  }

  // initialize the chart
  setInitialState();
  d3.json(chart.data.dir + chart.data.file, drawChart)

})();