from __future__ import division
from collections import defaultdict
from itertools import product
import json, os

'''
This script finds over- and under-represented relationships
within the graph data. For each combination of factors, for
each level in the first factor, we find the relative frequency
of all levels of the second factor. We then subtract from that
relative frequency the relative frequency of the given level in
the population.

E.g. Suppose factors are d[occupation][gender].
For each distinct occupation, we find the proportion of
associations with men and the proportion with women. Suppose
those values are 80% male and 20% female. We subtract from
the male value the relative frequency of males within the population
and we subtract from the female frequency the relative frequency
of females within the population. If the resulting value is
positive, then the relationship is over-represented; else
it's underrepresented (or zero you cheeky monkey)
'''

# list all factors
factors = ['education', 'religion', 'nationalities', 'occupations', 'gender', 'writing']

# d[factor] = set(levels in factor)
factor_to_levels = defaultdict(set)

# d[author_id][factor] = [author levels for factor]
author_id_to_data = defaultdict(
  lambda: defaultdict(list)
)

# d[author_id] = {graph json for author}
author_id_to_graph_data = {}

# d[factor][level] = level count
level_raw_frequency = defaultdict(
  lambda: defaultdict(int)
)

# d[factor][level] = relative frequency of level in factor
level_relative_frequency = defaultdict(
  lambda: defaultdict(float)
)

# d[factor1][factor2][level1][level2] = cooccurrence count
level_cooccurrence_count = defaultdict(
  lambda: defaultdict(
    lambda: defaultdict(
      lambda: defaultdict(int)
    )
  )
)

# d[factor1][factor2][level1][level2] = rel. freq. of level2 within level1
level_two_relative_freq = defaultdict(
  lambda: defaultdict(
    lambda: defaultdict(
      lambda: defaultdict(float)
    )
  )
)

# d[factor1][factor2][level1][level2] = rel freq of level2 within level1
# - rel freq of level2 within population
relationship_deltas = defaultdict(
  lambda: defaultdict(
    lambda: defaultdict(
      lambda: defaultdict(float)
    )
  )
)

# author to raw data
with open('../../clean_spenserian_data/json/spenserian_author_data.json') as f:
  j = json.load(f)
  for author in j:
    author_id = author['author_id']
    for factor in factors:
      try:
        levels = author[factor]
      except KeyError:
        levels = []

      if not isinstance(levels, list):
        levels = [levels]

      author_id_to_data[author_id][factor] = levels

# author to graph data
with open('poet_constellations.json') as f:
  j = json.load(f)
  for i in j['nodes']:
    author_id = str(i['id'])
    author_id_to_graph_data[author_id] = i

##
# Get raw counts of each level
##

for author_id in author_id_to_data.keys():
  for factor in author_id_to_data[author_id].keys():
    for level in author_id_to_data[author_id][factor]:
      level_raw_frequency[factor][level] += 1

##
# Get relative frequency of each level in its factor
##

for factor in level_raw_frequency.keys():

  # find the total number of observations for this level
  n_observations = 0
  for level in level_raw_frequency[factor].keys():
    n_observations += level_raw_frequency[factor][level]

  for level in level_raw_frequency[factor].keys():
    raw_level_count = level_raw_frequency[factor][level]
    level_relative_frequency[factor][level] = raw_level_count/n_observations

# identify all levels for each factor
for i in author_id_to_data.keys():
  author = author_id_to_data[i]
  for factor in author.keys():
    for level in author[factor]:
      factor_to_levels[factor].add(level)

##
# Get cooccurrence counts for each level combination within the graph
##

# initialize all cooccurrence counts to 0
for factor1 in factor_to_levels.keys():
  for factor2 in factor_to_levels.keys():
    for level1 in factor_to_levels[factor1]:
      for level2 in factor_to_levels[factor2]:
        level_cooccurrence_count[factor1][factor2][level1][level2] = 0

# update the cooccurrence counts
for author_id in author_id_to_graph_data.keys():
  author = author_id_to_graph_data[author_id]
  author_metadata = author_id_to_data[author_id]

  for associate_id in author['associates']:
    associate_metadata = author_id_to_data[str(associate_id)]

    for factor1, factor2 in product(factors, repeat=2):
      for level1 in author_metadata[factor1]:
        for level2 in associate_metadata[factor2]:
          
          # update the cooccurrence values symmetrically
          level_cooccurrence_count[factor1][factor2][level1][level2] += 1
          level_cooccurrence_count[factor2][factor1][level2][level1] += 1

##
# For each factor pair, find the relative frequencies of level2
##

for factor1 in level_cooccurrence_count.keys():
  for factor2 in level_cooccurrence_count[factor1].keys():
    for level1 in level_cooccurrence_count[factor1][factor2].keys():
      
      # compute the total number of observations for level1
      level_one_observations = 0
      for level2 in level_cooccurrence_count[factor1][factor2][level1].keys():
        level_one_observations += level_cooccurrence_count[factor1] \
            [factor2][level1][level2]

      # store the relative frequency of each second level
      for level2 in level_cooccurrence_count[factor1][factor2][level1].keys():
        raw = level_cooccurrence_count[factor1][factor2][level1][level2]

        level_two_relative_freq[factor1][factor2][level1][level2] = \
            raw/level_one_observations

##
# Finally, find the relationship deltas
##

for factor1 in level_cooccurrence_count.keys():
  for factor2 in level_cooccurrence_count[factor1].keys():
    for level1 in level_cooccurrence_count[factor1][factor2].keys():
      for level2 in level_cooccurrence_count[factor1][factor2][level1].keys():
        
        rel_freq_in_level1 = level_two_relative_freq[factor1] \
            [factor2][level1][level2]
        
        rel_freq_in_population = level_relative_frequency[factor2][level2]

        relationship_deltas[factor1][factor2][level1][level2] = \
            rel_freq_in_level1 - rel_freq_in_population


##
# Push d[f1][f2][l1][l2] = float into a series of json packets
# for charting
##

def get_chart_json(d, out_dir):
  '''
  Read in a dictionary with shape:
    d[factor1][factor2][level1][level2] = count
  transform that dictionary into the shape expected by the vis client
  and write it to disk.

  Note: because we use factor 2's levels as the individual data points
  in the chart, assign factor1 to the y axis and factor2 to the x
  '''
  if not os.path.exists(out_dir):
    os.makedirs(out_dir)

  for factor1 in d.keys():
    for factor2 in d[factor1].keys():
      factor_pair_json = {
        'variables': {
          'y': factor1,
          'x': factor2
        },
        'levels': {
          'y': [],
          'x': []
        },
        'observations': []
      }

      level_to_index = {
        'y': {},
        'x': {}
      }

      for level1 in sorted(d[factor1][factor2].keys()):
        level_to_index['y'][level1] = len(level_to_index['y'].keys())
        factor_pair_json['levels']['y'].append(level1)

        for level2 in sorted(d[factor1][factor2][level1].keys()):
          if level2 not in level_to_index['x'].keys():
            level_to_index['x'][level2] = len(level_to_index['x'].keys())
            factor_pair_json['levels']['x'].append(level2)

      for level1 in sorted(d[factor1][factor2].keys()):
        for level2 in sorted(d[factor1][factor2][level1].keys()):

          value = d[factor1][factor2][level1][level2]
          symmetrical_value = d[factor2][factor1][level2][level1]
          #assert(value == symmetrical_value) # not true with level_deltas

          factor_pair_json['observations'].append({
            'y': level_to_index['y'][level1],
            'x': level_to_index['x'][level2],
            'value': value
          })
      with open(out_dir + '/' + factor1 + '_' + factor2 + '.json', 'w') as out:
        json.dump(factor_pair_json, out)


get_chart_json(relationship_deltas, 'json/relationship_deltas')

with open('relationship_deltas.json', 'w') as out:
  json.dump(relationship_deltas, out)

with open('level_raw_frequency', 'w') as out:
  json.dump(level_raw_frequency, out)

with open('level_cooccurrence_count.json', 'w') as out:
  json.dump(level_cooccurrence_count, out)
