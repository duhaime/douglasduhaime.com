function Controls2D(obj) {

  // parse input arguments
  obj = obj || {};
  this.min = obj.min || 0;
  this.max = obj.max || 100;
  this.onDrag = obj.onDrag || function(a) {console.log('* sampling', a)};
  this.container = obj.container
    ? obj.container
    : document.querySelector('body');

  // state
  this.down = null; // object if we've mousedowned, else null

  // create the ui
  this.render = function() {
    this.box = document.createElement('div');
    this.box.id = 'ui-box';
    this.toggle = document.createElement('div');
    this.toggle.id = 'ui-toggle';
    this.box.appendChild(this.toggle);
    this.container.appendChild(this.box);
  }

  // style the ui
  this.style = function() {
    var style = document.createElement('style');
    style.textContent = '#ui-box {' +
      '  position: absolute;' +
      '  z-index: 99999999;' +
      '  width: 100px;' +
      '  height: 100px;' +
      '  background: #eee;' +
      '  border: 1px solid #7b7b7b;' +
      '  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);' +
      '  top: 40px;' +
      '  right: 40px;' +
      '}' +
      '#ui-toggle {' +
      '  width: 16px;' +
      '  height: 16px;' +
      '  background: #fff;' +
      '  border: 1px solid #909090;' +
      '  border-radius: 100%;' +
      '  position: relative;' +
      '  z-index: 100;' +
      '  display: inline-block;' +
      '  cursor: pointer;' +
      '  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);' +
      '}';
    document.head.appendChild(style);
  };

  // main function called on toggle drag
  this.moveToggle = function(e) {
    var position = offsetWithinBox(e),
        x = position.x,
        y = position.y,
        boxW = this.box.clientWidth,
        toggleW = this.toggle.clientWidth + 2; // 2px border
    x -= toggleW/2;
    y -= toggleW/2;
    // keep toggle in box
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > boxW - (toggleW/2)) x = boxW - (toggleW/2);
    if (y > boxW - (toggleW/2)) y = boxW - (toggleW/2);
    this.toggle.style.left = x + 'px';
    this.toggle.style.top = y + 'px';
    // pass scaled x, y coords to obj.onDrag callback
    this.onDrag({
      x: scale(x),
      y: scale(y),
    });
  }

  function start(e) {
    e.preventDefault();
    e.stopPropagation();
    this.down = true;
    this.moveToggle(e);
  }

  function move(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.down) this.moveToggle(e);
  }

  function end(e) {
    e.preventDefault();
    e.stopPropagation();
    this.down = false;
  }

  // add event listeners to controls
  this.addListeners = function() {
    this.box.addEventListener('mousedown', start.bind(this))
    this.box.addEventListener('touchstart', start.bind(this))
    this.box.addEventListener('mousemove', move.bind(this))
    this.box.addEventListener('touchmove', start.bind(this))
    document.addEventListener('mouseup', end.bind(this))
    document.addEventListener('touchend', end.bind(this))
  }

  // scale sampled value `v` from 0:82 to 0:1
  function scale(v) {
    return v/82;
  }

  // determine the offset of some event within an element
  function offsetWithinBox(e) {
    var target = e.target;
    if (target.id == 'ui-toggle') target = target.parentNode;
    var rect = target.getBoundingClientRect();
    var coords = getEventClientCoords(e);
    var x = coords.x - rect.left;
    var y = coords.y - rect.top;
    return {
      x: x,
      y: y,
    };
  }

  function getEventClientCoords(e) {
    return {
      x: e.touches && e.touches[0] && 'clientX' in e.touches[0]
        ? e.touches[0].clientX
        : e.changedTouches && e.changedTouches[0] && 'clientX' in e.changedTouches[0]
        ? e.changedTouches[0].clientX
        : e.clientX
        ? e.clientX
        : e.pageX,
      y: e.touches && e.touches[0] && 'clientY' in e.touches[0]
        ? e.touches[0].clientY
        : e.changedTouches && e.changedTouches[0] && 'clientY' in e.changedTouches[0]
        ? e.changedTouches[0].clientY
        : e.clientY
        ? e.clientY
        : e.pageY,
    }
  }

  this.style();
  this.render();
  this.addListeners();
}
