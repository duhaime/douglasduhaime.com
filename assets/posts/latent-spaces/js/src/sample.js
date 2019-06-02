(function() {

  window.mnist = window.mnist || {};

  // globals
  var dataDir = '/assets/posts/latent-spaces/data/model',
      decoder,
      domains,
      mesh;

  // boilerplate
  var container = document.querySelector('#sampling-target'),
      w = container.clientWidth,
      h = container.clientHeight,
      scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(75, w/h, 0.001, 100),
      renderConfig = {antialias: true, alpha: true},
      controls = new THREE.TrackballControls(camera, container);
      renderer = new THREE.WebGLRenderer(renderConfig),
      canvas = renderer.domElement;
  camera.position.set(0, 0, -0.8);
  controls.panSpeed = 0.4;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);
  container.appendChild(canvas);

  canvas.addEventListener('click', sample);
  window.addEventListener('resize', function() {
    w = container.clientWidth;
    h = container.clientHeight;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  })

  /**
  * Rendering
  **/

  // uses window.mnist api from mnist.js (gl) & auto.js (svg)
  function drawGl(m) {
    mesh = m;
    scene.add(mesh);
  }

  function createButtons() {
    var parent = document.createElement('div');
    parent.id = 'sampling-buttons';
    for (var i=0; i<10; i++) {
      var img = document.createElement('img');
      img.src = '/assets/posts/latent-spaces/images/digits/digit-' + i + '.png';
      parent.appendChild(img);
    }
    container.appendChild(parent);
  }

  function drawSvg() {
    window.mnist.drawSvg(container, 112, 112, false);
  }

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    if (controls && controls.enabled) controls.update();
  }

  /**
  * Sample from latent space
  **/

  function sample(e) {
    if (!domains || !decoder || !mesh) return;
    // get mouse cords in world space
    var coords = getWorldCoords(e);
    // convert world space to latent space domain
    var d = [-0.5, 0.5], // all world space axes are scaled {-0.5:0.5}
        scale = d3.scaleLinear().domain(d),
        x = scale.range(domains[0])(coords.x),
        y = scale.range(domains[1])(coords.y),
        decoded = decoder.predict(tf.tensor2d([[x, y]])).dataSync(),
        im = [];
    for (var i=0; i<decoded.length; i++) {
      im[i] = Math.abs(decoded[i]) / 255.0; // updateSvg takes vals {0:1}
    }
    window.mnist.updateSvg(container, im);
  }

  // get the position of a canvas event in world coords
  function getWorldCoords(e) {
    // identify the x,y coords in canavs that got event
    var rect = canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;
    // convert x,y to clip space in canvas:
    // canvas coords from top left in clockwise order
    // (-1,1), (1,1), (-1,-1), (1, -1)
    var mouse = new THREE.Vector3();
    mouse.x = ( (x / canvas.clientWidth ) * 2) - 1;
    mouse.y = (-(y / canvas.clientHeight) * 2) + 1;
    mouse.z = 0.5; // set to z position of mesh objects
    // reverse projection from 3D to screen
    mouse.unproject(camera);
    // convert from point to a direction
    mouse.sub(camera.position).normalize();
    // scale the projected ray
    var distance = - camera.position.z / mouse.z,
        scaled = mouse.multiplyScalar(distance),
        coords = camera.position.clone().add(scaled);
    return coords;
  }

  /**
  * Main
  **/

  d3.json(dataDir + '/decoder-domains.json').then(function(data) {
    domains = data;
    tf.loadLayersModel(dataDir + '/decoder/model.json').then(function(model) {
      decoder = model;
      createButtons();
      drawSvg();
      render();
    })
  })

  window.mnist.drawGl = drawGl;

})()