(function() {

  function get(url, onLoad) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        onLoad(JSON.parse(xhr.responseText))
      };
    };
    xhr.open('GET', url, true);
    xhr.send();
  };

  function load() {
    get(url, function(d) {
      data = d;
      getSample();
    })
  }

  function getSample() {
    var idx = Math.floor(Math.random() * data.length);
    var sample = data[idx];
    drawData(sample);
  }

  function cut(s) {
    return s.length > 140
      ? s.substring(0, 140) + '...'
      : s;
  }

  function drawData(obj) {
    var a = {
      'text': obj['a_text'],
      'author': obj['a_name'] || 'Unknown',
      'title': obj['a_display_title'],
      'imprint': obj['a_publisher'],
      'year': obj['a_year'],
    };
    var b = {
      'text': obj['b_text'],
      'author': obj['b_name'] || 'Unknown',
      'title': obj['b_display_title'],
      'imprint': obj['b_publisher'],
      'year': obj['b_year'],
    };
    if (a.year < b.year) {
      aBlock.innerHTML = _.template(template)({data: a});
      bBlock.innerHTML = _.template(template)({data: b});
    } else {
      aBlock.innerHTML = _.template(template)({data: b});
      bBlock.innerHTML = _.template(template)({data: a});
    }
  }

  var url = '/assets/posts/press-piracy/json/sample-text-matches.json',
      template = document.querySelector('#text-block-template').innerHTML,
      refresh = document.querySelector('#sample-text-refresh'),
      aBlock = document.querySelector('#sample-text-a'),
      bBlock = document.querySelector('#sample-text-b'),
      data = null;

  refresh.addEventListener('click', getSample)
  load();

})()