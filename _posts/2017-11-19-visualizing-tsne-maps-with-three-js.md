---
layout: post
title: Visualizing TSNE Maps with Three.js
date: 2017-11-19
categories: visualization three.js tsne
thumbnail: |
  /assets/posts/tsne-webgl/tsne-webgl-thumb.jpg
banner: |
  /assets/posts/tsne-webgl/tsne-webgl-banner.jpg
css: 
js: 
  - https://production-assets.codepen.io/assets/embed/ei.js
---

For the last year or so, Yale's DHLab has undertaken a series of experiments organized around analysis of visual culture. Some of those experiments have involved [identifying similar images]({{ site.baseurl }}/posts/identifying-similar-images-with-tensorflow.html) and visualizing patterns uncovered in this process. In this post, I wanted to discuss how we used the awesome Three.js library to build a WebGL-powered visualization that can display tens of thousands of images in an interactive 3D environment:

<img src='{{ site.baseurl }}/assets/posts/tsne-webgl/images/tsne-webgl-preview.jpg' alt='A preview of the WebGL-powered TSNE maps we will build below'>

## Three.js Foundations

Three.js is a JavaScript library that generates lower-level code for WebGL (the standard API for 3D rendering in a web browser). Using Three.js, one can build complex 3D environments that would take much more code to build in raw WebGL. For a quick sample of the projects others have built with the library, check out the [Three.js homepage](https://threejs.org/).

To get started with Three.js, one needs to provide a bit of boilerplate code with the three essential elements of a Three.js page:

**scene**: The scene contains all objects to be rendered:

{% highlight javascript %}

// Create the scene and a camera to view it
var scene = new THREE.Scene();

{% endhighlight %}

**camera**: The camera determines the position from which viewers see the scene:

{% highlight javascript %}

// Specify the portion of the scene visiable at any time (in degrees)
var fieldOfView = 75;

// Specify the camera's aspect ratio
var aspectRatio = window.innerWidth / window.innerHeight;

// Specify the near and far clipping planes. Only objects
// between those planes will be rendered in the scene
// (these values help control the number of items rendered
// at any given time)
var nearPlane = 0.1;
var farPlane = 1000;

// Use the values specified above to create a camera
var camera = new THREE.PerspectiveCamera(
  fieldOfView, aspectRatio, nearPlane, farPlane
);

// Finally, set the camera's position in the z-dimension
camera.position.z = 5;

{% endhighlight %}

**renderer**: The renderer renders the scene to a canvas element on an HTML page:  

{% highlight javascript %}

// Create the canvas with a renderer and tell the
// renderer to clean up jagged aliased lines
var renderer = new THREE.WebGLRenderer({antialias: true});

// Specify the size of the canvas
renderer.setSize( window.innerWidth, window.innerHeight );

// Add the canvas to the DOM
document.body.appendChild( renderer.domElement );

{% endhighlight %}

The code above creates our scene, adds a camera, and renders the canvas to the DOM. Now all we need to do is add some objects to the scene.

Each item rendered in a Three.js scene has a **geometry** and a **material**. Geometries describe the vertices and faces of a given object, and materials describe the appearance of that shape (including texture and color). A geometry and a material can be combined into a **mesh**, which is a fully composed object ready to be added to a scene:

{% highlight javascript %}

// Create a cube with width, height, and depth set to 1
var geometry = new THREE.BoxGeometry( 1, 1, 1 );

// Use a simple material with a specified hex color
var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

// Combine the geometry and material into a mesh
var cube = new THREE.Mesh( geometry, material );

// Add the mesh to our scene
scene.add( cube );

{% endhighlight %}

Finally, we can call the `render()` method to render our scene on the page:

{% highlight javascript %}

renderer.render( scene, camera );

{% endhighlight %}

Combining the snippets above, we get the following result:

<p data-height='265' data-theme-id='0' data-slug-hash='WXdYpx' data-default-tab='result' data-user='duhaime' data-embed-version='2' data-pen-title='The Simplest Three.js Scene' class='codepen'>See the Pen <a href='https://codepen.io/duhaime/pen/WXdYpx/'>The Simplest Three.js Scene</a> by Douglas Duhaime (<a href='https://codepen.io/duhaime'>@duhaime</a>) on <a href='https://codepen.io'>CodePen</a>.</p>

This is great, but our scene is static. To add some **animation** to the scene, we can periodically update the cube's rotation property, then rerender the scene. To do so, delete the `renderer.render()` line we used above, then add the following:

{% highlight javascript %}

function animate() {
requestAnimationFrame( animate );
  renderer.render( scene, camera );

  // Rotate the object a bit each animation frame
  cube.rotation.y += 0.01;
  cube.rotation.z += 0.01;
}
animate();

{% endhighlight %}

Now the cube will slowly rotate:

<p data-height='265' data-theme-id='0' data-slug-hash='vWpvNL' data-default-tab='result' data-user='duhaime' data-embed-version='2' data-pen-title='Animating the Cube' class='codepen'>See the Pen <a href='https://codepen.io/duhaime/pen/vWpvNL/'>Animating the Cube</a> by Douglas Duhaime (<a href='https://codepen.io/duhaime'>@duhaime</a>) on <a href='https://codepen.io'>CodePen</a>.</p>

To make the faces of the cube easier to differentiate, we can add some lights to the scene. To do so, we'll want to change the cube's material, as the [MeshBasicMaterial](https://threejs.org/docs/#api/materials/MeshBasicMaterial) doesn't support lights. Let's replace the material defined above with a [MeshPhongMaterial](https://threejs.org/docs/#api/materials/MeshPhongMaterial):

{% highlight javascript %}

var material = new THREE.MeshPhongMaterial({ color: 0xffff00 })

{% endhighlight %}

Next let's point a light at our cube so that different faces of the cube catch different amounts of light:

{% highlight javascript %}

// Add a point light with #fff color, .7 intensity, and 0 distance
var light = new THREE.PointLight( 0xffffff, .7, 0 );

// Specify the light's position
light.position.set(1, 1, 100 );

// Add the light to the scene
scene.add(light)

{% endhighlight %}

Voila!

<p data-height='265' data-theme-id='0' data-slug-hash='mqparr' data-default-tab='result' data-user='duhaime' data-embed-version='2' data-pen-title='Lighting the Cube' class='codepen'>See the Pen <a href='https://codepen.io/duhaime/pen/mqparr/'>Lighting the Cube</a> by Douglas Duhaime (<a href='https://codepen.io/duhaime'>@duhaime</a>) on <a href='https://codepen.io'>CodePen</a>.</p>

## Adding Images to a Scene

The snippets above give a quick overview of the core elements of a Three.js scene. Let's build upon those ideas to create a TSNE map of images.

To build a TSNE image viewer, we'll need to load some image files into custom Three.js materials. We can do so by using the [TextureLoader](https://threejs.org/docs/#api/loaders/TextureLoader):

{% highlight javascript %}

// Create a texture loader so we can load our image file
var loader = new THREE.TextureLoader();

// Load an image file into a custom material
var material = new THREE.MeshLambertMaterial({
  map: loader.load('https://s3.amazonaws.com/duhaime/blog/tsne-webgl/assets/cat.jpg')
});

{% endhighlight %}

Now that the material is ready, the remaining steps are to generate a geometry from the image, combine the material and geoemtry into a mesh, and add the mesh to the scene, just like we did for the cube above. Because images are two-dimensional planes, we can use a simple [PlaneGeometry](https://threejs.org/docs/#api/geometries/PlaneGeometry) for this object's geometry:

{% highlight javascript %}

// create a plane geometry for the image with a width of 10
// and a height that preserves the image's aspect ratio
var geometry = new THREE.PlaneGeometry(10, 10*.75);

// combine our image geometry and material into a mesh
var mesh = new THREE.Mesh(geometry, material);

// set the position of the image mesh in the x,y,z dimensions
mesh.position.set(0,0,0)

// add the image to the scene
scene.add(mesh);

{% endhighlight %}

Our image will now appear in the scene:

<p data-height='265' data-theme-id='0' data-slug-hash='jaYdLg' data-default-tab='result' data-user='duhaime' data-embed-version='2' data-pen-title='Adding an Image to a Three.js Scene' class='codepen'>See the Pen <a href='https://codepen.io/duhaime/pen/jaYdLg/'>Adding an Image to a Three.js Scene</a> by Douglas Duhaime (<a href='https://codepen.io/duhaime'>@duhaime</a>) on <a href='https://codepen.io'>CodePen</a>.</p>

It's worth noting that we can swap out the PlanarGeometry for other geometries and Three.js will automatically wrap our material over that geometry. For example, we could swap the PlanarGeometry for a more interesting Icosahedron geometry, and could make the icosahedron rotate by updating the mesh's rotation property inside the render loop:

{% highlight javascript %}

// use an icosahedron geometry instead of the planar geometry
var geometry = new THREE.IcosahedronGeometry();

// spin the icosahedron each animation frame
function animate() {
requestAnimationFrame( animate );
  renderer.render( scene, camera );
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.01;
  mesh.rotation.z += 0.01;
}
animate();

{% endhighlight %}

This produces a strange looking cat indeed:

<p data-height='265' data-theme-id='0' data-slug-hash='NwXeoB' data-default-tab='result' data-user='duhaime' data-embed-version='2' data-pen-title='Icosahedron Cat' class='codepen'>See the Pen <a href='https://codepen.io/duhaime/pen/NwXeoB/'>Icosahedron Cat</a> by Douglas Duhaime (<a href='https://codepen.io/duhaime'>@duhaime</a>) on <a href='https://codepen.io'>CodePen</a>.</p>

## Building Custom Geometries

In the examples above we use a few different geometries built into Three.js. Those geometries are based on the fundamental [THREE.Geometry](https://threejs.org/docs/#api/core/Geometry) class, which is a primitive geometry one can use to create custom geometries. THREE.Geometry is lower-level than the prebuilt geometries we've used above, but it gives performance gains that make it worth the effort. Let's create a custom geometry by calling the THREE.Geometry constructor, which takes no arguments:

{% highlight javascript %}

var geometry = new THREE.Geometry();

{% endhighlight %}

This geometry object doesn't do much yet, because it doesn't have any vertices, or points with which to ariculate a shape. Let's add four vertices, one for each corner of our image:

{% highlight javascript %}

// identify the image size
var imageSize = {width: 10, height: 7.5};

// identify the x, y, z coords where the image should be placed
var coords = {x: -5, y: -3.75, z: 0};

// add one vertex for each corner of the image, using the 
// following order: lower left, lower right, upper right, upper left
geometry.vertices.push(
  new THREE.Vector3(
    coords.x,
    coords.y,
    coords.z
  ),
  new THREE.Vector3(
    coords.x+imageSize.width,
    coords.y,
    coords.z
  ),
  new THREE.Vector3(
    coords.x+imageSize.width,
    coords.y+imageSize.height,
    coords.z
  ),
  new THREE.Vector3(
    coords.x,
    coords.y+imageSize.height,
    coords.z
  )
);

{% endhighlight %}

Now that the vertices are in place, we can add some faces to the object. Each face will be a triangle, as triangles are primitives in the WebGL world. We'll use two triangles to create our rectangular image. The first will triangulate the lower-left, lower-right, and upper-right vertices of the image, and the second will triangulate the lower-left, upper-right, and upper-left vertices of the image:

{% highlight javascript %}

// add the first face (the lower-right triangle)
var faceOne = new THREE.Face3(
  geometry.vertices.length-4,
  geometry.vertices.length-3,
  geometry.vertices.length-2
)

// add the second face (the upper-left triangle)
var faceTwo = new THREE.Face3(
  geometry.vertices.length-4,
  geometry.vertices.length-2,
  geometry.vertices.length-1
)

// add those faces to the geometry
geometry.faces.push(faceOne, faceTwo);

{% endhighlight %}

Awesome, we now have a geometry with four vertices that describe the corners of the image and two faces that fill two triangles described by those vertices. Next we need to describe which portions of the cat image should appear in each of the faces of the geometry. To do so, one must add some [faceVertexUvs](https://threejs.org/docs/#api/core/Geometry.faceVertexUvs) to the geometry, as faceVertexUvs indicate which portions of a texture should appear in which portions of a geometry.

FaceVertexUvs represent a texture as a two-dimensional plane that stretches from 0 to 1 in the x dimension and 0 to 1 in the y dimension. Within this coordinate system, 0,0 represents the bottom-left-most region of the texture, and 1,1 represents the top-right-most region of the texture. Given this coordinate system, we can map the lower-right triangle of our image to the first face created above, and we can map the upper-left triangle of our image to the second face created above:

{% highlight javascript %}

// map the region of the image described by the lower-left, 
// lower-right, and upper-right vertices to the first face
// of the geometry
geometry.faceVertexUvs[0].push([
  new THREE.Vector2(0,0),
  new THREE.Vector2(1,0),
  new THREE.Vector2(1,1)
]);

// map the region of the image described by the lower-left, 
// upper-right, and upper-left vertices to the second face
// of the geometry
geometry.faceVertexUvs[0].push([
  new THREE.Vector2(0,0),
  new THREE.Vector2(1,1),
  new THREE.Vector2(0,1)
]);

{% endhighlight %}

Once we've finished describing this geometry, we can render the custom geometry within the scene:

<p data-height='265' data-theme-id='0' data-slug-hash='mqpgbV' data-default-tab='result' data-user='duhaime' data-embed-version='2' data-pen-title='Building Custon Geometries' class='codepen'>See the Pen <a href='https://codepen.io/duhaime/pen/mqpgbV/'>Building Custon Geometries</a> by Douglas Duhaime (<a href='https://codepen.io/duhaime'>@duhaime</a>) on <a href='https://codepen.io'>CodePen</a>.</p>

This may seem like a lot of work for the same result we achieve with a one-line PlanarGeometry declaration above. When working with a single image, we could certainly use the PlanarGeometry and call it a day. However, each mesh added to a Three.js scene requires an additional 'draw call', so one usually wants to use custom geometries to minimize the number of meshes created and thus the draw calls issued. We'll return to this idea below while working to scale the visualization to many more images.

## Using an Atlas File

Let's now load multiple images into a scene. One way to accomplish this task is to pass a series of urls to the texture loader and load each image one-by-one. The trouble with this approach is it requires one new HTTP request for each image to be loaded. If the number of images to be displayed is sufficiently high, the web browser will grind to a halt and the scene will never render.

One way around this problem is to load an 'image atlas', or montage of small images combined into a single larger image:

<img src='{{ site.baseurl }}/assets/posts/tsne-webgl/tsne-webgl-banner.jpg'>

If you have ImageMagick installed, you can create one of these montages with the `montage` command:

{% highlight bash %}

# download directory of images
wget goo.gl/keWWPa -O 100-imgs.tar.gz && tar -zxf 100-imgs.tar.gz

# create a file that lists all files to be include in the montage
ls 100-imgs/* > images-to-montage.txt

# create single montage image from images in a directory
montage `cat images_to_montage.txt` -geometry +0+0 -background none -tile 10x 100-img-atlas.jpg

{% endhighlight %}

The last command will create an image atlas with 10 images per column and no padding between the images in the atlas. There are 100 images of size 128 x 128px in the sample directory, so the montage will be a 10 x 10 grid that's 1280 x 1280px.

Let's load the image atlas into a Three.js scene:

{% highlight javascript %}
// Create a texture loader so we can load the image file
var loader = new THREE.TextureLoader();

// Load an image file into a custom material
var material = new THREE.MeshBasicMaterial({
  map: loader.load('https://s3.amazonaws.com/duhaime/blog/tsne-webgl/data/100-img-atlas.jpg')
});
{% endhighlight %}

Once the image atlas is loaded in, we'll want to create some helper objects that identify the size of the atlas and its sub images. We'll use these helper objects to help us calculate the FaceVertexUvs:

{% highlight javascript %}

// Identify the subimage size in px
var image = {width: 128, height: 128};

// Identify the total number of cols & rows in the image atlas
var atlas = {width: 1280, height: 1280, cols: 10, rows: 10};
{% endhighlight %}

The custom geometry example above used four vertices and two faces to render a single image. To represent all 100 images from the image atlas, we can create four vertices and two faces for each of the 100 images to be displayed. Then we can associate the proper region of the image atlas material with each of the geometry's 200 faces:

{% highlight javascript %}

// Create a helper function that returns an int {-700,700}.
// We'll use this function to set each subimage's x and
// y coordinate positions
function getRandomInt() {
  var val = Math.random() * 700;
  return Math.random() > 0.5
    ? -val
    : val;
}

// Create the empty geometry
var geometry = new THREE.Geometry();

// For each of the 100 subimages in the montage, add four 
// vertices (one for each corner), in the following order:
// lower left, lower right, upper right, upper left
for (var i=0; i<100; i++) {
  
  // Create x, y, z coords for this subimage
  var coords = {
    x: getRandomInt(),
    y: getRandomInt(),
    z: -400
  };
  
  geometry.vertices.push(
    new THREE.Vector3(
      coords.x,
      coords.y,
      coords.z
    ),
    new THREE.Vector3(
      coords.x + image.width,
      coords.y,
      coords.z
    ),
    new THREE.Vector3(
      coords.x + image.width,
      coords.y + image.height,
      coords.z
    ),
    new THREE.Vector3(
      coords.x,
      coords.y + image.height,
      coords.z
    )
  );

  // Add the first face (the lower-right triangle)
  var faceOne = new THREE.Face3(
    geometry.vertices.length-4,
    geometry.vertices.length-3,
    geometry.vertices.length-2
  )

  // Add the second face (the upper-left triangle)
  var faceTwo = new THREE.Face3(
    geometry.vertices.length-4,
    geometry.vertices.length-2,
    geometry.vertices.length-1
  )

  // Add those faces to the geometry
  geometry.faces.push(faceOne, faceTwo);
  
  // Identify this subimage's offset in the x dimension
  // An xOffset of 0 means the subimage starts flush with
  // the left-hand edge of the atlas
  var xOffset = (i % 10) * (image.width / atlas.width);
  
  // Identify the subimage's offset in the y dimension
  // A yOffset of 0 means the subimage starts flush with
  // the top edge of the atlas
  var yOffset = Math.floor(i/10) * (image.height / atlas.height);
  
  // Use the xOffset and yOffset (and the knowledge that
  // each row and column contains only 10 images) to specify
  // the regions of the current image
  geometry.faceVertexUvs[0].push([
    new THREE.Vector2(xOffset, yOffset),
    new THREE.Vector2(xOffset+.1, yOffset),
    new THREE.Vector2(xOffset+.1, yOffset+.1)
  ]);

  // Map the region of the image described by the lower-left, 
  // upper-right, and upper-left vertices to `faceTwo`
  geometry.faceVertexUvs[0].push([
    new THREE.Vector2(xOffset, yOffset),
    new THREE.Vector2(xOffset+.1, yOffset+.1),
    new THREE.Vector2(xOffset, yOffset+.1)
  ]);
}

// Combine the image geometry and material into a mesh
var mesh = new THREE.Mesh(geometry, material);

// Set the position of the image mesh in the x,y,z dimensions
mesh.position.set(0,0,0)

// Add the image to the scene
scene.add(mesh);

{% endhighlight %}

Rendering that scene produces a litle scatterplot of images:

<p data-height='265' data-theme-id='0' data-slug-hash='vWdyGe' data-default-tab='result' data-user='duhaime' data-embed-version='2' data-pen-title='Loading Multiple Images' class='codepen'>See the Pen <a href='https://codepen.io/duhaime/pen/vWdyGe/'>Loading Multiple Images</a> by Douglas Duhaime (<a href='https://codepen.io/duhaime'>@duhaime</a>) on <a href='https://codepen.io'>CodePen</a>.</p>

Here we represent one hundred images with just a single mesh! This is much better than giving each image its own mesh, as it reduces the number of potential draw calls from 100 to 1!

## Using Multiple Atlas Files

Having discovered how to visualize multiple images with a single mesh, we can now scale up the image collection size dramatically.

One way to crank up the number of visualized images is to squeeze more images into the image atlas. As it turns out, however, the largest texture size supported by many modern hardware devices is 2048 x 2048px, so let's limit ourselves to atlas files of that size or smaller.

To keep the number of atlas files relatively small, let's use 20,000 32 x 32px subimages in each atlas. We can download a sample collection of 20,000 images with wget:

{% highlight bash %}
wget https://s3.amazonaws.com/duhaime/blog/tsne-webgl/data/32-thumbs.tar.gz
tar -zxf 32-thumbs.tar.gz
{% endhighlight %}

Then we can combine those images into a series of atlas files with the following Python script:

{% highlight python %}
# create_atlas_files.py
import glob, os

def subdivide(l, n):
  '''Return n-sized sublists from iterable l'''
  for i in range(0, len(l), n):
    yield l[i:i + n]

# identify the maximum number of images to process
max_imgs = 20480 # 5 atlas files, each with 64 rows & 64 cols

# get up to `max_imgs` images from a directory of 64x64 images
images = glob.glob('32-thumbs/*')[:max_imgs]

# create a list of files to montage for each montage to make
# use 4096 images per atlas as the atlas is 2048 x 2048px
# and there will be 64 cols and 64 rows of images
# sized 32 x 32px
for idx, atlas_images in enumerate(subdivide(images, 4096)):
  with open('images_to_montage.txt', 'w') as out:
    out.write('\n'.join(atlas_images))

  # identify the name for the new montage to create
  name = 'atlas-' + str(idx) + '.jpg'

  # create a new image montage with 64 rows & 64 columns
  # using the images in images_to_montage.txt
  os.system('montage @images_to_montage.txt -geometry +0+0 -background none -tile 64x ' + name)

{% endhighlight %}

Running that script on a directory with 20,000 images generates 5 atlas files, each with 4096 images [[sample atlas](https://s3.amazonaws.com/duhaime/blog/tsne-webgl/data/atlas_files/32px/atlas-0.jpg)]. Once those atlas files are loaded onto a static file server, one can load each atlas with a simple loop:

{% highlight javascript %}

// Create a store that maps each atlas file's index position
// to its material
var materials = {};

// Create a texture loader so we can load our image file
var loader = new THREE.TextureLoader();

for (var i=0; i<5; i++) {
  var url = 'https://s3.amazonaws.com/duhaime/blog/tsne-webgl/data/atlas_files/32px/atlas-' + i + '.jpg';
  loader.load(url, handleTexture.bind(null, i));
}

// Callback function that adds the texture to the list of textures
// and calls the geometry builder if all textures have loaded 
function handleTexture(idx, texture) {
  materials[idx] = new THREE.MeshBasicMaterial({ map: texture })
  if (Object.keys(materials).length === 5) {
    document.querySelector('#loading').style.display = 'none';
    buildGeometry();
  }
}

{% endhighlight %}

The buildGeometry function will then create the vertices and faces for the 20,000 images within the atlas files. Once those are set, one can pump those geometries into some meshes and add the meshes to the scene (click the Codepen link for the full code update):

<p data-height='265' data-theme-id='0' data-slug-hash='NwyoJV' data-default-tab='result' data-user='duhaime' data-embed-version='2' data-pen-title='Loading Multiple Atlas Files' class='codepen'>See the Pen <a href='https://codepen.io/duhaime/pen/NwyoJV/'>Loading Multiple Atlas Files</a> by Douglas Duhaime (<a href='https://codepen.io/duhaime'>@duhaime</a>) on <a href='https://codepen.io'>CodePen</a>.</p>

## Positioning Images with TSNE Coordinates

So far we've used random coordinates to place images within a scene. Let's now position images near other similar-looking images. To do so, we'll create vectorized representations of each image, project those vectors down into a 2D embedding, then use each image's position in the 2D coordinate space to position the image in the Three.js scene.

### Generating TSNE Coordinates

First things first, let's create a vector representation of each image. If you have tensorflow installed, you can create vectorized representations of each image in `32-thumbs` by running:

{% highlight bash %}

# download a script that generates vectorized representations of images
wget https://gist.githubusercontent.com/duhaime/2a71921c9f4655c96857dbb6b6ed9bd6/raw/0e72c48e698395265d029fabad0e6ab1f3961b26/classify_images.py

# install a dependency for process management
pip install psutil

# run the script on a glob of images
python classify_images.py '32-thumbs/*'

{% endhighlight %}

This script will generate one image vector for each image in `32-thumbs/`. We can then run the following script to create a 2D TSNE projection of those image vectors:

{% highlight python %}

# create_tsne_projection.py
from sklearn.manifold import TSNE
import numpy as np
import glob, json, os

# create datastores
image_vectors = []
chart_data = []
maximum_imgs = 20480

# build a list of image vectors
vector_files = glob.glob('image_vectors/*.npz')[:maximum_imgs]
for c, i in enumerate(vector_files):
  image_vectors.append(np.loadtxt(i))
  print(' * loaded', c+1, 'of', len(vector_files), 'image vectors')

# build the tsne model on the image vectors
model = TSNE(n_components=2, random_state=0)
np.set_printoptions(suppress=True)
fit_model = model.fit_transform( np.array(image_vectors) )

# store the coordinates of each image in the chart data
for c, i in enumerate(fit_model):
  chart_data.append({ 'x': i[0], 'y': i[1], 'idx': c })

with open('image_tsne_projections.json', 'w') as out:
  json.dump(chart_data, out)

{% endhighlight %}

Running that TSNE script on your image vectors will generate a JSON file in which each input image is mapped to x and y coordinate values:

{% highlight javascript %}

[
  { 'x': 95.027, 'y': 11.80  },
  { 'x': 98.54,  'y': -30.42 }, ...
] 

{% endhighlight %}

### Positioning Images in a Three.js Scene

Given the JSON file with those TSNE coordinates, all we need to do is iterate over each item in the JSON file and position the image in that index position accordingly.

To load a JSON file using the Three.js library, we can use a [FileLoader](https://threejs.org/docs/#api/loaders/FileLoader):

{% highlight javascript %}
// Create a store for image position information
var imagePositions = null;

var loader = new THREE.FileLoader();
loader.load('https://s3.amazonaws.com/duhaime/blog/tsne-webgl/data/image_tsne_projections.json', function(data) {
  imagePositions = JSON.parse(data);
  // Build the geometries if all atlas files are loaded
  conditionallyBuildGeometries()
})

{% endhighlight %}

We can then use the index position of each item in that JSON file to identify the appropriate atlas file and x, y offsets for a given image. To do so, we'll need to store each atlas material by its index position:

{% highlight javascript %}

// Create a texture loader so we can load our image file
var loader = new THREE.TextureLoader();
for (var i=0; i<5; i++) {
  var url = 'https://s3.amazonaws.com/duhaime/blog/tsne-webgl/data/';
  url += 'atlas_files/32px/atlas-' + i + '.jpg';
  // Pass the texture index position to the callback function
  loader.load(url, handleTexture.bind(null, i));
}

// Callback function that adds the texture to the list of textures
// and calls the geometry builder if all textures have loaded 
function handleTexture(idx, texture) {
  materials[idx] = new THREE.MeshBasicMaterial({ map: texture })
  conditionallyBuildGeometries()
}

// If the textures and the mapping from image idx to positional information
// are all loaded, create the geometries
function conditionallyBuildGeometries() {
  if (Object.keys(materials).length === 5 && imagePositions) {
    document.querySelector('#loading').style.display = 'none';
    buildGeometry();
  }
}

{% endhighlight %}

Then `buildGeometry()` can then pass the index position of each atlas `i` and the index position of each image within a given atlas `j` to `getCoords()`, a function that returns the given image's x and y coordinates:

{% highlight javascript %}

// Identify the total number of cols & rows in the image atlas
var atlas = {width: 2048, height: 2048, cols: 64, rows: 64};

// Create a new mesh for each texture
function buildGeometry() {
  for (var i=0; i<5; i++) {
    // Create one new geometry per atlas
    var geometry = new THREE.Geometry();
    for (var j=0; j< atlas.cols*atlas.rows; j++) {
      var coords = getCoords(i, j);
      geometry = updateVertices(geometry, coords)
      geometry = updateFaces(geometry)
      geometry = updateFaceVertexUvs(geometry, j)
    }
    buildMesh(geometry, materials[i])
  }
}

// Get the x, y, z coords for the subimage in index position j
// of atlas in index position i
function getCoords(i, j) {
  var idx = (i * atlas.rows * atlas.cols) + j;
  var coords = imagePositions[idx];
  coords.x *= 1200;
  coords.y *= 600;
  coords.z = (-200 + j/100);
  return coords;
}

{% endhighlight %}

### Adding Controls

In addition to setting the image positions, we can add some **controls** to the scene that allow users to zoom in or out. An easy way to do so is to add the pre-packaged [trackball controls](https://s3.amazonaws.com/duhaime/blog/tsne-webgl/assets/js/trackball-controls.js) as an additional JavaScript dependency. Then we can call the control's constructor and update the controls both on window resize events and inside the main render loop to keep the controls up to date with the application state:

{% highlight javascript %}

/**
* Add Controls
**/

var controls = new THREE.TrackballControls(camera, renderer.domElement);

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

// The main animation function
function animate() {
requestAnimationFrame( animate );
  renderer.render( scene, camera );
  controls.update();
}
animate();

{% endhighlight %}

The result is an interactive visualization of the images in a 2D TSNE projection:

<p data-height='265' data-theme-id='0' data-slug-hash='GOBNoJ' data-default-tab='result' data-user='duhaime' data-embed-version='2' data-pen-title='Three.js - Positioning Images with TSNE Coordinates' class='codepen'>See the Pen <a href='https://codepen.io/duhaime/pen/GOBNoJ/'>Three.js - Positioning Images with TSNE Coordinates</a> by Douglas Duhaime (<a href='https://codepen.io/duhaime'>@duhaime</a>) on <a href='https://codepen.io'>CodePen</a>.</p>

## Getting Fancy

We've now achieved a basic TSNE map with Three.js, but there's much more that could be done to improve a user's experience of the visualization. In particular:

<ul>
* Users get no indication of load progress<br/>
* Users can't see details within the small images<br/>
* Users can't get more information about particular images<br/>  
* Users have no guide through the visualization<br/>
</ul>