(function() {

  /****************
  * Create search *
  ****************/

  var body = document.querySelector('body')
  var input = document.getElementById('poet-networks-input')
  var button = document.getElementById('poet-networks-search')
  var typeahead = document.getElementById('poet-networks-typeahead')

  body.addEventListener('click', handlePageClick)
  input.addEventListener('click', stopPropagation)
  input.addEventListener('keyup', updateTypeahead)
  typeahead.addEventListener('click', selectTypeahead)
  button.addEventListener('click', runSearch)

  /**
  * Search functions
  **/

  function stopPropagation(e) {
    e.stopPropagation();
  }

  function updateTypeahead(e) {
    var searchTerm = e.target.value.toLowerCase();
    if (searchTerm.length === 0) {
      typeahead.style.display = 'none';
      return;
    }

    var nameToId = window.poetNetwork.nameToId;
    var names = _.keys(nameToId);
    var matchingNames = _.filter(names, function(n) {
      return (n.toLowerCase().includes(searchTerm))
    })
    
    var divs = '';
    matchingNames.map(function(n) {
      divs += '<div>' + n + '</div>';
    })

    typeahead.innerHTML = divs;
    typeahead.style.display = 'inline-block';
  }

  function selectTypeahead(e) {
    e.stopPropagation()
    input.value = e.target.textContent;
    hideTypeahead()
    runSearch()
  }

  function hideTypeahead() {
    typeahead.style.display = 'none';
  }

  function handlePageClick() {
    window.poetNetwork.clearGraph()
    hideTypeahead()
  }

  function runSearch(e) {
    e ? e.stopPropagation() : {};
    var query = input.value;
    var poetId = window.poetNetwork.nameToId[query];
    if (poetId) {
      window.poetNetwork.findPoet(poetId);
      scrollToPoet(poetId);  
    }
  }

  function scrollToPoet(poetId) {
    var elem = d3.select('#node-' + poetId);
    var offsetTop = elem.node().getBoundingClientRect().top;
    scrollTo(document.body, offsetTop - 300, 100)
  }

  /**
  * Function to smooth scroll on a page
  * @author: TimWolla
  * @source: http://stackoverflow.com/questions/8917921
  **/

  function scrollTo(element, to, duration) {
    if (duration <= 0) return;
    var difference = to - element.scrollTop;
    var perTick = difference / duration * 10;

    setTimeout(function() {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        scrollTo(element, to, duration - 10);
    }, 10);
  }

})()