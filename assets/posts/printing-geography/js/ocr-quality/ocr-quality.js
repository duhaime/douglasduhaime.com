;(function() {
  var dir = '/assets/posts/printing-geography/js/ocr-quality/',
      path = dir + 'parsed-words-filelist.json',
      imgs = 'https://s3.amazonaws.com/duhaime/blog/printing-geography/ocr-word-samples/',
      container = document.querySelector('#cropped-words'),
      parent = document.createElement('div');
  d3.json(path, function(data) {
    // sort the data by pub city
    var d = {};
    data.forEach(function(i) {
      var city = i.split('-')[1];
      Array.isArray(d[city])
        ? d[city].push(i)
        : d[city] = [i];
    })
    // sort each city by ocr quality and render
    var cities = ['London', 'Edinburgh', 'Dublin'];
    for (var i=0; i<cities.length; i++) {
      var city = cities[i];
      var column = document.createElement('div');
      column.className = 'city-word-col';
      // sort the city's values by ocr value
      var vals = d[city];
      vals.sort(function(a, b) {
        return parseFloat(a.split('-')[2]) > parseFloat(b.split('-')[2])
          ? 0
          : -1;
      })
      vals.slice(0,40).forEach(function(j) {
        var img = document.createElement('img');
        img.src = imgs + j;
        img.className = 'cropped-word ' + city;
        column.appendChild(img);
      })
      container.appendChild(column);
    }
  })
})();
