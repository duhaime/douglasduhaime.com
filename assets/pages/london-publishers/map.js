var map = (function () {
  'use strict';

  /**
  * Draw the map
  **/

  function getMap() {
    return L.map('map', {
      maxZoom: 20,
      trackResize: true,
      keyboard: false,
      zoomControl: false
    });
  }

  function getLayer() {
    var layer = Tangram.leafletLayer({
      scene: '/assets/pages/london-publishers/styles/publisher-streets.yaml',
      attribution: ' &copy; OSM contributors | <a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | <a href="https://github.com/duhaime" target="_blank">@duhaime</a>'
    });
    window.layer = layer;
    window.scene = layer.scene;
    return layer;
  }

  // Use leaflet-style URL hash pattern: ?style.yaml#[zoom],[lat],[lng]
  function getStartLocation() {
    var startLocation = [51.513, -0.12, 15.72];
    var url_hash = window.location.hash.slice(1).split('/');
    if (url_hash.length == 3) {
      startLocation = [
        parseFloat(url_hash[1]),
        parseFloat(url_hash[2]),
        parseFloat(url_hash[0])
      ];
    }
    return startLocation;
  }

  function setMapView() {
    map.setView(startLocation.slice(0, 2), startLocation[2]);
    var hash = new L.Hash(map);
  }

  function resizeMap() {
    document.getElementById('map').style.width = window.innerWidth + 'px';
    document.getElementById('map').style.height = window.innerHeight + 'px';
    map.invalidateSize(false);
  }

  function getJson(url, success, err) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        if (xmlhttp.status === 200) {
          success(xmlhttp.responseText)
        } else {
          err(xmlhttp);
        };
      };
    };

    xmlhttp.open('GET', url, true);
    xmlhttp.send();
  }

  function loadBuildingData() {
    getJson('/assets/pages/london-publishers/data/osm_building_data.json', handleBuildingData)
  }

  function colorBuildings(data, extra_data) {
    data.buildings.features.forEach(function(building) {
      var buildingId = building.properties.id;
      if (buildingId && extra_data[buildingId.toString()]) {
        var color = '#e45f4a'
      } else {
        var color = '#666'
      }

      building.properties.fillval = color;
    })

    return data;
  }

  function handleBuildingData(data) {
    window.scene.config.sources.osm.transform = colorBuildings;
    window.scene.config.sources.osm.extra_data = JSON.parse(data);
    window.scene.rebuild();
  }

  function addHoverListener() {
    map.getContainer().addEventListener('mousemove', function(e) {
      if (staticTooltip) return;

      var cursor = {
        x: e.clientX,
        y: e.clientY
      }

      window.scene.getFeatureAt(cursor).then(function(selection) {
        if (!selection || !selection.feature) {
          tooltip.style.display = 'none';
          return;
        };

        // check if this building is in the extra data
        var extraData = scene.config.sources.osm.extra_data,
            buildingId = selection.feature.properties.id,
            buildingData = extraData[buildingId];

        // if building data is available, build up the tooltip html
        if (buildingData) {

          var workerHtml = '';
          buildingData.workers.sort(function(a, b) {
            if (a.years && b.years) {
              if (a.years[0] !== b.years[0]) {
                return a.years[0] - b.years[0];
              } else { // handle identical years
                return a.name > b.name ? 1 : -1
              }
            } else { // handle missing year data
              return a.years ? 1 : -1
            }
          })

          buildingData.workers.forEach(function(worker) {
            workerHtml += '<div class="worker">';
            workerHtml +=   '<div class="name">' + worker.name + '</div>';
            if (worker.years) {
              workerHtml += '<div class="years">' + worker.years.join('-') + '</div>';
            }
            if (worker.labels) {
              workerHtml += '<div class="label">' + worker.labels[0] + '</div>';
            }
            workerHtml += '</div>';
          })

          // position and style the tooltip
          workers.innerHTML = workerHtml || '';
          address.innerHTML = buildingData.address || '';
          tooltip.style.left = cursor.x + 'px';
          tooltip.style.top = cursor.y - 10 + 'px';
          tooltip.style.display = 'block';
        }
      })
    })
  }

  function addtooltipListeners() {
    map.getContainer().addEventListener('click', function(e) {
      staticTooltip = !staticTooltip;
    })

    workers.addEventListener('mousewheel', function(e) {
      e.preventDefault();
      e.stopPropagation();
      tooltip.scrollTop += e.deltaY;
    });
  }

  /**
  * Build the map
  **/

  var map = getMap(),
      layer = getLayer(),
      startLocation = getStartLocation(),
      tooltip = document.querySelector('#building-details'),
      address = tooltip.querySelector('.building-address'),
      years = tooltip.querySelector('.building-years'),
      workers = tooltip.querySelector('.building-workers'),
      staticTooltip = false;

  setMapView();
  resizeMap();
  addHoverListener();
  addtooltipListeners();
  
  window.addEventListener('resize', resizeMap);

  // add the layer to the map
  window.addEventListener('load', function() {
    layer.addTo(map);
  });

  // add a callback triggered when map enters resting state
  scene.subscribe({
    view_complete: function() {
      loadBuildingData();
    }
  });

  return map;

}());
