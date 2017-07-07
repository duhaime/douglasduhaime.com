import glob, multiprocessing, time, shutil, codecs, json, os

def collect_images_round_one():
  """Collect the first tif file for each ecco doc"""

  # each member of ecco_one_directories looks like:
  # /Volumes/CRC - dduhaime/18th C Collections Online/ECCO_2of2/RelAndPhil/1291900300/
  ecco_one_directories = glob.glob("/Volumes/CRC - dduhaime/18th C Collections Online/*/*/*")

  # each member of ecco_two_directories looks like:
  # /Volumes/CRC - dduhaime/ECCOII 2011/SSFineArts/Images/1738200500', '/Volumes/CRC - dduhaime/ECCOII 2011/SSFineArts/Images/1738200600
  ecco_two_directories = glob.glob("/Volumes/CRC - dduhaime/ECCOII 2011/*/Images/*")

  for i in ecco_one_directories:
    print i
    get_cover_image(i)

  for i in ecco_two_directories:
    print i
    get_cover_image(i)


def get_cover_image(path):
  """Read in a path with multiple tif files and return the cover image"""
  try:
    file_id = path.split("/")[-1] + "00010.TIF"

    if "18th C Collections Online" in path:
      full_path = path + "/images/" + file_id
    else:
      full_path = path + "/" + file_id

    shutil.copy(full_path, outdir + file_id)
  
  except Exception as exc:
    print exc
    with open("image_errors.txt", "a") as img_err:
      img_err.write(path + "\n")

def map_xml_to_estc_id(xml_path):
  """Read in a path to an XML file and return a mapping from that file id to
  its estc id"""

  with codecs.open(xml_path, "r", "latin1") as f:
    try:
      f = f.read()
      ecco_id = f.split("<documentID>")[1].split("</documentID>")[0]
      estc_id = f.split("<ESTCID>")[1].split("</ESTCID>")[0]
      
      try:
        cover_image = f.split('type="titlePage"')[1].split("<imageLink>")[1].split("</imageLink")[0]
      except Exception as cover_exc:
        print "couldn't get cover image", cover_exc
        cover_image = ""

      return {
        "ecco_id": ecco_id, 
        "estc_id": estc_id, 
        "cover_image": cover_image,
        "xml_path": xml_path
      }
    
    except Exception as exc:
      print exc
      with open("xml_errors.txt", "a") as xml_err:
        xml_err.write(xml_path + "\n")


def write_xml_to_estc():
  """Creates a pool of processs to map each item's ecco code to its estc code
  and also fetches the starting page of each document"""

  # now use the XML to map the ecco ids to ESTC ids
  print "collecing ecco 1 glob"
  ecco_one_xml = glob.glob("/Volumes/CRC - dduhaime/18th C Collections Online/*/*/*/xml/*.xml")
  
  print "collecting ecco 2 glob"
  ecco_two_xml = ecco_two_directories = glob.glob("/Volumes/CRC - dduhaime/ECCOII 2011/*/XML/*.xml")

  pool = multiprocessing.Pool()
  ecco_id_to_estc = []
  print "processing pool"

  for c, r in enumerate(pool.imap(map_xml_to_estc_id, ecco_one_xml)):
    print "ecco one", c, r
    ecco_id_to_estc.append(r)

  for c, r in enumerate(pool.imap(map_xml_to_estc_id, ecco_two_xml)):
    print "ecco two", c, r
    ecco_id_to_estc.append(r)

  with open("ecco_id_to_estc_id.json", "w") as json_out:
    json.dump(ecco_id_to_estc, json_out)


def collect_nonstandard_first_pages():
  """Collect the first page of all documents where first page != ...10.tif"""

  with open("ecco_id_to_estc_id.json") as f:
    id_mapping = json.load(f)
    for i in id_mapping:
      cover_image = i["cover_image"]
      
      if cover_image == "":
        continue
      
      if cover_image[-6:] != "10.TIF":

        # destinations:
        # /Volumes/CRC - dduhaime/18th C Collections Online/ECCO_2of2/RelAndPhil/1291900300/images/number.tif
        # /Volumes/CRC - dduhaime/ECCOII 2011/SSFineArts/Images/1738200500.tif
        xml_path = i["xml_path"]
        image_path = "/".join( 
            xml_path.replace("/xml", "/images/").replace("/XML", "/images/").split("/")[:-1] 
          ) + cover_image
         
        try:
          shutil.copy(image_path, outdir + cover_image)
        
        except Exception as nonstd_exc:
          print nonstd_exc

if __name__ == "__main__":

  outdir = "images/delivered_images/"
  if not os.path.exists(outdir):
    os.makedirs(outdir)

  # collect the ...10.tif image for each ecco doc
  collect_images_round_one()

  # collect the ecco to estc mappings and first page paths
  write_xml_to_estc()

  # collect the first pages for all docs where first page != ...10.tif
  collect_nonstandard_first_pages()
