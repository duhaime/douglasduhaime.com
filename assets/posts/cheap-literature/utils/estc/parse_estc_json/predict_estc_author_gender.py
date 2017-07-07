"""Uses genderize.io api service to predict gender
for each ESTC record"""

import urllib2, json, codecs, re, urlparse, time, sys
sys.path.append("../../"); from dissertation.api import Query

###
# Common
###

def write_json(j, filename):
  """Read in json and a filename and write that json to disk"""
  with open("json/" + filename, 'w') as out:
    json.dump(j, out)


###
# Non-ascii url escaping
###

# via http://stackoverflow.com/questions/4389572
def urlEncodeNonAscii(b):
  return re.sub('[\x80-\xFF]', lambda c: '%%%02x' % ord(c.group(0)), b)

def iriToUri(iri):
  parts= urlparse.urlparse(iri)
  return urlparse.urlunparse(
    part.encode('idna') if parti==1 else urlEncodeNonAscii(part.encode('utf-8'))
    for parti, part in enumerate(parts)
  )

###
# Get author genders
###

def get_record_names(records):
  """Read in an array of ESTC records and return a
  dictionary with estc id keys and author first name
  values, as well as an array of those names"""
  estc_id_to_name = {}
  names = []
  for r in records:
    estc_id = r["estc_id"]
    name = r["marc_first_name"]
    
    # in the case of multi word first names
    # with whitespace (e.g. John Michael),
    # take only the first word from the name
    name = name.split(" ")[0]

    # remove non-alphabetic characters
    name = "".join(s for s in name if s.isalpha() or s == "-")

    estc_id_to_name[estc_id] = name
    names.append(name)
  
  # dedupe the names array
  names = list(set(names))
  return estc_id_to_name, names


def get_gender(name):
  """Read in a name, submit that name to genderize.io,
  and return the predicted gender and gender prediction
  confidence values"""
  try:
    uri_name = iriToUri(name)
    url = "https://api.genderize.io/?name=" + uri_name
    if apikey:
      url += "&apikey=" + apikey

    response = urllib2.urlopen(url)
    html = response.read()
    unicode_html = unicode(html, "utf-8")
    json_response = json.loads(unicode_html)
    return json_response

  except:
    print "couldn't call genderize api for", name
    return {
      "gender": uncertain_gender_value,
      "probability": uncertain_gender_value,
      "count": uncertain_gender_value
    }


def get_genders(names):
  """Read in an array of names and return a dictionary
  with name keys and both gender and gender prediction
  confidence values"""
  name_to_gender = {}
  for name in names:
    if name:
      name_to_gender[name] = get_gender(name)
  return name_to_gender


def genderize_records(estc_id_to_name, name_to_gender):
  """Read in a mapping of ESTC id's to names, and a mapping
  of names to genders, and return a mapping from ESTC id
  to gender, gender count, and gender probability"""
  estc_author_genders = []
  for estc_id in estc_id_to_name.iterkeys():
    name = estc_id_to_name[estc_id]
    if name:
      gender_data = name_to_gender[name]
      
      # Treat the inconsistent api response formats
      try:
        gender = gender_data["gender"]
        if gender not in genders:
          print "unrecognized gender:", gender, "for:", name
          gender = uncertain_gender_value
      except KeyError:
        gender = uncertain_gender_value
      
      try:
        gender_probability = gender_data["probability"]
      except KeyError:
        gender_probability = uncertain_gender_value

      estc_author_genders.append({
        "gender": gender,
        "estc_id": estc_id
      })

    else:
      estc_author_genders.append({
        "gender": uncertain_gender_value,
        "estc_id": estc_id
      })

  return estc_author_genders


if __name__ == "__main__":
  query = Query(limit=10000, offset=0)
  records = query.get_records()

  apikey = "api_key_goes_here"
  genders = ["male", "female"]
  uncertain_gender_value = ""

  estc_id_to_name, names = get_record_names(records)
  name_to_gender = get_genders(names)
  estc_author_genders = genderize_records(estc_id_to_name, name_to_gender)
  write_json(name_to_gender, "name_to_gender.json")
  write_json(estc_author_genders, "estc_author_genders.json")