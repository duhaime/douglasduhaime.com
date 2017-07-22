---
layout: page
description: Mapping the distribution of early London printers (1473-1852) with Tangram.js.
permalink: '/pages/london-publishers/'
title: 'London Publishers'
js: 
  - https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.1/leaflet.js
  - https://cdn.rawgit.com/mlevans/leaflet-hash/master/leaflet-hash.js
  - https://mapzen.com/tangram/0.12/tangram.min.js
  - /assets/pages/london-publishers/map.js
css:
  - https://fonts.googleapis.com/css?family=Pirata+One
  - https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.1/leaflet.css
  - /assets/pages/london-publishers/style.css
---

<div id='map'>
  <div id='legend'>
    <img src='/assets/pages/london-publishers/images/ribbon.svg'>
    <div class='legend-label'>
      <svg width='200' height='150'>
        <defs>
          <path id='textpath' d='M10 45 C 83 20, 83 20, 200 50'/>
        </defs>
        <text fill='#444'>
          <textPath xlink:href='#textpath'>Early London Printers</textPath>
        </text>
      </svg>
    </div>
    <div class='legend-description-container'>
      <div class='legend-description'>Shewing known printers in London, 1473-1851.<div>Read more <a href='/posts/mapping-the-early-english-book-trade.html'>here</a>.</div>
      </div>
    </div>
  </div>

  <div id='building-details'>
    <div class='building-address'></div>
    <div class='building-workers'></div>
  </div>
</div>
