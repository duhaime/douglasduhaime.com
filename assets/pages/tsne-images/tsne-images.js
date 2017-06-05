(function() {

  var chart = {
    canvas: '#tsne-canvas',
    svg: '#tsne-svg',
    height: 1200,
    width: 1700,
    data: {
      projections: '/assets/posts/similar-images/data/image_tsne_projections.json',
      images: 'https://s3.amazonaws.com/duhaime/blog/image-similarity/images/'
    }
  }

  function drawChart(data) {
    var container = d3.select(chart.canvas)
      .attr('width', chart.width)
      .attr('height', chart.height)

    var svg = d3.select(chart.svg)
      .attr('width', chart.width)
      .attr('height', chart.height)

    var g = d3.select(chart.svg).append('g');

    var canvas = document.querySelector(chart.canvas),
        ctx = canvas.getContext('2d');

    var x = d3.scale.linear()
      .domain(d3.extent(data, function(d) { return d.x }))
      .range([0, chart.width])

    var y = d3.scale.linear()
      .domain(d3.extent(data, function(d) { return d.y }))
      .range([0, chart.height])

    /**
    * Paint the canvas black
    **/

    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fill();

    /**
    * Add the images to the canvas
    **/

    data.forEach(function(d, i) {
      addImage( i, d.image, x(d.x), y(d.y) )
    })

    function addImage(idx, src, x, y) {
      var img = new Image();
      img.onload = function() {
        data[idx].width = img.width/4;
        data[idx].height = img.height/4;

        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, x, y, data[idx].width, data[idx].height);
      }

      img.src = chart.data.images + src;
    }

    /**
    * Add voronoi overlay to canvas
    **/

    var voronoi = d3.geom.voronoi()
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); })
      .clipExtent([[0, 0], [chart.width, chart.height]]);

    var polygons = g.selectAll('path').data(voronoi(data));

    polygons.enter()
      .append('path')
      .attr('d', function(d, i) { return 'M' + d.join('L') + 'Z'; })
      .attr('stroke', '#fff')
      .on('mousemove', handleMousemove)
      .on('mouseexit', handleMouseexit)

    var tooltip = d3.select('#tooltip');

    function handleMousemove(d, i) {
      var mouse = d3.mouse(this);
      var image = data[i];

      tooltip
        .style('left', mouse[0] - image.width*2 + 'px')
        .style('top', mouse[1] - 200 + 'px')
        .style('opacity', 1)
        .select('img')
          .attr('src', chart.data.images + image.image)
          .attr('class', 'tooltip-image')
    }

    function handleMouseexit() {
      tooltip.style('opacity', 0)
    }
  }

  /**
  * Load the chart
  **/

  d3.json(chart.data.projections, drawChart)

})()