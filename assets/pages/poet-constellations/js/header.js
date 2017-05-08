(function() {

  /****************
  * Header styles *
  ****************/

  // make header visible after user scrolls down n units
  var header = document.querySelector('.poet-constellations-header')
  window.addEventListener('scroll', handleWindowScroll)

  function handleWindowScroll(e) {
    var yOffset = window.pageYOffset;
    if (yOffset > 330) {
      header.style.opacity = 1
    } else {
      header.style.opacity = 0
    }
  }

})()