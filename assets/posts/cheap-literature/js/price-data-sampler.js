/**
* Generate and display random samples of price data
**/

(function() {
  var container = document.querySelector('#price-data-sample'),
      table = container.querySelector('table'),
      button = document.querySelector('#refresh-sample'),
      datafile = '/assets/posts/cheap-literature/data/price-data-sample.json';

  var updateTable = function(data) {
    var sample = _.sampleSize(data, 5),
        cells = [];

    cells.push('<tr>');
    cells.push('<th>ESTC ID</th>');
    cells.push('<th>MARC PRICE</th>');
    cells.push('<th>FARTHINGS</th>');
    cells.push('</tr>');

    sample.forEach(function(d) {
      cells.push('<tr>');
      ['estc_id', 'marc_price', 'farthings'].forEach(function(level) {
        cells.push('<td><div>' + d[level] + '</div></td>')
      })
      cells.push('</tr>');
    });

    table.innerHTML = '<tbody>' + cells.join('') + '</tbody>';
  }

  var updateData = function() {
    d3.json(datafile, updateTable);
  }

  button.addEventListener('click', updateData);
  updateData();
})()