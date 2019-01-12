;(function() {

  // globals
  var dir = '/assets/posts/printing-geography/js/edition-sampler',
      targetElem = document.querySelector('#reprint-sample-target'),
      templateElem = document.querySelector('#reprint-sample-template'),
      buttonElem = document.querySelector('#resample');

  function get(url, handleSuccess, handleErr) {
    handleSuccess = handleSuccess || function() {};
    handleErr = handleErr || function() {};
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        xmlhttp.status === 200
          ? handleSuccess(JSON.parse(xmlhttp.responseText))
          : handleErr(xmlhttp)
      };
    };
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
  };

  function formatName(item) {
    return item.author.trim()
      ? item.author.trim()
      : 'Anonymous'
  }

  function formatCity(item) {
    return item.imprint_city.trim()
          ? item.imprint_city.trim()
          : 'S.L.';
  }

  function formatTitle(d) {
    d.display_title = d.display_title.trim();
    return d.display_title.length > 40
      ? d.display_title.substring(0, 40).trim() + '...'
      : d.display_title;
  }

  function setActiveRow(e) {
    var rows = document.querySelectorAll('.sample-match-row');
    var deactivate = e.target.parentNode.className.includes('active');
    for (var i=0; i<rows.length; i++) {
      rows[i].className = rows[i].className.replace(' active', '');
    }
    if (!deactivate) e.target.parentNode.className += ' active';
  }

  function shuffle(l) {
    var plucked = [],
        len = l.length;
    while (plucked.length < len) {
      var idx = parseInt(Math.random() * l.length);
      plucked.push( l.splice(idx, 1)[0] );
    }
    return plucked;
  }

  function stopPropagation(e) {
    e.stopPropagation();
  }

  function renderEditions() {
    get(dir + '/reprint-sample.json', function(data) {
      // sample only n observations from data
      var selected = shuffle(data).slice(0, 5);

      // format the data for display
      var formatted = [];
      selected.forEach(function(group) {
        var groupData = {
          teaser: {
            author: formatName(group[0]),
            display_title: formatTitle(group[0]),
          }
        };
        group.forEach(function(d) {
          d.author = formatName(d);
          d.location = formatCity(d);
          d.display_title = formatTitle(d);
        })
        groupData.group = group;
        formatted.push(groupData);
      })

      targetElem.innerHTML = _.template(templateElem.textContent)({
        groups: formatted,
      });

      // bind event listeners on each clickable row
      var rows = document.querySelectorAll('.sample-match-row');
      for (var i=0; i<rows.length; i++) {
        rows[i].addEventListener('click', setActiveRow);
      }

      var tags = document.querySelectorAll('.sample-match a');
      for (var i=0; i<tags.length; i++) {
        tags[i].addEventListener('click', stopPropagation);
      }
    })
  }

  // bind event listeners to the resample button
  buttonElem.addEventListener('click', renderEditions);

  // main
  renderEditions();

})();
