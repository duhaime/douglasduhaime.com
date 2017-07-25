"""Write json to disk that maps an estc id to the
total number of pages and volumes in that record"""

import json, sys, urllib2
from collections import defaultdict

sys.path.append("../../"); from dissertation.api import Query

###
# I/O
###

def write_json(j, filename):
  """Write json to disk"""
  with open("json/" + filename, "w") as out:
    json.dump(j, out)

###
# Retrieve Particular ECCO Record
###

def estc_to_ecco_id(estc_id):
  """Read in an ESTC id as represented in the ESTC,
  convert that id to an ESTC id as represented in
  ECCO"""
  letter = estc_id[0]
  numbers = estc_id[1:]
  ecco_estc_id = letter

  # all ecco estc ids have 6 digits
  # they pad the ecco id with leading 0's
  for i in xrange(6 - len(numbers)):
    ecco_estc_id += "0"
  
    # add the original estc number sequence to the string
  ecco_estc_id += numbers
  return ecco_estc_id


def get_ecco_record(estc_id):
  """Read in an ESTC id in ESTC format and return the 
  ECCO json for that record"""
  url = 'http://localhost:8080/api/ecco/record?estc_id='
  estc_id = estc_to_ecco_id(estc_id)
  response = urllib2.urlopen(url + estc_id)
  json_string = response.read()
  return json.loads(json_string)


###
# Get all ECCO records
###

def get_ecco_metadata():
  """Return a mapping from an ECCO representation
  of an ESTC id to relevant metadata fields
  within that ECCO record"""
  ecco_query = Query(limit=10000, offset=0, route='/api/ecco/record')
  ecco_records = ecco_query.get_records()

  ecco_metadata = defaultdict(lambda: defaultdict())
  for r in ecco_records:
    estc_id = r["estc_id"]

    # initialize each variable only once
    for k in ["total_pages", "total_volumes", "holding_libraries"]:
      if k not in ecco_metadata[estc_id].iterkeys():
        try:
          ecco_metadata[estc_id][k] = int(r[k])
        except:
          continue
      else:
        # multi-volume records (e.g. T147377) list total pages per volume
        if k == "total_pages":
          try:
            ecco_metadata[estc_id][k] += int(r[k])
          except:
            continue

  return ecco_metadata


def get_estc_id_to_pages(estc_records):
  """Return a mapping from estc id to
  the number of pages in that record"""
  print "mapping estc id to page counts"
  estc_id_to_pages = []
  for c, r in enumerate(estc_records):
    estc_id = r["estc_id"]

    # transform the ESTC id to an ECCO ESTC id
    ecco_id = estc_to_ecco_id(estc_id)
    ecco_metadata = estc_id_to_ecco_metadata[ecco_id]

    # not all estc ids are in ecco
    if ecco_metadata:
      try:
        estc_id_to_pages.append({
          "estc_id": estc_id,
          "total_pages": ecco_metadata["total_pages"],
          "total_volumes": ecco_metadata["total_volumes"],
          "holding_libraries": ecco_metadata["holding_libraries"]
        })

      except Exception as exc:
        estc_id_to_pages.append({
          "estc_id": estc_id,
          "total_pages": "",
          "total_volumes": "",
          "holding_libraries": ""
        })

  return estc_id_to_pages


if __name__ == "__main__":
  
  # fetch the estc records
  estc_query = Query(limit=10000, offset=0)
  estc_records = estc_query.get_records()

  # get a mapping from ecco's estc id to metadata fields
  estc_id_to_ecco_metadata = get_ecco_metadata()

  # retrieve the data mapping from estc id to bibliographic data
  estc_id_to_pages = get_estc_id_to_pages(estc_records)
  write_json(estc_id_to_pages, "estc_id_to_pages.json")