from __future__ import division
import operator, json, sys
sys.path.append("../../"); from dissertation.api import Query, Dataframe

records = Query(params={
  "farthings": "true", 
  "price_options": "0",
  "subjects": "!Advertisement+!Advertisements+!Prospectus+!Prospectuses+!Prices+!Catalogs",
  "printing_details": "false",
  "total_images": "false",
  "total_pages": ">30",
  "physical_description": "false"
}).get_records()

farthings_d = {}

with open("estc/estc_records/json/clean_estc_prices.json") as f:
  f = f.read()
  j = json.loads(f)
  for i in j:
    estc_id = i["estc_id"]
    farthings_d[estc_id] = i

d = {}

for r in records:
  try:
    estc_id = r["estc_id"]

    if farthings_d[estc_id]["price_options"] == "0":
      pages = r["total_pages"]
      farthings = farthings_d[estc_id]["farthings"]
      d[estc_id] = float(farthings) / float(pages)
  except:
    pass

sorted_d = sorted(d.items(), key=operator.itemgetter(1))

for c, i in enumerate(sorted_d):
  print c, i