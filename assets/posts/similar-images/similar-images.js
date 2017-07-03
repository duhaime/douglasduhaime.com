/**
* Simple utilities for displaying similar images on the DOM
**/

(function() {

  var config = {
    nImages: window.innerWidth < 500 ? 3 : 12
  }

  var data = {
    projections: '/assets/posts/similar-images/data/image_tsne_projections.json',
    images: ' https://s3.amazonaws.com/duhaime/blog/image-similarity/images/',
    neighbors: 'https://s3.amazonaws.com/duhaime/blog/image-similarity/nearest-neighbors-json/',
  }

  var container = document.querySelector('.nearest-neighbors'),
      button = container.querySelector('button'),
      random = container.querySelector('.random'),
      matches = container.querySelector('.matches');

  function loadRandomImages(json) {
    var selected = _.sampleSize(json, config.nImages),
        images = random.querySelectorAll('img');

    for (var i=0; i<images.length; i++) {
      var elem = images[i];
      elem.src = data.images + selected[i].image;
      elem.removeEventListener('mouseover', handleMouseover);
      elem.addEventListener('mouseover', handleMouseover)
    }
  }

  function handleMouseover(e) {
    getSimilarImages(e.target.src)
  }

  function getSimilarImages(imageSrc) {
    var imageName = imageSrc.split('/images/')[1].replace('.jpg', '.json'),
        matchImages = matches.querySelectorAll('img');
        dataPath = data.neighbors + imageName;

    d3.select(matches).select('.guide')
      .style('display', 'none')

    d3.json(dataPath, function(json) {
      var json = _.take(json, 5);
      for (var i=0; i<matchImages.length; i++) {
        var elem = matchImages[i];
        elem.src = data.images + json[i].filename + '.jpg';
      }
    })

    matches.className = 'matches masonry-container';
  }

  function initialize() {
    _.times(config.nImages).map(function(d) {
      d3.select(random).append('img');
    })

    _.times(5).map(function(d) {
      d3.select(matches).append('img');
    })

    refresh();
  }

  function refresh() {
    d3.json(data.projections, loadRandomImages)  
  }

  /**
  * Add event listeners
  **/

  button.addEventListener('click', refresh)

  /**
  * Initialize the view
  **/

  initialize();

})()