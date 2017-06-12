---
layout: page
permalink: '/pages/spenserian-networks/'
title: 'Poet Constellations'
js: 
  - https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js
  - https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js
  - /assets/pages/spenserian-networks/js/search.js
  - /assets/pages/spenserian-networks/js/legend.js
  - /assets/pages/spenserian-networks/js/spenserian-networks.js
  - /assets/pages/spenserian-networks/js/header.js
  - /assets/vendor/js/d3-labeler.js
css: /assets/pages/spenserian-networks/spenserian-networks.css
---
<div class='spenserian-networks'>

  <div class='spenserian-networks-header'>
    <h1>Spenserian Networks</h1>
  </div>

  {% include icons/home.html %}

  <div class='spenserian-networks-top'>
    <h1>Spenserian Networks</h1>
    <div class='intro-text'>
      <p>The chart below represents a network of literary relationships.</p>
      <p>Hover an author to see their connections, or search for an author below.</p>
      <p>You can read more about this work <a href='/posts/spenserian-networks.html'>here</a>.</p>
    </div>
    <div id='legend'></div>

    <div class='poet-networks-search-container'>
      <input id='poet-networks-input' placeholder='Search for a poet'>
      <div id='poet-networks-search'>Search</div>
      <div id='poet-networks-typeahead'></div>
    </div>
  </div>

  <div id='poet-networks'></div>
</div>