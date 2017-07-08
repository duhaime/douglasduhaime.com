'''Prepare data to plot an overview of the corpus metadata'''

from __future__ import division
from collections import Counter, defaultdict
import json

def get_author_json():
  '''Return the clean_spenserian_author_data.json'''
  with open(author_file) as f:
    return json.load(f)

def get_raw_frequencies():
  '''Get the raw frequencies of each metadata level'''
  d = defaultdict(lambda: Counter())
  factors =   factors = [
    'education',
    'religion',
    'nationalities',
    'occupations',
    'gender',
    'writing'
  ]

  for author in author_metadata:
    for factor in factors:
      values = author[factor]
      if not type(values) is list:
        values = [values]
      
      for value in values:
        d[factor][value] += 1
  return d

def write_raw_frequencies():
  '''Write out the raw frequencies for each factor'''
  with open('app/json/raw_metadata_frequencies.json', 'w') as out:
    json.dump(raw_frequencies, out)

def write_relative_frequencies():
  '''Write out the relative frequencies for each factor'''
  normalized_counts = defaultdict(lambda: defaultdict())
  total_authors = len(author_metadata)
  for factor in raw_frequencies:
    factor_sum = 0
    for count in raw_frequencies[factor]:
      factor_sum += raw_frequencies[factor][count]

    for level in raw_frequencies[factor]:
      raw_frequency = raw_frequencies[factor][level]
      normalized_counts[factor][level] = raw_frequency/factor_sum

  with open('app/json/normalized_metadata_frequencies.json', 'w') as out:
    json.dump(normalized_counts, out)
      
if __name__ == '__main__':
  author_file = '../clean_spenserian_data/json/spenserian_author_data.json'
  author_metadata = get_author_json()
  raw_frequencies = get_raw_frequencies()
  write_raw_frequencies()
  write_relative_frequencies()