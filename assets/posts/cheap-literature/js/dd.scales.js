/**
* Scales
**/

(function() {
  window.dd = window.dd || {};
  window.dd.scales = function(obj, _dd) {

    _dd.domains = {
      x: getDomain(_dd.data, 'x'),
      y: getDomain(_dd.data, 'y')
    }

    _dd.scales = {
      x: getScale(_dd.data, 'x')
        .domain(_dd.domains.x)
        .range([0, _dd.chart.width]),

      y: getScale(_dd.data, 'y')
        .domain(_dd.domains.y)
        .range([_dd.chart.height, 0]),

      color: d3.scale.category20b()
    }

    /**
    * Domain helpers
    **/

    function getDomain(data, axis) {
      var domain = obj.domains[axis] ?
          obj.domains[axis]
        : [null, null];

      domain = _.filter(domain, function(d) {
        return typeof(d) === 'number' || typeof(d) === 'string';
      })

      if (domain.length === 2) {
        return domain;
      }

      if (obj.scales[axis] && obj.scales[axis] === 'ordinal') {
        return _.groupBy(data, _dd.accessors[axis]);
      }

      var dataDomain = d3.extent(data, function(d) {
        return d[_dd.accessors[axis]];
      })

      if (domain[0]) dataDomain[0] = domain[0];
      if (domain[1]) dataDomain[1] = domain[1];
      return dataDomain;
    }

    /**
    * Scale helpers
    **/

    function getScale(data, axis) {
      if (obj.scales && obj.scales[axis]) {
        switch(obj.scales[axis]) {
          case 'ordinal':
            return d3.scale.ordinal()

          case 'log':
            return d3.scale.log()

          case 'linear':
            return d3.scale.linear()
        }
      } else {
        return d3.scale.linear()
      }
    }

    return _dd;
  }
})()