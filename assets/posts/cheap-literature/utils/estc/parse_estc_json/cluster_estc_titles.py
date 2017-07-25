"""For each title, determine whether that title was printed
as a different edition, and if so, assign all such editions
to a unique title cluster"""

from __future__ import division
from collections import defaultdict, Counter
from operator import itemgetter, truediv, mul
from itertools import starmap
from functools import reduce
from datasketch import MinHash, MinHashLSH
from nltk import ngrams
from pyxdameraulevenshtein import normalized_damerau_levenshtein_distance
import codecs, json, urllib2, difflib, itertools, multiprocessing, sys
import numpy as np

sys.path.append("../../"); from dissertation.api import Query

###
# Common
###

def write_json(j, filename):
  """Read in json and a filename and write that json to disk"""
  with open("json/" + filename, 'w') as out:
    json.dump(j, out)

###
# Cluster Titles
###

def get_author_to_records(records):
  """Read in an array of estc records and return an object with form:
  d[last_name][i] = [list of records] where i is a band of texts
  with a given length"""
  author_dict = defaultdict(list)

  # map each author key to an array of records they wrote
  for record in records:
    author = record["marc_last_name"]
    author_dict[author].append(record)

  return author_dict


def get_similarity(title_a, title_b, method="difflib"):
  """Read in two titles and return a measure of their similarity"""
  
  # run a quick check to get a fast high level estimate of the string
  # similarity, and follow up with a more precise measurement if the
  # first is above the required threshold. The real_quick_ratio will
  # always be greater than or equal the ratio similarity
  if method == "difflib":
    result = difflib.SequenceMatcher(None, title_a, title_b, autojunk=False)
    real_quick_ratio = result.real_quick_ratio()
    if real_quick_ratio >= min_similarity:
      return result.ratio()
    return 0
  
  elif method == "damerau":
    try:
      return 1 - normalized_damerau_levenshtein_distance(title_a, title_b)
    except ZeroDivisionError:
      return 0

  else:
    raise Exception("Only difflib and damerau similarity are supported")


def cluster_author_records(author_key):
  """Read in a single author's key and return an object mapping
  each of that author's records to a single cluster identifier"""
  author_records = author_to_records[author_key]
  estc_id_to_cluster = {}

  # Create a MinHashLSH index optimized for Jaccard threshold 0.5,
  # that accepts MinHash objects with 128 permutation functions
  lsh = MinHashLSH(threshold=0.5, num_perm=128)

  # Create one MinHash object for each title
  minhashes = {}
  for c, r in enumerate(author_records):
    minhash = MinHash(num_perm=128)
    for ngram in ngrams(r["display_title"], 3):
      minhash.update("".join(ngram).encode('utf-8'))
    lsh.insert(c, minhash)
    minhashes[c] = minhash

  # for each minhash bucket, run an all against all comparison
  for i in xrange(len(author_records)):
    matches = lsh.query(minhashes[i])
    matching_records = [author_records[j] for j in matches]
    estc_id_to_cluster = all_against_all_comparison(estc_id_to_cluster,
      matching_records, author_key)

  return format_results(estc_id_to_cluster)


def all_against_all_comparison(estc_id_to_cluster, author_records, author_key):
  """Read in a mapping from estc_id to the cluster to which that title belongs,
  an array of author record objects, and the string representation of the
  author's last name, and return an updated mapping of estc id to cluster id"""
  author_record_combinations = itertools.combinations(author_records, 2)
  total_combinations = count_combinations(len(author_records), 2)

  for c, record_pair in enumerate(author_record_combinations):
    try:
      if c % 10 == 0:
        print " * ", (c+1)/total_combinations,
        print "compared", c+1, "of", total_combinations,
        print "combinations of", len(author_records), "titles",
        print "with author key", author_key

      record_a = record_pair[0]
      record_b = record_pair[1]

      if record_a["estc_id"] > record_b["estc_id"]:
        record_b = record_pair[0]
        record_a = record_pair[1]

      estc_id_a = record_a["estc_id"]
      estc_id_b = record_b["estc_id"]

      title_a = record_a["display_title"]
      title_b = record_b["display_title"]

      similarity = get_similarity(title_a, title_b, method="damerau")

      # these titles are sufficiently similar, so map them to the same cluster
      if similarity > min_similarity:
        estc_id_to_cluster = update_cluster_mapping(estc_id_to_cluster,
            estc_id_a, estc_id_b)

      # here we assign each unclustered title to its own cluster
      else:
        if estc_id_a not in estc_id_to_cluster.iterkeys():
          estc_id_to_cluster[estc_id_a] = estc_id_a

        if estc_id_b not in estc_id_to_cluster.iterkeys():
          estc_id_to_cluster[estc_id_b] = estc_id_b

    except Exception as exc:
      print exc

  return estc_id_to_cluster


def update_cluster_mapping(estc_id_to_cluster, estc_id_a, estc_id_b):
  """Read in a mapping from estc id to cluster, update that mapping,
  and return the mapping"""

  # On occassion it may be the case that both estc_id_a and b have
  # been mapped to different clusters. In this case, unite those
  # clusters
  if all(r in estc_id_to_cluster.keys() for r in [estc_id_a, estc_id_b]):
    if estc_id_to_cluster[estc_id_a] != estc_id_to_cluster[estc_id_b]:
      record_a_cluster = estc_id_to_cluster[estc_id_a]
      estc_id_to_cluster[estc_id_b] = record_a_cluster

  # check to see if we've already matched either to other records
  if estc_id_a in estc_id_to_cluster.iterkeys():
    record_a_cluster = estc_id_to_cluster[estc_id_a]
    estc_id_to_cluster[estc_id_b] = record_a_cluster

  elif estc_id_b in estc_id_to_cluster.iterkeys():
    record_b_cluster = estc_id_to_cluster[estc_id_b]
    estc_id_to_cluster[estc_id_a] = record_b_cluster

  else:
    estc_id_to_cluster[estc_id_a] = estc_id_a
    estc_id_to_cluster[estc_id_b] = estc_id_a

  return estc_id_to_cluster


def count_combinations(n, k):
  """Read in a number of elements (n) and a number to choose in
  each combination (k), and return the total number of n choose k
  combinations"""
  combinations = lambda n, k: reduce(mul, starmap(truediv,
      zip(range(n, n - k, -1), range(k, 0, -1))))
  return int(combinations(n, k))


def format_results(estc_id_to_cluster):
  """Read in a dictionary with k:v pairs, and return an array
  of objects with estc_id and title_cluster k,v pairs"""
  l = []
  for k in estc_id_to_cluster.iterkeys():
    l.append({"estc_id": k, "title_cluster": estc_id_to_cluster[k]})
  return l


def cluster_records(author_to_records):
  """Read in a dictionary mapping author keys to an array of
  that author's records, cluster the records by author, and return
  an object mapping each ESTC id to a cluster id"""
  results = []
  author_keys = author_to_records.iterkeys()
  author_pool = multiprocessing.Pool(max_cores)

  for result in author_pool.imap(cluster_author_records, author_keys):
    results += result
  return results

  """
  for k in author_keys:
    r = cluster_author_records(k)
  """


if __name__ == "__main__":
  query = Query(limit=10000, offset=0,
    fields=["estc_id", "display_title", "marc_last_name"]
  )
  records = query.get_records()
  max_cores = 6
  min_similarity = 0.65

  # cluster records by author
  author_to_records = get_author_to_records(records)

  # map title identifier keys to sufficiently similar record values
  clustered_records = cluster_records(author_to_records)

  print "clustering complete"

  write_json(clustered_records, "estc_id_to_title_cluster.json")
