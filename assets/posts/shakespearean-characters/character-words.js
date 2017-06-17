function getTextWidth(text, font) {
  // re-use canvas object for better performance
  var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  var context = canvas.getContext('2d');
  context.font = font;
  var metrics = context.measureText(text);
  return metrics.width;
};

var characterWordsJson = 'https://s3.amazonaws.com/duhaime/blog/shakespearean-characters/json/words_by_entrance.json';
d3.json(characterWordsJson, function(error, data) {
  if (error) throw error;

  // specify div (id) to which we'll attach svg 
  var vizDiv = '#character-words';
  var vizDivStr = vizDiv.replace('#','');

  // specify font spec
  var fontSpec = '13pt Arial';
  
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

  x.domain(d3.extent(data, function(d) { return d.entrance; })).nice();
  y.domain(d3.extent(data, function(d) { return d.words; })).nice();

  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
    .append('text')
      .attr('class', 'label')
      .attr('x', width/2 + 160)
      .attr('y', +45)
      .style('text-anchor', 'end')
      .text('Words spoken before character enters play')
      .style('font-size','16px');

  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
    .append('text')
      .attr('class', 'label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -75)
      .style('text-anchor', 'end')
      .text('Words spoken by character')
      .style('font-size', '16px');

  svg.selectAll('.dot')
      .data(data)
    .enter().append('circle')
      .attr('class', 'dot')
      .attr('r', 3.5)
      .attr('cx', function(d) { return x(d.entrance); })
      .attr('cy', function(d) { return y(d.words); })
      .style('opacity', .9)
      .style('fill', function(d) { return color(d.gender); })
      .on('mouseover', function(d) {
        tooltip.transition()
        .duration(200)
        .style('opacity', .96);  
        tooltip.html(d.name + ' (' + d.play + ')') 
           .style('left', (parseInt(d3.select(this).attr('cx')) + 
                document.getElementById(vizDivStr).offsetLeft) +78 + 'px')     
           .style('top', (parseInt(d3.select(this).attr('cy')) +
                document.getElementById(vizDivStr).offsetTop) +5 + 'px') 
           .style('background-color', '#ffffff')
           .style('width', getTextWidth(d.name, fontSpec) + getTextWidth(d.play, fontSpec) + 2 + 'px')
           .style('height', 15 + 'px'); 
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
