function ThreeWorld(obj) {
  obj = obj || {};
  var container = obj.container || document.querySelector('body'),
      w = container.clientWidth,
      h = container.clientHeight,
      scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(75, w/h, 0.001, 10000),
      controls = new THREE.TrackballControls(camera, container),
      renderConfig = {antialias: true, alpha: true},
      renderer = new THREE.WebGLRenderer(renderConfig);
  controls.target = new THREE.Vector3(0, 0, 0.75);
  camera.position.set(0, 0, -150);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', function() {
    camera.aspect = container.clientWidth/container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  })

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
  }

  this.camera = camera;
  this.controls = controls;
  this.renderer = renderer;
  this.scene = scene;
  this.render = render;
}