function Player() {
  this.elems = {
    playButtons: document.querySelectorAll('.play-button'),
    playIcon: '/assets/posts/markov-midi/images/play.svg',
    stopIcon: '/assets/posts/markov-midi/images/stop.svg',
  }
  this.playing = null;
  this.text = '';
  this.notes = [];
  this.model = null;
  this.initialized = false;
  this.timeout = null;
  this.initialize();
}

Player.prototype.addEventListeners = function() {
  for (var i=0; i<this.elems.playButtons.length; i++) {
    this.elems.playButtons[i].addEventListener('click', this.handlePlayStopClick.bind(this));
  }
}

Player.prototype.handlePlayStopClick = function(e) {
  var target = e.target;
  if (target.tagName.toUpperCase() === 'IMG') target = target.parentNode;
  // determine if the user clicked a play or pause button
  var img = target.querySelector('img');
  var mode = img.src.includes('play') ? 'play' : 'stop';
  // stop the music; if the user clicked the stop button we're done
  this.stop();
  if (mode === 'stop') return;
  // if the user clicked the play button prepare to play
  var id = target.getAttribute('data-id');
  if (id.includes('.mid')) {
    this.playFile(id);
  } else if (id.includes('.txt')) {
    this.sampleText(id);
  }
}

Player.prototype.updatePlayStopIcons = function() {
  for (var j=0; j<this.elems.playButtons.length; j++) {
    var elem = this.elems.playButtons[j];
    var id = elem.getAttribute('data-id');
    elem.querySelector('img').src = id === this.playing
      ? this.elems.stopIcon
      : this.elems.playIcon
  }
}

Player.prototype.stop = function() {
  clearTimeout(this.timeout);
  MIDI.Player.pause();
  while (this.notes.length) {
    var note = this.notes.pop();
    try {
      note.stop();
    } catch (err) {}
  }
  this.playing = null;
  this.updatePlayStopIcons();
}

Player.prototype.playFile = function(id) {
  var self = this;
  var path = '/assets/posts/markov-midi/midis/mid/' + id;
  MIDI.loadPlugin({
    soundfontUrl: "/assets/posts/markov-midi/js/soundfont/",
    onsuccess: function() {
      MIDI.Player.loadFile(path, function() {
        self.playing = id;
        MIDI.Player.start();
        self.updatePlayStopIcons();
      });
    }
  });
  MIDI.Player.addListener(function(data) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(function() {
      self.stop();
    }, 2000)
    if (data.now >= data.end) self.stop();
  });
}

Player.prototype.loadText = function(filename, callback) {
  var self = this;
  fetch('/assets/posts/markov-midi/midis/text/' + filename)
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      callback(text);
    })
}

Player.prototype.playText = function(s) {
  var time = 1;
  s.split(' ').slice(0,1000).forEach(i => {
    if (i[0] == 'n') {
      i = i.substring(1, i.length);
      var [note, duration] = i.split('_');
      note = parseInt(note);

      duration = parseFloat(duration) * 4;
      /*
      duration = Math.random() > 0.5 ? 1 : 0.5;
      while (note < 60 - 24) note += 12;
      while (note > 60 + 24) note -= 12;
      */

      // add the notes to the sequence
      var idA = MIDI.noteOn(0, note, 120, time); // 120 == velocity
      var idB = MIDI.noteOff(0, note, time + duration);
      this.notes.push(idA);
      this.notes.push(idB);
    } else if (i[0] == 'w') {
      i = i.substring(1, i.length);

      time += parseFloat(i);
      /*
      time += Math.random() > 0.5 ? 0.25 : 0.5;
      */
    }
  })

  this.timeout = setTimeout(function() {
    this.stop();
  }.bind(this), time * 1000)

}

Player.prototype.sampleText = function(filename) {
  this.loadText(filename, function(text) {
    this.playing = filename;
    this.updatePlayStopIcons();
    this.text = text;
    this.model = new Markov(text);
    this.playText(this.model.sample());
  }.bind(this));
}

Player.prototype.initialize = function() {
  this.initializeAudio();
  this.addEventListeners();
}

Player.prototype.initializeAudio = function() {
  var self = this;
  MIDI.loadPlugin({
    soundfontUrl: "/assets/posts/markov-midi/js/soundfont/",
    onsuccess: function() {
      self.initialized = true;
    }
  });
}

var player = new Player();