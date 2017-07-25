#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json, urllib2, os, multiprocessing, regex, sys
sys.path.append("../../"); from dissertation.api import Query

"""This script parses structured title data from raw
estc record json objects"""

def parse_estc_records(estc_records):
  """Read in an array of estc records and parse clean metadata
  from each"""
  raw_pool = multiprocessing.Pool()
  titles = []
  for title in raw_pool.imap(find_title, estc_records):
    if title:
      titles.append(title)

  print "found", len(titles), "titles"

  write_json(titles, "clean_estc_titles.json")


def find_title(estc_record):
  """Read in an array of estc objects, and return an object with
  the given record's title fields"""
  title_fields = {}
  title_fields["estc_id"] = estc_record["estc_id"]

  try:
    title_fields["full_title"] = estc_record["metadata"]["245"]["a"][0]
  except:
    title_fields["full_title"] = ""

  # the b field is optional
  try:
    title_fields["full_title"] += " " + estc_record["metadata"]["245"]["b"][0]
  except:
    pass 

  try:
    title_fields["display_title"] = estc_record["metadata"]["245"]["a"][0]
  except:
    title_fields["display_title"] = ""

  try:
    title_fields["uniform_title"] = estc_record["metadata"]["240"]["a"][0]
  except:
    title_fields["uniform_title"] = ""

  return title_fields


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