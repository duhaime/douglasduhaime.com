(function() { 

  var state = {
    start: 0, // idx of first author represented
    end: 5    // idx of last author represented+1 (for slice)
  }

  // input data file and images repository
  var file = '/assets/posts/cheap-literature/data/author-publication-counts.json',
      images = '/assets/posts/cheap-literature/images/resized-headshots/';
  
  // mapping from author name as stored in d.author to author headshot
  var headshots = {
    'George Whitefield': 'george-whitefield-headshot.jpg',
    'Alexander Pope': 'alexander-pope-headshot.jpg',
    'Cotton Mather': 'cotton-mather-headshot.jpg',
    'Daniel Defoe': 'daniel-defoe-headshot.jpg',
    'Edward Young': 'edward-young-headshot.jpg',
    'Isaac Watts': 'isaac-watts-headshot.jpg',
    'John Bunyan': 'john-bunyan-headshot.jpg',
    'John Dryden': 'john-dryden-headshot.jpg',
    'John Wesley': 'john-wesley-headshot.jpg',
    'Jonathan Swift': 'jonathan-swift-headshot.jpg',
    'Oliver Goldsmith': 'oliver-goldsmith-headshot.jpg',
    'Richard Baxter': 'richard-baxter-headshot.jpg',
    'Voltaire': 'voltaire-headshot.jpg',
    'William Shakespeare': 'william-shakespeare-headshot.jpg',
    'John Milton': 'john-milton-headshot.jpg',
    'John Gay': 'john-gay-headshot.jpg',
    'William Lily': 'william-lily-headshot.jpg',
    'Hannah More': 'hannah-more-headshot.jpg',
    'James Christie': 'james-christie-headshot.jpg',
    'Thomas Paine': 'thomas-paine-headshot.jpg'
  }

  // chart options
  var options = function() {
    return {
      height: 60,
      width: 600,
      margin: {
        top: 5,
        right: 10,
        bottom: 20,
        left: 40
      },
      grid: true,
      x: 'year',
      y: 'value',
      domains: {
        x: [1700, 1800],
        y: [1, 1200]
      },
      ticks: {
        x: function(d) { return d; },
        y: function(d) { return [100, 1200].includes(d) ? d : '' }
      },
      stroke: function(d) { return '#ee6559'; },
      fill: function(d) { return '#ee6559' },
      drawArea: true,
      autoResize: window.innerWidth < 600 ? true : false
    }
  }

  // plot container
  var container = document.querySelector('#author-publications');

  // store for update functions per chart
  var updateChart = {};

  // main chart drawing function
  function redraw() {
    disableButtons();
    d3.json(file, function(json) {
      json = json.slice(state.start, state.end);
      json.forEach(function(d, i) {
        updateAuthorRow(d, i)

        var config = new options();
        config.data = d.values;
        config.container = '.author-row-' + i;

        if (updateChart[i]) {
          updateChart[i](config);
        } else {
          updateChart[i] = dd.chart(config);
        }

        updateRangeLabels()
      })
    })
  }

  // creates or updates the text and image for a given author row
  function updateAuthorRow(d, idx) {        
    var author = document.querySelector('.author-row-' + idx),
        name = author ? author.querySelector('.author-name') : null,
        img = author ? author.querySelector('.author-headshot') : null;

    if (author) {
      name.textContent = d.author;
      img.src = images + headshots[d.author];
    } else {
      createAuthorRow(d, idx)
    }
  }

  // create the html elements for an author's name and image
  function createAuthorRow(d, idx) {
    var author = document.createElement('div'),
        name = document.createElement('div'),
        img = document.createElement('img');

    author.className = 'author-row author-row-' + idx;
    name.className = 'author-name';
    name.textContent = d.author;
    img.className = 'author-headshot';
    img.src = images + headshots[d.author];

    author.appendChild(name);
    author.appendChild(img);
    container.appendChild(author);
  }

  // update the values indicating current page range
  function updateRangeLabels() {
    var rangeContainer = document.querySelector('.author-publications-range'),
        start = rangeContainer.querySelector('.range-start'),
        end = rangeContainer.querySelector('.range-end');

    start.innerHTML = state.start + 1;
    end.innerHTML = state.end;
  }

  // change the page of authors displayed
  function updateAuthorRange(val) {
    state.start += val;
    state.end += val;
    redraw();
  }

  // disable any buttons that need disabling
  function disableButtons() {
    previous.disabled = state.start === 0 ? true : false;
    next.disabled = state.end === 20 ? true : false;
  }

  var buttonContainer = document.querySelector('.author-publications-buttons'),
      previous = buttonContainer.querySelector('.previous'),
      next = buttonContainer.querySelector('.next');

  previous.addEventListener('click', function() {
    updateAuthorRange(-5)
  })

  next.addEventListener('click', function() {
    updateAuthorRange(5)
  })

  redraw();

})()