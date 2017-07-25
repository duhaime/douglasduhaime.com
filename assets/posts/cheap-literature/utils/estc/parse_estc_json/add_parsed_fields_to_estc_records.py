"""Combines a selection of parsed json results to 
the estc records directory for inclusion in the
estc record json packets"""

import shutil, os, json

if __name__ == "__main__":
  files_to_combine = [
    "estc_author_ages.json",
    "estc_author_genders.json",
    "estc_id_to_image_counts.json",
    "estc_id_to_mean_ocr.json",
    "estc_id_to_pages.json",
    "estc_publishers.json",
    "estc_id_to_title_cluster.json"
  ]

  for i in files_to_combine:
    file_basename = os.path.basename(i)
    shutil.copy("json/" + file_basename, "../estc_records/json/" + file_basename)