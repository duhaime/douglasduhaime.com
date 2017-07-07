from collections import defaultdict
import json

def shrink_json():
  """Shrink the estc json to a more compact size"""
  estc_json = []

  with open("estc_marc_bibliography.json") as f:
    j = json.load(f)

  for r in j:
    record_json = defaultdict(lambda: defaultdict(list))
    record = r["record"]
    
    # iterate over the controlfield fields to get estc ids
    record_controlfield = record["marc:controlfield"]
    for controlfield in record_controlfield:
      tag = controlfield["@tag"]
      if tag == "001":
        estc_id = controlfield["#text"]
      elif tag == "009":
        estc_internal_id = controlfield["#text"]

    # store the estc record identifiers
    record_json["001"] = estc_id
    record_json["009"] = estc_internal_id

    # now parse through the datafields for record metadata
    record_datafield = record["marc:datafield"]
    for datafield_index, datafield in enumerate(record_datafield):
      tag = record_datafield[datafield_index]["@tag"]
      if "marc:subfield" in record_datafield[datafield_index].iterkeys():
        subfield = record_datafield[datafield_index]["marc:subfield"]

        # some subfields are arrays, some are objects
        if isinstance(subfield, list):
          for subfield_dict in subfield:
            if "@code" in subfield_dict.iterkeys():
              code = subfield_dict["@code"]

              if "#text" in subfield_dict:
                record_json[tag][code].append(subfield_dict["#text"])
            else:
              print "subfield without code", subfield_dict

        # handle the object case
        else:
          if "@code" in subfield:
            code = subfield["@code"]
            if "#text" in subfield:
              record_json[tag][code].append(subfield["#text"])
          else:
            print "subfield without code", subfield

    # finally, for each key that contains only a single value,
    # store that values as a string rather than 1-member list
    if reduce_arrays == 1:
      for tag in record_json.iterkeys():
        try:
          for code in record_json[tag].iterkeys():
            value = record_json[tag][code]
            if isinstance(value, list):
              if len(value) == 1:
                record_json[tag][code] = record_json[tag][code][0]
        except:
          pass

    estc_json.append(record_json)

  with open("json/estc_marc.json", "w") as out:
    json.dump(estc_json, out)

if __name__ == "__main__":
  reduce_arrays = 0
  shrink_json()