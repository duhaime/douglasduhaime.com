(function() {

  var data;

  var dir = '/assets/posts/printing-geography/js/counties/',
      container = '#county-publications';

  var colors = d3.scaleLinear()
    .domain([0, 1])
    .range(['cornsilk', 'red']);

  var projection = d3
    .geoMercator()
    .scale(480) // zoom
    .center([39.0, 40.0]); // starting lat,lng

  var graticule = d3.geoGraticule()
    .step([2,2])

  var path = d3.geoPath().projection(projection);

  d3.json(dir + 'county_publication_counts.geojson', function(json) {
    data = json;
    for (var i=0; i<12; i++) draw(1580 + (i*20));
  })

  var draw = function(year) {

    var map = d3.select(container)
      .append('svg')
      .attr('width', 218)
      .attr('height', 135)
      .attr('id', 'map-' + year)

    map.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', path);

    map.append('text')
      .attr('x', 10)
      .attr('y', 30)
      .style('font-size', '20px')
      .style('font-family', 'Montserrat, sans-serif')
      .style('fill', '#666')
      .text(year)

    // draw the paths
    var paths = map.selectAll('path').data(data.features),
        exp = d3.scaleLog().domain(getDomain(data, year));

    paths.enter()
      .append('path')
      .attr('class', 'terrain')
      .attr('d', path)
      .attr('stroke', '#4a4a4a')
      .attr('stroke-width', ' 0.01em')
      .attr('fill', getFill.bind(null, year, exp))

    paths.transition()
      .duration(1000)
      .attr('fill', getFill.bind(null, year, exp))
  };

  // find the min and max publication counts
  function getDomain(data, year) {
    var min = Number.POSITIVE_INFINITY,
        max = Number.NEGATIVE_INFINITY;
    data.features.map(function(feature) {
      feature.data.map(function(o) {
        if (o.year === year) {
          if (o.val < min) min = o.val;
          if (o.val > max) max = o.val;
        }
      })
    })
    return [min, max];
  }

  // get the fill attribute for a path
  function getFill(year, exp, d) {
    var datum = d.data.filter(function(i) {return i.year == year});
    return datum.length
      ? colors( exp(datum[0].val) )
      : '#F5F5F3';
  }

})();
