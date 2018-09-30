---
layout: post
title: Constrained Lloyd Iteration
date: 2018-09-29
categories: data-visualization
thumbnail: /assets/posts/lloyd-iteration/lloyd-iteration-thumb.jpg
banner: /assets/posts/lloyd-iteration/lloyd-iteration-banner.png
css:
js:
  - https://d3js.org/d3.v4.min.js
  - /assets/posts/lloyd-iteration/svg/plot-lloyd.js
---

{% assign img_dir = '/assets/posts/lloyd-iteration/images' %}

[Lloyd iteration](https://en.wikipedia.org/wiki/Lloyd%27s_algorithm) is an iterative algorithm that distributes points within a space. During each iteration of the algorithm, Lloyd iteration builds a [Voronoi map](https://en.wikipedia.org/wiki/Voronoi_diagram) in which each point is contained within a distinct Voronoi cell, then centers each point within its cell. This operation causes overlapping points to spread out within a distribution, which can be helpful for data visualization purposes:

<img src='{{ img_dir }}/unconstrained.gif'>

<div class='caption'>The illustration above shows the first 20 iterations of unconstrained Lloyd iteration on a sample distribution of points. As the number of iterations increases, points near the <a href='https://en.wikipedia.org/wiki/Convex_hull'>convex hull</a> (the outside border) tend toward infinity [<a target='_blank' href='https://gist.github.com/duhaime/04bf7db1d7d8d6a0d823ef88e31376fe'>gist</a>].</div>

Lloyd iteration does not constrain the expansion of points, which means that as the number of iterations increases, points near the <a href='https://en.wikipedia.org/wiki/Convex_hull'>convex hull</a> (the outside border) tend toward infinity. This can be a problem for many use cases, as Lloyd iterations can expand the domain of a set of points quite significantly.

It turns out one can solve this problem by adding vertices at the bounding box of the initial point distribution. These vertices will prevent the Voronoi map from extending beyond the initial point domains, which ensures the resulting point posititions remain inside the initial point domains:

<img src='{{ img_dir }}/constrained.gif'>

<div class='caption'>The illustration above shows the first 20 iterations of constrained Lloyd iteration on a sample distribution of points. As the number of iterations increases, points near the convex hull remain inside the initial points' x and y domains [<a target='_blank' href='https://gist.github.com/duhaime/347e1061d51139eb77ab6bf65b11debc'>gist</a>].</div>

As one can see, in just a few iterations, the constrained Lloyd model distributes points so as to prevent overlapping points. This lets one strategically "jitter" points so as to make it easy to interact with each (click to toggle):

<div>
  <svg id='lloyd-target'></svg>
  <div style='font-family:courier; text-align:center'>Showing points <span id='target'>before</span> Lloyd iteration.</div>
</div>

To make it easier to transform points in this way, I put together a small package named [lloyd](https://github.com/duhaime/lloyd). One can install the package with pip:

{% highlight bash %}
pip install lloyd
{% endhighlight %}

After installing the package, one can transform the positions of points within a two-dimensional numpy array in the following way:

{% highlight python %}
from lloyd import Field
import numpy as np

# generate 2000 observations with 2 dimensions
points = np.random.rand(2000, 2)

# create a lloyd model on which one can perform iterations
field = Field(points)

# run one iteration of Lloyd relaxation on the field of points
field.relax()

# get the resulting point positions
new_positions = field.get_points()
{% endhighlight %}

`new_positions` will then be a numpy array with the same shape as `points`, only the positions of each point will be updated by the Lloyd algorithm described above. To further distribute points, one can call the `.relax()` method on the lloyd model until the distribution is optimal for plotting.