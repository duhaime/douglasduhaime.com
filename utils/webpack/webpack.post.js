/**
* Combine and minify js assets for a post
*
* @args:
*   {str} infile: the path the a file with markdown headers
*     declaring the js to load on a page
*
* Example usage (from app root directory):
*   node utils/webpack/webpack.post.js _posts/2017-05-13-spenserian-networks.md
*
* Compiled assets are then available in /utils/webpack/build/
**/

var YAML = require('yamljs');
var fs = require('fs');
var _ = require('lodash');
var spawn = require('child_process').spawn;

// read the incoming .md file
var infile = process.argv[2];
var content = fs.readFile(infile, 'utf8', handleFile);

function handleFile(err, data) {
  if (err) return console.warn(err)

  // get the header yaml
  var header = data.split('---')[1];
  var args = YAML.parse(header);
  var js = _.castArray(args.js);
  var css = _.castArray(args.css);
  var assets = js.concat(css);

  // build up the require statements
  var indexjs = '';
  assets.forEach((i) => {
    if (i.includes('http://') || i.includes('https://')) return;
    indexjs += 'require("../../' + i + '");\n'
  })

  // write the index file to disk
  writeFile('utils/webpack/index.js', indexjs)
}

function writeFile(filename, content) {
  fs.writeFile(filename, content, (err) => {
    if (err) return console.warn(err);
    webpack();
  });
}

function webpack() {
  var cmd = spawn('npm', [
    'run',
    'compress-post'
  ]);

  cmd.stdout.on('data', ( (d) => console.log(d.toString() )))
  cmd.stderr.on('data', ( (d) => console.log(d.toString() )))
}
