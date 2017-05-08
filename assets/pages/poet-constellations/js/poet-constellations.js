(function() {

  /**********************
  * Create poet network *
  **********************/

  var width = 860,
    height = 1500;

  var margin = {
    top: 30,
    right: 30,
    bottom: 25,
    left: 30
  }

  var chart = {
    container: '#poet-networks',
    height: height - margin.top - margin.bottom,
    width: width - margin.right - margin.left,
    dataPath: '/assets/pages/poet-constellations/poet_constellations.json',
    accentColor: '#b0cce7',
    headshotSize: 22
  }

  var svg = d3.select(chart.container).append('svg')
      .attr('width', width)
      .attr('height', height);

  var g = svg.append('g')
      .attr('class', 'network-container')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  /**
  * Glow filter
  **/

  var defs = svg.append('defs');

  var filter = defs.append('filter')
    .attr('id','glow');
  filter.append('feGaussianBlur')
    .attr('stdDeviation','3.5')
    .attr('result','coloredBlur');
  var feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode')
    .attr('in','coloredBlur');
  feMerge.append('feMergeNode')
    .attr('in','SourceGraphic');

  /**
  * Image data
  **/

  var idToImage = {
    32967: '/assets/pages/poet-constellations/images/resized-headshots/alexander-pope-headshot.jpg',
    32874: '/assets/pages/poet-constellations/images/resized-headshots/john-dryden-headshot.jpg',
    32958: '/assets/pages/poet-constellations/images/resized-headshots/john-gay-headshot.jpg',
    32824: '/assets/pages/poet-constellations/images/resized-headshots/john-milton-headshot.jpg',
    33015: '/assets/pages/poet-constellations/images/resized-headshots/john-wesley-headshot.jpg',
    32920: '/assets/pages/poet-constellations/images/resized-headshots/jonathan-swift-headshot.jpg',
    33128: '/assets/pages/poet-constellations/images/resized-headshots/oliver-goldsmith-headshot.jpg'
  }

  // identify node ids that have images
  var imageIds = _.keys(idToImage).map((k) => parseInt(k));

  /**
  * Loda data
  **/

  d3.json(chart.dataPath, function(error, graph) {
    if (error) throw error;

    /**
    * Search helpers
    **/

    var nameToId = {};
    graph.nodes.map(function(n) {
      nameToId[n.name] = n.id;
    })

    function findPoet(poetId) {
      var matchingNodes = _.filter(graph.nodes, function(d) {
        return d.id === poetId;
      })

      handleMouseenter(matchingNodes[0]);
    }

    window.poetNetwork = window.poetNetwork || {
      graphNodes: graph.nodes,
      nameToId: nameToId,
      findPoet: findPoet,
      clearGraph: clearGraph
    };

    /**
    * Scales
    **/

    var y = d3.scale.linear()
      .domain( d3.extent( _.map(graph.nodes, 'year') ) )
      .range([0, chart.height])

    var color = d3.scale.ordinal()
      .domain( _.map(graph.nodes, 'gender') )
      .range(['#ffffff', '#e45656'])

    /**
    * Force configuration
    **/

    var force = d3.layout.force()
      .gravity(0.2)
      .friction(0.95)
      .charge(function(d) {
        return -1 * (d.associates*50)
      })
      .alpha(0.5)
      .linkDistance(10)
      .size([chart.width, chart.height])
      .nodes(graph.nodes)
      .links(graph.links)
      .on('tick', tick)
      .start();

    function tick(e) {
      var k = .1 * e.alpha;

      // gravitate points toward their year
      // and the center of the chart
      graph.nodes.forEach(function(d) {
        d.y += (y(d.year) - d.y) * k;
        d.y += (height/2 - d.y) * 3*k;
        d.x += (width/2 - d.x) * 5*k;
      })

      node.attr('cx', function(d) { return d.x; })
      node.attr('cy', function(d) { return d.y; })
    }

    /**
    * Enter and update
    **/

    var image = g.selectAll('.selected-node')
        .data( _.keys(idToImage) )
      .enter().append('pattern')
        .attr('id', function(d) { return parseInt(d) })
        .attr('x', '0')
        .attr('y', '0')
        .attr('height', '1')
        .attr('width', '1')
        .append('image')
          .attr('x', '0')
          .attr('y', '0')
          .attr('height', chart.headshotSize * 2 + 'px')
          .attr('width', chart.headshotSize * 2 + 'px')
          .attr('xlink:href', function(d) { return idToImage[d] });

    var node = g.selectAll('.node')
        .data(graph.nodes, function(d) { return d.id }) 
      .enter().append('circle')
        .attr('class', 'node')
        .attr('id', function(d) {
          return 'node-' + d.id
        })
        .attr('r', getRadius)
        .style('fill', getFill)
        .style('filter', getFilter)
        .on('mouseenter', handleMouseenter)
        .call(force.drag)

    /**
    * Node attribute functions
    **/

    function getRadius(d) {
      return _.includes(imageIds, d.id) ?
          chart.headshotSize
        : Math.log(d.associates + 2) * 1.7
    }

    function getFill(d) {
      return _.includes(imageIds, d.id) ?
          'url(#' + d.id + ')'
        : d3.rgb( color(d.gender) ).darker(Math.log(d.associates+.1)/10)
    }

    function getActiveFill(d) {
      return _.includes(imageIds, d.id) ?
          'url(#' + d.id + ')'
        : '#f7ba39'
    }

    function getFilter(d) {
      return _.includes(imageIds, d.id) ?
          'url(#glow)'
        : null
    }

    /**
    * Node mouseover callback
    **/

    // cache the moused over point to prevent re-entry
    var mousedNode = null;

    function handleMouseenter(d) {

      if ( _.isEqual(mousedNode, d) ) return;
      mousedNode = d;

      /**
      * Get link data
      **/

      var linkData = _.filter(graph.links, function(l) {
        return l.source.index === d.index || l.target.index === d.index
      })

      /**
      * Start link transitions
      **/

      d3.selectAll('.link').remove()
      var links = g.selectAll('.link').data(linkData)

      links.enter().append('path')
        .attr('class', 'link')
        .attr('d', interpolateLink)

      /**
      * Get node data
      **/

      var linkNodeSet = new Set();
      linkData.map(function(l) {
        linkNodeSet.add(l.source)
        linkNodeSet.add(l.target)
      })

      var linkNodes = Array.from(linkNodeSet)
      var linkNodeIds = _.map(linkNodes, 'id')
      linkNodeIds.push(d.id)
      var linkNodeIds = _.uniq(linkNodeIds)

      /**
      * Begin node transitions
      **/

      g.selectAll('.node').transition()
        .duration(500)
        .style('fill', function(d) {
          return _.includes(linkNodeIds, d.id) ?
            getActiveFill(d)
          : getFill(d)
        })
        .style('opacity', function(d) {
          return _.includes(linkNodeIds, d.id) ?
            1
          : 0.2
        })

      /**
      * Get label data
      **/

      var labelFoci = [];
      var labelNodes = [];
      linkNodes.map(function(d) {
        labelFoci.push({ 
          x: d.x,
          y: d.y,
          r: getRadius(d)
        });
        labelNodes.push({
          x: d.x,
          y: d.y,
          name: d.name
        })
      })

      /**
      * Start label transitions
      **/

      d3.selectAll('.node-label').remove()
      var labels = g.selectAll('.node-label')
        .data(labelNodes);

      labels.enter().append('text')
        .attr('class', 'node-label')
        .attr('x', function(d) { return d.x + 5})
        .attr('y', function(d) { return d.y })
        .text(function(d) { return d.name })
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .attr('font-family', 'courier')

      /**
      * Reposition overlapping labels
      **/

      var index = 0;
      labels.each(function() {
        labelNodes[index].width = this.getBBox().width;
        labelNodes[index].height = this.getBBox().height;
        index += 1;
      });

      d3.labeler()
        .label(labelNodes)
        .anchor(labelFoci)
        .width(width)
        .height(height)
        .start(100);

      labels
        .transition()
        .duration(500)
        .attr('x', function(d) { return (d.x); })
        .attr('y', function(d) { return (d.y); });
    }

    function interpolateLink(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);

      return 'M' + d.source.x + ',' + d.source.y +
        'A' + dr + ',' + dr + ' 0 0,1 ' +
        d.target.x + ',' + d.target.y;
    }

    /**
    * Clear the graph of selections
    **/

    function clearGraph() {
      
      // remove last moused node from memory
      mousedNode = null;

      // reset nodes
      g.selectAll('.node').transition()
          .duration(500)
          .style('fill', getFill)
          .attr('r', getRadius)
          .style('opacity', 1)

      // clear links
      g.selectAll('.link').transition()
          .duration(500)
          .style('opacity', 0)
          .remove()

      // clear labels
      g.selectAll('.node-label')
          .transition()
          .duration(500)
          .style('opacity', 0)
          .remove()
    }

  });
})()