import sys, json
sys.path.append("../../"); from dissertation.api import Query

def clean_pagination(records):
  """Main method for cleaning record pagination statements"""
  results = []
  for r in records:
    try:
      estc_id = r["estc_id"]
      description = r["metadata"]["300"]["a"][0]
      split_description = description.split(",")
      for field in split_description:
        # should check if "engraved" appears in 500 fields e.g. T206354
        field = field.lower()
        if "plates" in field.lower():
          plate_statement = "plates"
        elif "plate" in field.lower():
          plate_statement = "plate"
        else:
          plate_statement = ""

        results.append({
          "estc_id": estc_id,
          "physical_description": plate_statement
        })

    except Exception as exc:
      pass

  return results

if __name__ == "__main__":
  records = Query(route="/api/estc/marc").get_records()
  physical_descriptions = clean_pagination(records)

  with open("json/clean_estc_physical_descriptions.json", "w") as out:
    json.dump(physical_descriptions, out)