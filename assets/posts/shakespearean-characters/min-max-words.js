var minMaxWordsJson ='https://s3.amazonaws.com/duhaime/blog/shakespearean-characters/json/min_max_words.json';

d3.json(minMaxWordsJson, function(error, data) {
  if (error) throw error;
  // specify the div (id) to which we'll attach the svg
  var vizDiv = '#min-max-words';
  var vizDivStr = vizDiv.replace('#','');
  // specify font spec
  fontSpec = 'bold 13pt Arial';
  var margin = {top: 20, right: 20, bottom: 50, left: 75},
      width = 650 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
  var x = d3.scale.linear()
      .range([0, width]);
  var y = d3.scale.linear()
      .range([height, 0]);
  var color = d3.scale.ordinal()
    .range(['#17becf', '#d62728']);
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');
  var tooltip = d3.select(vizDiv).append('div')
      .attr('class', 'tooltip')
      .style('opacity', 1);
  var svg = d3.select(vizDiv).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  x.domain(d3.extent(data, function(d) { return d.min['val']; })).nice();
  y.domain(d3.extent(data, function(d) { return d.max['val']; })).nice();
  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
    .append('text')
      .attr('class', 'label')
      .attr('x', 380)
      .attr('y', 45)
      .style('text-anchor', 'end')
      .text('Maximum words for gender')
      .style('font-size','16px');
  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
    .append('text')
      .attr('class', 'label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -60)
      .style('text-anchor', 'end')
      .text('Minimum words for gender')
      .style('font-size', '16px');
  svg.selectAll('.dot')
      .data(data)
    .enter().append('g')
      .attr('class', 'playTitle')
    .append('text')
      .attr('dx', function(d) { return x(d.min['val']); })
      .attr('dy', function(d) { return y(d.max['val']); })
      .text(function(d) { return d.play; })
      .style('fill',function(d) { return color(d.gender);})
      .on('mouseover', function(d) {
          tooltip.transition()
          .duration(200)
          .style('opacity', .96);  
          var currentGender = d.gender;
          tooltip.html('smallest role: ' + d.min['name'] + '</br>' +
                   'largest role: ' + d.max['name']) 
               .style('left', (parseInt(d3.select(this).attr('dx')) + 
                    document.getElementById(vizDivStr).offsetLeft) +97 + 'px')     
               .style('top', (parseInt(d3.select(this).attr('dy')) +
                    document.getElementById(vizDivStr).offsetTop) -16 + 'px') 
               .style('background-color', '#ffffff')
               .style('width', getTextWidth(d.max['name'], fontSpec) >
                    getTextWidth(d.min['name'], fontSpec) ? 
                    getTextWidth(d.max['name'], fontSpec) : 
                    getTextWidth(d.min['name'], fontSpec))
               .style('height', 30 + 'px')
          })
          .on('mouseout', function(d) {
              tooltip.transition()
                   .duration(500)
                   .style('opacity', 0);
          });   
  var legend = svg.selectAll('.legend')
      .data(color.domain())
    .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });
  legend.append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);
  legend.append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(function(d) { 
        if (d === 1) {
          return 'male';
        } else {
        if (d === 2) {
          return 'female';
          }
        } 
      });
});
