(function() {

  /****************
  * Create search *
  ****************/

  var body = document.querySelector('body');
  var input = document.getElementById('poet-networks-input');
  var button = document.getElementById('poet-networks-search');
  var typeahead = document.getElementById('poet-networks-typeahead');

  body.addEventListener('click', handlePageClick);
  input.addEventListener('click', stopPropagation);
  input.addEventListener('keyup', updateTypeahead);
  typeahead.addEventListener('click', selectTypeahead);
  button.addEventListener('click', runSearch);

  var state = {
    typeaheadIndex: -1
  }

  /**
  * Search functions
  **/

  function stopPropagation(e) {
    e.stopPropagation();
  }

  function updateTypeahead(e) {
    var searchTerm = e.target.value.toLowerCase();

    // if the search term is empty, close the typeahead
    if (searchTerm.length === 0) {
      typeahead.style.display = 'none';
      return;
    }

    // get all names the user's query could match
    var names = getNames();

    // get the names that match the user's query
    var matchingNames = getMatchingNames(names, searchTerm);

    // if the user sent an arrow key, update the typeahead index
    if (e.keyCode == 40) incrementTypeaheadIndex(matchingNames);
    if (e.keyCode == 38) decrementTypeaheadIndex();

    // if the user sent the enter key, set the input value and search
    if (e.keyCode == 13) {
      handleTypeaheadSearch(matchingNames);
      return;
    }

    // update the name divs
    setTypeaheadValues(matchingNames);
  }

  /**
  * Function to get the list of names the user's query could match
  *
  * @args:
  *   none
  * @returns:
  *   {array}: an array of strings, each of which represents a poet's name
  **/

  function getNames() {
    var nameToId = window.poetNetwork.nameToId;
    return _.keys(nameToId);
  }

  /**
  * Function to parse out the names that match the user's query
  *
  * @args:
  *   {array} names: a list of names the user's query could match
  *   {str} searchTerm: the current value of the input box
  * @returns:
  *   {array}: an array of poet names that match the user's query
  **/

  function getMatchingNames(names, searchTerm) {
    return _.filter(names, function(n) {
      return (n.toLowerCase().includes(searchTerm));
    })
  }

  /**
  * Functon to increment the typeahead index state
  *
  * @args:
  *   {array} matchingNames: a list of all names that match the search
  * @returns:
  *   none
  **/

  function incrementTypeaheadIndex(matchingNames) {
    state.typeaheadIndex += 1;
    if (state.typeaheadIndex > matchingNames.length-1) {
      state.typaheadIndex = matchingNames.length-1;
    }
  }

  /**
  * Functon to decrement the typeahead index state
  *
  * @args:
  *   none
  * @returns:
  *   none
  **/

  function decrementTypeaheadIndex() {
    state.typeaheadIndex -= 1;
    if (state.typeaheadIndex < 0) {
      state.typeaheadIndex = 0;
    }
  }

  /**
  * Function triggered when users click enter on a typeahead element.
  * Set the value of the input to the given element, then trigger a search.
  *
  * @args:
  *   {array} matchingNames: a list of all names that match the user's search
  * @returns:
  *   none
  **/

  function handleTypeaheadSearch(matchingNames) {
    var query = matchingNames[state.typeaheadIndex];
    if (query) {
      input.value = query;
      hideTypeahead();
      runSearch();

      // reset the typeahead index state
      state.typeaheadIndex = -1;
    }
  }

  /**
  * Clickhandler that selects a given typahead element, sets
  * the input value to that element, then triggers a search
  *
  * @args:
  *   {obj} e: a click event
  * @returns:
  *   none
  **/

  function selectTypeahead(e) {
    e.stopPropagation();
    input.value = e.target.textContent;
    hideTypeahead();
    runSearch();
  }

  /**
  * Helper to hide the typeahead
  *
  * @args:
  *   none
  * @returns:
  *   none
  **/

  function hideTypeahead() {
    typeahead.style.display = 'none';
  }

  /**
  * Clickhandler for the page used to hide the typeahead
  *
  * @args:
  *   {obj} e: a click event
  * @returns:
  *   none
  **/

  function handlePageClick(e) {
    window.poetNetwork.clearGraph();
    hideTypeahead();
  }

  /**
  * Clickhandler that finds the current value of the input box
  * and submits a search for that value
  *
  * @args:
  *   {obj} e: a click event
  * @returns:
  *   none
  **/

  function runSearch(e) {
    e ? e.stopPropagation() : {};
    var query = input.value;
    var poetId = window.poetNetwork.nameToId[query];
    if (poetId) {
      window.poetNetwork.findPoet(poetId);
      scrollToPoet(poetId);  
    }
  }

  /**
  * Function that sets the typeahead values in the DOM
  *
  * @args:
  *   {array} matchingNames: a list of names that match the user's query
  * @returns:
  *   none
  **/

  function setTypeaheadValues(matchingNames) {
    var divs = '';
    matchingNames.map(function(n, i) {
      divs += (i == state.typeaheadIndex) ?
          '<div class="active">' + n + '</div>'
        : '<div>' + n + '</div>';
    })

    typeahead.innerHTML = divs;
    typeahead.style.display = 'inline-block';
  }

  /**
  * Function that scrolls to a given poetId node
  *
  * @args:
  *   {int} poetId: the poetId assigned to a given poet
  * @returns:
  *   none
  **/

  function scrollToPoet(poetId) {
    var elem = d3.select('#node-' + poetId);
    var offsetTop = elem.node().getBoundingClientRect().top;
    scrollTo(offsetTop - 300, 100);
  }

  /**
  * Function to smooth scroll on a page
  *
  * @args:
  *   {int} to: the y position of document to which we should scroll
  *   {int} duration: the duration of the scroll
  * @returns:
  *   none
  **/

  function scrollTo(to, duration) {
    if (duration <= 0) return;
    var doc = document.documentElement;
    var scrolled = (window.pageYOffset || doc.scrollTop) -
        (doc.clientTop || 0);
    var difference = to - scrolled;
    var perTick = difference / duration * 10;

    setTimeout(function() {
      window.scrollTo(0, scrolled + perTick);
      if (scrolled + perTick === to) return;
      scrollTo(to, duration - 10);
    }, 10);
  }

})()