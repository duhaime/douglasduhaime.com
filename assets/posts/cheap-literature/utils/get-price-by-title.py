import subprocess, shlex, json

url_start = 'http://localhost:7080/api/cheapLiterature/priceByTitle?subject='
url_end = '&select=title_cluster+segment+local_slope+year+mean_farthings'

subjects = [
  {
    'query': 'England',
    'label': 'england'
  },
  {
    'query': 'Politics%20and%20government',
    'label': 'politics'
  },
  {
    'query': 'Poems',
    'label': 'poems'
  },
  {
    'query': 'History',
    'label': 'history'
  },
  {
    'query': 'Plays',
    'label': 'plays'
  },
  {
    'query': 'Sermons',
    'label': 'sermons'
  }
]

slopes = [-0.4, 0.4]

slope_args = [
  {
    'label': 'positive',
    'args': '&minSlope=' + str(slopes[1])
  },
  {
    'label': 'neutral',
    'args': '&minSlope=' + str(slopes[0]) + '&maxSlope=' + str(slopes[1])
  },
  {
    'label': 'negative',
    'args': '&maxSlope=' + str(slopes[0])
  }
]

for i in subjects:
  for j in slope_args:
    url = url_start + i['query'] + j['args'] + url_end
    command = 'curl ' + url
    result = subprocess.check_output(shlex.split(command))
    result = json.loads(result)

    outfile = i['label'] + '-' + j['label'] + '.json'
    with open('../data/price-by-title/' + outfile, 'w') as out:
      json.dump(result, out)