"""Call Stanford NER to get the publisher(s) of an
ESTC record. To do so, one must download the
Stanford CoreNLP, cd into the CoreNLP directory,
and start the server with the following command:

java -mx4g -cp "*" edu.stanford.nlp.pipeline.StanfordCoreNLPServer 3000 10000

The first integer argument is the port on which the
server will be run, and the second is the timeout for
long calls"""

import subprocess, json, urllib2, sys
from collections import defaultdict
sys.path.append("../../"); from dissertation.api import Query

###
# Common
###

def write_json(j, filename):
  """Read in json and a filename and write that json to disk"""
  with open("json/" + filename, 'w') as out:
    json.dump(j, out)


###
# Prepare data structures
###

def map_record_to_publisher(records):
  """Read in an array of records and return a mapping
  from ESTC id to the publisher of the given record"""
  estc_id_to_publisher = {}
  for r in records:
    estc_id = r["estc_id"]
    publisher = r["imprint_publisher"]
    estc_id_to_publisher[estc_id] = publisher
  return estc_id_to_publisher


###
# Named Entity Recognition
###

def get_publisher_ner(estc_id_to_publisher):
  """Read in a mapping from ESTC id to the publisher
  string for the given record, perform the NER lookup
  for each record in the incoming dictionary, and add
  the resulting json to the outgoing dictionary"""
  publisher_ner = {}
  for estc_id in estc_id_to_publisher.iterkeys():
    publisher_field = estc_id_to_publisher[estc_id]
    ner_results = run_ner(publisher_field)
    publisher_ner[estc_id] = {
      "ner": ner_results,
      "imprint_publisher": publisher_field
    }
  return publisher_ner


def run_ner(text):
  """Read in a text string and return the json response
  from the NER classifier"""
  if text:
    # escape single quote with unicode representation
    m =  "curl --data '" + text.replace("'", "\u0027")
    m += "' 'http://localhost:9000/?properties="
    m += annotator_prefix + annotator_uri + annotator_suffix
    m += "outputFormat%22%3A%22json%22}' -o -"

    response = subprocess.check_output([m], shell=True)
    json_response = json.loads(response, strict=False)
    try:
      return json_response
    except:
      return {}
  return {}


def find_publishers(publisher_ner):
  """Read in a d with ESTC id keys that map to dictionaries
  with ner and imprint_publisher keys, parse out the people
  from the ner field, and return a mapping from ESTC ids
  to an array of publishers"""
  estc_publishers = []
  for estc_id in publisher_ner.iterkeys():
    publishers = []
    ner = publisher_ner[estc_id]["ner"]

    if "sentences" in ner.keys():
      for i, sentence in enumerate(ner["sentences"]):
        current_publisher = ""
        in_publisher = 0
        tokens = ner["sentences"][i]["tokens"]
        for token in tokens:
          if token["ner"] == "PERSON":
            in_publisher = 1
            current_publisher += " " + token["originalText"]
          
          # Handle the case of Eliz. Adams, which parses the .
          # into a unique token
          elif token["ner"] == "PERSON":
            if in_publisher == 1:
              current_publisher += " " + token["originalText"]
          else:
            if in_publisher == 1:
              in_publisher = 0
              current_publisher = current_publisher.strip()
              current_publisher = current_publisher.strip('.')
              publishers.append(current_publisher)
              current_publisher = ""
    estc_publishers.append({"estc_id": estc_id, "publishers": publishers})
  return estc_id_to_publishers


if __name__ == "__main__":
  query = Query(limit=10000, offset=0)
  records = query.get_records()

  # prepare uri strings for requests to the CoreNLP server 
  annotators = "tokenize,ssplit,pos,depparse,lemma,ner"
  annotator_uri = "%2c".join(annotators.split(","))
  annotator_prefix = "{%22annotators%22%3A%22" 
  annotator_suffix = "%22%2C%22"

  estc_id_to_publisher = map_record_to_publisher(records)
  publisher_ner = get_publisher_ner(estc_id_to_publisher)
  estc_publishers = find_publishers(publisher_ner)
  write_json(estc_publishers, "estc_publishers.json")