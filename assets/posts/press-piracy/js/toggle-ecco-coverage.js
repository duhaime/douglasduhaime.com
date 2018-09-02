(function() {

  var a = document.querySelector('#ecco-titles-raw'),
      b = document.querySelector('#ecco-titles-percent');

  a.addEventListener('click', function() {
    a.style.display = 'none';
    b.style.display = 'block';
  })

  b.addEventListener('click', function() {
    b.style.display = 'none';
    a.style.display = 'block';
  })

})()