---
layout: page
permalink: '/pages/poet-constellations/'
title: 'Poet Constellations'
js: 
  - /assets/vendor/js/lodash.min.js
  - /assets/vendor/js/d3.min.js
  - /assets/pages/poet-constellations/js/search.js
  - /assets/pages/poet-constellations/js/legend.js
  - /assets/pages/poet-constellations/js/poet-constellations.js
  - /assets/pages/poet-constellations/js/header.js
css: /assets/pages/poet-constellations/poet-constellations.css
---

<div class='poet-constellations-header'>
  <h1>Poet Constellations</h1>
</div>

{% include icons/home.html %}

<h1>Poet Constellations</h1>

The chart below represents a network of literary relationships.

<div id='legend'></div>

<div class='poet-networks-search-container'>
  <input id='poet-networks-input' placeholder='Search for a poet'>
  <div id='poet-networks-search'>Search</div>
  <div id='poet-networks-typeahead'></div>
</div>

<div id='poet-networks'></div>