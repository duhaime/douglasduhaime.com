from __future__ import division
from collections import defaultdict
import urllib2, json

def write_json(json_file, outfile_name):
  """Write a json file to disk"""
  with open("json/" + outfile_name, "w") as out:
    json.dump(json_file, out)


def get_records():
  """Return all titlePrice records"""
  url = "http://localhost:8080/api/cheapLiterature/estcTitlePrice"
  response = urllib2.urlopen(url)
  return json.load(response)


def find_price_deltas(records):
  """Read in an array of records and find the mean
  price before and after 1774 for each"""
  d = defaultdict(lambda: defaultdict(list))
  for r in records:
    title_cluster = r["title_cluster"]
    if r["year"] >= 1774:
      d[title_cluster]["after_1774"].append( r["farthings"] )
    else:
      d[title_cluster]["before_1774"].append( r["farthings"] )

  # for all records with before and after keys, find
  # the mean price before and after
  price_deltas = []
  for title_cluster in d:
    before_prices = len(d[title_cluster]["before_1774"])
    after_prices = len(d[title_cluster]["after_1774"])

    if (before_prices > 0 and after_prices > 0):
      before_sum = sum(d[title_cluster]["before_1774"])
      after_sum = sum(d[title_cluster]["after_1774"])

      mean_before = before_sum / before_prices
      mean_after = after_sum / after_prices

      price_deltas.append({
        "title_cluster": title_cluster,
        "before_1774": mean_before,
        "after_1774": mean_after
      })

  return price_deltas


if __name__ == "__main__":
  records = get_records()
  price_deltas = find_price_deltas(records)
  write_json(price_deltas, "donaldson_price_deltas.json")
    