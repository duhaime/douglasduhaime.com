import json, urllib2, os, multiprocessing, regex, sys

sys.path.append("../../"); from dissertation.api import Query

"""This script parses structured price data from raw price strings
in historical texts. The conversion formula is as follows:

  2 farthings  = 1 halfpenny
  4 farthings  = 1 penny (d)
  12 pennies   = 1 shilling (s)
  5 shillings  = 1 crown
  4 crowns     = 1 pound (l)
  21 shillings = 1 guinea"""

def print_log(m):
  """Read in a message to log, and log it if logging == 1"""
  if logging == 1:
    print m


def write_json(j, filename):
  """Write json to the given filename"""
  with open("json/" + filename, "w") as out:
    json.dump(j, out)


def parse_records(records):
  """Read in an array of results and parse prices from each"""
  price_pool = multiprocessing.Pool(max_cores)
  found_prices = []
  
  if multiprocess == 1:
    for price_result in price_pool.imap(find_price, records):
      if price_result:
        found_prices.append(price_result)
  else:
    for record in records:
      price_result = find_price(record)
      if price_result:
        found_prices.append(price_result)
  print_log("found " + str(len(found_prices)) + " prices")

  parse_pool = multiprocessing.Pool(max_cores)
  parsed_prices = []

  if multiprocess == 1:
    for parsed_result in parse_pool.imap(parse_prices, found_prices):
      if parsed_result:
        parsed_prices.append(parsed_result)
  else:
    parsed_prices = []
    for found_price in found_prices:
      parsed_price = parse_prices(found_price)
      if parsed_price:
        parsed_prices.append(parsed_price)
  return parsed_prices


def find_price(estc_record):
  """Read in an estc record object, and return the raw price
  for the record"""
  estc_id = estc_record["estc_id"]
  price_string = ""

  try:
    note_fields = estc_record["metadata"]["500"]
  except:
    return {"estc_id": estc_id, "price": ""}

  for letter in note_fields:
    for note_field in note_fields[letter]:
      if "price" in note_field.lower():
        price_string += note_field + " "

  if price_string:
    return {"estc_id": estc_id, "price": price_string}
  return {"estc_id": estc_id, "price": ""}


def parse_prices(price_object):
  """Read in a price object, and return an object with clean price data"""
  estc_id = price_object["estc_id"]

  nonparsed_response = {
    "estc_id": estc_id,
    "marc_price": "",
    "price_options": "",
    "farthings": "",
    "printing_details": []
  }

  try:
    raw_price = price_object["price"]
    price_string = parse_price_strings(raw_price, estc_id)
    if not price_string:
      return nonparsed_response

    clean_price = clean_price_string(price_string)
    price_parts = parse_price_parts(clean_price)
    price_options = are_there_price_options(raw_price, price_parts)
    printing_details = get_printing_details(raw_price)

    if not price_parts:
      print_log("2 " + estc_id + " " + raw_price)
      return nonparsed_response

    farthings = compute_farthings(price_parts)

    if not farthings:
      print_log("3 " + estc_id + " " + raw_price)
      return nonparsed_response
    
    return {
      "estc_id": estc_id,
      "marc_price": raw_price,
      "price_options": str(price_options),
      "farthings": str(int(farthings)),
      "printing_details": printing_details
    }

  # if this record has no price, return empty fields
  except:
    return nonparsed_response


def are_there_price_options(raw_price, price_parts):
  """Read in a price string and list of price parts and
  return a boolean indicating where there are price options
  for the text"""
  raw_price = remove_punctuation(raw_price.lower())

  price_variants = [
    " or ", # e.g. T164537
    "published", # e.g. N3472
    "publishd", # e.g. T46672
    "may be had", # e.g. T161193
    "dozen",
    "hundred", # e.g. T178298
    "100" # e.g. T187424
  ]

  if any(t in raw_price for t in price_variants):
    return 1

  # handle case of e.g. N24883:
  # "Price from imprint: Price from 12s. 6d. to 2l. 12s. 6d."
  elif "from" in raw_price and " to " in raw_price:
    return 1

  # case of works with advertisements on their cover pages
  # e.g. N21382, T46672, T190927, N3472, T161193, T129742, T183570 ...
  elif len(price_parts) > 6:
    return 1

  # check if a given price unit (e.g. "s", "l") occurs more than
  # once in this record. If so, we should indicate this record has
  # pricing variants. See e.g. T102247
  duplicate_price_values = detect_duplicate_price_values(price_parts)
  if duplicate_price_values:
    return 1

  return 0


def detect_duplicate_price_values(price_parts):
  """Read in a list of price parts ala ["1", "s"] and
  return a boolean to indicate whether this record
  has some price values (e.g. "l", "s") listed more than
  once"""
  price_letters = []
  for p in price_parts:
    if p in farthings_dict.iterkeys():
      price_letters.append(p)
  return len(price_letters) != len(list(set(price_letters)))


def get_printing_details(raw_price):
  """Read in a raw price and return the kind of binding
  or paper used, or subscription status, if discussed"""
  raw_price = remove_punctuation(raw_price.lower())

  details = {
    "stitched": ["stitched", "stitchd", "sewed", "stitcht", "stichd"],
    "half_bound": ["halfbound"],
    "unbound": ["unbound"],
    "bound": ["bound", "boards"],
    "calf": ["calf"],
    "color": ["colourd", "colored", "coloured"],
    "gilt": ["gilt"],
    "impression": ["impression"],
    "subscription": ["subscription" "subscribers"]
  }

  printing_details = []

  for d in details.iterkeys():
    for w in details[d]:
      if w in raw_price.split():
        printing_details.append(d)
  return list(set(printing_details))


def parse_price_strings(raw_price, estc_id):
  """Read in a price string and return that price after
  splitting on high-frequecy price introduction strings"""
  price_strings = [
    "Price from imprint:",
    "in square brackets:",
    "Price on title page:",
    "Price at foot of title page in parentheses:",
    "At end of imprint:",
    "At foot of title:",
    "At foot of page:",
  ]

  cleaner_price = raw_price

  for price_string in price_strings:
    if price_string in raw_price:
      cleaner_price = raw_price.split(price_string)[1]

  cleaner_price = cleaner_price.lower()

  # note: strings like "unpriced" must be removed in order to run
  # cleaner_price.split("price")[-1], as otherwise the clean
  # price string will consist entirely of d, which will be identified
  # as the monetary symbol
  for i in ["unpriced", "priced", "prices"]:
    cleaner_price = cleaner_price.replace(i,"")

  if "price" in cleaner_price.lower():
    cleaner_price = cleaner_price.lower().split("price")[-1]

  for i in [" or ", " or, ", " -or ", " -or, "]:
    if i in cleaner_price:
      cleaner_price = cleaner_price.split(i)[0]
  return cleaner_price


def clean_price_string(price_string):
  """Read in a price string and return it in cleaned fashion"""
  price_string = remove_punctuation(price_string)
  return price_string.lower()


def parse_price_parts(clean_price):
  """Read in a price string and return an array of price parts"""
  price_parts = []
  price_words = clean_price.split()
  for word in price_words:

    # the 6 d condition
    if word in scalars:
      price_parts.append(word)

    elif word in money_symbols:
      price_parts.append(word)
    
    # the 6d condition
    elif word[0] in integers:
      coefficient = ""
      for character in word:
        if character in integers:
          coefficient += character
        else:
          break
      
      try:
        next_character = word[len(coefficient)]
      except IndexError:
        return None

      if next_character in money_symbols:
        price_parts.append(coefficient)
        price_parts.append(next_character)

    # the twelvepence condition
    else:
      for d in [money_dict, numbers_dict]:
        try:
          retrieved_value = d[word]
          if isinstance(retrieved_value, list):
            for value in retrieved_value:
              price_parts.append(value)
          else:
            price_parts.append(retrieved_value)
        except KeyError:
          pass

  return price_parts


def compute_farthings(price_parts):
  """Read in a list of price parts ala ["1", "s"] and return
  an integer indicating the price of the work in farthings"""
  farthings = 0
  coefficient = {
    "val": 1,
    "used": 0
  }

  for part in price_parts:
    if part in scalars:
      # to prevent 'two pence halfpenny' from computing as
      # farthings = 12 (i.e. 2*4 + 2*2) and generate the
      # correct parse instead (2*4 + 2 = 10), only use coefficients once.
      # See e.g. P2505
      coefficient = {
        "val": float(part),
        "used": 0
      }

    elif part in farthings_dict:
      unit_farthings = float(farthings_dict[part])

      try:
        if coefficient["used"] == 0:
          coefficient["used"] = 1
        else:
          coefficient = {
            "val": 1,
            "used": 0
          }

        farthings += coefficient["val"] * unit_farthings

      except Exception as exc:
        return None

    else:
      print "couldn't parse farthings", part, price_parts
  return farthings


def remove_punctuation(s):
  """Read in a string and return that string without punctuation"""
  s = s.replace("-"," ")
  return regex.sub(ur"\p{P}+", "", s)


def get_money_dict():
  """Return a mapping from monetary string to controlled 
  monetary value"""
  return {
    "sh"             : "s",
    "shil"           : "s",
    "shill"          : "s",
    "shillg"         : "s",
    "shillgs"        : "s",
    "silling"        : "s",
    "oneshilling"    : "s",
    "shilling"       : "s",
    "shillings"      : "s",
    "shelings"       : "s",
    "shellings"      : "s",
    "pence"          : "d",
    "pences"         : "d",
    "penny"          : "d",
    "penne"          : "d",
    "peny"           : "d",
    "guinea"         : "g",
    "guineas"        : "g",
    "halfpence"      : "h",
    "pound"          : "l",
    "pounds"         : "l",
    "halfpenny"      : "h",
    "crown"          : "c",
    "twopence"       : ["2", "d"],
    "threepence"     : ["3", "d"],
    "fourpence"      : ["4", "d"],
    "fivepence"      : ["5", "d"],
    "sixpence"       : ["6", "d"],
    "sevenpence"     : ["7", "d"],
    "eightpence"     : ["8", "d"],
    "ninepence"      : ["9", "d"],
    "tenpence"       : ["10", "d"],
    "elevenpence"    : ["11", "d"],
    "twelvepence"    : ["12", "d"],
    "thirteenpence"  : ["13", "d"],
    "fourteenpence"  : ["14", "d"],
    "fifteenpence"   : ["15", "d"],
    "sixteenpence"   : ["14", "d"],
    "seventeenpence" : ["14", "d"],
    "eighteenpence"  : ["14", "d"],
    "nineteenpence"  : ["14", "d"]
  }


def get_numbers_dict():
  """Return a mapping from numbers to controlled number value"""
  return {
    "half"           : "0.5",
    "one"            : "1",
    "two"            : "2",
    "three"          : "3",
    "four"           : "4",
    "five"           : "5",
    "six"            : "6",
    "seven"          : "7",
    "eight"          : "8",
    "nine"           : "9",
    "ten"            : "10",
    "eleven"         : "11",
    "twelve"         : "12",
    "thirteen"       : "13",
    "fourteen"       : "14",
    "fifteen"        : "15",
    "sixteen"        : "16",
    "seventeen"      : "17",
    "eighteen"       : "18",
    "nineteen"       : "19",
    "twenty"         : "20"
  }


def get_farthings_dict():
  """Return a mapping from monetary character to the monetary value 
  of that unit in farthings"""
  return {
    "d": 4,
    "s": 48,
    "l": 960,
    "g": 1008,
    "h": 2,
    "c": 240
  }


if __name__ == "__main__":
  # processing options
  logging      = 1
  max_cores    = 1
  multiprocess = 0

  # internal data mappings
  money_dict     = get_money_dict()
  numbers_dict   = get_numbers_dict()
  farthings_dict = get_farthings_dict()
  
  # internal data lists
  integers = [str(i) for i in xrange(240)]
  scalars = integers + ["0.5"]
  money_symbols = ["l","s","d"]

  records = Query(route="/api/estc/marc").get_records()
  parsed_prices = parse_records(records)
  write_json(parsed_prices, "clean_estc_prices.json")