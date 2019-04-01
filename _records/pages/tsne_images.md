---
layout: page
description: |
  Projecting similar images to a 2D plane with Scikit Learn's TSNE implementation and D3.js + canvas.
permalink: '/pages/tsne-images/'
title: 'TSNE Images'
css: /assets/pages/tsne-images/tsne-images.css
js:
  - https://d3js.org/d3.v3.min.js
  - /assets/pages/tsne-images/tsne-images.js
---

{% include icons/home.html %}
<div class='legend'>
  <a href='/posts/identifying-similar-images-with-tensorflow.html'>
    <h1 class='return-link'>TSNE IMAGES</h1>
  </a>
  <p>This plot contains 500 images from the NYPL's Farm Security Administration <a href='https://digitalcollections.nypl.org/collections/farm-security-administration-photographs#/?tab=navigation'>collection</a> that were vectorized, run through a TSNE implementation, and projected onto two dimensions such that similar images appear close together. Read more about this work <a href='{{ site.baseurl }}/posts/identifying-similar-images-with-tensorflow.html'>here</a>.
  </p>
</div>
<div id='tooltip'>
  <img/>
</div>
<svg id='tsne-svg'></svg>
<canvas id='tsne-canvas'></canvas>