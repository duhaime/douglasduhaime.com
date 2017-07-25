(function() {
  var state = {
    group: 'size'
  }

  var width = 600,
      height = 400;

  var margin = {
    top: 5,
    right: 10,
    bottom: 70,
    left: 70
  }

  var chart = {
    container: '#price-by-size',
    width: width - margin.right - margin.left,
    height: height - margin.top - margin.bottom,
    data: {
      dir: '/assets/posts/cheap-literature/data/',
      file: 'price-by-metadata-field-quartiles.json'
    }
  }

  var svg = d3.select(chart.container).append('svg')
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('class', 'grid');

  svg.append('rect')
    .attr('class', 'grid-background')
    .attr('x', margin.left)
    .attr('y', margin.top)
    .attr('width', chart.width)
    .attr('height', chart.height);

  var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chart.height + ')');

  g.append('g')
    .attr('class', 'y axis');

  g.append('text')
    .html('Farthings per Page')
    .attr('x', -chart.height/2)
    .attr('y', -40)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(270)');

  var colors = ['#efb7b2','#ee6559', '#e7ba52', '#aec7e8', '#1f77b4'];

  function updateChart(data) {
    // arrange the boxplots smallest -> largest medians
    var sortOrder = ['sixteenmo', 'duodecimo', 'octavo', 'quarto', 'folio'];
    var data = data[state.group];
    data.sort(function(a, b) {
      return sortOrder.indexOf(a.level) - sortOrder.indexOf(b.level)
    })

    var yDomain = {
      min: d3.min(_.map(data, '10')),
      max: d3.max(_.map(data, '90')),
    };

    var x = d3.scale.ordinal()
      .domain(_.map(data, 'level'))
      .rangeBands([0, chart.width]);

    var y = d3.scale.linear()
      .domain([(yDomain.min - 0.1), (yDomain.max + 0.1)])
      .range([chart.height, 0]);

    /**
    * Geom update
    **/

    var groups = g.selectAll('.group').data(data);

    var group = groups.enter()
      .append('g')
      .attr('class', 'group');

    // vertical line
    group.append('line')
      .attr('x1', function(d) { return getX(d) + getWidth(d)/2; })
      .attr('x2', function(d) { return getX(d) + getWidth(d)/2; })
      .attr('y1', getY10)
      .attr('y2', getY90)
      .attr('stroke', getStroke())

    // bottom whisker
    group.append('line')
      .attr('x1', getWhiskerX1)
      .attr('x2', getWhiskerX2)
      .attr('y1', getY10)
      .attr('y2', getY10)
      .attr('stroke', getStroke())

    // top whisker
    group.append('line')
      .attr('x1', getWhiskerX1)
      .attr('x2', getWhiskerX2)
      .attr('y1', getY90)
      .attr('y2', getY90)
      .attr('stroke', getStroke())

    group.append('rect')
      .attr('width', getWidth)
      .attr('height', function(d) { return y(d['25']) - y(d['75']); })
      .attr('x', getX)
      .attr('y', function(d) { return y(d['75']); })
      .attr('fill', function(d, i) { return colors[i]; })
      .attr('stroke', getStroke());

    group.append('line')
      .attr('x1', getX)
      .attr('x2', function(d) {return getX(d) + getWidth()})
      .attr('y1', getMedianY)
      .attr('y2', getMedianY)
      .attr('stroke', getStroke())

    /**
    * Axis update
    **/

    var xAxis = d3.svg.axis()
      .scale(x)
      .innerTickSize(-chart.height)
      .orient('bottom');

    var yAxis = d3.svg.axis()
      .scale(y)
      .outerTickSize(10)
      .innerTickSize(-chart.width)
      .tickPadding(10)
      .orient('left');

    g.select('.x.axis').call(xAxis)
    g.select('.y.axis').call(yAxis)
    g.select('.x.axis').selectAll('text').transition()
      .style('text-anchor', 'start')
      .attr('transform', 'rotate(45)');

    /**
    * Helpers
    **/

    function getX(d) {
      return x(d.level) + 5;
    }

    function getWhiskerX1(d) {
      return getX(d) + (getWidth(d) * (1/3));
    }

    function getWhiskerX2(d) {
      return getX(d) + (getWidth(d) * (2/3));
    }

    function getY10(d) {
      return y(d['10']);
    }

    function getY90(d) {
      return y(d['90']);
    }

    function getWidth(d) {
      return x.rangeBand() - 10;
    }

    function getMedianY(d) {
      return y(d['50'])
    }

    function getStroke() {
      return '#000'
    }

  }

  d3.json(chart.data.dir + chart.data.file, updateChart)
})()