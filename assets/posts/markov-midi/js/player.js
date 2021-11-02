function Player() {
  this.elems = {
    audios: document.querySelectorAll('audio'),
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
  this.soundfontUrl = '/assets/posts/markov-midi/js/soundfont/';
  this.initialize();
}

Player.prototype.handlePlayStopClick = function(e) {
  // determine the clicked element
  var target = e.target;
  if (target.tagName.toUpperCase() === 'IMG') target = target.parentNode;
  this.playing = target.getAttribute('id');
  // stop any playing audio
  this.stop();
  // handle the case the user clicked an audio tag
  if (target.tagName.toUpperCase() == 'AUDIO') {
    target.play();
  // handle the case the user clicked a custom div
  } else {
    // determine if the user clicked a play or pause button
    var img = target.querySelector('img');
    var mode = img.src.includes('play') ? 'play' : 'stop';
    // if the user clicked the stop button we're done
    if (mode === 'stop') {
      this.playing = null;
      this.updatePlayStopIcons();
      return;
    }
    // if the user clicked the play button prepare to play
    target.querySelector('audio').play();
  }
  // update the icons
  this.updatePlayStopIcons();
}

Player.prototype.updatePlayStopIcons = function() {
  for (var j=0; j<this.elems.playButtons.length; j++) {
    var elem = this.elems.playButtons[j];
    var id = elem.querySelector('audio').getAttribute('id');
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
  for (var i=0; i<this.elems.audios.length; i++) {
    if (this.elems.audios[i].getAttribute('id') !== this.playing) {
      this.elems.audios[i].pause();
      this.elems.audios[i].currentTime = 0;
    }
  }
}

Player.prototype.playMidi = function(id) {
  var self = this;
  var path = '/assets/posts/markov-midi/midis/mid/' + id;
  MIDI.loadPlugin({
    soundfontUrl: self.soundfontUrl,
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
  get(filename, callback);
}

Player.prototype.playText = function(s) {
  var time = 1;
  s.split(' ').slice(0,1000).forEach(function(i) {
    if (i[0] == 'n') {
      i = i.substring(1, i.length);
      var [note, duration] = i.split('_');
      note = parseInt(note);
      duration = parseFloat(duration) * 4;
      // add the notes to the sequence
      var idA = MIDI.noteOn(0, note, 120, time); // 120 == velocity
      var idB = MIDI.noteOff(0, note, time + duration);
      this.notes.push(idA);
      this.notes.push(idB);
    } else if (i[0] == 'w') {
      i = i.substring(1, i.length);
      time += parseFloat(i);
    }
  }.bind(this))

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
    audioFormat: 'mp3',
    instrument: 'acoustic_grand_piano',
    soundfontUrl: self.soundfontUrl,
    onsuccess: function() {
      self.initialized = true;
    }
  });
}

Player.prototype.addEventListeners = function() {
  for (var i=0; i<this.elems.playButtons.length; i++) {
    this.elems.playButtons[i].addEventListener('click', this.handlePlayStopClick.bind(this));
  }
  for (var i=0; i<this.elems.audios.length; i++) {
    this.elems.audios[i].addEventListener('onended', this.stop.bind(this))
    this.elems.audios[i].onplay = this.handlePlayStopClick.bind(this);
  }
}

function get(url, handleSuccess) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
      if (xmlhttp.status === 200) {
        if (handleSuccess) handleSuccess(xmlhttp.responseText)
      }
    };
  };
  xmlhttp.open('GET', url, true);
  xmlhttp.send();
};

var player = new Player();