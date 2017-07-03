(function() {
  
  var state = {
    'slope': 'neutral',
    'subject': 'england'
  }

  var margin = {
    top: 20,
    right: 20,
    bottom: 60,
    left: 70
  }

  var ticks = {
    x: function(d) { return d },
    y: function(d) {
      var vals = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
      return vals.includes(d) ?
          d
        : '' }
  }

  var domains = {
    x: [1700, 1800],
    y: [1, null]
  }

  var scales = {
    y: 'log'
  }

  var jitter = {
    y: 2
  }

  var colors = {
    'negative': '#ee6559',
    'neutral': '#e7ba52',
    'positive': '#1f77b4',
  }

  var options = {
    container: '#price-by-title',
    height: 400,
    width: 700,
    x: 'year',
    y: 'mean_farthings',
    ticks: ticks,
    margin: margin,
    domains: domains,
    scales: scales,
    yLabel: 'Price in Farthings',
    yLabelOffset: 15,
    drawLines: true,
    key: function(d) { return d.title_cluster + '.' + d.segment },
    jitter: jitter
  }

  var updateChart = null;

  function redraw() {
    var dir = '/assets/posts/cheap-literature/data/price-by-title/',
        file = state.subject + '-' + state.slope + '.json';

    d3.json(dir + file, function(json) {
      options.data = json;
      options.stroke = function(d) { return colors[state.slope]; };
      options.fill = function(d) { return colors[state.slope]; };

      if (updateChart) {
        updateChart(options)
      } else {
        updateChart = dd.chart(options);
      }      
    })
  }

  /**
  * Add event listeners
  **/

  function handleSlopeClick(e) {
    var self = this;
    state.slope = self.id;

    for (var i=0; i<slopeButtons.length; i++) {
      var elem = slopeButtons[i];
      elem.className = elem.id === self.id ?
          'slope-button active'
        : 'slope-button';
    }
    redraw();
  }

  function handleSubjectClick(e) {
    var self = this;
    state.subject = self.id;

    for (var i=0; i<subjectButtons.length; i++) {
      var elem = subjectButtons[i];
      elem.className = elem.id === self.id ?
          'subject-button active'
        : 'subject-button'; 
    }
    redraw();
    
  }

  var slopeButtons = document.querySelectorAll('.slope-button'),
      subjectButtons = document.querySelectorAll('.subject-button');

  for (var i=0; i<slopeButtons.length; i++) {
    var elem = slopeButtons[i];
    elem.addEventListener('click', handleSlopeClick)
  }

  for (var i=0; i<subjectButtons.length; i++) {
    var elem = subjectButtons[i];
    elem.addEventListener('click', handleSubjectClick)
  }

  // initialize the chart
  redraw();

})()