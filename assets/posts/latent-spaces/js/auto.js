(function() {

  var dir = '/assets/posts/latent-spaces/data',
      model,
      trainX,
      epochs = d3.select('#auto-epochs'),
      loss = d3.select('#auto-loss');

  // state
  var nEpochs = 0,
      sampleIdx,
      training = false;

  /**
  * SVG setup
  **/

  var width = height = 140,
      perSide = 28,
      containers = ['#auto-input', '#auto-output'];

  var colorScale = d3.scaleLinear().domain([0, 1])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb('#007AFF'), d3.rgb('#FFF500')]);

  containers.forEach(function(i) {
    var svg = d3.select(i).select('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height);

    for (var y=0; y<perSide; y++) {
      for (var x=0; x<perSide; x++) {
        svg.append('rect')
          .attr('width', width/perSide)
          .attr('height', height/perSide)
          .attr('x', x * width/perSide)
          .attr('y', y * height/perSide)
          .attr('fill', 'rgb(10, 122, 255)')
      }
    }
  })

  function colorBoxes(selector, data) {
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
    colorBoxes('#auto-input', data);
    var data = model.auto.predict(trainX).dataSync().slice(start, end);
    colorBoxes('#auto-output', tf.abs(data).dataSync());
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

  d3.json(dir + '/trainX-sample.json').then(function(x) {
    model = new Autoencoder();
    trainX = tf.div(tf.tensor(x), 255); // scale {0:1}
    window.trainX = trainX;
    train();
    setTimeout(drawNewSample, 1000);
  })

  function train(args, cb) {
    if (training) return;
    args = args || {};
    args.batchSize = args.batchSize || 50;
    args.epochs = args.epochs || 100;
    args.callbacks = args.callbacks || {
      onEpochEnd: function(epoch, d) {
        nEpochs++;
        if (nEpochs % 10 == 0) {
          epochs.text(nEpochs);
          loss.text(d.loss);
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

  d3.select('#train-button').on('click', train);
  d3.select('#sample-button').on('click', drawNewSample);

  window.trainAuto = train;
  window.renderAutoSample = renderSample;

})();