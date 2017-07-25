import json, codecs, multiprocessing, glob, os

def get_field_content(xml, field):
  """Read in a string of xml and a field (or tag),
  and return the contents of that tag"""
  content_start = xml.split("<" + field)
  content_end = content_start[1].split(">")[1]
  content = content_end.split("</" + field)[0]
  return content


def get_image_data(page, estc_id, ecco_xml_file_path):
  """Read in a page of ECCO xml and return an object
  that describes the image on that page"""
  image_id = get_field_content(page, "imageLink")
  page_id = get_field_content(page, "pageID")
  record_id = get_field_content(page, "recordID")
  graphic_caption = get_field_content(page, "graphicCaption").strip()
  image_type = page.split("<graphicCaption")[1].split('type="')[1].split('"')[0]

  image_data = {
    "estc_id": estc_id,
    "ecco_xml_file_path": ecco_xml_file_path,
    "image_id": image_id,
    "page_id": page_id,
    "record_id": record_id,
    "graphic_caption": graphic_caption,
    "image_type": image_type
  }

  return image_data


def get_paragraphs(page):
  """Read in a page of ECCO xml and return an array of all 
  paragraphs on that page"""
  paragraphs = []
  for p in page.split("<p>")[1:]:
    paragraph = p.split("</p>")[0]
    paragraphs.append(paragraph)
  return paragraphs


def get_paragraph_words(paragraphs):
  """Read in a list of paragraphs and return a list of
  paragraphs, each of which is comprised of a list of
  words (e.g. [["Once", "upon", "a", "time"],[]...])"""
  paragraph_words = []
  for paragraph in paragraphs:
    words = []
    for w in paragraph.split("<wd")[1:]:
      word = w.split(">")[1].split("</wd")[0]
      words.append(word)
    paragraph_words.append(words)
  return paragraph_words


def get_text_data(page):
  """Read in the XML from an ECCO page and return an object with
  keys that describe the page's text data"""
  page_id = get_field_content(page, "pageID")
  ocr_quality = get_field_content(page, "ocr")
  paragraphs = get_paragraphs(page)
  paragraph_words = get_paragraph_words(paragraphs)

  page_text_data = {
    "page_id": page_id,
    "ocr_quality": ocr_quality,
    "paragraphs": paragraph_words
  }

  return page_text_data


def get_text_and_images(ecco_xml_file_path):
  """Read in the full path to an ECCO xml file, parse
  out the text content within that file, and return
  an array with one object per image in the file"""

  record_images = []
  record_text = []

  with codecs.open(ecco_xml_file_path, 'r', 'latin1') as f:
    f = f.read()

    # pluck out the estc id
    estc_id = get_field_content(f, "ESTCID")

    # split the record into a list of pages
    # nb: split on "<page " rather than "<page"
    # because otherwise "<pageContent" enters the mix
    pages = f.split("<page ")[1:]

    for page in pages:
      if "<graphicCaption" in page:
        image_data = get_image_data(page, estc_id, ecco_xml_file_path)
        record_images.append(image_data)

      else:
        page_text = get_text_data(page)
        record_text.append(page_text)

    return {
      "estc_id": estc_id,
      "record_images": record_images,
      "record_text": record_text
    }


def write_ecco_text_data(json_result):
  """Read in the json result from get_ecco_record_metadata()
  function call and write the text data for the current
  record to disk"""
  estc_id = json_result["estc_id"]
  record_text = json_result["record_text"]

  # store the output in a nested directory structure
  out_dir =  "ecco_texts/" + estc_id[0] + "/"
  out_dir += estc_id[1] + "/" + estc_id[2] + "/"
  if not os.path.exists(out_dir):
    os.makedirs(out_dir)

  with open(out_dir + estc_id + "_text_data.json", "w") as text_out:
    json.dump(record_text, text_out)


if __name__ == "__main__":

  if not os.path.exists("ecco_texts"):
    os.makedirs("ecco_texts")

  ecco_image_data = []
  pool = multiprocessing.Pool()
 
  print "collecting ecco one xml glob"
  ecco_one_xml_files   = glob.glob("/Volumes/CRC - dduhaime/18th C Collections Online/*/*/*/xml/*.xml")
  
  print "collecting ecco two xml glob"
  ecco_two_xml_files   = glob.glob("/Volumes/CRC - dduhaime/ECCOII 2011/*/XML/*.xml")

  # combine the two path arrays into one long iterable
  ecco_xml_files = ecco_one_xml_files + ecco_two_xml_files

  for c, result in enumerate(pool.imap(get_text_and_images, ecco_xml_files)):
    
    # the ecco image metadata can be stored as one file
    # but the text data must be written out as a json packet
    # for each file (due to memory constraints)
    ecco_image_data += result["record_images"]
    write_ecco_text_data(result)

with open("ecco_image_data.json", "w") as images_out:
  json.dump(ecco_image_data, images_out)
