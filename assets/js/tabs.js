/* allow users to toggle the active tab */
(function() {

  // only run this function on the main route
  var path = window.location.pathname;
  if (path === '/#' || path === '/') {

    var tabNames = {
      0: 'posts',
      1: 'about'
    };

    setActiveTab = function(e) {
      var selectedIndex = e.target.getAttribute('data-tab-index');

      // highlight the active tab
      var tabs = document.querySelectorAll('.tab');
      tabs.forEach(function(tab, i) {
        tab.className = i == selectedIndex ? 'tab active' : 'tab'
      })

      // make the relevant tab content visible
      var tabContent = document.querySelectorAll('.tab-content');
      tabContent.forEach(function(tab, i) {
        tab.style.display = i == selectedIndex ? 'block' : 'none';
      })
    }

    addListeners = function() {
      var tabs = document.querySelectorAll('.tab');
      tabs.forEach(function(tab, i) {
        tabs[i].addEventListener('click', function(e) {
          setActiveTab(e)
        }, false)
      })
    }

    initialize = function() {
      // show the first tab content option
      document.querySelector('.tab-content').style.display = 'block';

      // add the click listeners to show/hide content as users click tabs
      addListeners();
    }

    initialize();
  }
})();