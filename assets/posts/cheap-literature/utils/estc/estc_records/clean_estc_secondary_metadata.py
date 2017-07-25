#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json, urllib2, os, multiprocessing, regex, sys

sys.path.append("../../"); from dissertation.api import Query

"""This script parses 'secondary' metadata fields (i.e. less
canonical metadata fields) from raw estc record json objects"""

def parse_estc_records(estc_records):
  """Read in an array of estc records and parse clean metadata
  from each"""
  raw_pool = multiprocessing.Pool()
  results = []
  for result in raw_pool.imap(find_secondary_metadata, estc_records):
    if result:
      results.append(result)

  print "found", len(results), "secondary metadata fields"

  write_json(results, "clean_estc_secondary_metadata.json")


def remove_trailing_period(s):
  """Read in a string and return it sans trailing period"""
  if s[-1] == ".":
    return "".join(s[:-1])
  return s


def find_secondary_metadata(estc_record):
  """Read in an estc record and return an object with
  the given record's secondary metadata fields"""
  fields = {}
  fields["estc_id"] = estc_record["estc_id"]

  try:
    fields["language"] = estc_record["metadata"]["240"]["l"][0]
  except:
    fields["language"] = ""

  # subjects requires special parsing, as it contains 6xx keys
  fields["subjects"] = []
  for code in xrange(100):
    code = str(600 + code)
    try:
      for letter in estc_record["metadata"][code].iterkeys():
        for subject in estc_record["metadata"][code][letter]:
          if subject[-1] == ".":
            subject = remove_trailing_period(subject)
          fields["subjects"].append(subject)
    except KeyError:
      pass

  # dedupe the subjects
  fields["subjects"] = list(set(fields["subjects"]))

  try:
    fields["notes"] = []
    for letter in estc_record["metadata"]["500"].iterkeys():
      for note in estc_record["metadata"]["500"][letter]:
        fields["notes"].append(note)
  except:
    fields["notes"] = ""

  try:
    fields["genres"] = []
    for genre in estc_record["metadata"]["655"]["a"]:
      genre = remove_trailing_period(genre)
      fields["genres"].append(genre)

    # dedupe the genres
    fields["genres"] = list(set(fields["genres"]))
  except:
    fields["genres"] = ""

  try:
    fields["edition"] = estc_record["metadata"]["250"]["a"][0]
  except:
    fields["edition"] = ""

  try:
    fields["physical_location"] = ""
    for letter in estc_record["metadata"]["852"].iterkeys():
      for observation in estc_record["metadata"]["852"][letter]:
        fields["physical_location"].append(observation)
  except:
    fields["physical_location"] = ""

  try:
    size = estc_record["metadata"]["300"]["c"][0]
    size = size.replace(u"\u2070", "").replace(".", "")
    fields["size"] = size
  except:
    size = ""

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
  records = Query().get_records()
  parse_estc_records(estc_records)