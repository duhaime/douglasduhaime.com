import json, codecs, multiprocessing, glob, os

def get_ecco_record_metadata(ecco_xml_file_path):
  """Read in the full path to an ECCO xml file and return
  json with that file's metadata fields"""

  record_metadata = {"xml_path": ecco_xml_file_path, "subjects": []}

  with codecs.open(ecco_xml_file_path, 'r', 'latin1') as f:
    f = f.read()

  ###
  # parse out straightforward fields
  ###

  for field in get_ecco_string_fields():
    try:
      start                  = "<" + field
      end                    = "</" + field
      record_metadata[field] = f.split(start)[1].split(">")[1].split(end)[0]

    except Exception as exc:
      record_metadata[field] = ""
      log_exception(exc, ecco_xml_file_path, field)

  ###
  # parse subject fields
  ###

  try:
    subjects = f.split("<locSubject")
    for subject in subjects[1:]:
      clean_subject = subject.split(">")[1].split("</locSubject")[0].strip()
      if clean_subject:
        record_metadata["subjects"].append(clean_subject)

  except Exception as exc:
    record_metadata["subjects"] = []
    log_exception(exc, ecco_xml_file_path, "subject")

  ###
  # parse or infer cover image
  ###

  try:
    cover_image = f.split('type="titlePage"')[1].split("<imageLink>")[1].split("</imageLink")[0]
    record_metadata["cover_image"] = cover_image
  
  except Exception as exc:
    record_metadata["cover_image"] = ""
    log_exception(exc, ecco_xml_file_path, "cover_image")

  ###
  # identify number of holding libraries
  ###

  try:
    record_metadata["holding_libraries"] = str(len(f.split("<libraryName")[1:]))

  except Exception as exc:
    record_metadata["holding_libraries"] = ""
    log_exception(exc, ecco_xml_file_path, "holding_libraries")

  return record_metadata


def log_exception(exception, file_path, message):
  """Read in a path to a file that raised an exception and a message
  and log that message to disk"""
  with codecs.open("exception_log", "a", "utf-8") as exc_out:
    exc_out.write(" ".join([exception, file_path, message]) + "\n")


def get_ecco_string_fields():
  """Returns an array of the fields in the ECCO metadata that can be
  parsed out with simple means"""
  return [
    "documentID",
    "ESTCID",
    "language",
    "notes",
    "marcName",
    "birthDate",
    "deathDate",
    "marcDate",
    "fullTitle",
    "displayTitle",
    "uniformTitle",
    "currentVolume",
    "totalVolumes",
    "imprintFull",
    "imprintCity",
    "imprintPublisher",
    "imprintYear",
    "collation",
    "publicationPlace",
    "totalPages"
  ]

if __name__ == "__main__":
  
  if not os.path.exists("json"):
    os.makedirs("json")

  metadata_results = []
  pool = multiprocessing.Pool()
  
  print "collecting ecco one xml glob"
  ecco_one_xml_files = glob.glob("/Volumes/CRC - dduhaime/18th C Collections Online/*/*/*/xml/*.xml")
  
  print "collecting ecco two xml glob"
  ecco_two_xml_files = glob.glob("/Volumes/CRC - dduhaime/ECCOII 2011/*/XML/*.xml")

  ecco_xml_files = ecco_one_xml_files + ecco_two_xml_files

  for c, result in enumerate(pool.imap(get_ecco_record_metadata, ecco_xml_files)):
    print c
    metadata_results.append(result)

with open("json/ecco_records.json", "w") as metadata_out:
  json.dump(metadata_results, metadata_out)
