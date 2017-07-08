from __future__ import division
from collections import defaultdict
import json, codecs, os, re

# optional input file that gives each node an x, y position
node_positions = 'node-positions-1380'

network = {
  'nodes': [],
  'links': []
}

# map each author's id to the raw spenserian data
author_id_to_data = {}

# map each author's id to their index position within the nodes
author_id_to_index = {}

# map each author's id to their associates
author_id_to_associates = defaultdict(set)

# map each author's id to their node data
author_id_to_node_data = {}

# map each author's id to their x,y coords (if available)
author_id_to_coords = {}

def get_year(text_records_list):
  '''
  @args:
    {arr} text_records_list: a list of objects, each with
      year, title, and text_id keys
  @returns:
    {int}: the first parsable publication year among the
      text_records_list
  '''
  for i in text_records_list:
    try:
      numeric_chars = re.findall(r'\d+', i['year'])
      if len(numeric_chars) == 1:
        year = int(numeric_chars[0])
        return year

    except:
      continue

  return None

# author to raw data
with open('../../clean_spenserian_data/json/spenserian_author_data.json') as f:
  j = json.load(f)
  for i in j:
    author_id_to_data[i['author_id']] = i

# author to coords -- only available after saving positions
# from force layout
if os.path.exists(node_positions):
  with open(node_positions) as f:
    f = f.read()
  for i in f.split('\n'):
    if 'VM' in i:
      _, node_id, x, y = i.split()
      author_id = node_id.replace('node-','')
      author_id_to_coords[author_id] = {
        'x': (float(x)*100)/100,
        'y': (float(y)*100)/100,
      }

for author_id in author_id_to_data.keys():
  author_data = author_id_to_data[author_id]

  # assess the author's associates
  # note that connections missing years must be excluded
  for i in author_data['associates']:
    try:
      associate_id = i['author_id']
      associate_data = author_id_to_data[associate_id]

      # validate both have year data
      author_year = get_year(author_data['text_records'])
      associate_year = get_year(associate_data['text_records'])

      if not author_year or not associate_year:
        continue

      # if so, update the links of both
      author_id_to_associates[author_id].add(associate_id)
      author_id_to_associates[associate_id].add(author_id)

    # key errors will spring for associates who lack author_ids
    # skip those records, as they're not in the spenserians db
    except KeyError as exc:
      print(author_id, i, exc)
      pass

# this may seem unnecessary, but the data sometimes indicates
# a is a friend of b but doesn't indicate b is a friend of a
# because we skip all nodes without edges, there's an edge
# case where b has no indicated friends so isn't included in
# the nodes on the first pass (we need to hit a to get
# b into the nodes list)
for author_id in author_id_to_data.keys():
  author_data = author_id_to_data[author_id]

  # remove nodes without any friends
  if len(author_id_to_associates[author_id]) == 0:
    continue

  # get the author's year as an int
  year = get_year(author_data['text_records'])
  if not year:
    continue

  node = {
    'name': author_data['name'],
    'id': author_id,
    'year': year,
    'publications': len(author_data['works']),
    'associates': list(author_id_to_associates[author_id]),
    'gender': author_data['gender']
  }

  # only append x, y coordinate information if available
  try:
    node['x'] = author_id_to_coords[author_id]['x']
    node['y'] = author_id_to_coords[author_id]['y']
  except KeyError:
    pass

  network['nodes'].append(node)
  author_id_to_index[author_id] = len(author_id_to_index.keys())

# build a list of network links then deduplicate it
network_links = []
for i in network['nodes']:
  source_id = i['id']
  source_idx = author_id_to_index[source_id]

  for j in i['associates']:
    target_id = j
    target_idx = author_id_to_index[target_id]
    link = sorted([source_idx, target_idx])
    network_links.append( tuple(link) )

# dedupe the links then add all to the data structure
network_links = list(set(network_links))
for i in network_links:
  network['links'].append({
    'source': i[0],
    'target': i[1]
  })

# finally, once all lookups are done convert ids to ints
for i in network['nodes']:
  i['id'] = int(i['id'])
  i['associates'] = [int(j) for j in i['associates']]

# write the outfiles
with open('poet_constellations.json', 'w') as out:
  json.dump(network, out)

del network['links']
with open('poet_constellations_static.json', 'w') as out:
  json.dump(network, out)

##
# Write gephi files
##

'''
with codecs.open('poet-nodes.txt', 'w', 'utf8') as out:
  out.write('name\tid\tyear\n')
  for i in network['nodes']:
    out.write(i['name'] + '\t' + str(i['id']) + '\t' + str(i['year']) + '\n')

with codecs.open('poet-edges.txt', 'w', 'utf8') as out:
  out.write('source\ttarget\n')
  for i in network['links']:
    out.write(str(i['source']) + '\t' + str(i['target']) + '\n')
'''