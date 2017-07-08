import json

d = {'nodes': []}
with open('spenserian_networks_static.json') as f:
 j = json.load(f)
 for i in j['nodes']:
  i['y'] += 60
  d['nodes'].append(i)

with open('spenserian-networks-static.json', 'w') as out:
 json.dump(d, out)
