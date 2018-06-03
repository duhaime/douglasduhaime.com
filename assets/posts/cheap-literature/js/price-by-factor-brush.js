(function() {
  var width = 600,
      height = 85;

  var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  }

  var chart = {
    container: '#price-by-factor-brush',
    width: width - margin.right - margin.left,
    height: height - margin.top - margin.bottom,
    initialObservations: 8,
    brush: '#price-by-factor-brush',
    json: null,
    data: {
      dir: '/assets/posts/cheap-literature/data/',
      file: 'price-by-metadata-field-quartiles.json'
    }
  }

  /**
  * Initialize chart
  **/

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

  /**
  * Update brush
  **/

  function updateBrush(data) {
    var yDomain = {
      max: d3.max(_.map(data, '90')),
      min: d3.min(_.map(data, '10')),
    };

    var x = d3.scale.ordinal()
      .domain(_.map(data, 'level'))
      .rangeBands([0, chart.width]);

    var y = d3.scale.linear()
      .domain([yDomain.min, yDomain.max])
      .range([chart.height, 0]);

    var colors = d3.scale.linear()
      .domain([0, data.length])
      .interpolate(d3.interpolateHcl)
      .range(['#e7ba52', '#ee6559']);

    /**
    * Groups Enter
    **/

    var groups = g.selectAll('.group').data(data);

    var group = groups.enter()
      .append('g')
      .attr('class', 'group');

    group.append('line').attr('class', 'vertical-line')
    group.append('line').attr('class', 'top-whisker')
    group.append('line').attr('class', 'bottom-whisker')
    group.append('rect')
    group.append('line').attr('class', 'median-line')

    /**
    * Groups transition
    **/

    var transition = groups.transition()
      .duration(500);

    transition.select('.vertical-line').transition()
      .duration(500)
      .attr('x1', function(d) { return getX(d) + getWidth(d)/2; })
      .attr('x2', function(d) { return getX(d) + getWidth(d)/2; })
      .attr('y1', getY10)
      .attr('y2', getY90)
      .attr('stroke', getStroke())

    transition.select('.top-whisker').transition()
      .duration(500)
      .attr('x1', getWhiskerX1)
      .attr('x2', getWhiskerX2)
      .attr('y1', getY90)
      .attr('y2', getY90)
      .attr('stroke', getStroke())

    transition.select('.bottom-whisker').transition()
      .duration(500)
      .attr('x1', getWhiskerX1)
      .attr('x2', getWhiskerX2)
      .attr('y1', getY10)
      .attr('y2', getY10)
      .attr('stroke', getStroke())

    transition.select('rect').transition()
      .duration(500)
      .attr('width', getWidth)
      .attr('height', function(d) { return y(d['25']) - y(d['75']); })
      .attr('x', getX)
      .attr('y', function(d) { return y(d['75']); })
      .attr('fill', function(d, i) { return colors(i) })
      .attr('stroke', getStroke());

    transition.select('.median-line').transition()
      .duration(500)
      .attr('x1', getX)
      .attr('x2', function(d) {return getX(d) + getWidth()})
      .attr('y1', getMedianY)
      .attr('y2', getMedianY)
      .attr('stroke', getStroke())

    /**
    * Exit
    **/

    groups.exit()
      .remove()

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

    /**
    * Add brush after painting geoms
    **/

    var brushElem = g.append('g')
      .attr('class', 'brush')
      .append('rect')
        .attr('height', chart.height)
        .attr('class', 'viewport');

    var brush = d3.svg.brush()
      .x(x)
      .on('brushend', handleBrushend)

    d3.select(chart.container).select('.brush').call(brush)
      .selectAll('rect')
      .attr('height', chart.height)

    var initialX = _.chain(data)
      .map('level')
      .take(chart.initialObservations)
      .value()

    d3.select('.brush').transition()
      .call(brush.extent([
        x(_.first(initialX)),
        x(_.last(initialX)) + x.rangeBand()
      ]));

    function handleBrushend() {
      var extent = brush.extent(),
          first = Math.floor( extent[0]/x.rangeBand() ),
          last = Math.ceil( extent[1]/x.rangeBand() );

      window.updatePriceByFactor({
        data: chart.json,
        first: first,
        last: last
      });
    }

    /**
    * Helpers
    **/

    function getX(d) {
      return x(d.level);
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
      return x.rangeBand() - 2;
    }

    function getMedianY(d) {
      return y(d['50'])
    }

    function getStroke() {
      return '#000'
    }
  }

  /**
  * Button click callback
  **/

  function handleButtonClick(e) {
    var self = this;
    for (var i=0; i<buttons.length; i++) {
      var elem = buttons[i];
      elem.className = elem.id === self.id ?
          'factor-button active'
        : 'factor-button'
    }

    // sort the data by median values and initialize both charts
    d3.json(chart.data.dir + chart.data.file, function(json) {
      var factorData = json[self.id],
          sortedData = _.sortBy(factorData, '50');

      title.textContent = self.textContent;
      chart.json = sortedData;
      updateBrush(sortedData);
      window.updatePriceByFactor({
        data: sortedData,
        first: 0,
        last: chart.initialObservations
      });
    })
  }

  /**
  * Add event listeners
  **/

  var buttonContainer = document.querySelector('.price-by-factor-buttons'),
      buttons = buttonContainer.querySelectorAll('.factor-button'),
      title = document.querySelector('.factor-title');

  for (var i=0; i<buttons.length; i++) {
    var elem = buttons[i];
    elem.addEventListener('click', handleButtonClick)
  }

  // initialize the chart
  buttons[0].click();
})()
