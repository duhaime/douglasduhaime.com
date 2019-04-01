;(function() {

  window.lightbox = function(selector, imgs) {
    var container = document.querySelector(selector);

    for (var i=0; i<imgs.length; i++) {

      // create default displayed image container - links to the larger img
      var thumb = document.createElement('a'),
          hash = 'lb-' + parseInt(Math.random() * 2**32);
      thumb.className = 'default-image';
      thumb.href = '#' + hash;

      // create the image within that container
      var img = document.createElement('img');
      img.src = imgs[i];
      img.alt = 'lightbox-displayed';
      thumb.appendChild(img);

      // create the larger lightbox image container
      var box = document.createElement('a');
      box.href = '#_';
      box.className = 'lightbox';
      box.id = hash;

      // create the lightbox image inside that container
      var larger = document.createElement('img');
      larger.src = imgs[i];
      larger.alt = 'lightbox large image';
      box.appendChild(larger);

      // add the children components
      container.appendChild(thumb);
      container.appendChild(box);
    }
  }

})();