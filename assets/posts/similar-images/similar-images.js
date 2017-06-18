/**
* Simple utilities for displaying similar images on the DOM
**/

(function() {

  var config = {
    nImages: 12
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

    images.forEach(function(d, i) {
      d.src = data.images + selected[i].image;
      d.removeEventListener('mouseover', handleMouseover);
      d.addEventListener('mouseover', handleMouseover);

      function handleMouseover(e) {
        getSimilarImages(e.target.src)
      }
    })
  }

  function getSimilarImages(imageSrc) {
    var imageName = imageSrc.split('/images/')[1].replace('.jpg', '.json'),
        matchImages = matches.querySelectorAll('img');
        dataPath = data.neighbors + imageName;

    d3.select(matches).select('.guide')
      .style('display', 'none')

    d3.json(dataPath, function(json) {
      var json = _.take(json, 5);
      matchImages.forEach(function(d, i) {
        d.src = data.images + json[i].filename + '.jpg';
        d.style.display = 'flex';
      })
    })
  }

  function initialize() {
    _.times(config.nImages).map(function(d) {
      d3.select(random).append('img');
    })

    _.times(5).map(function(d) {
      d3.select(matches).append('img').style('display', 'none');
    })
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
  refresh();

})()