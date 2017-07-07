from collections import defaultdict
from bs4 import BeautifulSoup, Tag
import codecs, json, xmltodict

estc_json = []

# marcxml was delivered from UC Riverside
with codecs.open("marcxml/bibexp20150720.marcxml", "r", "utf-8") as f:
  f = f.read()
  records = f.split("<marc:record>")[1:]

  # recursiveChildGenerator iterates over all descendants
  for c, record in enumerate(records):
    print "processing", c

    # get the content before the closing of the record
    clean_record = "<record>" + record.split("</marc:record>")[0] + "</record>"
    record_json  = xmltodict.parse(clean_record)

    estc_json.append(record_json)

print "writing json"

with open("estc_marc_bibliography.json", "w") as out:
  json.dump(estc_json, out)
