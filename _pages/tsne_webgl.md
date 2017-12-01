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
    <img src='http://localhost:8000/64-thumbs/MES15557.jpg'>
    <div>Boxers</div>
  </div>
  <div class='hotspot'>
    <img src='http://localhost:8000/64-thumbs/MES13276.jpg'>
    <div>Buildings</div>
  </div>
  <div class='hotspot'>
    <img src='http://localhost:8000/64-thumbs/MES17700.jpg'>
    <div>Buttons</div>
  </div>
  <div class='hotspot'>
    <img src='http://localhost:8000/64-thumbs/MES20315.jpg'>
    <div>Chairs</div>
  </div>
  <div class='hotspot'>
    <img src='http://localhost:8000/64-thumbs/MES22594.jpg'>
    <div>Gowns</div>
  </div>
  <div class='hotspot'>
    <img src='http://localhost:8000/64-thumbs/MES14735.jpg'>
    <div>Groups</div>
  </div>
  <div class='hotspot'>
    <img src='http://localhost:8000/64-thumbs/MES04871.jpg'>
    <div>Hats</div>
  </div>
  <div class='hotspot'>
    <img src='http://localhost:8000/64-thumbs/MES15328.jpg'>
    <div>Landscapes</div>
  </div>
  <div class='hotspot'>
    <img src='http://localhost:8000/64-thumbs/MES22336.jpg'>
    <div>Madams</div>
  </div>
  <div class='hotspot'>
    <img src='http://localhost:8000/64-thumbs/MES15626.jpg'>
    <div>Miniatures</div>
  </div>
  <div class='hotspot'>
    <img src='http://localhost:8000/64-thumbs/MES22681.jpg'>
    <div>Performers</div>
  </div>
  <div class='hotspot'>
    <img src='http://localhost:8000/64-thumbs/MES21013.jpg'>
    <div>Suits</div>
  </div>
</nav>