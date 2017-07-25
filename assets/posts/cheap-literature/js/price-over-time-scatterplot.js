(function() {

  var laborData = [
    {year: 1701, laborValue: 76},
    {year: 1710, laborValue: 84},
    {year: 1730, laborValue: 88},
    {year: 1736, laborValue: 92},
    {year: 1773, laborValue: 96},
    {year: 1776, laborValue: 106},
    {year: 1791, laborValue: 116},
    {year: 1802, laborValue: 144}
  ]

  var priceData = {
    dir: '/assets/posts/cheap-literature/data/',
    file: 'price-by-size.json'
  }

  d3.json(priceData.dir + priceData.file, function(json) {
    var octavos = [],
        quartos = [];
    json.forEach(function(d) {
      d.size === '8' ?
          octavos.push(d)
        : quartos.push(d)
    })

    var octavoOptions = new options();
    octavoOptions.container = '#octavos-over-time';
    octavoOptions.data = octavos;
    octavoOptions.title = 'Octavos';
    octavoOptions.stroke = function(d) { return '#ee6559'; };
    octavoOptions.fill = function(d) { return 'rgba(238, 101, 89, 0.8)'; };
    dd.chart(octavoOptions);
    
    var quartoOptions = new options();
    quartoOptions.container = '#quartos-over-time';
    quartoOptions.data = quartos;
    quartoOptions.title = 'Quartos';
    quartoOptions.yLabel = 'Price in Farthings';
    quartoOptions.yLabelOffset = 15;
    quartoOptions.stroke = function(d) { return '#e7ba52'; };
    quartoOptions.fill = function(d) {return 'rgba(231, 186, 82, 0.8)'; };
    dd.chart(quartoOptions);

    var laborOptions = new options();
    laborOptions.y = 'laborValue';
    laborOptions.container = '#labor-over-time';
    laborOptions.data = laborData;
    laborOptions.title = 'Craftsmen Daily Wage';
    laborOptions.stroke = function(d) { return 'rgba(31, 119, 180, 0.5)'; };
    laborOptions.fill = function(d) { return 'rgba(31, 119, 180, 0.4)'; };
    laborOptions.drawLines = true;
    dd.chart(laborOptions);
  })

  var options = function() {
    return {
      height: 190,
      width: 700,
      grid: true,
      x: 'year',
      y: 'mean_price',
      r: 4,
      interpolate: 'basis',
      ticks: {
        x: function(d) {return d},
        y: function(d) {return d}
      },
      margin: {
        top: 40,
        right: 20,
        bottom: 25,
        left: 50
      },
      drawPoints: true
    }
  }

})();