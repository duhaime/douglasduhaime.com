from collections import defaultdict
import json

'''
Find the 1,2,3 quartiles and 10th + 90th percentile
for each level of each factor
'''

d = defaultdict(list)

with open('../data/price-by-metadata-field.json') as f:
  j = json.load(f)

for i in j:
  factor = i['type']
  for k in i['values']:
    level = k['label']
    sorted_values = sorted(k['values'])
    l = len(sorted_values)

    d[factor].append({
      'level': level, 
      10: sorted_values[int(l*.1)],
      25: sorted_values[int(l*.25)],
      50: sorted_values[int(l*.5)],
      75: sorted_values[int(l*.75)],
      90: sorted_values[int(l*.9)],
    })

with open('../data/price-by-metadata-field-quartiles.json', 'w') as out:
  json.dump(d, out)