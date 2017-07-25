from __future__ import division
import glob, codecs, os, json

def ecco_to_estc_id(estc_id):
  """Read in an ECCO ESTC id and return that id
  in ESTC format (sans leading zeros)"""
  letter = estc_id[0]
  numbers = "".join(estc_id[1:])
  return letter + numbers.lstrip("0")

def get_ocr_quality(files):
  """Main function for parsing out the mean ocr quality
  of each ECCO record"""
  estc_id_to_mean_ocr = []

  for i in files:
    try:
      estc_id = os.path.basename(i).split("_")[0]
      estc_id = ecco_to_estc_id(estc_id)

      with open(i) as f:
        j = json.load(f)
        pages = len(j)
        if pages == 0:
          print "skipping", i
          continue

        aggregate_ocr_quality = 0
        for p in j:
          ocr_quality = float(p["ocr_quality"])
          aggregate_ocr_quality += ocr_quality

      estc_id_to_mean_ocr.append({
        "estc_id": estc_id,
        "mean_ocr_quality": aggregate_ocr_quality / pages
      })
    
    except:
      print "couldn't parse", i
      estc_id_to_mean_ocr.append({
        "estc_id": estc_id,
        "mean_ocr_quality": ""
      })

  with open("json/estc_id_to_mean_ocr.json", "w") as out:
    json.dump(estc_id_to_mean_ocr, out)


if __name__ == "__main__":
  files = glob.glob("ecco_texts/*/*/*/*.json")
  estc_id_to_mean_ocr = get_ocr_quality(files)