(function() {

  /****************
  * Header styles *
  ****************/

  // make header visible after user scrolls down n units
  var header = document.querySelector('.spenserian-networks-header')
  window.addEventListener('scroll', handleWindowScroll)

  function handleWindowScroll(e) {
    var yOffset = window.pageYOffset;
    header.style.opacity = yOffset > 330 ? 1 : 0;
  }

})()