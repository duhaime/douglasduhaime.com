---
layout: page
description: |
  Projecting similar images to a 2D plane with Umap-Learn's UMAP embedding model
  and Three.js
permalink: '/pages/tsne-webgl/'
title: 'TSNE WebGL'
css: /assets/pages/tsne-webgl/tsne-webgl.css
js: 
  - https://cdnjs.cloudflare.com/ajax/libs/three.js/88/three.min.js
  - /assets/pages/tsne-webgl/js/tween.js
  - /assets/pages/tsne-webgl/js/trackball-controls.js
  - /assets/pages/tsne-webgl/js/texture-loader.js
  - /assets/pages/tsne-webgl/js/tsne-webgl.js
---

<header class='header'>
  <img class='logo' src='/assets/pages/tsne-webgl/images/owl.svg' alt='DHLab logo'>
  <div class='app-name'>NEURAL NETWORKS</div>
  <div class='tagline'>Image Fields in the Meserve-Kunhardt Collection</div>
</header>

<div id='loader'>0%</div>
<nav>
  <h2>Click an image below to explore a topic:</h2>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES15557.png)'></div>
    <div>Boxers</div>
  </div>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES13276.png)'></div>
    <div>Buildings</div>
  </div>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES17700.png)'></div>
    <div>Buttons</div>
  </div>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES20315.png)'></div>
    <div>Chairs</div>
  </div>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES22594.png)'></div>
    <div>Gowns</div>
  </div>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES20334.png)'></div>
    <div>Groups</div>
  </div>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES15328.png)'></div>
    <div>Landscapes</div>
  </div>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES22336.png)'></div>
    <div>Madams</div>
  </div>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES15626.png)'></div>
    <div>Miniatures</div>
  </div>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES22681.png)'></div>
    <div>Performers</div>
  </div>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES21013.png)'></div>
    <div>Suits</div>
  </div>
  <div class='hotspot'>
    <div class='background-image'
      style='background-image: url(http://localhost:5000/thumbs/128px/MES16558.png)'></div>
    <div>Swords</div>
  </div>
</nav>