(function(){

  /**
  * State values:
  *   {obj} nestedData: the input data, with shape
  *           d[factor][level][year] = value
  *   {str} factor: the currently selected factor (e.g. occupation, gender)
  *   {arr} levels: an array of the levels for the current factor
  *   {arr} years: an array of integers that indicate the years for the chart
  *   {func} mouseoverX: a d3 quantized scale with domain = chart width in pixels
  *           and range = the year array; used for computing the hovered year
  *           inside the mousemove event handler
  **/ 

  var state = {
    nestedData: {},
    factor: 'occupations',
    levels: [],
    years: [],
    mouseoverX: function() {}
  }

  var colors = {
    blue0: '#52beda',
    blue1: '#3691a8',
    blue2: '#206d81',
    blue3: '#0c4351',

    red0: '#fc8e80',
    red1: '#d53a26',
    red2: '#be311f',
    red3: '#851b0e',

    yellow0: '#ffecb3',
    yellow1: '#e9cf7f',
    yellow2: '#e3c15c',
    yellow3: '#cf9f13'
  }

  var width = 700,
    height = 500;

  var margin = {
    top: 0,
    right: 0,
    bottom: 40,
    left: 0
  }

  var chart = {
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
    container: '#steam-chart',
    tooltip: '#steam-chart-tooltip',
    data: {
      dir: '/assets/posts/poet-constellations/json/',
      file: 'metadata_distributions_over_time.json'
    }
  }

  var buttons = {
    container: '#steam-chart-buttons',
    elem: '.factor-button'
  }

  var color = d3.scale.ordinal()
    .range([colors.blue0, colors.blue1, colors.blue2, colors.blue3]);

  var svg = d3.select(chart.container).append('svg')
    .attr('width', width)
    .attr('height', height);

  svg.append('g').attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chart.height + ')')
    .append('text')
      .attr('x', (chart.width/2) - 38)
      .attr('y', 40)
      .style('font-size', 16)
      .html('Year')

  /**
  * The data passed to the stack layout should have the following form:
  *
  * [
  *   [ 
  *     {x: y:}, {x: y:} // observations for first level of factor
  *   ],
  *   [
  *     {x: y:}, {x: y:} // observations for second level of factor
  *   ]
  * ]
  *
  * NB: Every level of each factor must have the same number of observations
  * (one per level along the x axis) 
  **/

  function redraw() {
    d3.json(chart.data.dir + '/' + chart.data.file, function(json) {

      var area = d3.svg.area()
        .x(function(d) { return x(d.x); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

      var stack = d3.layout.stack().offset('wiggle');
      data = stack(parseData(json));

      // chart scales
      var x = d3.scale.linear()
          .domain([_.min(state.years), _.max(state.years)])
          .range([0, chart.width]);

      var y = d3.scale.linear()
          .domain([0, d3.max(data, function(layer) {
            return d3.max(layer, function(d) {
              return d.y0 + d.y;
            });
          })])
          .range([chart.height, 0]);

      // mouseover scale; the domain == range of chart x scale
      state.mouseoverX = d3.scale.quantize()
          .domain([0, chart.width])
          .range(state.years)

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.format('d'));

      var paths = svg.selectAll('.steam-path').data(data, function(d, i) {
        return i
      });

      paths.exit()
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove()

      paths.enter().append('path')
          .attr('class', 'steam-path')
          .attr('d', area)
          .style('fill', function(d, i) { return color(i); })
          .style('opacity', 0)
          .on('mousemove', handleMousemove)
          .on('mouseout', handleMouseout);

      paths.transition()
        .duration(300)
        .attr('d', area)
        .style('opacity', 1);

      svg.select('.x.axis').call(xAxis);
    })
  }

  /**
  * Transform data from shape d[factor][level][year] = count
  * to data of shape [[{x: y:}, {x: y:}], [{x: y:}, {x: y:}]]
  * where each subarray represents one level of the currently
  * selected factor
  **/

  function parseData(json) {
    var data = [],
        levels = [],
        years = [];

    _.keys(json[state.factor]).forEach(function(level) {
      levels.push(level);
      var factorArray = [];
      _.keys(json[state.factor][level]).forEach(function(year) {
        var year = parseInt(year);
        years.push(year);

        factorArray.push({
          x: year,
          y: json[state.factor][level][year]
        })
      })

      data.push(factorArray)
    })

    // cache the x domain and levels in the state
    state.nestedData = json;
    state.levels = levels;
    state.years = _.sortBy(_.uniqBy(years));

    return data;
  }

  /**
  * Functions called on mousemove over chart
  **/

  var tooltip = d3.select(chart.tooltip);

  function handleMousemove(d, i) {
    d3.select(chart.container).selectAll('.steam-path')
      .style('opacity', 0.8)

    d3.select(this).style('opacity', 1)

    var mousePosition = d3.mouse(this),
        year = state.mouseoverX(mousePosition[0]),
        level = state.levels[i],
        value = state.nestedData[state.factor][level][year];

    tooltip
      .style('left', mousePosition[0] - 100 + 'px')
      .style('top', mousePosition[1] - 140 + 'px')
      .style('opacity', 1)
      .style('z-index', 10);

    tooltip.select('.tooltip-level').html(level + '-poets')
    tooltip.select('.tooltip-year').html(year + ': ')
    tooltip.select('.tooltip-value').html(parseInt(value*100)+'%')
  }

  function handleMouseout(d, i) {
    tooltip.style('opacity', 0)
      .style('z-index', -1)

    d3.select(chart.container).selectAll('.steam-path')
      .style('opacity', 1)
  }

  /**
  * Click event handlers
  **/

  function selectButton(target) {
    var container = document.querySelector(buttons.container);
    container.querySelectorAll(buttons.elem).forEach(function(d) {
      d.classList.remove('active');
      if (d.dataset['id'] === target.dataset['id']) {
        d.className += ' active';
        state.factor = target.dataset['id'];
        redraw()
      }
    })
  }

  // add event listeners
  var container = document.querySelector(buttons.container);
  container.querySelectorAll(buttons.elem).forEach(function(d) {
    d.addEventListener('click', function() {
      selectButton(d)
    })
  })

  redraw()

})()