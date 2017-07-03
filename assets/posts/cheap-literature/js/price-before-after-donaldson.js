(function() {
  
  var margin = {
    top: 20,
    right: 20,
    bottom: 60,
    left: 70
  }

  var ticks = {
    x: function(d) {return d},
    y: function(d) {return d}
  }

  var domains = {
    x: [0, 370],
    y: [0, 370]
  }

  var options = {
    container: '#before-after-donaldson',
    height: 450,
    width: 700,
    grid: true,
    x: 'after_1774',
    y: 'before_1774',
    r: 4,
    ticks: ticks,
    margin: margin,
    domains: domains,
    stroke: function(d) { return 'rgba(31, 119, 180, 0.5)'; },
    fill: function(d) { return 'rgba(31, 119, 180, 0.6)' },
    xLabel: 'Price in Farthings After 1774',
    yLabel: 'Price in Farthings Before 1774',
    xLabelOffset: 15,
    yLabelOffset: 15,
    drawPoints: true
  }

  var data = {
    dir: '/assets/posts/cheap-literature/data/',
    file: 'price-before-after-donaldson.json'
  }

  d3.json(data.dir + data.file, function(json) {
    options.data = json;
    dd.chart(options)
  })

})()