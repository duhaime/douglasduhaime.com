import json

with open('author-publication-counts-over-time.json') as f:
 j = json.load(f)
 l = []

 j = sorted(j, key=lambda k: k['author_popularity_index']) 
 for i in j:
  if i['author_popularity_index'] > 19:
   continue

  max_year = 0
  max_val = 0
  complete = False

  author_d = {'author': i['author'], 'values': []}
  for k in i['publication_counts'].keys():
   if int(k) < 1700:
    continue
 
   if int(k) == 1800:
    complete = True

   elif int(k) > max_year and int(k) < 1800:
    max_year = int(k)
    max_val = i['publication_counts'][k]

   author_d['values'].append({
    'year': int(k),
    'value': i['publication_counts'][k],
   })

  if complete == False:
   print(i['author'])
   author_d['values'].append({
    'year': 1800,
    'value': max_val
   })

  l.append(author_d)

with open('author_publication_counts.json', 'w') as out:
 json.dump(l, out)
