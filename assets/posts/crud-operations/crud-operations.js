(function() {

  // game elements
  var container = document.querySelector('.ghost-container');
  var greeting = document.querySelector('.greeting');
  var ghost = document.querySelector('.ghost');
  var game = document.querySelector('.game');
  var start = document.querySelector('.start');
  var score = document.querySelector('.score');
  var timer = document.querySelector('.timer');

  // game over elements
  var gameOver = document.querySelector('.game-over');
  var endScore = document.querySelector('.end-score');
  var userName = document.querySelector('.user-name');
  var userScore = document.querySelector('.user-score');

  // scoreboard elements
  var loader = document.querySelector('#loader');
  var loadScores = document.querySelector('#load-scores');
  var ghostIframe = document.querySelector('#ghost-iframe');
  var saveScore = document.querySelector('.save-score');
  var form = document.querySelector('.ghost-container form');

  var state = {
    time: 11,
    score: 0,
    started: false
  }

  var postUrl = 'https://script.google.com/macros/s/AKfycbzJhcQAb01-jNJyNhU3OOxoSga2JiTu8HhnDlChJExVJJSSGiU/exec'

  start.addEventListener('click', startGame)
  ghost.addEventListener('click', incrementClicks)
  saveScore.addEventListener('click', showLoader)
  ghostIframe.addEventListener('load', getTopScores)
  loadScores.addEventListener('click', getTopScores)

  /**
  * Start the game
  **/

  function startGame() {
    state.started = true;
    greeting.style.display = 'none';
    decrementTime()
  }

  /**
  * Game end event
  **/

  function endGame() {
    gameOver.style.display = 'block';
    endScore.innerHTML = 'Your Score: ' + state.score;
    userScore.value = state.score;
  }

  /**
  * Decrement the time left in the game
  **/

  function decrementTime() {
    state.time--;
    if (state.time == 0) {
      endGame()
    } else {
      timer.innerHTML = 'Time: ' + state.time;
      setTimeout(decrementTime, 1000);
    }
  }

  /**
  * Count the user clicks
  **/

  function incrementClicks() {
    state.score++;
    score.innerHTML = 'Score: ' + state.score;
    userScore.value = state.score;
  }

  /**
  * Show the loader
  **/

  function showLoader() {
    ghost.style.display = 'none';
    greeting.style.display = 'none';
    game.style.display = 'none';
    gameOver.style.display = 'none';
    loader.style.display = 'block';
  }

  /**
  * Function to request top scores
  **/

  function getTopScores(e) {
    // firefox calls iframe.load on document.load
    if (e.type === 'load' && !state.started) return;

    showLoader()

    var xhr = new XMLHttpRequest();
    xhr.open('GET', postUrl + '?callback=""');
    xhr.onreadystatechange = function(e) {
      if (xhr.readyState === XMLHttpRequest.DONE &&
          xhr.status === 200) {
        var result = JSON.parse(e.target.response);
        buildResultTable(result.data)
      }
    }
    xhr.send();
  }

  /**
  * Build the result table and append it to the DOM
  **/

  function buildResultTable(data) {
    var table = '<table class="scoreboard">';
    table += '<caption>Scoreboard</caption>';
    table += '<thead><th>Date</th><th>Name</th><th>Score</th></thead>';
    var rows = [],
        data = data.splice(21, data.length);

    var str = data.reduce(function(s, row) {
      if (row[0] && row[1] && row[2]) {
        s += '<tr>' +
          '<td>' + row[0].substring(0, 10) + '</td>' +
          '<td>' + row[1] + '</td>' +
          '<td>' + row[2] + '</td>' +
          '</tr>';
      }
      return s;
    }, '')

    container.innerHTML = table + str + '</table>';
    container.style.height = '280px';
    container.style.overflow = 'auto';
  }

})()