from collections import defaultdict
import json

def ecco_to_estc_id(estc_id):
  """Read in an ECCO ESTC id and return that id
  in ESTC format (sans leading zeros)"""
  letter = estc_id[0]
  numbers = "".join(estc_id[1:])
  return letter + numbers.lstrip("0")

def get_image_counts(ecco_images):
  """Read in an array of objects and return an object
  mapping each estc_id to counts of image types"""
  d = defaultdict(lambda: defaultdict(int))

  image_types = [
    'portrait',
    'chart',
    'map',
    'plan',
    'illustration',
    'genealogicalTable',
    'coatOfArms',
    'music',
    'cartoon'
  ]

  for i in ecco_images:
    estc_id = ecco_to_estc_id(i["estc_id"])
    image_type = i["image_type"]
    d[estc_id][image_type] += 1

  # after counting all observations, transform the d into
  # an array in the format expected by the model ingestion
  # script
  l = []
  for estc_id in d.iterkeys():
    observation = {"estc_id": estc_id}
    total_images = 0
    for image_type in image_types:
      
      # pluralize the image type for the model
      if image_type == "coatOfArms":
        plural_image_type = "coats_of_arms"
      elif image_type == "genealogicalTable":
        plural_image_type = "genealogical_tables"
      elif image_type == "music":
        plural_image_type = "music_sheets"
      else:
        plural_image_type = image_type + "s"

      observation[plural_image_type] = d[estc_id][image_type]
      total_images += d[estc_id][image_type]
    observation["total_images"] = total_images
    l.append(observation)
  
  return l

if __name__ == "__main__":
  with open("ecco_image_data.json") as f:
    ecco_images = json.load(f)
  image_counts = get_image_counts(ecco_images)
  
  with open("estc_id_to_image_counts.json", "w") as out:
    json.dump(image_counts, out)
