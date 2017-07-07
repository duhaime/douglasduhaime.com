#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json, urllib2, os, multiprocessing, regex, sys

sys.path.append("../../"); from dissertation.api import Query

"""This script parses structured imprint data from raw
ESTC record json objects"""

def parse_estc_records(estc_records):
  """Read in an array of estc records and parse clean metadata
  from each"""
  raw_pool = multiprocessing.Pool()
  results = []
  for result in raw_pool.imap(find_imprint, estc_records):
    if result:
      results.append(result)

  print "found", len(results), "imprints"

  write_json(results, "clean_estc_imprints.json")


def find_imprint(estc_record):
  """Read in an array of estc objects, and return an object with
  the given record's title fields"""
  fields = {}
  fields["estc_id"] = estc_record["estc_id"]

  try:
    imprint_full = ""
    for letter in estc_record["metadata"]["260"].iterkeys():
      if len(imprint_full) > 1:
        imprint_full += " "
      imprint_full += estc_record["metadata"]["260"][letter][0]
    fields["imprint_full"] = imprint_full
  except:
    fields["imprint_full"] = ""

  try:
    fields["imprint_city"] = clean_city(
      estc_record["metadata"]["260"]["a"][0]
    )
  except:
    fields["imprint_city"] = ""

  try:
    fields["imprint_publisher"] = estc_record["metadata"]["260"]["b"][0]
  except:
    fields["imprint_publisher"] = ""

  try:
    raw_year = estc_record["metadata"]["260"]["c"][0]
    fields["imprint_year"] = clean_year(raw_year)
  except:
    fields["imprint_year"] = ""

  return fields


def clean_year(imprint_year):
  """Read in a raw imprint year and return the first string
  of four consecutive integers from that string"""
  for hyphen_component in imprint_year.split("-"):
    for square_component in hyphen_component.split("["):
      for slash_component in square_component.split("/"):
        for token in slash_component.split(" "):
          clean_token = ""
          for character in token:
            if character in integers:
              clean_token += character
          if len(clean_token) == 4:
            return clean_token
  print "could not parse a year from", imprint_year
  return imprint_year


def clean_city(city):
  """Read in a raw city string and return the cleaned city string"""
  clean_city = "".join(i for i in city if i.isalpha() or i == " ")
  return clean_city.strip()


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