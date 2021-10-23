function Markov(s, sequenceLength=4) {
  this.d = {}
  this.text = s;
  this.sep = '#';
  this.build(sequenceLength=sequenceLength);
  this.last = null; // last generated sample
}

Markov.prototype.build = function(sequenceLength=6) {
  // get the list of token sequences
  var sequences = [];
  var sequence = [];
  this.text.split(' ').forEach(function(t) {
    // skip empty tokens
    if (t) {
      sequence.push(t);
      if (sequence.length === sequenceLength) {
        sequences.push(sequence.join(this.sep));
        sequence = [];
      }
    }
  }.bind(this))
  // after we get the sequences, build the dictionary
  var d = {};
  var last = false;
  sequences.forEach(function(s) {
    if (last) {
      d[last] = d[last] || [];
      d[last].push(s);
    }
    last = s;
  })
  this.sequences = sequences;
  this.d = d;
}

Markov.prototype.sample = function(length=200, prompt=null) {
  // continue sampling from dictionary until we have the desired length
  var idx = Math.floor(Math.random() * this.sequences.length-1);
  var start = prompt || this.sequences[ idx ];
  var sequences = [ start ];
  while (sequences.length < length) {
    var last = sequences[sequences.length-1];
    try {
      var idx = Math.floor(Math.random() * this.d[last].length);
      sequences.push(this.d[last][idx]);
    } catch (err) {
      console.log(' * could not get sample', sequences, last)
    }
  }
  // format into a string
  var generated = '';
  sequences.forEach(function(s) {
    generated += s.split(this.sep).join(' ') + ' ';
  }.bind(this))
  // store the last generated string for reference
  this.last = {
    start: start,
    s: generated,
  };
  // return the generated string
  return generated;
}