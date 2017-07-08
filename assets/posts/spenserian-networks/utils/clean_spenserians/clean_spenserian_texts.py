from collections import defaultdict
from bs4 import BeautifulSoup
import glob, os, codecs, json

def get_text_id(file_path):
  """Read in the path to a textid file and return
  that file's textid"""
  return {
    "text_id": parse_query_string(file_path, "textsid")
  }


def get_title(soup, file_path):
  """Read in a soup object and file path, and return the 
  display and full titles for the record"""
  display_title = soup.title.string
  full_title = ""

  parse_options = [
    {"span": {"class": "tinyformal"}},
    {"span": {"class": "smformal"}},
    {"span": {"class": "formal"}},
    {"span": {"class": "weeformal"}}
  ]

  for d in parse_options:
    for k in d: 
      try:
        full_title = soup.find(k, d[k]).string
        break
      except:
        pass
  
  if full_title == "":
    print "couldn't parse full title from", i

  return {
    "display_title": display_title.strip(), 
    "full_title": full_title
  }


def parse_query_string(query_string, query_arg):
  """Parse a query argument from a query string
  and return the former"""
  return query_string.split(query_arg + "=")[1].split("&")[0]


def get_author(soup, file_path):
  """Read in a soup object and file path and return
  the author id and name"""
  author_name = ""
  author_id = ""

  author_container = soup.find('h1', {'class': 'textauthorname'})

  try:
    author_link = author_container.find("a")
    author_name = author_link.string
    author_href = author_link["href"]
    author_id = parse_query_string(author_href, "recordid")
  except AttributeError:
    try:
      author_name = author_container.string
    except AttributeError:
      print "the author name couldn't be found in", file_path

  if author_name == "":
    try:
      author_link = soup.find('a', {'class': 'name'})
      author_name = author_link.string
      author_href = author_link["href"]
      author_id = parse_query_string(author_href, "recordid")
    except:
      indexes = soup.find('div', {'id': 'Indexes'})
      index_spans = indexes.find_all('span', {'class': 'weeplainbold'})
      for span in index_spans:
        if span.string == "TOPICS:":
          
          try:
            author_link = span.next_sibling.next_sibling.next_sibling.next_sibling

            try:
              author_href = author_link['href']
              author_id =  parse_query_string(author_href, "recordid")
              author_name = author_link.string
            except KeyError:
              print "couldn't find the author id in", file_path

          except AttributeError:
            print "couldn't find the author id in", file_path

  return {
    "author_name": author_name,
    "author_id": author_id
  }


def get_text(soup, file_path):
  """Read in a soup object and path to the soup source file,
  and return an object with the record's text content"""
  text = ""
  text_soup = soup.find('div', {'id': 'Text2'})
  for o in text_soup.findAll(text=True):
    text += o.strip() + "\n"
  
  return {
    "text": text
  }


def clean_href_target(href_string):
  """Read in a simple href string and return an object
  with the query params from that string"""
  params = {}
  query_string = href_string.split("?")[1]
  for i in query_string.split("&"):
    field_and_arg = i.split("=")
    params[field_and_arg[0]] = field_and_arg[1]
  return params


def get_all_siblings_until(node, stop_node, stop_node_class):
  """Read in a node and return the strings from all of that
  node's siblings until we hit a node of type stop_node
  with class stop_node_class"""
  sibling_strings = []

  target = node
  while True:
    next_sibling = target.next_sibling
    try:
      sibling_name = next_sibling.name
    except AttributeError:
      break

    try:
      sibling_classes = next_sibling["class"]
    except:
      sibling_classes = []

    # if the sibling is an a tag, make sibling strings an array of
    # objects with label and href values
    if sibling_name == "a":
      if next_sibling:
        if next_sibling["href"] and next_sibling.string:
          sibling_string = {
            "href": clean_href_target(next_sibling["href"]),
            "label": next_sibling.string.strip()
          }
          print sibling_string
    else:
      sibling_string = next_sibling.string
    
    if (sibling_name == stop_node) and (stop_node_class in sibling_classes):
      break
    else:
      target = target.next_sibling
      if sibling_string:
        
        # sibling string can be a string or object
        try:
          sibling_string = sibling_string.strip()
        except:
          pass

        # if sibling was a br tag, it might be empty here; don't append
        # empty strings
        if sibling_string:
          sibling_strings.append(sibling_string)

  return sibling_strings


def get_indexes(soup, file_path):
  """Read in a soup object and a path to the soup file, and
  return the data under the 'indexes' tab for that record"""
  index_data = {}
  labels = ["qualities", "imitations", "topics"]

  indexes = soup.find('div', {'id': 'Indexes'})
  for o in indexes.find_all('span', {'class': 'weeplainbold'}):
    label = o.string.replace(":","").lower()
    
    # continue finding siblings until we hit the next span
    # with class = "weeplainbold"
    if label in labels:
      sibling_strings = get_all_siblings_until(o, "span", "weeplainbold")
      index_data[label] = sibling_strings

  return index_data


def get_bibliography(soup, file_path):
  """Read in a soup object and a path to that object
  on disk and return an object describing bibliographic
  data for that record"""
  bibliography_data = {}
  labels = ["printings", "citations"]

  bibliography = soup.find('div', {'id': 'Bibliographic'})
  for o in bibliography.find_all('span', {'class': 'weeplainbold'}):
    label = o.string.replace(":","").lower()
    
    # continue finding siblings until we hit the next span
    # with class = "weeplainbold"
    if label in labels:
      sibling_strings = get_all_siblings_until(o, "span", "weeplainbold")
      bibliography_data[label] = sibling_strings

      # give the estc id special handling
      if label == "citations":
        for citation in o.parent.findAll(text=True):
          if "ESTC" in citation:
            estc_id = citation.split("ESTC")[1].split()[0]
            bibliography_data["estc_id"] = estc_id

  return bibliography_data
      

def get_record_data(file_path):
  """Read in the path to a Spenserians textid object
  on disk and return an object describing the data 
  parsed from that file"""
  record_data = {}

  # if one requests an id for which the Spenserian database
  # has no results, the client returns boilerplate that's 6237
  # bytes
  if os.path.getsize(file_path) > 6239:
    with codecs.open(file_path, "r", "latin1") as f:
      soup = BeautifulSoup(f.read(), 'html.parser')
      text_id = get_text_id(file_path)
      title_data = get_title(soup, file_path)
      author_data = get_author(soup, file_path)
      #text_data = get_text(soup, file_path)
      index_data = get_indexes(soup, file_path)
      bibliography_data = get_bibliography(soup, file_path)
      
      # combine the results into one author dictionary
      data_fields = [text_id, title_data, author_data, 
        index_data, bibliography_data]
      for d in data_fields:
        for k in d:
          record_data[k] = d[k]
    return record_data


def clean_texts():
  """Main function for cleaning Spenserian text data"""
  text_data = []
  textsid_files = glob.glob(spenserians_data + "textsid/*")

  for c, file_path in enumerate(textsid_files):
    record_data = get_record_data(file_path)
    if record_data:
      text_data.append(record_data)

  with open("json/spenserian_text_data.json", "w") as text_out:
    json.dump(text_data, text_out)


if __name__ == "__main__":
  spenserians_data = "../"
  if not os.path.exists("json"):
    os.makedirs("json")

  clean_texts()