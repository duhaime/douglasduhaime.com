(function() {

  /**********************
  * Create poet network *
  **********************/

  var width = 1000,
    height = 1300;

  var margin = {
    top: 40,
    right: 160,
    bottom: 160,
    left: 160
  }

  var chart = {
    container: '#poet-networks',
    height: height - margin.top - margin.bottom,
    width: width - margin.right - margin.left,
    accentColor: '#b0cce7',
    headshotSize: 15,
    data: {
      dir: '/assets/pages/poet-constellations/',
      file: 'poet_constellations_static.json'
    }
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
    .attr('stdDeviation','2.5')
    .attr('result','coloredBlur');

  var feMerge = filter.append('feMerge');

  feMerge.append('feMergeNode')
    .attr('in','coloredBlur');

  feMerge.append('feMergeNode')
    .attr('in','SourceGraphic');

  /**
  * Image data
  **/

  var imagePath = '/assets/pages/poet-constellations/images/resized-headshots/';

  var idToImage = {
    24:    'edmund-spenser-headshot.jpg',
    28:    'walter-raleigh-headshot.jpg',
    29:    'philip-sidney-headshot.jpg',
    42:    'george-chapman-headshot.jpg',
    48:    'john-harington-headshot.jpg',
    49:    'samuel-daniel-headshot.jpg',
    51:    'michael-drayton-headshot.jpg',
    55:    'christopher-marlowe-headshot.jpg',
    86:    'ben-jonson-headshot.jpg',
    87:    'thomas-dekker-headshot.jpg',
    89:    'john-donne-headshot.jpg',
    108:   'john-fletcher-headshot.jpg',
    1181:  'mary-wortley-montagu-headshot.jpg',
    1184:  'john-wilson-croker-headshot.jpg',
    32771: 'francis-beaumont-headshot.jpg',
    32792: 'robert-herrick-headshot.jpg',
    32824: 'john-milton-headshot.jpg',
    32874: 'john-dryden-headshot.jpg',
    32896: 'nahum-tate-headshot.jpg',
    32851: 'andrew-marvell-headshot.jpg',
    32898: 'john-oldham-headshot.jpg',
    32916: 'matthew-prior-headshot.jpg',
    32768: 'philip-massinger-headshot.jpg',
    32967: 'alexander-pope-headshot.jpg',
    32925: 'joseph-addison-headshot.jpg',
    32815: 'william-davenant-headshot.jpg',
    32958: 'john-gay-headshot.jpg',
    32982: 'lord-chesterfield-headshot.jpg',
    32920: 'jonathan-swift-headshot.jpg',
    32890: 'nathaniel-lee-headshot.jpg',
    32972: 'samuel-richardson-headshot.jpg',
    32875: 'katherine-phillips-headshot.jpg',
    32885: 'thomas-shadwell-headshot.jpg',
    32927: 'richard-steele-headshot.jpg',
    32921: 'william-congreve-headshot.jpg',
    32841: 'abraham-cowley-headshot.jpg',
    33457: 'john-keats-headshot.jpg',
    33015: 'john-wesley-headshot.jpg',
    33128: 'oliver-goldsmith-headshot.jpg',
    33136: 'william-cowper-headshot.jpg',
    33049: 'david-hume-headshot.jpg',
    33202: 'anna-laetitia-barbauld-headshot.jpg',
    33302: 'william-lisle-bowles-headshot.jpg',
    33142: 'richard-cumberland-headshot.jpg',
    33278: 'william-blake-headshot.jpg',
    33073: 'elizabeth-montague-headshot.jpg',
    33039: 'samuel-johnson-headshot.jpg',
    33366: 'william-hazlitt-headshot.jpg',
    33285: 'robert-burns-headshot.jpg',
    33120: 'thomas-percy-headshot.jpg',
    33062: 'thomas-gray-headshot.jpg',
    33137: 'erasmus-darwin-headshot.jpg',
    33091: 'adam-smith-headshot.jpg',
    33672: 'anne-finch-headshot.jpg',
    33261: 'george-crabbe-headshot.jpg',
    33200: 'anna-seward-headshot.jpg',
    33312: 'john-thelwall-headshot.jpg',
    33595: 'colin-maclaurin-headshot.jpg',
    33194: 'george-chalmers-headshot.jpg',
    33114: 'edmund-burke-headshot.jpg',
    33026: 'henry-fielding-headshot.jpg',
    33154: 'james-beattie-headshot.jpg',
    33332: 'james-hogg-headshot.jpg',
    32997: 'james-thomson-headshot.jpg',
    33222: 'john-aikin-headshot.jpg',
    33088: 'joseph-warton-headshot.jpg',
    33409: 'lord-byron-headshot.jpg',
    33078: 'mark-akenside-headshot.jpg',
    33066: 'hugh-blair-headshot.jpg',
    33013: 'robert-dodsley-headshot.jpg',
    33346: 'robert-southey-headshot.jpg',
    33342: 'samuel-coleridge-headshot.jpg',
    33307: 'samuel-rogers-headshot.jpg',
    33338: 'walter-scott-headshot.jpg',
    33276: 'william-godwin-headshot.jpg',
    33057: 'william-shenstone-headshot.jpg',
    33333: 'william-wordsworth-headshot.jpg',
    33040: 'george-lyttelton-headshot.jpg',
    33111: 'thomas-warton-headshot.jpg',
    33065: 'horace-walpole-headshot.jpg',
    33451: 'john-gibson-lockhart-headshot.jpg',
    33316: 'isaac-disraeli-headshot.jpg',
    33213: 'henry-mackenzie-headshot.jpg',
    33080: 'william-collins-headshot.jpg'
  }

  // identify node ids that have images
  var imageIds = _.keys(idToImage).map(function(k) { return parseInt(k) });

  /**
  * Loda data
  **/

  d3.json(chart.data.dir + chart.data.file, function(error, graph) {
    if (error) throw error;

    /**
    * Search helpers
    **/

    var nameToId = {};
    var idToNode = {};
    graph.nodes.map(function(n) {
      nameToId[n.name] = n.id;
      idToNode[n.id] = n;
    });

    function findPoet(poetId) {
      handleMouseenter(_.find(graph.nodes, function(d) {
        return d.id === poetId
      }));
    }

    window.poetNetwork = window.poetNetwork || {
      graphNodes: graph.nodes,
      nameToId: nameToId,
      idToNode: idToNode,
      findPoet: findPoet,
      clearGraph: clearGraph
    };

    /**
    * Scales
    **/

    var color = d3.scale.ordinal()
      .domain( _.map(graph.nodes, 'gender') )
      .range(['#e5e5e5', '#e45656'])

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
          .attr('xlink:href', function(d) { return imagePath + idToImage[d] });

    var node = g.selectAll('.node')
        .data(graph.nodes, function(d) { return d.id }) 
      .enter().append('circle')
        .attr('class', 'node')
        .attr('id', function(d) { return 'node-' + d.id })
        .attr('cx', function(d) { return d.x })
        .attr('cy', function(d) { return d.y })
        .style('opacity', 0)
        .attr('r', getRadius)
        .style('fill', getFill)
        .style('filter', getFilter)
        .on('mouseenter', handleMouseenter);

    node.transition()
      .duration(1000)
      .style('opacity', 1)

    /**
    * Node attribute functions
    **/

    function getRadius(d) {
      return _.includes(imageIds, d.id) ?
          chart.headshotSize
        : Math.log(d.associates.length + 2) * 1.7
    }

    function getFill(d) {
      return _.includes(imageIds, d.id) ?
          'url(#' + d.id + ')'
        : d3.rgb(color(d.gender)).brighter(Math.log(d.associates.length+.1)/4)
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

      // if the user already moused this node, exit
      if ( _.isEqual(mousedNode, d) ) return;
      mousedNode = d;

      /**
      * Get transition data
      **/

      var linkData = [];
      var linkNodeIds = [d.id];
      var labelNodes = [{
        x: d.x,
        y: d.y,
        name: d.name,
        r: getRadius(d)
      }];
      var labelAnchors = [{
        x: d.x,
        y: d.y,
        r: getRadius(d)
      }]

      d.associates.forEach(function(associateId) {
        var associateNode = idToNode[associateId];

        // used to draw links between nodes
        linkData.push({
          source: d,
          target: associateNode
        })

        // used to update node attributes
        linkNodeIds.push(associateId)

        // used to update labels
        labelNodes.push({
          x: associateNode.x,
          y: associateNode.y,
          name: associateNode.name
        })
        labelAnchors.push({
          x: associateNode.x,
          y: associateNode.y,
          r: getRadius(associateNode)
        })
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
          : 0.1
        })
        .select(function(d) {
          // remove and reappend selected nodes to stack
          // nodes atop links
          if (_.includes(linkNodeIds, d.id)) {
            var parent = this.parentNode;
            parent.removeChild(this)
            parent.appendChild(this);
          }
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

      labels.each(function(d, i) {
        labelNodes[i].width = this.getBBox().width;
        labelNodes[i].height = this.getBBox().height;
      });

      d3.labeler()
        .label(labelNodes)
        .anchor(labelAnchors)
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