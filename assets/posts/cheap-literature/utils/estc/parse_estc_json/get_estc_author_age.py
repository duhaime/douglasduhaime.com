"""Finds the delta between an author's birth date
and the publication date of a record to determine
how old the author was when they wrote the record"""

import urllib2, json, codecs, sys
sys.path.append("../../"); from dissertation.api import Query

###
# Common
###

def write_json(j, filename):
  """Read in json and a filename and write that json to disk"""
  with open("json/" + filename, 'w') as out:
    json.dump(j, out)


def clean_year(imprint_year):
  """Read in a raw imprint year and return the first string
  of four consecutive integers from that string"""
  imprint_year = imprint_year.replace(".","")
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

###
# Calculate author age
###

def clean_int(integer_string):
  """Read in a string representation of an integer
  and return a cleaned integer"""
  number = clean_year(integer_string)
  try:
    return int(number)
  except Exception as exc:
    return None


def get_author_ages(records):
  """Read in an array of ESTC records and return a 
  dictionary that maps the ESTC id to the age 
  of the author at the time of the publication and
  a boolean integer indicating whether the author was
  alive at the time of the publication"""
  estc_author_ages = []
  for r in records:
    estc_id = r["estc_id"]
    imprint_year = r["imprint_year"]
    
    author_date_uncertainty = r["author_date_uncertainty"]
    if int(author_date_uncertainty) == 0:
      try:
        publication_year = clean_int(imprint_year)
        author_birth = clean_int(r["birth_date"])
        author_death = clean_int(r["death_date"])
        
        # measure time between author's birth and the 
        # publication year
        if author_birth and author_death:
          years_after_birth = publication_year - author_birth

          # determine whether the author was alive when the
          # record was published
          if publication_year > author_death:
            author_alive = 0
          else:
            author_alive = 1

      except Exception as exc:
        years_after_birth = ""
        author_alive = ""

    else:
      years_after_birth = ""
      author_alive = ""

    estc_author_ages.append({
      "estc_id": estc_id,
      "author_age": str(years_after_birth),
      "author_alive": str(author_alive)
    })

  return estc_author_ages


if __name__ == "__main__":
  records = Query(params={"author_date_uncertainty": "0"}).get_records()
  integers = [str(i) for i in xrange(10)]
  estc_author_ages = get_author_ages(records)
  write_json(estc_author_ages, "estc_author_ages.json")