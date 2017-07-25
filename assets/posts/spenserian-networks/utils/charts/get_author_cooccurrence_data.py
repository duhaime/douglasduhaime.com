from __future__ import division
from itertools import product
from collections import Counter, defaultdict
import json

def get_author_json():
  '''Return the clean_spenserian_author_data.json'''
  with open(author_file) as f:
    return json.load(f)

def get_raw_frequencies():
  '''Find the cooccurrence count for each pair of factor levels'''
  factors = [
    'education',
    'religion',
    'nationalities',
    'occupations',
    'gender',
    'writing'
  ]

  # find the number of observations per level
  counts = Counter()
  for author in author_metadata:
    for factor in factors:
      values = author[factor]
      if not type(values) is list:
        values = [values]
      for value in values:
        counts[value] += 1

  # use cartesian product to find permutations with replacement
  for factor_a, factor_b in product(factors, repeat=2):

    d = defaultdict(lambda: Counter())
    factor_a_levels = []
    factor_b_levels = []

    for author in author_metadata:      
      values_a = author[factor_a]
      values_b = author[factor_b]

      if not type(values_a) is list:
        values_a = [values_a]
      if not type(values_b) is list:
        values_b = [values_b]

      for value_a in values_a:
        factor_a_levels.append(value_a)

        for value_b in values_b:
          d[value_a][value_b] += 1
          factor_b_levels.append(value_b)

    # reshape the data to make visualization task easier
    factor_a_levels = sorted(list(set(factor_a_levels)))
    factor_b_levels = sorted(list(set(factor_b_levels)))

    vis_json = {
      'variables': {
        'x': factor_a,
        'y': factor_b
      },
      'levels': {
        'x': factor_a_levels,
        'y': factor_b_levels,
      },
      'observations': []
    }

    for column_index, a in enumerate(factor_a_levels):
      for row_index, b in enumerate(factor_b_levels):
        vis_json['observations'].append({
          'x': column_index,
          'y': row_index,
          'value': d[a][b]
        })

    # write the cooccurrence values for this factor pair
    filename = '_'.join([factor_a, factor_b]) + '_cooccurrence.json'
    with open('app/json/poet_metadata_cooccurrence/' + filename, 'w') as out:
      json.dump(vis_json, out)

if __name__ == '__main__':
  author_file = '../clean_spenserian_data/json/spenserian_author_data.json'
  author_metadata = get_author_json()
  raw_frequencies = get_raw_frequencies()
