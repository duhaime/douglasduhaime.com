/***
* Coccurrence plot
***/

function select_json(new_json) {
  var margin = {
      top: 120,
      right: 0,
      bottom: 10,
      left: 180
  };
  var width = 600;
  var height = 600;

  var x = d3.scale.ordinal().rangeBands([0, width]),
    z = d3.scale.linear().domain([0, 4]).clamp(true),
    c = ['#9467bd', '#17becf', '#d62728', '#bcbd22', '#ff7f0e', '#1f77b4', '#e377c2'];  
 
  var svg = d3.select('#cooccurrence').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');  

    // Based on the user-selected input text above, make the appropriate api call and retrieve the json 
    d3.json(new_json, function(play_object) {
      var matrix = [],
        nodes = play_object.nodes,
        n = nodes.length;

      // Compute index per node.
      nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) {
          return {
            x: j,
            y: i,
            z: 0
          };
        });
      });

      // Convert links to matrix; count character occurrences.
      play_object.links.forEach(function(link) {
        matrix[link.source][link.source].z += link.value;
        matrix[link.source][link.target].z += link.value;
        matrix[link.target][link.source].z += link.value;
        matrix[link.target][link.target].z += link.value;
        nodes[link.source].count += link.value;
        nodes[link.target].count += link.value;
      });
      
      // Precompute the orders.
      var orders = {
        name: d3.range(n).sort(function(a, b) {
          return d3.ascending(nodes[a].name, nodes[b].name);
        }),
        count: d3.range(n).sort(function(a, b) {
          return nodes[b].count - nodes[a].count;
        }),
        group: d3.range(n).sort(function(a, b) {
          return nodes[b].group - nodes[a].group;
        }),
        gender: d3.range(n).sort(function(a, b) {
          return nodes[b].gender - nodes[a].gender;
        })
      };
      // Use currently selected value of the orders dropdown
      // to determine the current sort choice 
      var orderValue = d3.select('#order').property('value');
      if (orderValue === 'name'){
        x.domain(orders.name);
      } else if (orderValue === 'count'){
        x.domain(orders.count);
      } else if (orderValue === 'group'){
        x.domain(orders.group);
      } else if (orderValue === 'gender'){
        x.domain(orders.gender);
      };
      // Use currently selected value of the color dropdown
      // to determine the current sort choice 
      var colorValue = d3.select('#color-dropdown').property('value'); 
       
      svg.append('rect')
        .attr('class', 'background')
        .attr('width', width)
        .attr('height', height);
      var row = svg.selectAll('.row')
        .data(matrix)
        .enter().append('g')
        .attr('class', 'row')
        .attr('transform', function(d, i) {
          return 'translate(0,' + x(i) + ')';
        })
        .each(row);
      row.append('line')
        .attr('x2', width);
      row.append('text')
        .attr('x', -6)
        .attr('y', x.rangeBand() / 2)
        .attr('dy', '.32em')
        .attr('text-anchor', 'end')
        .text(function(d, i) {
          return nodes[i].name;
        });
      var column = svg.selectAll('.column')
        .data(matrix)
        .enter().append('g')
        .attr('class', 'column')
        .attr('transform', function(d, i) {
          return 'translate(' + x(i) + ')rotate(-90)';
        });
      column.append('line')
        .attr('x1', -width);
      column.append('text')
        .attr('x', 6)
        .attr('y', x.rangeBand() / 2)
        .attr('dy', '.32em')
        .attr('text-anchor', 'start')
        .text(function(d, i) {
          return nodes[i].name;
        });
      function row(row) { 
        var cell = d3.select(this).selectAll('.cell')
          .data(row.filter(function(d) {
            return d.z;
          }))
          .enter().append('rect')
          .attr('class', 'cell')
          .attr('x', function(d) {
            return x(d.x);
          })
          .attr('width', x.rangeBand())
          .attr('height', x.rangeBand())
          .style('fill-opacity', function(d) {
            return z(d.z);
          })
          .style('fill', function(d) {
            if (colorValue === 'gender') {
              return nodes[d.x].gender == nodes[d.y].gender ? c[nodes[d.x].gender] : null;
            } else {
              return nodes[d.x].group == nodes[d.y].group ? c[nodes[d.x].group] : null;
            }
          })
          .on('mouseover', mouseover)
          .on('mouseout', mouseout);
      }
      function mouseover(p) {
        d3.select('#cooccurrence').selectAll('.row text').classed('active', function(d, i) {
          return i == p.y;
        });
        d3.select('#cooccurrence').selectAll('.column text').classed('active', function(d, i) {
          return i == p.x;
        });
      }
      function mouseout() {
        d3.selectAll('text').classed('active', false);
      }
      d3.select('#order').on('change', function() {
        clearTimeout(timeout);
        order(this.value);
      });
      function order(value) {
        x.domain(orders[value]);
        var t = svg.transition().duration(2500);
        t.selectAll('.row')
          .delay(function(d, i) {
            return x(i) * 4;
          })
          .attr('transform', function(d, i) {
            return 'translate(0,' + x(i) + ')';
          })
          .selectAll('.cell')
          .delay(function(d) {
            return x(d.x) * 4;
          })
          .attr('x', function(d) {
            return x(d.x);
          });
        t.selectAll('.column')
          .delay(function(d, i) {
            return x(i) * 4;
          })
          .attr('transform', function(d, i) {
            return 'translate(' + x(i) + ')rotate(-90)';
          });
      }
      var timeout = setTimeout(function() {
        order('group');
        d3.select('#order').property('selectedIndex', 2).node().focus();
      }, 50000000);
  });
}

var initializeCooccurrence = function() {
  // set initial json selection
  var jsonPath = 'https://s3.amazonaws.com/duhaime-shakespeare/folger-json/'

  select_json(jsonPath + '1H4.json', 0);

  // handle on click event
  d3.select('#selected-json').on('change', function() {
    d3.select('#cooccurrence').select('svg').remove(); 
    var new_json = d3.select(this).property('value');  
    select_json(jsonPath + new_json);
  });

  d3.select('#color-dropdown').on('change', function() {
    var colorIndex = this.selectedIndex; 
    var current_json = d3.select('#selected-json').property('value');
    d3.select('#cooccurrence').select('svg').remove();
    select_json(jsonPath + current_json);
  });
}

initializeCooccurrence()