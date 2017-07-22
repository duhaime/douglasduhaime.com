---
layout: page
description: Projecting similar images to a 2D plane with Scikit Learn's TSNE implementation and D3.js + canvas.
permalink: '/pages/tsne-images/'
title: 'TSNE Images'
css: /assets/pages/tsne-images/tsne-images.css
js:
  - https://d3js.org/d3.v3.min.js
  - /assets/pages/tsne-images/tsne-images.js
---
{% include icons/home.html %}
<div class='banner'>
  <a href='/posts/identifying-similar-images-with-tensorflow.html'>
    <div class='return-link'>TSNE IMAGES</div>
  </a>
</div>
<div id='tooltip'>
  <img/>
</div>
<svg id='tsne-svg'></svg>
<canvas id='tsne-canvas'></canvas>