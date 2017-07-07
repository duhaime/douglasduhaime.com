"""Determine the number of folio, quarto, octavo and other
book size instances with price data that exist within 
each year of the ESTC data"""

import subprocess, json, urllib2, sys
from collections import defaultdict
sys.path.append("../../")

from dissertation.api import Query

###
# Common
###

def write_json(j, filename):
  """Read in json and a filename and write that json to disk"""
  with open("json/" + filename, 'w') as out:
    json.dump(j, out)

###
# Parse Sizes
###

def count_record_sizes_by_year(records, group="all"):
  """Read in an array of records objects and return
  json that indicates how many of each book size
  were published in each year"""
  size_counts = defaultdict(lambda: defaultdict(int))
  for r in records:
    try:
      year = r["imprint_year"]

      # ensure year is an integer
      try:
        year = int(year)
      except ValueError:
        continue

      # ensure year falls within range of interest
      if year < 1700:
        continue

      if year > 1800:
        continue

      size = r["size"]
      if size in good_sizes:
        size_counts[year][size] += 1
    except KeyError:
      continue

  # transform size counts into an array of objects
  size_count_list = []
  for year in size_counts.iterkeys():
    for size in size_counts[year].iterkeys():
      size_count_list.append({
        "year": int(year),
        "size": size,
        "count": size_counts[year][size],
        "group": group
      })

  return size_count_list


if __name__ == "__main__":
  # identify the domain of sizes of interest
  good_sizes = ["2","4","8","12"]

  # first get the records for records with prices
  records = Query(params={"farthings": "true"}).get_records()
  size_counts = count_record_sizes_by_year(records, group="priced")

  # then get the records for all estc records
  all_records = Query().get_records()
  all_size_counts = count_record_sizes_by_year(all_records, group="total")
  write_json(size_counts + all_size_counts, "price_sample_size.json")
