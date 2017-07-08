from __future__ import division
from collections import defaultdict
import codecs, json, re

with open('../clean_spenserian_data/json/spenserian_author_data.json') as f:
  author_json = json.load(f)

factors = ['education', 'religion', 'nationalities', 'occupations', 'societies', 'gender', 'writing']

# all distinct time values
times = []

# d[factor][level][year] = count
d = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
year_sums = defaultdict(lambda: defaultdict(int))

for i in author_json:
  try:
    for c, record in enumerate(i['text_records']):

      # to restrict analysis to poets, use first poem as
      # proxy for poet dates
      if c > 1:
        continue

      year = re.sub(r'\D', '', record['year'])
      decade = ''.join(year[0:3]) + '0'
      year = int(decade)

      # start chart in 1590 to avoid small sample of early years
      if year == 0 or year == 1570:
        continue

      times.append(year)

      for factor in factors:
        if isinstance(i[factor], list):
          for level in i[factor]:
            d[factor][level][year] += 1
        else:
          level = i[factor]
          d[factor][level][year] += 1

        year_sums[factor][year] += 1

  except:
    print('could not parse', i)
    continue

times = set(list(times))
print(times)

# make sure each level of each factor has each year
# and divide each by the total values for that year
# to normalize
for factor in d.keys():
  for level in d[factor].keys():
    for time in times:
      try:
        d[factor][level][time] /= year_sums[factor][time]
      except KeyError:
        d[factor][level][time] = 0  

      # finally round to two point precision
      d[factor][level][time] = int((d[factor][level][time]*100)+0.5)/100

with open('app/json/metadata_distributions_over_time.json', 'w') as out:
  json.dump(d, out)