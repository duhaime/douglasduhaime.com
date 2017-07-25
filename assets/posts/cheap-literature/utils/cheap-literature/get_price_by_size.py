from __future__ import division
from collections import defaultdict
import json, sys

sys.path.append("../../")
from dissertation.api import Query

def write_json(json_object, filename):
  """Write a json object to disk"""
  with open("json/" + filename, "w") as out:
    json.dump(json_object, out)

###
# Get mean prices by year
###

def get_farthings_by_size(records):
  """Read in an array of records and return an object
  that indicates the list of prices available
  for each year of each size of interest"""
  
  # d[size][year] = [price array]
  d = defaultdict(lambda: defaultdict(list))

  for r in records:
    try:
      year = r["imprint_year"]

      try:
        year = int(year)
      except ValueError:
        pass

      if year < 1700:
        continue
      elif year > 1800:
        continue

      size = r["size"]

      if size not in good_sizes:
        continue

      if r["price_options"] != "0":
        continue

      farthings = float(r["farthings"])
      pages = float(r["total_pages"])

      # limit the analysis to records with > 20 pages
      # to ensure prices are length normalized
      if pages > 20:
        d[size][year].append(farthings/pages)

    except KeyError:
      continue

  return d

def get_mean_farthings_by_year(d):
  """Read in a dictionary with format:
  d[size][year] = [record price list]
  and return an object that retains the
  mean price for each size and year"""
  mean_prices = []
  for size in d.iterkeys():
    for year in d[size].iterkeys():
      mean_price = sum(d[size][year]) / len(d[size][year])
      mean_prices.append({
        "size": size,
        "year": year,
        "mean_price": mean_price
      })
  return mean_prices


if __name__ == "__main__":
  good_sizes = ["4", "8"]

  records = Query(params={
    "farthings":"true",
    "price_options":"0",
    "subjects": "!Advertisement+!Advertisements+!Prospectus+!Prospectuses+!Prices+!Catalogs"
  }).get_records()

  farthings_by_size = get_farthings_by_size(records)
  mean_farthings_by_year = get_mean_farthings_by_year(farthings_by_size)

  write_json(mean_farthings_by_year, "price_by_size.json")