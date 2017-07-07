from __future__ import division
from collections import defaultdict, Counter
import sys, json

sys.path.append("../../")
from dissertation.api import Query

"""Utility that calculates the length and size-normalized price
of each estc record and expresses that data by subject by decade"""

def get_estc_subject_prices(records):
  """Read in an array of records and return an array of objects
  with estc_id, subject, and normalied_price keys"""
  estc_subject_prices = []
  price_by_subject_by_decade = defaultdict(lambda: defaultdict(list))
  subject_counter = Counter()

  for r in records:
    try:
      estc_id = r["estc_id"]
      farthings = float(r["farthings"])
      size = int(r["size"])
      subjects = r["subjects"]
      total_pages = int(r["total_pages"])
      year = r["imprint_year"]
      normalized_price = (farthings/total_pages) / (16/size)

      for s in subjects:
        subject_counter[s] += 1
        estc_subject_prices.append({
          "estc_id": estc_id,
          "normalized_price": float("{0:.2f}".format(normalized_price)),
          "subject": s,
          "decade": int("".join(year[:3]) + "0"),
          "year": int(year)
        })

    except Exception as exc:
      pass

  print "top subjects:", subject_counter.most_common(100)
  write_json(estc_subject_prices, "price_by_subject.json")

def write_json(j, filename):
  """Read in json and a filename and write that json to disk"""
  with open("json/" + filename, 'w') as out:
    json.dump(j, out)

if __name__ == "__main__":
  records = Query(params={
    "farthings": "true",
    "price_options": "0",
    "subjects": "!Advertisement+!Advertisements+!Prospectus+!Prospectuses+!Prices+!Catalogs",
    "printing_details": "false",
    "total_images": "false",
    "total_pages": ">30",
    "physical_description": "false"
  }).get_records()

  get_estc_subject_prices(records)
