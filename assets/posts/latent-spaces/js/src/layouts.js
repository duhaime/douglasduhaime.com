(function() {

  // draw the mnist digits in reduced dimensionality
  window.mnist = window.mnist || {};

  // globals
  var mesh,
      // trainY config
      trainYLocation = '/assets/posts/latent-spaces/data/trainY.json',
      trainY, // arr of class labels for each input observation
      // image config
      imageCount = 2,
      imageSize = 2048,
      imageDir = 'https://s3.amazonaws.com/duhaime/blog/latent-spaces/atlas-images',
      images = {},
      // layout config
      layoutDir = '/assets/posts/latent-spaces/data/mnist-positions',
      layoutFiles = {
        'umap': layoutDir + '/umap_positions.json',
        'tsne': layoutDir + '/tsne_positions.json',
        'auto': layoutDir + '/auto_positions.json',
      },
      layoutKeys = Object.keys(layoutFiles),
      layouts = {};

  var state = {
    layout: 'umap',
    settingLayout: false,
    rotate: false,
    drewNext: false,
  };

  // boilerplate
  var container = document.querySelector('#mnist-target'),
      loader = container.querySelector('.loader'),
      w = container.clientWidth,
      h = container.clientHeight,
      scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(75, w/h, 0.001, 10),
      controls = new THREE.TrackballControls(camera, container),
      renderConfig = {antialias: true, alpha: true},
      renderer = new THREE.WebGLRenderer(renderConfig);
  controls.target = new THREE.Vector3(0, 0, 0.75);
  controls.panSpeed = 0.4;
  camera.position.set(0, 0, -0.85);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', function() {
    w = container.clientWidth;
    h = container.clientHeight;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  })

  window.addEventListener('mousewheel', function(e) {
    var t = e.target;
    if ((t.id && t.id == 'mnist-target') || (t.tagName == 'CANVAS')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, {passive: false})

  function loadAtlases(cb) {
    var loaded = 0;
    function loadAtlas(url) {
      var im = new Image,
          xhr = new XMLHttpRequest();
      im.crossOrigin = 'Anonymous';
      im.onload = function() {
        if (++loaded == imageCount) {
          if (cb) cb()
        }
      }
      xhr.onload = function(e) {
        im.src = url;
        images[url] = im;
      }
      xhr.onprogress = function(e) {}
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.send();
    }
    // load each atlas
    for (var i=0; i<imageCount; i++) {
      loadAtlas(imageDir + '/atlas-' + i + '.jpg')
    }
  }

  function get(url, handleSuccess) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        if (xmlhttp.status === 200) {
          handleSuccess(JSON.parse(xmlhttp.responseText))
        }
      };
    };
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
  };

  function draw() {
    var buffers = getBuffers(state.layout, state.layout),
        BA = THREE.BufferAttribute,
        IBA = THREE.InstancedBufferAttribute;
    // create the geometry
    var geometry = new THREE.InstancedBufferGeometry();
    geometry.addAttribute('uv',
      new BA(buffers.uvs, 2));
    geometry.addAttribute('position',
      new BA(buffers.positions, 3));
    geometry.addAttribute('target',
      new IBA(buffers.targets, 3, true, 1));
    geometry.addAttribute('translation',
      new IBA(buffers.translations, 3, true, 1));
    geometry.addAttribute('textureIndex',
      new IBA(buffers.texIndices, 1, true, 1));
    geometry.addAttribute('textureOffset',
      new IBA(buffers.texOffsets, 2, true, 1));
    geometry.addAttribute('label',
      new IBA(buffers.labels, 1, true, 1));
    // get the shader material
    var material = new THREE.RawShaderMaterial({
      vertexShader: document.querySelector('#vs').textContent,
      fragmentShader: document.querySelector('#fs').textContent,
      uniforms: {
        textures: { type: 'tv', value: getTextures(), },
        percent: { type: 'f', value: 0.0, },
      },
      side: THREE.DoubleSide,
    })
    // compose the mesh
    mesh = new THREE.Points(geometry, material);
    mesh.frustumCulled = false;
    //mesh.rotation.y = Math.PI;
    scene.add(mesh);
    addLayoutButtons();
  }

  function getTextures() {
    var textures = [];
    for (var i=0; i<imageCount; i++) {
      var im = images[imageDir + '/atlas-' + i + '.jpg'],
          canvas = document.createElement('canvas');
      canvas.height = imageSize;
      canvas.width = imageSize;
      var ctx = canvas.getContext('2d').drawImage(im, 0, 0),
          tex = new THREE.Texture(canvas);
      tex.needsUpdate = true;
      tex.flipY = false;
      textures.push(tex);
    }
    return textures;
  }

  // layout0 and layout1 are keys in the data dict
  function getBuffers(layout0, layout1) {
    var nCells = layouts[layout0].length,
        cellsPerAtlas = 5329,
        perRow = 73, // images per row/col in each atlas
        // buffers
        uvs = new Float32Array([0, 0]),
        positions = new Float32Array([0,0,0]),
        translations = new Float32Array(3*nCells),
        targets = new Float32Array(3*nCells),
        texIndices = new Float32Array(nCells),
        texOffsets = new Float32Array(2*nCells),
        labels = new Float32Array(nCells),
        // iters
        translationIter = 0,
        targetIter = 0,
        texIndexIter = 0,
        texOffsetIter = 0,
        labelsIter = 0;
    for (var i=0; i<nCells; i++) {
      var j = i%cellsPerAtlas,
          texX = Math.floor(j/perRow),
          texY = j%perRow;
      translations[translationIter++] = layouts[layout0][i][0];
      translations[translationIter++] = layouts[layout0][i][1];
      translations[translationIter++] = layouts[layout0][i][2] || 0;
      targets[targetIter++] = layouts[layout1][i][0];
      targets[targetIter++] = layouts[layout1][i][1];
      targets[targetIter++] = layouts[layout1][i][2] || 0;
      texIndices[texIndexIter++] = Math.floor(i/cellsPerAtlas);
      texOffsets[texOffsetIter++] = texX;
      texOffsets[texOffsetIter++] = texY;
      labels[labelsIter++] = trainY[i];
    }
    return {
      uvs: uvs,
      positions: positions,
      translations: translations,
      targets: targets,
      texIndices: texIndices,
      texOffsets: texOffsets,
      labels: labels,
    }
  }

  function setLayout(layout) {
    if (!state.settingLayout &&
        layout in layouts &&
        layouts[layout].length >= layouts[state.layout].length) {
      state.settingLayout = true;
      state.layout = layout;
      setActiveButton();
      var buffers = getBuffers(state.layout, layout);
      mesh.geometry.attributes.target.array = buffers.targets;
      mesh.geometry.attributes.target.needsUpdate = true;
      TweenLite.to(mesh.material.uniforms.percent, 1.0, {
        value: 1.0,
        ease: Power4.easeInOut,
        onComplete: function() {
          mesh.geometry.attributes.translation.array = buffers.targets;
          mesh.geometry.attributes.translation.needsUpdate = true;
          mesh.material.uniforms.percent = { value: 0.0, type: 'f', };
          state.settingLayout = false;
        }
      })
    }
  }

  function addLayoutButtons() {
    var parent = document.createElement('div');
    parent.id = 'layout-buttons';
    for (var i=0; i<layoutKeys.length; i++) {
      var child = document.createElement('div');
      child.className = 'layout-button';
      child.onclick = setLayout.bind(null, layoutKeys[i]);
      child.textContent = layoutKeys[i];
      parent.appendChild(child);
    }
    container.appendChild(parent);
    setActiveButton();
  }

  function setActiveButton() {
    var elems = document.querySelectorAll('.layout-button');
    for (var i=0; i<elems.length; i++) {
      elems[i].className = elems[i].textContent == state.layout
        ? 'layout-button active'
        : 'layout-button';
    }
  }

  function loadDataFiles() {
    for (var i=0; i<layoutKeys.length; i++) {
      var key = layoutKeys[i];
      get(layoutFiles[key], function(key, json) {
        layouts[key] = json;
      }.bind(null, key))
    }
  }

  /**
  * Main
  **/

  // render loop
  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();

    if (mesh && state.rotate) mesh.rotation.y += 0.0005;

    // draw the next visualization
    if (!state.drewNext && mesh && layouts.auto && window.mnist.drawGl) {
      state.drewNext = true;
      var m = new THREE.Points(mesh.geometry.clone(), mesh.material),
          pos = getBuffers('auto', 'auto').targets;
      m.frustumCulled = false;
      //m.rotation.y = Math.PI;
      m.geometry.attributes.target.array = pos;
      m.geometry.attributes.target.needsUpdate = true;
      m.geometry.attributes.translation.array = pos;
      m.geometry.attributes.translation.needsUpdate = true;
      window.mnist.drawGl(m);
    }
  };

  loadAtlases(function() {
    get(trainYLocation, function(json) {
      trainY = json;
      get(layoutFiles.umap, function(json) {
        layouts.umap = json;
        draw();
        loadDataFiles();
      });
    });
  });

  // pause before initial render
  setTimeout(function() {
    render();
    loader.parentNode.removeChild(loader);
  }, 1000)

})();