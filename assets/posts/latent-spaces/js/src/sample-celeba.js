(function() {

  // globals
  var world;

  // get the point geometry
  function getGeometry(colors) {
    var geometry = new THREE.Geometry();
    for (var i=0, y=218; y>0; y--) {
      for (var  x=0; x<178; x++) {
        var color = colors && colors.length ? colors[i++] : Math.random();
        geometry.vertices.push(new THREE.Vector3(x-(182/2), y-(218/2), 0));
        geometry.colors.push(new THREE.Color(color, color, color));
      }
    }
    return geometry;
  }

  // sample from the latent space at obj.x, obj.y
  function sample(obj) {
    obj.x = (obj.x - 0.5) * 500;
    obj.y = (obj.y - 0.5) * 500;
    // convert 10, 50 into a vector
    var y = tf.tensor2d([[obj.x, obj.y]]);
    // sample from region 10, 50 in latent space
    var prediction = window.decoder.predict(y).dataSync();
    // log the prediction to the browser console
    world.mesh.geometry = getGeometry(prediction);
  }

  // initialize the scene
  function init() {
    // add the mesh to the scene
    var container = document.querySelector('#celeba-scene'),
        loader = container.querySelector('.loader');
    world = new ThreeWorld({ container: container, });
    var materialConfig = { size: 1.3, vertexColors: THREE.VertexColors, };
    var material = new THREE.PointsMaterial(materialConfig);
    var geometry = getGeometry([]);
    world.mesh = new THREE.Points(geometry, material);
    world.controls.noPan = true;
    world.scene.add(world.mesh);
    // load the decoder with tensorflow.js and render the scene
    var modelPath = 'https://duhaime.s3.amazonaws.com/blog/latent-spaces/celeba-decoder/celeba-decoder-js/model.json';
    tf.loadLayersModel(modelPath).then(function(model) {
      window.decoder = model;
      sample({x: 0, y: 0})
      world.render();
      loader.parentNode.removeChild(loader);
      window.c2d = new Controls2D({ onDrag: sample, container: container, });
    })
  }

  setTimeout(init, 3000);

})();