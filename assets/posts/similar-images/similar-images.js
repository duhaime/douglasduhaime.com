/**
* Simple utilities for displaying similar images on the DOM
**/

(function() {

  var config = {
    nImages: window.innerWidth < 500 ? 6 : 10,
    nMatches: window.innerWidth < 500 ? 3 : 5,
    imageClass: 'image-cell'
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
        images = random.querySelectorAll('.' + config.imageClass);

    for (var i=0; i<images.length; i++) {
      var elem = images[i],
          elemSrc = data.images + selected[i].image;
      elem.style.backgroundImage = 'url(' + elemSrc + ')';
      elem.removeEventListener('mouseover', handleMouseover);
      elem.addEventListener('mouseover', handleMouseover);
    }
  }

  function handleMouseover(e) {
    getSimilarImages(e.target.style.backgroundImage)
  }

  function getSimilarImages(imageSrc) {
    var matchImages = matches.querySelectorAll('.' + config.imageClass),
        imageSrc = imageSrc.substring(5, imageSrc.length-2), // remove url(' ')
        imageName = imageSrc.split('/images/')[1].replace('.jpg', '.json'),
        dataPath = data.neighbors + imageName;

    d3.select(matches).select('.guide')
      .style('display', 'none')

    d3.json(dataPath, function(json) {
      var json = _.take(json, config.nMatches);
      for (var i=0; i<matchImages.length; i++) {
        var elem = matchImages[i],
            elemSrc = data.images + json[i].filename + '.jpg';
        elem.style.backgroundImage = 'url(' + elemSrc + ')';
      }
    })

    matches.className = 'matches masonry-container';
  }

  function getImage() {
    var imageContainer = document.createElement('div');
    imageContainer.className = config.imageClass + '-container';

    var image = document.createElement('div');
    image.className = 'background-image ' + config.imageClass;

    var combined = imageContainer.appendChild(image);
    return combined.parentNode;
  }

  function initialize() {
    _.times(config.nImages).map(function(d) {
      random.appendChild(getImage());
    })

    _.times(config.nMatches).map(function(d) {
      matches.appendChild(getImage());
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