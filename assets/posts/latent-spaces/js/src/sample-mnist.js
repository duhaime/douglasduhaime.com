(function() {

  // show how an autoencoder samples from a latent space
  window.mnist = window.mnist || {};
  window.mnist.sample = window.mnist.sample || {};

  // globals
  var dataDir = '/assets/posts/latent-spaces/data/mnist-decoder',
      decoder,
      domains,
      mesh,
      clickMarker,
      throbDirection,
      mouseDown = {x: null, y: null}; // identify clicks vs drags on canvas

  // boilerplate
  var container = document.querySelector('#sampling-target'),
      w = container.clientWidth,
      h = container.clientHeight,
      scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(75, w/h, 0.001, 100),
      renderConfig = {antialias: true, alpha: true},
      controls = new THREE.TrackballControls(camera, container);
      renderer = new THREE.WebGLRenderer(renderConfig),
      canvas = renderer.domElement,
      p = {x: -0.22, y: -0.28, z: -0.14}; // start position
  camera.position.set(p.x, p.y, p.z);
  controls.target.set(p.x, p.y, 0);
  controls.panSpeed = 0.4;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);
  container.appendChild(canvas);

  // add event listeners
  canvas.addEventListener('mousedown', function(e) {
    mouseDown.x = e.clientX;
    mouseDown.y = e.clientY;
  });

  canvas.addEventListener('click', function(e) {
    if (e.clientX == mouseDown.x &&
        e.clientY == mouseDown.y) {
    if (!domains || !decoder || !mesh) return;
      // get mouse cords in world space
      var coords = getWorldCoords(e);
      sample(coords);
    }
  });

  window.addEventListener('resize', function() {
    w = container.clientWidth;
    h = container.clientHeight;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  /**
  * Rendering
  **/

  // uses window.mnist api from mnist.js (gl) & auto.js (svg)
  function drawGl(m) {
    mesh = m;
    scene.add(mesh);
    // sample an initial location
    addClickMarker();
    sample({x: -0.2794771992145654, y: -0.2572047738693068, z: 0});
  }

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    if (controls && controls.enabled) controls.update();
  }

  /**
  * Sample from latent space
  **/

  function sample(coords) {
    clickMarker.position.set(coords.x, coords.y, 0);
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
  * Cursor location marker
  **/

  function addClickMarker() {
    var geometry = new THREE.TorusGeometry( 5, 1.5, 16, 100 ),
        material = new THREE.MeshPhongMaterial({
          color: 0xd0901d,
          emissive: 0xaa0000,
          side: THREE.DoubleSide,
          flatShading: true,
          depthTest: false,
        });
    clickMarker = new THREE.Mesh(geometry, material);
    clickMarker.rotation.z = Math.PI;
    clickMarker.scale.set(0.001, 0.001, 0.001);
    clickMarker.material.depthTest = false;
    scene.add(clickMarker);
    // add light so we can see flat shading in marker
    scene.add(new THREE.DirectionalLight(0xFFFFFF, 1.0));
    // make the click marker grow and shrink
    var timeline = new TimelineMax();
    timeline.from(clickMarker.scale, 1.0, {
      x: 0.001,
      y: 0.001,
      z: 0.001,
      ease: Bounce.easeOut,
    });
    timeline.to(clickMarker.scale, 1.0, {
      x: 0.00125,
      y: 0.00125,
      z: 0.00125,
      repeat: -1,
      yoyo: true,
    });
  }

  /**
  * Main
  **/

  d3.json(dataDir + '/decoder-domains.json').then(function(data) {
    domains = data;
    tf.loadLayersModel(dataDir + '/decoder/model.json').then(function(model) {
      decoder = model;
      window.mnist.drawSvg(container, 112, 112, false);
      render();
    })
  })

  window.mnist.drawGl = drawGl;

})()