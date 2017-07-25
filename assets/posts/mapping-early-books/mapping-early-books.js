var map = (function () {
  'use strict';

  var map,
      layer,
      scene,
      startLocation,
      timeLevels = [1600, 1650, 1700, 1750, 1800],
      timeIndex = 0,
      startLocation = [54.887, -3.386, 5];

  /**
  * Draw the map
  **/

  function getMap() {
    return L.map('map', {
      maxZoom: 20,
      trackResize: true,
      keyboard: false
    });
  }

  function getLayer() {
    layer = Tangram.leafletLayer({
      scene: '/assets/posts/mapping-early-books/early-books.yaml',
      attribution: ' &copy; OSM contributors | <a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | <a href="https://github.com/duhaime" target="_blank">@duhaime</a>'
    });
    window.layer = layer;
    scene = layer.scene;
    window.scene = scene;
    return layer;
  }

  function setMapView() {
    map.setView(startLocation.slice(0, 2), startLocation[2]);
  }

  function resizeMap() {
    var contentWidth = document.querySelector('.content').clientWidth;
    document.getElementById('map').style.width = contentWidth + 'px';
    document.getElementById('map').style.height = contentWidth * .6 + 'px';
    map.invalidateSize(false);
  }

  function redrawMap() {
    timeIndex = (timeIndex + 1) % timeLevels.length;
    window.scene.config.global.fillval = 'publications_' + timeLevels[timeIndex];
    window.scene.updateConfig();
  }

  function updateYear() {
    var year = timeLevels[timeIndex];
    var elem = document.querySelector('#current-year');
    elem.innerHTML = year;
    window.setTimeout(function() {
      redrawMap();
    }, 1500)
  }

  /**
  * Build the map
  **/

  function initializeMap() {
    map = getMap(),
    layer = getLayer(),
    setMapView();
    resizeMap();

    layer.addTo(map);

    // load: triggered once on map load
    // view_complete: called when map enters resting state
    scene.subscribe({
      load: function() {
        redrawMap();
      },
      view_complete: function() {
        updateYear();
      }
    });
  }
  
  window.addEventListener('resize', resizeMap);

  // add the layer to the map
  window.addEventListener('load', function() {
    initializeMap()
  });

  return map;
}());
