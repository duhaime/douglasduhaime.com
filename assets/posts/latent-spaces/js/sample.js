(function() {

  window.mnist = window.mnist || {};

  // globals
  var container = document.querySelector('#sampling');

  // boilerplate
  var container = document.querySelector('body'),
      w = container.clientWidth,
      h = container.clientHeight,
      scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(75, w/h, 0.001, 100),
      controls = new THREE.TrackballControls(camera, container),
      renderConfig = {antialias: true, alpha: true},
      renderer = new THREE.WebGLRenderer(renderConfig);
  controls.target = new THREE.Vector3(0, 0, 0.75);
  controls.panSpeed = 0.4;
  camera.position.set(0, 0, -10);
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

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
  }

  // helpers
  function createButtons() {
    var parent = container.querySelector('#sampling-buttons');
    for (var i=0; i<10; i++) {
      var img = document.createElement('img');
      img.src = '/assets/posts/latent-spaces/images/digits/digit-' + i + '.png';
      parent.appendChild(img);
    }
  }

  function draw() {
    console.log(window.mnist)
  }

  window.mnist.draw = draw;
  createButtons();

})()