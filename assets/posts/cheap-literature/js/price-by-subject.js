(function() {

  var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 60
  }

  var ticks = {
    x: function(d) {return d},
    y: function(d) {return d}
  }

  var domains = {
    x: [1700, 1800],
    y: [0, 1.2]
  }

  var options = function() {
    return {
      container: '#price-by-subject',
      height: 400,
      width: 700,
      grid: true,
      x: 'year',
      y: 'normalized_price',
      r: 4,
      ticks: ticks,
      margin: margin,
      domains: domains,
      stroke: function(d) { return 'rgba(31, 119, 180, 0.5)'; },
      fill: function(d) { return 'rgba(31, 119, 180, 0.4)' },
      yLabel: 'Farthings per Page',
      yLabelOffset: 15,
      drawPoints: true
    }
  }

  var data = {
    dir: '/assets/posts/cheap-literature/data/price-by-subject/',
    prefix: 'price-by-subject-',
    suffix: '.json'
  }

  // store the update function
  var update = null;

  // initial chart json
  var initialfile =  data.dir + data.prefix + 'english-drama' + data.suffix;

  /**
  * Main chart drawing function
  **/

  function draw(value) {
    var filename = data.dir + data.prefix + value + data.suffix;

    d3.json(filename, function(json) {
      var priceBySubject = new options();
      priceBySubject.data = json.docs;

      // draw or redraw the chart
      if (update) {
        update(priceBySubject);
      } else {
        update = dd.chart(priceBySubject);
      }
    })
  }

  /**
  * Add event listeners
  **/

  function handleChange(e) {
    draw(e.target.value)
  }

  var container = document.querySelector('.price-by-subject'),
      select = container.querySelector('select');

  select.addEventListener('change', handleChange)

  /**
  * Initialize the chart
  **/

  draw('english-drama')

})()