---
layout: post
title: Clustering Semantic Vectors with Python
date: 2015-09-12
categories: posts
description: |
  Hard clustering semantic vectors using Stanford's GloVe word embeddings and Scikit Learn's K-Means implementation.
thumbnail: /assets/posts/semantic-vectors/semantic-vectors-thumb.jpg
banner: /assets/posts/semantic-vectors/semantic-vectors-banner.png
thumbnail_color: 'FBA1A3'
---

{% capture img_dir %}{{ site.baseurl }}/assets/posts/semantic-vectors/images{% endcapture %}

Google's Word2Vec and Stanford's GloVe have recently offered two fantastic open source software packages capable of transposing words into a high dimension vector space. In both cases, a vector's position within the high dimensional space gives a good indication of the word's semantic class (among other things), and in both cases these vector positions can be used in a variety of applications. In the post below, I'll discuss one approach you can take to clustering the vectors into coherent semantic groupings.

Both Word2Vec and GloVe can create vector spaces given a large training corpus, but both maintain pretrained vectors as well. To get started with ~1GB of pretrained vectors from GloVe, one need only run the following lines:

{% highlight bash %}
wget http://www-nlp.stanford.edu/data/glove.6B.300d.txt.gz
gunzip glove.6B.300d.txt.gz
{% endhighlight %}

If you unzip and then glance at glove.6B.300d.txt, you'll see that it's organized as follows:

{% highlight plaintext %}
the 0.04656 0.21318 -0.0074364 [...] 0.053913
, -0.25539 -0.25723 0.13169 [...] 0.35499
. -0.12559 0.01363 0.10306 [...] 0.13684
of -0.076947 -0.021211 0.21271 [...] -0.046533
to -0.25756 -0.057132 -0.6719 [...] -0.070621
[...]
sandberger 0.429191 -0.296897 0.15011 [...] -0.0590532
{% endhighlight %}

Each new line contains a token followed by 300 signed floats, and those values appear to be organized from most to least common. Given this ready format, it's fairly straightforward to get straight to clustering!

There are a variety of methods for clustering vectors, including density-based clustering, hierarchical clustering, and centroid clustering. One of the most intuitive and most commonly used centroid-based methods is K-Means. Given a collection of points in a space, K-Means uses a Hunger Games style random lottery to pick a few lucky points (colored green below), then assigns each of the non-lucky points to the lucky point to which it's closest. Using these preliminary groupings, the next step is to find the "centroid" (or geometric center) of each group, using the same technique one would use to find the center of a square. These centroids become the new lucky points, and again each non-lucky point is again assigned to the lucky point to which it's closest. This process continues until the centroids settle down and stop moving, after which the clustering is complete. Here's a nice visual description of K-Means [[source][kmeans-source]]:

<img src='{{ img_dir }}/kmeans.gif' id='gif' alt='Visualization of the K-Means clustering algorithm.'/>

To cluster the GloVe vectors in a similar fashion, one can use the sklearn package in Python, along with a few other packages:

{% highlight python %}

from __future__ import division
from sklearn.cluster import KMeans
from numbers import Number
from pandas import DataFrame
import sys, codecs, numpy

{% endhighlight %}

It will also be helpful to build a class to mimic the behavior of autovivification in Perl, which is essentially the process of creating new default hash values given a new key. In Python, this behavior is available through collections.defaultdict(), but the latter isn't serializable, so the following class is handy. Given an input key it hasn't seen, the class will create an empty list as the corresponding hash value:

{% highlight python %}

class autovivify_list(dict):
  '''A pickleable version of collections.defaultdict'''
  def __missing__(self, key):
    '''Given a missing key, set initial value to an empty list'''
    value = self[key] = []
    return value

  def __add__(self, x):
    '''Override addition for numeric types when self is empty'''
    if not self and isinstance(x, Number):
      return x
    raise ValueError

  def __sub__(self, x):
    '''Also provide subtraction method'''
    if not self and isinstance(x, Number):
      return -1 * x
    raise ValueError

{% endhighlight %}

We also want a method to read in a vector file (e.g. glove.6B.300d.txt) and store each word and the position of that word within the vector space. Because reading in and analyzing some of the larger GloVe files can take a long time, to get going quickly one can limit the number of lines to read from the input file by specifying a global value (n_words), which is defined later on:

{% highlight python %}

def build_word_vector_matrix(vector_file, n_words):
  '''Return the vectors and labels for the first n_words in vector file'''
  numpy_arrays = []
  labels_array = []
  with codecs.open(vector_file, 'r', 'utf-8') as f:
    for c, r in enumerate(f):
      sr = r.split()
      labels_array.append(sr[0])
      numpy_arrays.append( numpy.array([float(i) for i in sr[1:]]) )

      if c == n_words:
        return numpy.array( numpy_arrays ), labels_array

  return numpy.array( numpy_arrays ), labels_array

{% endhighlight %}

Scikit-Learn's implementation of K-Means returns an object (cluster_labels in these snippets) that indicates the cluster to which each input vector belongs. That object doesn't tell one which word belongs in each cluster, however, so the following method takes care of this. Because all of the words being analyzed are stored in labels_array and the cluster to which each word belongs is stored in cluster_labels, the following method can easily map those two sequences together:

{% highlight python %}

def find_word_clusters(labels_array, cluster_labels):
  '''Return the set of words in each cluster'''
  cluster_to_words = autovivify_list()
  for c, i in enumerate(cluster_labels):
    cluster_to_words[ i ].append( labels_array[c] )
  return cluster_to_words

{% endhighlight %}

Finally, we can call the methods above, perform K-Means clustering, and print the contents of each cluster with the following block:

{% highlight python %}
if __name__ == "__main__":
  input_vector_file = sys.argv[1] # Vector file input (e.g. glove.6B.300d.txt)
  n_words = int(sys.argv[2]) # Number of words to analyze
  reduction_factor = float(sys.argv[3]) # Amount of dimension reduction {0,1}
  n_clusters = int( n_words * reduction_factor ) # Number of clusters to make
  df, labels_array = build_word_vector_matrix(input_vector_file, n_words)
  kmeans_model = KMeans(init='k-means++', n_clusters=n_clusters, n_init=10)
  kmeans_model.fit(df)

  cluster_labels  = kmeans_model.labels_
  cluster_inertia   = kmeans_model.inertia_
  cluster_to_words  = find_word_clusters(labels_array, cluster_labels)

  for c in cluster_to_words:
    print cluster_to_words[c]
    print "\n"
{% endhighlight %}

The full script is available [here][script-link]. To run it, one needs to specify the vector file to be read in, the number of words one wishes to sample from that file (one can of course read them all, but doing so can take some time), and the "reduction factor", which determines the number of clusters to be made. If one specifies a reduction factor of .1, for instance, the routine will produce n*.1 clusters, where n is the number of words sampled from the file. The following command reads in the first 10,000 words, and produces 1,000 clusters:

{% highlight shell %}
python cluster_vectors.py glove.6B.300d.txt 10000 .1
{% endhighlight %}

The output of this command is the series of clusters produced by the K-Means clustering:

{% highlight shell %}
[u'Chicago', u'Boston', u'Houston', u'Atlanta', u'Dallas', u'Denver', u'Philadelphia', u'Baltimore', u'Cleveland', u'Pittsburgh', u'Buffalo', u'Cincinnati', u'Louisville', u'Milwaukee', u'Memphis', u'Indianapolis', u'Auburn', u'Dame']

[u'Product', u'Products', u'Shipping', u'Brand', u'Customer', u'Items', u'Retail', u'Manufacturer', u'Supply', u'Cart', u'SKU', u'Hardware', u'OEM', u'Warranty', u'Brands']

[u'home', u'house', u'homes', u'houses', u'housing', u'offices', u'household', u'acres', u'residence']

[...]

[u'Night', u'Disney', u'Magic', u'Dream', u'Ultimate', u'Fantasy', u'Theme', u'Adventure', u'Cruise', u'Potter', u'Angels', u'Adventures', u'Dreams', u'Wonder', u'Romance', u'Mystery', u'Quest', u'Sonic', u'Nights']
{% endhighlight %}

I'm currently using these word clusters for fuzzy plagiarism detection, but they can serve a wide variety of purposes. If you find them helpful for a project you're working on, feel free to drop me a note below!

[kmeans-source]: http://shabal.in/visuals.html
[script-link]: https://github.com/duhaime/cluster-semantic-vectors
