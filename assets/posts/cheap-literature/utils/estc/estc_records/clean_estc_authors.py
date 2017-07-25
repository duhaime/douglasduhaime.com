import json, urllib2, os, multiprocessing, regex, sys
from collections import Counter

sys.path.append("../../"); from dissertation.api import Query

"""This script parses structured author data from raw
estc record json objects"""

def print_log(m):
  """Read in a message to log, and log it if logging == 1"""
  if logging == 1:
    print m


def write_json(j, filename):
  """Read in some json and write it to filename"""
  with open("json/" + filename, "w") as out:
    json.dump(j, out)


def parse_estc_records(estc_records):
  """Read in an array of estc records and parse clean metadata
  from each"""
  raw_pool = multiprocessing.Pool()
  raw_authors = []
  
  if multiprocess == 1:
    for author in raw_pool.imap(find_author, estc_records):
      if author:
        raw_authors.append(author)
  else:
    for author in estc_records:
      raw_author = find_author(author)
      if raw_author:
        raw_authors.append(raw_author)

  clean_pool = multiprocessing.Pool()
  clean_authors = []
  
  if multiprocess == 1:
    for clean_author in clean_pool.imap(parse_author, raw_authors):
      if clean_author:
        clean_authors.append(clean_author)
  else:
    for raw_author in raw_authors:
      clean_author = parse_author(raw_author)
      if clean_author:
        clean_authors.append(clean_author)

  write_json(clean_authors, "clean_estc_authors.json")


def find_author(estc_record):
  """Read in an estc record and return metadata with the fields
  of interest from that input document"""
  raw_fields = {
    "estc_id": estc_record["estc_id"]
  }

  estc_id = estc_record["estc_id"]
  fields_to_parse = get_fields_to_parse()
  found_fields = 0

  for f in fields_to_parse:
    label = f["label"]
    number = f["number"]
    letter = f["letter"]

    try:
      raw_fields[label] = estc_record["metadata"][number][letter][0]
      found_fields = 1
    except:
      raw_fields[label] = ""

  return raw_fields


def get_fields_to_parse():
  """Return an object describing the fields to parse"""
  return [
    {
      "label": "name",
      "number": "100",
      "letter": "a"
    },
    {
      "label": "number",
      "number": "100",
      "letter": "b"
    },
    {
      "label": "title",
      "number": "100",
      "letter": "c"
    },
    {
      "label": "dates",
      "number": "100",
      "letter": "d"
    },
    {
      "label": "fuller_name",
      "number": "100",
      "letter": "q"
    }
  ]


def parse_author(estc_record):
  """Returns the estc id, the raw data field, and cleaned 
  data field"""
  try:
    marc_name = estc_record["name"]
  except:
    marc_name = ""

  try:
    clean_name = clean_author_name(estc_record["name"])
    marc_first_name = clean_name["first_name"]
    marc_last_name  = clean_name["last_name"]
  except:
    clean_name = ""
    marc_first_name = ""
    marc_last_name = ""

  try:
    clean_number = clean_author_number(estc_record["number"])
  except:
    clean_number = ""

  try:
    author_title = clean_author_title(estc_record["title"])
  except:
    author_title = ""

  try:
    dates = clean_author_dates(estc_record["dates"])
    marc_date = dates["raw_dates"]
    birth_date = dates["birth"]
    death_date = dates["death"]
    date_uncertainty = dates["uncertainty"]
  except:
    clean_dates = ""
    marc_date = ""
    birth_date = ""
    death_date = ""
    date_uncertainty = ""

  try:
    fuller_name = estc_record["fuller_name"]
  except:
    fuller_name = ""
  
  return {
    "estc_id": estc_record["estc_id"],
    "marc_name": marc_name,
    "marc_first_name": marc_first_name,
    "marc_last_name": marc_last_name,
    "marc_date": marc_date,
    "birth_date": birth_date,
    "death_date": death_date,
    "author_title": author_title,
    "author_date_uncertainty": str(date_uncertainty)
  }


def clean_author_name(raw_field):
  """Clean the raw data observation"""
  clean_name = {}

  if "," in raw_field:
    split_name = raw_field.split(",")
    last_name = split_name[0]
    first_name = split_name[1]
    clean_name["last_name"] = last_name.strip()
    clean_name["first_name"] = first_name.strip()

    # remove terminal periods unless they follow an initial
    for name in ["last_name", "first_name"]:
      if len(clean_name[name]) > 3:
        if clean_name[name][-1] == ".":
          # retain periods if they follow an initial
          if clean_name[name][-3] != " ":
            clean_name[name] = "".join(clean_name[name][:-1])
    
  return clean_name


def clean_author_number(raw_field):
  """Clean the raw data observation"""
  clean_number = raw_field.replace(",","").strip()
  return clean_number


def clean_author_title(raw_field):
  """Clean the raw data observation"""
  title = {"raw_title": raw_field}
  clean_title = raw_field

  bad_chars = [",", "[", "]", "(", ")"]
  for char in bad_chars:
    clean_title = clean_title.replace(char, "")

  period_words = ["Mrs.", "Mr.", "Dr.", "M.D.", "M.A.", "Esq.", 
    "LL.D.", "M.", "A.M.", "Rev.", "V.D.M.", "Knt.", "jun.", 
    "Gent.", "Mons.", "D.D.", "Bart.", "P.C.", "Stud.", "Capt.",
    "gent.", "B.D.", "Sc.B.", "A.B.", "L.L.D.", "Mme.", "Count."]

  if (len(clean_title) > 1) and (clean_title[-1] == "."):
    if clean_title not in period_words:
      clean_title = "".join(clean_title[:-1])

  return clean_title.strip()


def is_there_date_uncertainty(raw_field):
  """Return a boolean indicating whether there is uncertainty
  within the author dates"""
  raw_field = raw_field.lower()
  uncertainty_markers = ["?", "active", "fl", "or", "approx"]

  for marker in uncertainty_markers:
    if marker in raw_field:
      return 1
  return 0


def clean_author_dates(raw_field):
  """Clean the raw data observation"""
  clean_dates = {}

  if "-" in raw_field:
    split_dates = raw_field.split("-")
    birth = split_dates[0]
    death = split_dates[1]

    clean_birth = "".join(i for i in birth if i in integers).strip()
    clean_death = "".join(i for i in death if i in integers).strip()

    # dates are 'uncertain' if they contain a marker of uncertainty
    # like fl., active, etc. or if either the author's birth or death
    # is not four numbers long
    date_uncertainty = is_there_date_uncertainty(raw_field)
    if date_uncertainty == 0:
      if (len(clean_birth) != 4) or (len(clean_death) != 4):
        date_uncertainty = 1

    clean_dates = {
      "raw_dates": raw_field,
      "birth": clean_birth,
      "death": clean_death,
      "uncertainty": date_uncertainty
    }

  return clean_dates


if __name__ == "__main__":
  # processing options
  logging      = 1
  max_cores    = 4
  multiprocess = 0

  # data objects for cleaning
  integers = [str(i) for i in xrange(10)]

  # observations is an array of estc objects
  estc_records = Query(route="/api/estc/marc").get_records()
  parse_estc_records(estc_records)