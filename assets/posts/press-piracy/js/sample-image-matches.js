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

  function shuffle (array) {
    var i = 0,
        j = 0,
        item = null;

    for (i=array.length-1; i>0; i--) {
      j = Math.floor(Math.random() * i);
      item = array[i];
      array[i] = array[j];
      array[j] = item;
    };
    return array;
  };

  function draw() {
    elem.innerHTML = null;
    shuffle(data).slice(0, n).forEach(function(group, idx) {
      var img = group[0];
      addImage(elem, img, 'small');
    });
  };

  function addImage(container, id, imageSize) {
    var child = document.createElement('img');
    child.className = 'sample-image';
    child.src = s3 + '/' + imageSize + '/' + id + '.jpg';
    container.appendChild(child);
  };

  function activateImage(e) {
    var src = e.target.src;
    if (!src || src === active) return;
    active = src;
    deactivate();
    elem.className += ' active';
    e.target.className += ' active';
    var split = src.split('/');
    var key = split[split.length-1].split('.')[0];
    var group = map[key];
    group.forEach(function(img) {
      addImage(matches, img, 'medium');
    });
  };

  function deactivate() {
    matches.innerHTML = null;
    elem.className = elem.className.replace(' active', '');
    var imgs = elem.querySelectorAll('img');
    for (var i=0; i<imgs.length; i++) {
      imgs[i].className = imgs[i].className.replace(' active', '');
    };
  };

  function reset(e) {
    if (e.target.className.includes('sample-image')) return;
    deactivate();
    matches.appendChild(guide);
    active = null;
  };

  var s3 = 'https://s3.amazonaws.com/duhaime/blog/press-piracy/sample-image-matches';
  var refresh = document.querySelector('#refresh-sample-images');
  var matches = document.querySelector('#match-reel');
  var guide = document.querySelector('#match-guide');
  var elem = document.querySelector('#sample-images');
  var dataDir = '/assets/posts/press-piracy';
  var imageDir = dataDir + '/images/resized';
  var file = 'sample-image-matches.json';
  var active = null;
  var data = null;
  var map = {};
  var n = 200;

  refresh.addEventListener('click', draw);
  elem.addEventListener('click', activateImage);
  document.body.addEventListener('click', reset);

  get(dataDir + '/json/' + file, function(raw) {
    data = raw;
    data.forEach(function(i, idx) { map[i[0]] = i; })
    window.setTimeout(function() {
      refresh.click();
    }, 1000);
  });

})();