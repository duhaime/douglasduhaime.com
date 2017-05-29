(function() {
  
  /**
  * Draw the grass
  **/

  var grass = document.querySelector('.grass');
  if (!grass) return;

  var width = grass.offsetWidth - 20;
  var height = grass.offsetHeight - 20;

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getElem(className) {
    var marginTop = getRandomInt(0, height);
    var marginLeft = getRandomInt(0, width);
    var cssText = 'left:' + marginLeft + 'px;';
    cssText += 'top:' + marginTop + 'px;';

    var elem = document.createElement('div');
    elem.className = className;
    elem.style.cssText = cssText;
    return elem;
  }

  ['small-grass-patch', 'large-grass-patch'].forEach(function(d) {
    for (var i=0; i<10; i++) {
      var elem = getElem(d);
      grass.appendChild(elem);
    }
  })

  /**
  * Let the caveman run
  **/

  function handleKeys(e) {
    if (e.keyCode == 39) run(+150);
    if (e.keyCode == 37) run(-150);
  }

  function run(val) {
    var left = parseInt(caveman.style.left, 10)

    // if the caveman enters the cave, return home 
    if (left + val > width) returnHome();

    // else make him run and change direction
    caveman.style.left = left + val + 'px';
    caveman.style.transform = val > 0 ? 'rotateY(0deg)' : 'rotateY(180deg)'
    if (!caveman.className.includes('charge')) {
      caveman.className += ' charge';
    }
  }

  var body = document.querySelector('body');
  var caveman = document.querySelector('.caveman');
  body.addEventListener('keydown', handleKeys)

  /**
  * Send users home
  **/

  function returnHome() {
    window.location = '/#'
  }

  var homeButton = document.querySelector('.return-home');
  homeButton.addEventListener('click', returnHome)

})();