---
process: true
---

(function() {
  function convertToDuotone(container, color1, color2) {
    if (!container) return;
    var matrix = container.querySelector('feColorMatrix');
    var value = [];
    value = value.concat(
    [color1[0]/256 - color2[0]/256, 0, 0, 0, color2[0]/256]);
    value = value.concat(
    [color1[1]/256 - color2[1]/256, 0, 0, 0, color2[1]/256]);
    value = value.concat(
    [color1[2]/256 - color2[2]/256, 0, 0, 0, color2[2]/256]);
    value = value.concat([0, 0, 0, 1, 0]);
    matrix.setAttribute('values', value.join(' '));
  }

  var header = document.getElementById('header-duotone');

  convertToDuotone(header, [{{ site.light }}], [{{ site.dark }}]);
})()