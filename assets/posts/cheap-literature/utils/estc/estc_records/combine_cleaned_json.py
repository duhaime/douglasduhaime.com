from collections import defaultdict
import codecs, json, glob

def combine_estc_json():
  """Create json that's an array with one member for
  each record to be included in the estc-records table"""
  estc_records = defaultdict(lambda: defaultdict())

  for i in glob.glob("json/*.json"):
    if i != "json/estc_records.json":
      print "adding", i, "to the combined record json"
      with open(i) as f:
        j = json.load(f)
        for record in j:
          estc_id = record["estc_id"]
          if estc_id in ecco_only_estc_ids:
            continue

          for field in record.iterkeys():
            if field != "estc_id":
              estc_records[estc_id][field] = record[field]

  # after building up the dictionary, reduce the json
  # to an array of estc record objects
  estc_records_array = []

  for estc_id in estc_records:
    estc_record_json = estc_records[estc_id]
    estc_record_json["estc_id"] = estc_id
    estc_records_array.append(estc_record_json)  

  with open("json/estc_records.json", "w") as out:
    json.dump(estc_records_array, out)

if __name__ == "__main__":
  # Several estc ids are in ECCO but not ESTC; skip these
  # records when preparing the data model
  ecco_only_estc_ids = [
    "T91440",
    "N27109",
    "T194291",
    "T75703",
    "T35957",
    "T202928",
    "T218004",
    "N65697",
    "T71048",
    "T183362",
    "T191598",
    "T98811",
    "T208723",
    "P1759",
    "N71651",
    "T170388",
    "T136256",
    "T198724",
    "T144464",
    "T189120",
    "T147902",
    "T141034",
    "N17355",
    "T192187",
    "N26033",
    "T155341",
    "T230000",
    "T47411",
    "N68765",
    "T51039",
    "N71633",
    "N36170",
    "T229504",
    "W21717",
    "T226527",
    "T185929",
    "T190549",
    "T176040",
    "T88025",
    "N3791",
    "T140202",
    "T51803",
    "T180135",
    "T88701",
    "T164299",
    "T104748",
    "T192945",
    "T219064",
    "N18660",
    "W42459",
    "N54411",
    "T232336",
    "T196522",
    "T129032",
    "T94983",
    "T218005",
    "T48834",
    "T127015",
    "T219029",
    "T113374",
    "T153603",
    "T108207",
    "T155683",
    "N71639",
    "N71673",
    "T131094",
    "T105447",
    "T139823",
    "T77880",
    "N26763",
    "R221154",
    "T136414",
    "W18825",
    "N49118",
    "W42714",
    "T38963",
    "T120774",
    "T179109",
    "T18271",
    "T148719",
    "N45649",
    "W42700",
    "N71657",
    "T108304",
    "T223733",
    "W42698",
    "N71662",
    "N48595",
    "T152670",
    "N71661",
    "T222825",
    "N47629",
    "T135411"
  ]

  combine_estc_json()