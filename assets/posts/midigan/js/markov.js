function Markov(s) {
  this.d = {}
  this.s = s;
  this.build();
  this.last = null; // last generated sample
}

Markov.prototype.build = function(sequenceLength=4) {
  // get the list of token sequences
  var sequences = [];
  var sequence = [];
  this.s.split(' ').forEach(function(t) {
    sequence.push(t);
    if (sequence.length === sequenceLength) {
      sequences.push(sequence);
      sequence = [];
    }
  })
  // after we get the sequences, build the dictionary
  var d = {};
  var last = null;
  sequences.forEach(function(s) {
    if (last) {
      if (last in d) {
        d[last].concat(s);
      } else {
        d[last] = [s]
      }
    }
    last = s;
  })
  this.sequences = sequences;
  this.d = d;
}

Markov.prototype.sample = function(length=250) {
  // continue sampling from dictionary until we have the desired length
  var sequences = [ this.sequences[ parseInt(Math.random() * this.sequences.length) ] ];
  while (sequences.length < length) {
    var last = sequences[sequences.length-1];
    sequences.push(this.d[last][ parseInt(Math.random() * this.d[last].length) ]);
  }
  // format into a string
  var generated = '';
  sequences.forEach(s => {
    generated += s.join(' ') + ' ';
  })
  this.last = generated;
  return generated;
}