#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json, urllib2, os, multiprocessing, regex, sys
sys.path.append("../../"); from dissertation.api import Query

"""This script parses structured location data from raw
estc record json objects"""

def parse_estc_records(estc_records):
  """Read in an array of estc records and parse clean metadata
  from each"""
  raw_pool = multiprocessing.Pool()
  results = []
  for result in raw_pool.imap(find_locations, estc_records):
    if result:
      results.append(result)

  print "found", len(results), "locations"

  write_json(results, "clean_estc_locations.json")


def find_locations(estc_record):
  """Read in an array of estc objects, and return an object with
  the given record's title fields"""
  fields = {}
  fields["estc_id"] = estc_record["estc_id"]

  try:
    fields["publication_country"] = estc_record["metadata"]["752"]["a"][0]
  except:
    fields["publication_country"] = ""

  try:
    fields["publication_state"] = estc_record["metadata"]["752"]["b"][0]
  except:
    fields["publication_state"] = ""

  try:
    publication_city = estc_record["metadata"]["752"]["d"][0]
    if len(publication_city) > 1:
      if publication_city[-1] == ".":
        publication_city = "".join(publication_city[:-1])
    fields["publication_city"] = publication_city
  except:
    fields["publication_city"] = ""

  return fields

  def write_json(json_object, filename):
    """Write the parsed results to disk"""
    with open("json/" + filename, "w") as out:
      json.dump(json_object, out)


if __name__ == "__main__":
  # processing options
  logging      = 1
  max_cores    = 4
  multiprocess = 0

  # internal data lists
  integers = [str(i) for i in xrange(10)]

  # observations is an array of estc objects
  estc_records = Query().get_records()
  parse_estc_records(estc_records)