(function() {

  window.mnist = window.mnist || {};

  var dir = '/assets/posts/latent-spaces/data',
      epochs = d3.select('#auto-epochs'),
      loss = d3.select('#auto-loss'),
      colors = ['#81a8d4','#c4ccd8','#f0d8b0','#f1ca7e','#e9b053','#ee7d58','#e55646','#d53a26'],
      domain = colors.reduce(function(arr, i, idx) {
          arr.push((idx+1)/colors.length); return arr;
        }, [0]),
      colorScale = d3.scaleLinear()
        .domain(domain)
        .range(colors),
      model,
      trainX;

  // state
  var nEpochs = 0,
      sampleIdx,
      training = false;

  /**
  * SVG setup
  **/

  function drawSvg(selector, width, height, scale) {
    var perSide = 28,
        svg = d3.select(selector).select('svg');
    if (scale) {
      svg.attr('viewBox', '0 0 ' + width + ' ' + height);
    } else {
      svg.attr('width', width);
      svg.attr('height', height);
    }
    for (var y=0; y<perSide; y++) {
      for (var x=0; x<perSide; x++) {
        svg.append('rect')
          .attr('width', width/perSide)
          .attr('height', height/perSide)
          .attr('x', x * width/perSide)
          .attr('y', y * height/perSide)
          .attr('fill', colors[0])
      }
    }
  }

  function updateSvg(selector, data) {
    var target = d3.select(selector).select('svg');
    target.selectAll('rect').data(data).transition()
      .duration(500)
      .delay(function(d, idx) { return Math.random() * 750; })
      .attr('fill', function(d, idx) { return colorScale(d); })
  }

  function renderSample() {
    var n = model.img_units, // n pixels per image
        start = n * sampleIdx,
        end = n * (sampleIdx+1);
    var data = trainX.dataSync().slice(start, end);
    updateSvg('#auto-input', data);
    var data = model.auto.predict(trainX).dataSync().slice(start, end);
    updateSvg('#auto-output', tf.abs(data).dataSync());
  }

  function drawNewSample() {
    sampleIdx = parseInt(Math.random() * 50);
    renderSample();
  }

  /**
  * Autoencoder setup
  **/

  function Autoencoder(obj) {
    obj = obj || {};
    this.latent_dim = obj.latent_dim || 2;
    this.n_layers = obj.n_layers || 2;
    this.n_units = obj.n_units || 128;
    this.img_shape = obj.img_shape || [28,28];
    this.img_units = this.img_shape[0] * this.img_shape[1];

    // build the encoder
    var i = tf.input({shape: this.img_shape})
    var h = tf.layers.flatten().apply(i)
    for (var j=0; j<this.n_layers; j++) {
      var h = tf.layers.dense({units: this.n_units, activation:'relu'}).apply(h)
    }
    var o = tf.layers.dense({units: this.latent_dim}).apply(h)
    this.encoder = tf.model({inputs: i, outputs: o});

    // build the decoder
    var i = h = tf.input({shape: this.latent_dim})
    for (var j=0; j<this.n_layers; j++) {
      var h = tf.layers.dense({units: this.n_units, activation:'relu'}).apply(h)
    }
    var o = tf.layers.dense({units: this.img_units}).apply(h)
    var o = tf.layers.reshape({targetShape: this.img_shape}).apply(o)
    this.decoder = tf.model({inputs: i, outputs: o})

    // stack the autoencoder
    var i = tf.input({shape: this.img_shape})
    var z = this.encoder.apply(i)
    var o = this.decoder.apply(z)
    this.auto = tf.model({inputs: i, outputs: o})
    this.auto.compile({optimizer: 'adam', loss: 'meanSquaredError', lr: 0.1})
  }

  function train(args, cb) {
    if (training) return;
    args = args || {};
    args.batchSize = args.batchSize || 50;
    args.epochs = args.epochs || 100;
    args.callbacks = args.callbacks || {
      onEpochEnd: function(epoch, d) {
        nEpochs++;
        if (nEpochs % 1 == 0) {
          requestAnimationFrame(function() {
            epochs.text(nEpochs);
            loss.text(d.loss)
          });
        }
      },
      onTrainBegin: function() {
        training = true;
      },
      onTrainEnd: function() {
        renderSample();
        training = false;
      }
    };
    model.auto.fit(trainX, trainX, args); // returns promise
  }

  /**
  * Main
  **/

  var width = height = 140,
      perSide = 28;
  ['#auto-input', '#auto-output'].forEach(function(i) {
    drawSvg(i, width, height, perSide, true);
  })

  d3.json(dir + '/trainX-sample.json').then(function(x) {
    model = new Autoencoder();
    trainX = tf.div(tf.tensor(x), 255); // scale {0:1}
    train();
    setTimeout(drawNewSample, 1000);
  })

  d3.select('#train-button').on('click', train);
  d3.select('#sample-button').on('click', drawNewSample);

  window.mnist.drawSvg = drawSvg;
  window.mnist.updateSvg = updateSvg;
})();