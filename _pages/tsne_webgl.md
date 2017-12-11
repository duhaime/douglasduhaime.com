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
  - https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js
  - /assets/pages/tsne-webgl/js/trackball-controls.js
  - /assets/pages/tsne-webgl/js/texture-loader.js
  - /assets/pages/tsne-webgl/js/tween.js
  - /assets/pages/tsne-webgl/js/tsne-webgl.js
---

<header class='header'>
  <img class='logo' src='{{ site.baseurl }}/assets/pages/tsne-webgl/images/owl.svg' alt='logo' />
  <div class='app-name'>PixPlot</div>
  <div class='tagline'>Image fields in the Meserve-Kunhardt Collection</div>
</header>
<div class='loader-scene'>
  <p class='welcome'>Explore over 27,000 images from the nineteenth-century <a href='http://hdl.handle.net/10079/fa/beinecke.meservekunhardt' target='_blank'>Meserve-Kunhardt Collection</a> at Yale's <a href='http://beinecke.library.yale.edu' target='_blank'>Beinecke Rare Book & Manuscript Library</a>. Each image was processed with an <a href='https://www.cs.unc.edu/~wliu/papers/GoogLeNet.pdf' target='_blank'>Inception</a> Convolutional Neural Network, trained on <a href='http://image-net.org/challenges/LSVRC/2012/' target='_blank'>ImageNet 2012</a>, and projected into a two-dimensional manifold with the <a href='https://github.com/lmcinnes/umap' target='_blank'>UMAP</a> algorithm such that similar images appear proximate to one another.</p>
  <div class='loader-container'>
    <div class='loader-icon'>
      <div class='blocks'>
        <div class='block'></div>
        <div class='block'></div>
        <div class='block'></div>
        <div class='block'></div>
        <div class='block'></div>
        <div class='block'></div>
        <div class='block'></div>
        <div class='block'></div>
        <div class='block'></div>
      </div>
    </div>
    <div id='progress'>0%</div>
  </div>
  <button id='enter'>Enter</button>
</div>
<nav>
  <div class='nav-inner'>
    <h2>Hotspots</h2>
    <div id='hotspots'></div>
    <script type='text/html' id='template'>
      <% _.forEach(hotspots, function(hotspot) { %>
        <div class='hotspot'>
          <div class='background-image'
            style='background-image: url(https://s3.amazonaws.com/duhaime/blog/pix-plot/thumbs/128px/<%= hotspot.img %>)'></div>
          <div><%= hotspot.label %></div>
        </div>
      <% }); %>
    </script>
  </div>
</nav>