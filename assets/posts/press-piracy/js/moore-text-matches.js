;(function() {

  function World() {
    this.scene = this.getScene();
    this.camera = this.getCamera();
    this.renderer = this.getRenderer();
    this.controls = this.getControls();
    this.color = new THREE.Color();
    this.mouse = new THREE.Vector2();
    this.points = [];
    this.bb = {
      x: {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
      },
      y: {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
      }
    }
    this.mooreIndices = [];
    this.mooreIdxToCoords = {};
    this.metaMap = this.getMetaMap();
    this.addEventListeners();
    this.jsonDir = '/assets/posts/press-piracy/json/';

    get(this.jsonDir + 'moore_matches_meta.json', function(meta) {
      this.meta = JSON.parse(meta);
      get(this.jsonDir + 'moore_matches.json', this.drawPoints.bind(this))
    }.bind(this))
  }

  World.prototype.getMetaMap = function(data) {
    return {
      // Unknown
      "T131454": "T147189",
      // Henry Maundrell
      "T100592": "T211421",
      // Daniel Fenning
      "T133336": "T149482",
      "T220639": "T149482",
      "T133335": "T149482",
      "T133334": "T149482",
      // Tobias Smollett
      "T055286": "T055396",
      "T055397": "T055396",
      "T055395": "T055396",
      "T055399": "T055396",
      "T055400": "T055396",
      // Thomas Bankes
      "T230585": "N042049",
      "N042026": "N042049",
      "T230586": "N042049",
      "T095120": "N042049",
      "T173389": "N042049",
      // John Payne
      "T202828": "T095864",
      // Lord Kames
      "T048433": "T048434",
      // Joseph Addison
      "T089172": "T014869",
      "T089181": "T014869",
      "T118423": "T014869",
      "T074579": "T014869",
      "T084077": "T014869",
      "T074576": "T014869",
      "T074577": "T014869",
      "T074580": "T014869",
      "T074581": "T014869",
      "N023125": "T014869",
      "N003983": "T014869",
      "T074578": "T014869",
      // Samuel Johnson
      "T188378": "N000734",
      "T083970": "N000734",
      "T083705": "N000734",
      "T084319": "N000734",
      "T083973": "N000734",
      "T083702": "N000734",
      "T147766": "N000734",
      "N000735": "N000734",
      "T083704": "N000734",
      "T083971": "N000734",
      "T083708": "N000734",
      // Gilbert Burnet
      "T110198": "T110319",
      // Pehr Kalm
      "T123553": "T123563",
      // Charles Middleton
      "N005096": "T125494"
    }
  }

  World.prototype.getScene = function() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f7);
    return scene;
  }

  World.prototype.getCamera = function() {
    var renderSize = getRenderSize(),
        aspectRatio = renderSize.w / renderSize.h,
        camera = new THREE.PerspectiveCamera(
          75, aspectRatio, 0.1, 100000);
    camera.position.set(0, 1, -1000);
    return camera;
  }

  World.prototype.getRenderer = function() {
    var renderSize = getRenderSize(),
        renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio); // retina displays
    renderer.setSize(renderSize.w, renderSize.h); // set w,h
    return renderer;
  }

  World.prototype.getControls = function() {
    var controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    controls.zoomSpeed = 0.4;
    controls.panSpeed = 0.4;
    return controls;
  }

  World.prototype.centerCamera = function() {
    var x = (this.bb.x.max + this.bb.x.min)/2,
        y = (this.bb.y.max + this.bb.y.min)/2,
        center = {x: x, y: y};
    this.camera.position.set(x, y, this.camera.position.z);
    this.camera.lookAt(x, y, 0);
    this.controls.target = new THREE.Vector3(x, y, 0);
  }

  World.prototype.drawPoints = function(data) {
    data = JSON.parse(data);

    var IBG = THREE.InstancedBufferGeometry,
        BA = THREE.BufferAttribute,
        IBA = THREE.InstancedBufferAttribute,
        Vec3 = THREE.Vector3,
        Arr = Float32Array,
        // colors
        colorMap = getColorMap(),
        nColors = Object.keys(colorMap).length,
        // data
        levels = Object.keys(data),
        levelToIdx = itemToIndex(levels);

    for (var i=0; i<levels.length; i++) {
      var level = levels[i];
      for (var j=0; j<data[level].length; j++) {
        this.points.push({
          moore_idx: data[level][j][0],
          other_idx: data[level][j][1],
          group: level,
        })
      }
    }

    // add data for each observation; n = num observations
    var geometry = new IBG(),
        n = this.points.length,
        translations = new Arr(n * 3),
        colors = new Arr(n * 3),
        uidColors = new Arr(n * 3),
        translationIterator = 0,
        colorIterator = 0,
        uidColorIterator = 0;

    for (var i=0; i<n; i++) {
      var p = this.points[i],
          x = -(p.moore_idx / 100),
          y = levelToIdx[p.group] * 20,
          color = colorMap[ levelToIdx[p.group] % nColors ],
          uidColor = this.color.setHex(i + 1);
      this.points[i].x = x;
      this.points[i].y = y;
      this.mooreIdxToCoords[p.moore_idx] = {
        x: x,
        y: y,
        z: 0,
      }
      if (x > this.bb.x.max) this.bb.x.max = x;
      if (x < this.bb.x.min) this.bb.x.min = x;
      if (y > this.bb.y.max) this.bb.y.max = y;
      if (y < this.bb.y.min) this.bb.y.min = y;
      translations[translationIterator++] = x;
      translations[translationIterator++] = y;
      translations[translationIterator++] = 0;
      colors[colorIterator++] = color.r / 255;
      colors[colorIterator++] = color.g / 255;
      colors[colorIterator++] = color.b / 255;
      uidColors[uidColorIterator++] = uidColor.r;
      uidColors[uidColorIterator++] = uidColor.g;
      uidColors[uidColorIterator++] = uidColor.b;
    }

    // add attributes
    geometry.addAttribute('position', new BA(new Arr([0, 0, 0]), 3));
    geometry.addAttribute('translation', new IBA(translations, 3, 1));
    geometry.addAttribute('color', new IBA(colors, 3, 1));
    geometry.addAttribute('uidColor', new IBA(uidColors, 3, 1));

    // create the material and mesh
    var material = getMaterial(false),
        mesh = new THREE.Points(geometry, material);

    // add some axis labels
    this.labelAxes(levels, levelToIdx);

    // build the scene
    mesh.frustumCulled = false; // don't clip mesh on drag
    this.scene.add(mesh);
    this.centerCamera();
    this.render();
    find('#gl-target').appendChild(this.renderer.domElement);

    // store the unique set of moore indices in sorted order
    // and position the line against the first moore index
    this.mooreIndices = Object.keys(this.mooreIdxToCoords).map(Number);
    this.mooreIndices.sort(function(a, b) {return a-b});
    line.init();
  }

  World.prototype.render = function() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
  }

  // add axis labels
  World.prototype.labelAxes = function(yLevels, yLevelToIdx) {

    // label y levels
    var yLevelsElem = document.createElement('div');
    yLevelsElem.id = 'gl-labels';
    for (var i=0; i<yLevels.length; i++) {
      var level = yLevels[i],
          child = document.createElement('a'),
          estcId = eccoToEstcId(level);
      child.href = 'http://estc.bl.uk/' + estcId;
      child.target = '_blank';
      child.className = 'gl-label';
      child.textContent = level;
      child.style.bottom = (17 + (yLevelToIdx[level] * 5.86)) + 'px';
      yLevelsElem.appendChild(child);
    }
    // label y axis
    var yLabel = document.createElement('div');
    yLabel.id = 'gl-y-axis-label';
    yLabel.textContent = 'Matching Text';
    // label x axis
    var xLabel = document.createElement('div');
    xLabel.id = 'gl-x-axis-label';
    xLabel.innerHTML = 'Passage in Moore\'s <i>Voyages and Travels</i>';
    // append to DOM
    var container = find('.gl-container')
    container.appendChild(yLevelsElem);
    container.appendChild(yLabel);
    container.appendChild(xLabel);
  }

  // get the world coordinates of the current mouse position
  World.prototype.getMouseWorldCoords = function() {
    var camera = this.camera,
        vector = new THREE.Vector3(),
        elem = this.renderer.domElement,
        x = (this.mouse.x / elem.clientWidth) * 2 - 1,
        y = (this.mouse.y / elem.clientHeight) * 2 + 1;
    vector.set(x, y, 0.5);
    vector.unproject(camera);
    var direction = vector.sub(camera.position).normalize(),
        distance = - camera.position.z / direction.z,
        scaled = direction.multiplyScalar(distance),
        coords = camera.position.clone().add(scaled);
    return coords;
  }

  // get the screen coordinates from an object in world coordinates
  World.prototype.getScreenCoords = function(obj) {
    var vector = obj.clone(),
        w = this.renderer.domElement.clientWidth,
        h = this.renderer.domElement.clientHeight;
    // project returns a vector with components in -1:1
    // assuming the vector was originally inside the view frustum
    // the +/-1 scale these values to 0:1, then we multiply
    // by the w/h of the screen over 2 (as the origin is at
    // the center of the screen)
    vector.project(this.camera);
    vector.x =  (vector.x + 1) * w/2;
    vector.y = -(vector.y - 1) * h/2;
    vector.z = 0;
    return vector;
  }

  World.prototype.addEventListeners = function() {
    var elem = this.renderer.domElement;
    elem.addEventListener('mousemove', function(e) {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }.bind(this))
  }

  /**
  * Colors
  **/

  function getColorMap() {

    function toHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? '0' + hex : hex;
    }

    function rgbToHex(r, g, b) {
      return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      } : null;
    }

    // interpolations from https://gka.github.io/palettes
    var hexes = [
      '#fe4445','#fe4e40','#ff563d','#ff5e38','#ff6732','#ff6d2d','#ff7526','#ff7b1d','#ff8213','#ff8800',
      '#ff8e09','#ff9511','#ff9917','#ff9f1d','#ffa622','#ffab26','#ffb12c','#ffb530','#ffbb34',
      '#f3be30','#ebc02d','#e0c229','#d6c424','#cac61f','#bdc81a','#b3c914','#a5cb0a','#99cc01',
      '#98cb17','#97c926','#95c632','#94c43b','#92c244','#90c04c','#8ebe53','#8cbd5a','#8bbc5e','#89b965','#86b76b','#83b671','#80b478','#7eb27b','#7bb081','#78af87','#74ac8d','#71ab91','#6da997','#68a89d','#63a6a2','#5fa4a6','#57a3ac','#4fa1b3','#4aa0b6','#3e9ebc','#379cc0','#239ac6','#0099cb',
      '#059acc','#089ccd','#0e9ecf','#119fd0','#15a0d2','#17a2d3','#1ba3d5','#1da5d6','#20a6d8','#22a8d9','#24a9db','#26abdc','#28acde','#2aaddf','#2cafe0','#2eb0e2','#30b2e3','#31b3e5','#33b5e6'
    ]

    return indexToItem(hexes.map(hexToRgb));
  }

  /**
  * Control selecting line
  **/

  function Line() {
    this.state = {idx: 0};
    this.step = 1;
    this.elem = find('#gl-line');
  }

  // initialize listeners only after canvas is drawn
  Line.prototype.init = function() {
    this.addEventListeners();
    this.moveLine();
    this.elem.style.opacity = 1;
  }

  Line.prototype.moveLine = function() {
    // get world x, y coords of the current moore passage
    var mooreIdx = world.mooreIndices[ this.state.idx ],
        coords = world.mooreIdxToCoords[ mooreIdx ],
        vec = new THREE.Vector3(coords.x, coords.y, 0),
        screenCoords = world.getScreenCoords(vec);
    // move the line visually to the moore passage idx
    this.elem.style.left = screenCoords.x + 'px';
    // display the text for the moore passage idx
    passages.activate(world.mooreIndices[this.state.idx])
  }

  Line.prototype.getPassageAtCursor = function() {
    var cursor = world.getMouseWorldCoords(),
        xStart = world.bb.x.min,
        xEnd = world.bb.x.max,
        idxStart = 3,    // moore passage idx at world.bb.ix.min
        idxEnd = 211571, // moore passage idx at world.bb.ix.max
        // reverse signs to undo the reverse x-axis above
        scaledCursor = -(cursor.x / (xEnd - xStart));
    // passageIdx is the index of a passage in Moore's text
    return parseInt(scaledCursor * (idxEnd - idxStart));
  }

  Line.prototype.addEventListeners = function() {
    var canvas = world.renderer.domElement;
    canvas.addEventListener('mousemove',
      this.handleMouseMove.bind(this))
    document.addEventListener('keydown',
      this.handleKeyDown.bind(this))
  }

  Line.prototype.handleMouseMove = function(e) {
    return; // TODO
    // position the line
    this.elem.style.left = e.clientX - 1.5;
    // find the moore passage idx nearest the cursor
    var mooreIdx = this.getPassageAtCursor();
  }

  Line.prototype.handleKeyDown = function(e) {
    if (e.keyCode == 39) this.stepForward();
    if (e.keyCode == 37) this.stepBackward();
  }

  Line.prototype.stepForward = function() {
    var idx = this.state.idx,
        nIndices = world.mooreIndices.length;
    this.state.idx = Math.min(idx+this.step, nIndices);
    this.moveLine();
  }

  Line.prototype.stepBackward = function() {
    var idx = this.state.idx;
    this.state.idx = Math.max(idx-this.step, 0);
    this.moveLine();
  }

  /**
  * Passage Snippets
  **/

  function Passages() {
    this.cache = {};
    this.loading = {};
    this.elem = find('#match-target');
    this.template = find('#match-target-template').innerHTML;
  }

  Passages.prototype.activate = function(mooreWindowIdx) {
    var cached = this.cache[mooreWindowIdx] || false;
    if (cached) this.render(mooreWindowIdx);
    else this.load(mooreWindowIdx);
  }

  Passages.prototype.load = function(mooreWindowIdx) {
    // store the fact that this data has been requested
    if (this.loading[mooreWindowIdx]) return;
    this.loading[mooreWindowIdx] = true;
    // fetch the data
    var s3 = 'https://s3.amazonaws.com/duhaime/' +
        'blog/press-piracy/moore-passages'
        path = s3 + '/' + mooreWindowIdx + '.json';
    get(path, this.handleData.bind(this, mooreWindowIdx));
  }

  Passages.prototype.handleData = function(mooreWindowIdx, data) {
    data = JSON.parse(data);
    for (var i=0; i<data.length; i++) {
      var row = data[i],
          mooreIdx = row.moore_window_idx;
      this.cache[mooreIdx] = this.cache[mooreIdx] || [];
      this.cache[mooreIdx].push(row);
    }
    this.loading[mooreWindowIdx] = false;
    this.render(mooreWindowIdx)
  }

  Passages.prototype.render = function(mooreWindowIdx) {
    var data = this.cache[mooreWindowIdx];

    // initialize formatted metadata with moore
    var formatted = [{
      'window_idx': mooreWindowIdx,
      'estc_id': 'T113413',
      'window': data[0].moore_window,
      'meta': world.meta[ 'T113413' ],
    }];

    var seen = {};
    data.forEach(function(d) {
      var id = d.match_text_id;
      if (world.metaMap[id]) id = world.metaMap[id];
      if (!seen[id]) {
        seen[id] = true;
        meta = world.meta[id],
        name = meta.marc_name;
        formatted.push({
          'window_idx': d.match_window_idx,
          'estc_id': d.match_text_id,
          'window': d.match_window,
          'meta': meta,
        })
      }
    })

    // pass child render function as prop
    this.elem.innerHTML = _.template(this.template)({
      matches: formatted,
      renderMatch: _.template(find('#match-template').innerHTML),
    })
  }

  /**
  * Helpers
  **/

  function getRenderSize() {
    var target = find('#gl-target');
    return {
      w: target.clientWidth,
      h: target.clientHeight,
    }
  }

  function find(selector) {
    return document.querySelector(selector);
  }

  function itemToIndex(l) {
    return l.reduce(function(obj, i, idx) {
      obj[i] = idx; return obj;
    }, {})
  }

  function indexToItem(l) {
    return l.reduce(function(obj, i, idx) {
      obj[idx] = i; return obj;
    }, {})
  }

  function getMaterial(uid) {
    var prefix = uid ? '#define PICKING\n' : '';
        vert = find('#vertex-shader').textContent,
        frag = find('#fragment-shader').textContent;
    return new THREE.RawShaderMaterial({
      vertexShader: prefix + vert,
      fragmentShader: prefix + frag,
    });
  }

  function eccoToEstcId(eccoId) {
    var s = eccoId[0],
        trimmed = false;
    for (var i=1; i<eccoId.length; i++) {
      if (eccoId[i] !== '0') trimmed = true;
      if (trimmed) s += eccoId[i];
    }
    return s;
  }

  function get(url, onSuccess, onErr, onProgress) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        xmlhttp.status === 200
          ? onSuccess(xmlhttp.responseText)
          : onErr(xmlhttp)
      };
    };
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
  };

  /**
  * Main
  **/

  var passages = new Passages();
  var line = new Line();
  var world = new World();

  // configure line state
  world.controls.enabled = false;

})();