#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, json
import regex as re

sys.path.append("../../"); from dissertation.api import Query

"""Find ESTC records with edition fields, then parse out
integers to represent the edition number for the given record"""

def remove_punctuation(s):
  """Read in a string and return that string sans punctuation"""
  return re.sub(ur"[^\P{P}-]+", "", s)

def clean_edition_imprint_with_and_term(edition_words):
  """Read in a list of edition words and parse out the edition
  in the format 'the one and fortieth impression'"""
  ones = None
  tens = None

  for c, w in enumerate(edition_words):
    if w == "and":
      previous_word = edition_words[c-1]
      if previous_word in number_mapping.iterkeys():
        ones = number_mapping[previous_word]

      next_word = edition_words[c+1]
      if next_word in ordinal_mapping.iterkeys():
        tens = ordinal_mapping[next_word]

      try:
        clean_edition = tens + ones
        return clean_edition

      except:
        pass

  return None

def clean_edition_imprint(edition_words):
  """Read in a list of edition words and return a clean edition
  number"""
  for w in edition_words:
    if w in ordinal_mapping.iterkeys():
      return ordinal_mapping[w]
  return None

def clean_edition_imprint_with_numbers(edition_words):
  """Read in a list of edition words and return an edition
  statement like 'The 35. edition.' in clean form"""
  for w in edition_words:
    try:
      clean_edition = str(int(w))
      return clean_edition
    except:
      pass
  return None

def clean_editions(records):
  """Read in an array of record objects and return a clean mapping
  from estc_id to clean edition statement"""
  l = []
  failed_conversions = 0
  for r in records:
    try:
      estc_id = r["estc_id"]
      edition = r["edition"]
      clean_edition = None

      edition_words = remove_punctuation(edition.lower()).split()

      # handle editions like "thirtieth and third edition"
      if 'and' in edition_words:
        clean_edition = clean_edition_imprint_with_and_term(edition_words)

      if clean_edition == None:
        clean_edition = clean_edition_imprint(edition_words)

      if clean_edition == None:
        clean_edition = clean_edition_imprint_with_numbers(edition_words)

      if clean_edition == None:
        failed_conversions += 1

      else:
       l.append({
          "estc_id": estc_id,
          "edition_number": str(clean_edition)
        })

    except Exception as exc:
      print "couldn't parse record", estc_id

  print "couldn't convert", failed_conversions, "of", len(records), "records"
  return l

def get_ordinal_mapping():
  ordinal_mapping = {
    "1st": 1,
    "2nd": 2,
    "3rd": 3,

    "tenth": 10,
    "eleventh": 11,
    "twelfth": 12,
    "thirteenth": 13,
    "fourteenth": 14,
    "fifteenth": 15,
    "sixteenth": 16,
    "seventeenth": 17,
    "eighteenth": 18,
    "nineteenth": 19,
    "twentieth": 20,

    # latin declinations
    "priorum": 1,
    "primus": 1,
    "secunda": 2,
    "tertia": 3,
    "quarta": 4,
    "quinta": 5,
    "sexta": 6,
    "septima": 7,
    "octava": 8,
    "nona": 9,
    "decima": 10,

    # italian
    "primo": 1,
    "secondo": 2,
    "terzo": 3,
    "quarto": 4,
    "quinto": 5,
    "sesto": 6,
    "settimo": 7,
    "ottavo": 8,
    "nono": 9,
    "decimo": 10,

    # french
    u"premiere": 1,
    u"deuxi\u0301me": 2,
    u"troisie\u0301me": 3,
    u"troisi\u0301me": 3,
    u"quatri\u0301me": 4,
    u"cinqui\u0301me": 5,
    u"sixi\u0301me": 6,
    u"septi\u0301me": 7,
    u"huiti\u0301me": 8,
    u"neuvi\u0301me": 9,
    u"dixi\u0301me": 10,
    u"quinzi\u0301me": 15,

    # german
    u"erste": 1,
    u"ersten": 1,
    u"zweite": 2,
    u"dritte": 3,
    u"vierte": 4,
    u"fu\u0308nfte": 5,
    u"sechste": 6,
    u"siebte": 7,
    u"achte": 8,
    u"neunte": 9,
    u"zehnte": 10,

    # spanish
    "primero": 1,
    "segundo": 2,
    "tercero": 3,
    "cuarto": 4,
    "quinto": 5,
    "sexto": 6,
    "septimo": 7,
    "octavo": 8,
    "noveno": 9,
    "decimo": 10,

    # roman numerals
    "iind": 2,
    "ii": 2,
    "iiird": 3,
    "iii": 3,

    # assign an edition statement to new editions
    "new": 2,
    "newly": 2,
    "nova": 2,
    "nouvelle": 2,
    "nouellement": 2,
    "altera": 2,
    "andere": 2,
    "novissima": 2,

    # older english and spelling variants
    "seconda": 2,
    "seconde": 2,
    "secundae": 2,
    "segunda": 2,
    "2d": 2,
    "3d": 3,
    "thrid": 3,
    "terza": 3,
    "terceira": 3,
    "quatrieme": 4,
    "fift": 5,
    "fitfh": 5,
    "cinquieme": 5,
    "sixt": 6,
    "sixieme": 6,
    "seuenth": 7,
    "octo": 8,
    "eight": 8,
    "undecimo": 11,
    "eleuenth": 11,
    "twelvth": 12,
    "twelth": 12,
    "duodecima": 12,
    "thirteeu": 13,
    "foureteenth": 14,
    "fifthteenth": 15,
    "fifteen": 15,
    "seuenteenth": 17,
    "ninthteenth": 19
  }

  # create roman numerals iv, ivth ... xx, xxth
  roman_numerals = [
    "iv", "v", "vi", "vii", "viii", "ix", "x",
    "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx"
  ]

  for c, i in enumerate(roman_numerals):
    ordinal_mapping[i] = c + 4
    ordinal_mapping[i + "th"] = c + 4

  # create 4th, 5th, ... 20th
  for i in xrange(16):
    ordinal_mapping[str(4+i) + "th"] = 4+i

  # create 21st, 22nd, ... 99th
  for i in xrange(79):
    last_char = str(i)[-1]

    if last_char == "0":
      ordinal_mapping[str(20+i) + "th"] = 20+i
    
    elif last_char == "1":
      ordinal_mapping[str(20+i) + "st"] = 20+i

    elif last_char == "2":
      ordinal_mapping[str(20+i) + "nd"] = 20+i

    elif last_char == "3":
      ordinal_mapping[str(20+i) + "rd"] = 20+i

    else:
      ordinal_mapping[str(20+i) + "th"] = 20+i

  ordinals = [
    "first", "second", "third", 
    "fourth", "fifth", "sixth", 
    "seventh", "eighth", "ninth"
  ]

  # create first, second ... ninth
  for c, i in enumerate(ordinals):
    ordinal_mapping[i] = c+1

  # create twenty-first, twenty-second ... ninty-ninth
  for ci, i in enumerate([
    "twenty", "thirty", "forty", 
    "fifty", "sixty", "seventy", 
    "eighty", "ninety"
  ]):
    for cj, j in enumerate(ordinals):
      ordinal_mapping[i + "-" + j] = 20 + (ci*10) + (cj+1)
    ordinal_mapping[i.replace("y", "ieth")] = 20 + (ci*10)

  return ordinal_mapping

def get_number_mapping():
  """Return a mapping from strings one, two ... ten
  to integers"""
  return {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10
  }

if __name__ == "__main__":
  query = Query(fields=["estc_id", "edition"], params={"edition": "true"})
  records = query.get_records()

  ordinal_mapping = get_ordinal_mapping()
  number_mapping = get_number_mapping()

  records_with_editions = clean_editions(records)

  with open("json/estc_id_to_clean_edition.json", "w") as out:
    json.dump(records_with_editions, out)