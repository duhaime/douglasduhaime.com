/* Function to load google fonts async on mobile devices */
(function() {
    var width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;
    if (width > 600) return;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '//fonts.googleapis.com/css?family=Montserrat:400,500|Merriweather';
    document.querySelector('head').appendChild(link);
})();