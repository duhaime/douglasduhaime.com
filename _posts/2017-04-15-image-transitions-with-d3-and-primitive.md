---
layout: post
title: Image Transitions with D3 and Primitive
date: 2017-04-15
description: Fun and simple transitions between images using D3.js and @fogleman's Primitive library.
categories: d3 image-processing
thumbnail: /assets/posts/image-transitions/image-transitions-thumb.jpg
banner: /assets/posts/image-transitions/image-transitions-banner.jpg
js:
  - https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.js 
  - /assets/posts/image-transitions/draw.js
css: /assets/posts/image-transitions/image-transitions.css
---

[D3.js](https://d3js.org/) does magic with svgs, and [Primitive](https://github.com/fogleman/primitive) transforms images into svgs. Put them together and you can turn Kevin Bacon into Francis Bacon (click the page):

<div id='target'></div>

To help others produce image transitions like this, I put together a quick proof of concept [repository](https://github.com/duhaime/d3-image-transitions). The general approach is to transform each image from a raster object to an SVG object using Primitive. Here's a simple Python function that accomplishes this goal:

{% highlight python %}
from bs4 import BeautifulSoup
import json, sys, os, glob, subprocess, shlex

def img_to_svg(img):
  '''Read in the path to an image and use tfogelman/primitive
  to transform that image into an svg'''
  basename = os.path.basename(img)
  new_name = os.path.splitext(basename)[0] + '.svg'
  out_file = os.path.join(output_directory, new_name)
  call =  'primitive -i ' + img 
  call += ' -o ' + out_file
  call += ' -r ' + str(size)
  call += ' -s ' + str(size)
  call += ' -n 300' 
  call += ' -m 4'

  print(' * running', call)
  subprocess.call(shlex.split(call))
  return out_file
{% endhighlight %}

From there, one can transform the svg file to JSON for consumption within D3. Using BeautifulSoup installed via `pip install beautifulsoup4` makes it relatively to parse out each attribute from the elements in the SVG and transform them into a JSON object:

{% highlight python %}
def svg_to_json(svg):
  '''Read in the path to an svg and write json for that svg to disk'''
  filename = os.path.basename(svg)
  data = {
    'svg': {},
    'group': {},
    'rect': {},
    'points': [],
    'name': filename
  }

  with open(svg) as f:
    f = f.read()
    soup = BeautifulSoup(f, 'lxml')

    svg_elem = soup.find('svg')
    data['svg'] = {
      'width': svg_elem['width'],
      'height': svg_elem['height']
    }

    group = soup.find('g')
    data['group'] = {
      'transform': group['transform']
    } 

    rect = soup.find('rect')
    data['rect'] = {
      'x': rect['x'],
      'y': rect['y'],
      'width': rect['width'],
      'height': rect['height'],
      'fill': rect['fill']
    }

    point_attributes = ['fill', 'fill-opacity', 'cx', 'cy', 'rx', 'ry']
    points = soup.find_all('ellipse')
    for i in points:
      observation = {}
      for a in point_attributes:
        observation[a] = i[a]
      data['points'].append(observation)

  output_filename = filename.replace('.svg', '.json')
  outfile = os.path.join(output_directory, output_filename)
  with open(outfile, 'w') as out:
    json.dump(data, out)
{% endhighlight %}

Once that JSON is ready, one can load that data into D3 and use the general update pattern to transition between images. [Here](https://github.com/duhaime/d3-image-transitions/blob/master/draw.js) is the JS code used to generate the transition seen above. If you load that into a browser, fire up a web server, open your page and trigger a few click events, you should see a fun image transition.

For the complete code used in this post, feel free to visit the full [repository](https://github.com/duhaime/d3-image-transitions) and raise any questions or issues you might have. Happy coding!