/**
* Globals
**/

// Identify data endpoint
var dataUrl = 'https://s3.amazonaws.com/duhaime/blog/tsne-webgl/data/';
var dataUrl = 'http://localhost:5000/';

// Create global stores for image and atlas sizes
var image = { width: 32, height: 32, shownWidth: 64, shownHeight: 64 };
var atlas = { width: 2048, height: 2048, cols: 2048 / 32, rows: 2048 / 32 };

// Create a store for image position information
var imagePositions = null;

// Create a map from an image name to its
// index position in imagePositions
var imageToIndex = {};

// Create a store for the load progress. Data structure:
// {atlas0: percentLoaded, atlas1: percentLoaded}
var loadProgress = {};

// Create a store for the 32px and 64px atlas materials
var materials = {
  32: [],
  64: []
}

// Count of 32px and 64px atlas files to fetch
var atlasCount = 6;
var largeAtlasCount = atlasCount * 4;

// Create a store for meshes
var meshes = [];

// Count of the image files loaded
var loadedImages = 0;

// Number of images to include in each mesh
var imagesPerMesh = 1024;

/**
* Scene
**/

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x111111 );

/**
* Camera
**/

// Specify the portion of the scene visiable at any time (in degrees)
var fieldOfView = 75;

// Specify the camera's aspect ratio
var aspectRatio = window.innerWidth / window.innerHeight;

/*
Specify the near and far clipping planes. Only objects
between those planes will be rendered in the scene
(these values help control the number of items rendered
at any given time); see https://threejs.org/docs/#api/math/Frustum
*/
var nearPlane = 100;
var farPlane = 50000;

// Use the values specified above to create a camera
var camera = new THREE.PerspectiveCamera(
  fieldOfView, aspectRatio, nearPlane, farPlane
);

// Finally, set the camera's position {x, y, z}
camera.position.set(0, -1000, 12000);

/**
* Lights
**/

// Add a point light with #fff color, .7 intensity, and 0 distance
var light = new THREE.PointLight( 0xffffff, 1, 0 );

// Specify the light's position
light.position.set( 1, 1, 100 );

// Add the light to the scene
scene.add( light )

/**
* Renderer
**/

// Create the canvas with a renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });

// Add support for retina displays
renderer.setPixelRatio( window.devicePixelRatio );

// Specify the size of the canvas
renderer.setSize( window.innerWidth, window.innerHeight );

// Add the canvas to the DOM
document.body.appendChild( renderer.domElement );

/**
* Load Image Position Data
**/

// Load the image position JSON file
var fileLoader = new THREE.FileLoader();
var url = dataUrl + 'tsne_image_positions.json';
fileLoader.load(url, function(data) {
  imagePositions = JSON.parse(data);
  imagePositions.forEach(function(d, idx) {
    imageToIndex[ d.img ] = idx;
  })
  maybeBuildGeometries()
})

/**
* Load Atlas Textures
**/

// Create a texture loader so we can load our image files
var textureLoader = new AjaxTextureLoader();

function loadAtlasFiles() {
  for (var i=0; i<atlasCount; i++) {
    textureLoader.load(
      dataUrl + 'atlas_files/32px/atlas-' + i + '.jpg',
      handleTexture.bind(null, i),
      handleProgress.bind(null, i)
    )
  }
}

function handleProgress(atlasIndex, xhr) {
  loadProgress[atlasIndex] = xhr.loaded / xhr.total;
  // Sum the total load progress among all atlas files
  var sum = Object.keys(loadProgress).reduce(function (sum, key) {
    return sum + loadProgress[key];
  }, 0);
  // Update or hide the loader
  var loader = document.querySelector('#loader');
  var progress = sum / atlasCount;
  progress < 1
    ? loader.innerHTML = parseInt(progress * 100) + '%'
    : loader.style.display = 'none';
}

// Create a material from the new texture and call
// the geometry builder if all textures have loaded 
function handleTexture(textureIndex, texture) {
  var material = new THREE.MeshBasicMaterial({ map: texture });
  material.transparent = true;
  materials['32'][textureIndex] = material;
  maybeBuildGeometries(textureIndex);
}

// If the textures and the mapping from image index
// to image position are loaded, create the geometries
function maybeBuildGeometries(textureIndex) {
  if (Object.keys(materials['32']).length === atlasCount && imagePositions) {
    buildGeometry();
  }
}

/**
* Build Image Geometry
**/

// Iterate over the textures in the current texture set
// and for each, add a new mesh to the scene
function buildGeometry() {
  var atlasIndex = 0;
  var meshIndex = 0;
  var geometry = new THREE.Geometry();
  for (var imageIndex=0; imageIndex<imagePositions.length; imageIndex++) {
    geometry = updateVertices(geometry, imageIndex);
    geometry = updateFaces(geometry);
    geometry = updateFaceVertexUvs(geometry, imageIndex);
    if (imageIndex > 0 && (imageIndex + 1) % imagesPerMesh === 0) {
      buildMesh(geometry, materials['32'][atlasIndex], meshIndex);
      var geometry = new THREE.Geometry();
      meshIndex++;
    }
    if (imageIndex > 0 && (imageIndex + 1) % (atlas.rows * atlas.cols) === 0) {
      atlasIndex++;
    }
  }
  // Build the remaining geometry (if any)
  if (geometry.vertices.length) {
    buildMesh(geometry, materials['32'][atlasIndex], meshIndex);
  }
  // Load the large atlas files
  loadLargeAtlasFiles();
}

// Add one vertex for each corner of the image, using the 
// following order: lower left, lower right, upper right, upper left
function updateVertices(geometry, imageIndex) {
  // Retrieve the x, y, z coords for this subimage
  var coords = getCoords(imageIndex);
  geometry.vertices.push(
    new THREE.Vector3(
      coords.x,
      coords.y,
      coords.z
    ),
    new THREE.Vector3(
      coords.x + image.shownWidth,
      coords.y,
      coords.z
    ),
    new THREE.Vector3(
      coords.x + image.shownWidth,
      coords.y + image.shownHeight,
      coords.z
    ),
    new THREE.Vector3(
      coords.x,
      coords.y + image.shownHeight,
      coords.z
    )
  );
  return geometry;
}

// Get the x, y, z coords for the subimage at index position j
// of atlas in index position i
function getCoords(imageIndex) {
  return {
    x: imagePositions[imageIndex].x * 2000,
    y: imagePositions[imageIndex].y * 1600,
    z: -200 + (imageIndex/100)
  }
}

// Create two new faces for a given subimage, then add those
// faces to the geometry
function updateFaces(geometry) {
  geometry.faces.push(
    // Add the first face (the lower-right triangle)
    new THREE.Face3(
      geometry.vertices.length-4,
      geometry.vertices.length-3,
      geometry.vertices.length-2
    ),
    // Add the second face (the upper-left triangle)
    new THREE.Face3(
      geometry.vertices.length-4,
      geometry.vertices.length-2,
      geometry.vertices.length-1
    )
  )
  return geometry;
}

function updateFaceVertexUvs(geometry, imageIndex) {  
  // Modulate the imageIndex by the number of images per atlas
  imageIndex = imageIndex % (atlas.rows * atlas.cols);
  // Identify the relative width and height of the subimages
  // within the image atlas
  var w = image.width / atlas.width;
  var h = image.height / atlas.height;
  // Identify this subimage's offset in the x dimension
  // An xOffset of 0 means the subimage starts flush with
  // the left-hand edge of the atlas
  var xOffset = (imageIndex % atlas.cols) * w;
  // Identify this subimage's offset in the y dimension
  // A yOffset of 0 means the subimage starts flush with
  // the bottom edge of the atlas           
  var yOffset = 1 - (Math.floor(imageIndex/atlas.cols) * h) - h;
  // Determine the index position of the first face for this image
  var faceIndex = (imageIndex % imagesPerMesh) * 2;
  // Use .set() if the given faceVertex is already defined; see:
  // https://github.com/mrdoob/three.js/issues/7179
  if (geometry.faceVertexUvs[0][faceIndex]) {
    geometry.faceVertexUvs[0][faceIndex][0].set(xOffset, yOffset)
    geometry.faceVertexUvs[0][faceIndex][1].set(xOffset + w, yOffset)
    geometry.faceVertexUvs[0][faceIndex][2].set(xOffset + w, yOffset + h)
  } else {
    geometry.faceVertexUvs[0][faceIndex] = [
      new THREE.Vector2(xOffset, yOffset),
      new THREE.Vector2(xOffset + w, yOffset),
      new THREE.Vector2(xOffset + w, yOffset + h)
    ]
  }
  // Map the region of the image described by the lower-left, 
  // upper-right, and upper-left vertices to `faceTwo`
  if (geometry.faceVertexUvs[0][faceIndex + 1]) {
    geometry.faceVertexUvs[0][faceIndex + 1][0].set(xOffset, yOffset)
    geometry.faceVertexUvs[0][faceIndex + 1][1].set(xOffset + w, yOffset + h)
    geometry.faceVertexUvs[0][faceIndex + 1][2].set(xOffset, yOffset + h)
  } else {
    geometry.faceVertexUvs[0][faceIndex + 1] = [
      new THREE.Vector2(xOffset, yOffset),
      new THREE.Vector2(xOffset + w, yOffset + h),
      new THREE.Vector2(xOffset, yOffset + h)
    ]
  }
  // Explicitly set the material index for the new faces
  geometry.faces[faceIndex].materialIndex = 0;
  geometry.faces[faceIndex + 1].materialIndex = 0;
  return geometry;
}

function buildMesh(geometry, material, meshIndex) {
  // Combine the image geometry and material into a mesh
  var mesh = new THREE.Mesh(geometry, [material]);
  // Store the index position of the image and the mesh
  mesh.userData.meshIndex = meshIndex;
  // Set the position of the image mesh in the x,y,z dimensions
  mesh.position.set(0,0,0)
  // Add the image to the scene
  scene.add(mesh);
  // Save this mesh
  meshes.push(mesh);
}

/**
* Functions to load large atlas files
**/

function loadLargeAtlasFiles() {
  image = { width: 64, height: 64, shownWidth: 64, shownHeight: 64 };
  atlas = { width: 2048, height: 2048, cols: 2048 / 64, rows: 2048 / 64 };
  for (var i=0; i<largeAtlasCount; i++) {
    textureLoader.load(
      dataUrl + 'atlas_files/64px/atlas-' + i + '.jpg',
      handleLargeTexture.bind(null, i)
    )
  }
}

function handleLargeTexture(atlasIndex, texture) {
  var material = new THREE.MeshBasicMaterial({ map: texture });
  materials['64'][atlasIndex] = material;
  updateTexture(atlasIndex)
}

function updateTexture(atlasIndex) {
  // Update the material for the mesh, starting at index 1 (0 is taken)
  meshes[atlasIndex].material = [ materials['64'][atlasIndex] ];
  meshes[atlasIndex].material.needsUpdate = true;
  // Update the vertexUvs of each image in the new atlas
  var geometry = meshes[atlasIndex].geometry;
  for (var i=0; i<imagesPerMesh; i++) {
    geometry = updateFaceVertexUvs(geometry, i)
  }
  meshes[atlasIndex].geometry = geometry;
  meshes[atlasIndex].geometry.uvsNeedUpdate = true;
  meshes[atlasIndex].geometry.verticesNeedUpdate = true;
}


/**
* Functions to load individual image files (unused)
**/

function loadImage(imageIndex) {
  if (!imagePositions[imageIndex]) return;
  var image = imagePositions[imageIndex].img;
  textureLoader.load(
    dataUrl + '/64-thumbs/' + image + '.jpg',
    handleImage.bind(null, imageIndex)
  )
}

function handleImage(imageIndex, image) {
  var material = new THREE.MeshBasicMaterial({ map: image });
  materials.image[imageIndex] = material;
  updateImageGeometry(imageIndex);
  loadImage(imageIndex+1);
}

function updateImageGeometry(imageIndex) {
  var atlasIndex = Math.floor(imageIndex / (atlas.rows * atlas.cols));
  var offsetIndex = Math.floor(imageIndex % (atlas.rows * atlas.cols));
  var faceIndex = offsetIndex * 2;
  // Update the material for this image
  meshes[atlasIndex].material[offsetIndex] = materials.image[imageIndex];
  meshes[atlasIndex].material[offsetIndex].needsUpdate = true;
  meshes[atlasIndex].material.needsUpdate = true;
  // Update the faceVertexUvs for the faces of this image
  meshes[atlasIndex].geometry.faceVertexUvs[0][faceIndex][0].set(0, 0)
  meshes[atlasIndex].geometry.faceVertexUvs[0][faceIndex][1].set(1, 0)
  meshes[atlasIndex].geometry.faceVertexUvs[0][faceIndex][2].set(1, 1)
  meshes[atlasIndex].geometry.faceVertexUvs[0][faceIndex + 1][0].set(0, 0)
  meshes[atlasIndex].geometry.faceVertexUvs[0][faceIndex + 1][1].set(1, 1)
  meshes[atlasIndex].geometry.faceVertexUvs[0][faceIndex + 1][2].set(0, 1)
  meshes[atlasIndex].geometry.faces[faceIndex].materialIndex = offsetIndex;
  meshes[atlasIndex].geometry.faces[faceIndex + 1].materialIndex = offsetIndex;
  meshes[atlasIndex].geometry.uvsNeedUpdate = true;
  meshes[atlasIndex].geometry.groupsNeedUpdate = true;
  meshes[atlasIndex].geometry.verticesNeedUpdate = true;
}

/**
* Add Controls
**/

var controls = new THREE.TrackballControls(camera, renderer.domElement);

/**
* Add Raycaster
**/

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var lastMouse = new THREE.Vector2();
var selected = null;

function onMousemove(event) {
  // Calculate mouse position in normalized device coordinates
  // (-1 to +1) for the x and y axes
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  if (event.clientX < 100) {
    document.querySelector('nav').className = 'visible';
  }
}

// Capture the mousedown point so on mouseup we can determine
// whether user clicked or is dragging
function onMousedown(event) {
  lastMouse.copy( mouse );
}

function onMouseup(event) {
  // Determine which image is selected (if any)
  selected = raycaster.intersectObjects( scene.children );
  // Return if the user hasn't clicked anything or is dragging
  if (!selected.length || !(mouse.equals(lastMouse))) return;
  // The 0th member is closest to the camera
  selected = selected[0];
  // Identify the selected item's face within its parent mesh
  var faceIndex = selected.faceIndex;
  // Identify the selected item's mesh index
  var meshIndex = selected.object.userData.meshIndex;
  // rows * cols images per mesh, 2 faces per image
  var imageIndex = (meshIndex * (atlas.rows * atlas.cols)) + (Math.floor(faceIndex / 2));
  // Store the image name in the url hash for reference
  window.location.hash = imagePositions[imageIndex].img;
  flyTo(
    selected.point.x,
    selected.point.y,
    selected.point.z
  );
}

// Move the camera to focus on the designated x, y, z location
function flyTo(x, y, z) {
  // x, y, z are the coordinates on which we'll focus the camera;
  // Specify the *location* to which we'll move the camera
  var target = {
    x: x,
    y: y,
    z: z+500
  }
  // Save the initial camera quaternion so it can be used
  // as a starting point for the slerp
  var startQuaternion = camera.quaternion.clone();
  // Apply the tracking controls to a cloned dummy camera
  // so that the final quaternion can be computed
  var dummyCamera = camera.clone();
  dummyCamera.position.set(target.x, target.y, target.z);
  var dummyControls = new THREE.TrackballControls(dummyCamera);
  dummyControls.target.set(x, y, z);
  dummyControls.update();
  // Initialize the tween to animate from the current camera quaternion
  // to the final camera quaternion
  new TWEEN.Tween(camera.position)
    .to(target, 1000)
    .onUpdate(function(timestamp) {
      // Slerp the camera quaternion for smooth transition.
      // `timestamp` is the eased time value from the tween.
      THREE.Quaternion.slerp(startQuaternion, dummyCamera.quaternion, camera.quaternion, timestamp);
    })
    .onComplete(function() {
      controls.target = new THREE.Vector3(x, y, z)
    }).start();
}

var canvas = document.querySelector('canvas');
canvas.addEventListener('mousemove', onMousemove, false)
canvas.addEventListener('mousedown', onMousedown, false)
canvas.addEventListener('mouseup', onMouseup, false)

/**
* Add Click Listener to Images in Nav
**/

var navImages = document.querySelector('nav').querySelectorAll('img');
for (var i=0; i<navImages.length; i++) {
  navImages[i].addEventListener('click', onNavImageClick)
}

function onNavImageClick(event) {
  // Determine the mesh in which the clicked image occurs
  // Find the vertices of this image and zoom to them
  var src = event.target.getAttribute('src');
  var img = src.split('/')[src.split('/').length - 1];
  var name = img.substring(0, img.lastIndexOf('.'));
  var coords = getCoords( imageToIndex[ name ] );
  document.querySelector('nav').className = 'hidden';
  setTimeout(function() {
    flyTo(coords.x, coords.y, coords.z);
  }, 500)
}

/**
* Handle window resizes
**/

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  controls.handleResize();
});

/**
* Render!
**/

// The main animation function that re-renders the scene each animation frame
function animate() {
requestAnimationFrame( animate );
  TWEEN.update();
  raycaster.setFromCamera( mouse, camera );
  renderer.render( scene, camera );
  controls.update();
}
animate();

/**
* Main
**/

// Initialize the requests that bootstrap the application
loadAtlasFiles()