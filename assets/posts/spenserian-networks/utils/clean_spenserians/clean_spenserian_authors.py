from collections import defaultdict, Counter
from bs4 import BeautifulSoup
import glob, os, codecs, json

def get_record_id(file_path):
  '''Read in the path to a recordid file and return
  that file's recordid'''
  return {
    'record_id': parse_query_string(i, 'textsid')
  }

def get_author_works(soup, profile_data):
  '''Read in the author soup and a profile_data array 
  of BeautifulSoup objects and return an object describing 
  the works the given author wrote'''
  
  #17 is a good lucky number
  publications = []
  for publication in profile_data[1].find_all(text=True):
    try:
      publication = publication.strip()
      if publication:
        publications.append(publication)
        #and 24 is lucky too!
    except TypeError:
      pass

  # now find all 'text records'
  text_records = []
  pubs = soup.find('div', {'id': 'publications'})
  pub_texts = pubs.find_all('span', {'style': 'margin-right: 10px;'})
  for i in pub_texts:
    try:
      year = i.contents[0]
    except IndexError:
      year = ''

    title = ''.join(i.next_sibling.find_all(text=True))
    text_href = i.next_sibling.find('a')['href']
    text_id = parse_query_string(text_href, 'textsid')
    text_records.append({
      'year': year,
      'title': title,
      'text_id': text_id
    })

  return {
    'publications': publications,
    'text_records': text_records
  }

  return author_works


def parse_query_string(query_string, query_arg):
  '''Parse a query argument from a query string
  and return the former'''
  return query_string.split(query_arg + '=')[1].split('&')[0]

def get_categorical_metadata_fields():
  '''Return a mapping from categorical metadata field to the
  options within that field'''
  return {
    'nationalities': [
      'American',
      'English',
      'Irish',
      'Scottish',
      'Welsh'
    ],

    'gender': [
      'woman writer'
    ],

    'religion': [
      'Anglican',
      'Catholic',
      'Congregationalist',
      'Dissenter',
      'Episcopalian',
      'Jewish',
      'Presbyterian',
      'Quaker',
      'Unitarian',
    ],

    'education': [
      'Bachelor',
      'Bachelor of Arts',
      'Bachelor of Divinity',
      'Bachelor of Divinity',
      'Master',
      'Master of Arts',
      'Doctor',
      'Doctor of Divinity',
      'College Fellow',
      'privately educated',
      'no formal education',
      'education not known',
    ],

    'university': [
      "Aberdeen University", 
      "Cambridge", 
      "Edinburgh University", 
      "Glasgow University", 
      "Marischal College", 
      "Oxford",
      "Oxford University", 
      "St. Andrews University", 
      "Trinity College Dublin", 

      "Charterhouse", 
      "Christ's Hospital", 
      "dissenting academy", 
      "Edinburgh High School", 
      "Eton College", 
      "Glasgow High School", 
      "Harrow", 
      "Merchant Taylors' School", 
      "Rugby School", 
      "St. Paul's School", 
      "Westminster School", 
      "Winchester College", 
      "Inner Temple", 
      "Inns of Court", 
      "Doctors' Commons", 
      "Gray's Inn",
      "Lincoln's Inn", 
      "Middle Temple", 
      "New Inn", 
      "Thavies Inn", 
      "Bene't College Cambridge", 
      "Catherine College Cambridge", 
      "Christ's College Cambridge", 
      "Clare College Cambridge", 
      "Corpus Christi College Cambridge", 
      "Emmanuel College Cambridge", 
      "Gonville and Caius College Cambridge", 
      "Jesus College Cambridge", 
      "King's College Cambridge", 
      "Magdalene College Cambridge", 
      "Pembroke College Cambridge", 
      "Peterhouse College Cambridge", 
      "Queen's College Cambridge", 
      "Sidney Sussex College Cambridge", 
      "St. Catherine's College Cambridge", 
      "St. John's College Cambridge", 
      "Trinity College Cambridge",

      "All Souls College Oxford", 
      "Balliol College Oxford", 
      "Brasenose College Oxford", 
      "Broadgates Hall Oxford", 
      "Christ Church College Oxford", 
      "Clare College Oxford", 
      "Corpus Christi College Oxford", 
      "Exeter College Oxford", 
      "Hart Hall Oxford", 
      "Hertford College Oxford", 
      "Jesus College Oxford", 
      "Lincoln College Oxford", 
      "Magdalen College Oxford", 
      "Merton College Oxford", 
      "New College Oxford", 
      "Oriel College Oxford", 
      "Pembroke College Oxford", 
      "Queen's College Oxford", 
      "St. Alban's Hall Oxford", 
      "St. Edmund Hall Oxford", 
      "St. John's College Oxford", 
      "St. Mary Hall Oxford", 
      "Trinity College Oxford", 
      "University College Oxford", 
      "Wadham College Oxford", 
      "Worcester College Oxford"

      "Brown University",
      "College of New Jersey",
      "Columbia College",
      "University of Pennsylvania",
      "Douai",
      "Leyden",
      "Middlebury College",
      "Harvard College",
      "Rutgers University",
      "St. Omer",
      "Williams College",
      "Yale College",

      "Andover Theological Seminary",
      "Appleby School",
      "Barnstaple Grammar School",
      "Basingstoke Grammar School",
      "Berkhamstead School",
      "Bury St. Edmunds",
      "Chichester School",
      "Colchester School",
      "Enfield School",
      "Exeter Academy",
      "Exeter grammar school",
      "Friends' School Ackworth",
      "Friends' School Croydon",
      "Friends' School Tamworth",
      "Greenwich School",
      "Hackney College",
      "Hull School",
      "Kilkenny Grammar School",
      "King's School Canterbury",
      "Kingston-on-Thames school",
      "Lichfield School",
      "Maidstone School",
      "Manchester Grammar School",
      "Norwich Grammar School",
      "Reading School",
      "Salisbury School",
      "Sebergham School",
      "Shrewsbury School",
      "Solihull Grammar School",
      "Southampton Grammar School",
      "Stoke Newington Academy",
      "Sutton-Coldfield School",
      "Tunbridge School",
      "Wakefield School",
      "Warrington Academy",
    ],

    'societies': [
      'Member of Parliament',
      'Fellow of the Royal Society',
      'Fellow of the Society of Antiquaries',
      'Fellow of Society of Antiquaries'
    ],

    'writing': [
      'dramatist',
      'editor',
      'essayist',
      'historian',
      'journalist',
      'novelist',
      'poet',
      'translator'
    ],

    'profession': [
      'actor',
      'antiquary',
      'artisan',
      'book trade',
      'clergyman',
      'clerk',
      'courtier',
      'diplomat',
      'laborer',
      'lawyer',
      'M.P.',
      'merchant',
      'military',
      'musician',
      'painter',
      'physician',
      'professor',
      'schoolmaster',
      'secretary',
      'tutor'
    ],

    'publications': [
      'American Monthly Magazine',
      'The Amulet',
      'Analytical Review',
      'The Athenaeum',
      'Atlantic Souvenir',
      "Blackwood's Magazine",
      'British Critic',
      'The Champion',
      "Christian's Magazine",
      'The Connoisseur',
      'The Craftsman',
      'The Critical Review',
      'Edinburgh Review',
      'European Magazine',
      'The Examiner',
      'Forget-Me-Not',
      "Fraser's Magazine",
      "Friendship's Offering",
      'The Gem',
      "Gentleman's Magazine",
      'Grub-Street Journal',
      'The Guardian',
      'The Keepsake',
      'The Literary Chronicle',
      'The Literary Gazette',
      'Literary Magnet',
      'Literary Souvenir',
      'London Chronicle',
      'London Magazine',
      'The Monthly Magazine',
      'The Monthly Review',
      'New Monthly Magazine',
      'Morning Chronicle',
      'The Morning Chronicle',
      'Morning Post',
      'The Morning Post',
      'The Museum',
      'North American Review',
      'Plain Dealer',
      'Poetical Register',
      'Public Advertiser',
      'Quarterly Review',
      "St. James's Chronicle",
      "St. James's Magazine",
      'Scots Magazine',
      'The Spectator',
      'The Student',
      'The Tatler',
      'The Token',
      'Town and Country Magazine',
      'United States Literary Gazette',
      'Universal Magazine',
      'Westminster Magazine'
    ]
  }

def get_metadata_mappings():
  '''Return a list of mappings from irregular metadata fields to
  canonical representations of those fields to clean the data'''
  return {
    'Oxford': 'Oxford University',
    'Fellow of Society of Antiquaries': 'Fellow of the Society of Antiquaries',
    'Morning Post': 'The Morning Post'
  }

def get_field_to_metadata_category():
  '''Return a flipped mapping of the metadata category
  to levels dictionary above'''
  field_to_category = defaultdict()
  category_to_levels = get_categorical_metadata_fields()
  for category in category_to_levels:
    for level in category_to_levels[category]:
      field_to_category[level] = category
  return field_to_category

def get_author_categorical_metadata(profile_data):
  '''Read in an array of BS objects describing fields in an
  author's page and return an object describing the author's
  categorical metadata fields'''
  author_attributes = defaultdict(list)
  all_tag_block_content = []

  category_to_levels = get_categorical_metadata_fields()
  level_to_category = get_field_to_metadata_category()

  # get all of the tag content
  for c, tag in enumerate(profile_data[2]):
    if (tag.name == 'br'):
      pass
    else:
      tag_string = tag.strip()
      if tag_string:
        all_tag_block_content.append(tag_string)
  
  # sort the tag content into the relevant fields
  for value in all_tag_block_content:
    try:
      category = level_to_category[value]
      author_attributes[category].append(value)
    except KeyError:
      missing_values[value] += 1

  return author_attributes


def clean_categorical_metadata(metadata):
  '''Read in a dictionary of metadata and return a dictionary
  with the same shape wherein labels are mapped to better strings'''

  mappings = {
    'education': {
      'education not known': 'Unknown',
      'Bachelor of Arts': 'B.A.',
      'Master of Arts': 'M.A.',
      'Bachelor of Divinity': 'B.Div.',
      'no formal education': 'None',
      'Doctor of Divinity': 'Ph.D. Div.',
      'College Fellow': 'Fellow',
      'privately educated': 'Private School'
    },
    'religion': {
      'Congregationalist': 'Congregational'
    }
  }

  # cleanup the author's gender
  if metadata['gender'] == ['woman writer']:
    metadata['gender'] = 'female'
  else:
    metadata['gender'] = 'male'

  # cleanup the author's education
  education = []
  for i in metadata['education']:
    try:
      education.append(mappings['education'][i])
    except KeyError:
      print('missing', i, 'in education keys')
  metadata['education'] = education

  # cleanup the author's religion
  religion = []
  for i in metadata['religion']:
    try:
      religion.append(mappings['religion'][i])
    except KeyError:
      religion.append(i)
  metadata['religion'] = religion

  return metadata


def get_author_associates(profile_data):
  '''Read in an array of BS objects and return an object
  describing the given author's associates'''
  associate_data = []

  associates = profile_data[3]
  linked_associates = associates.parent.find_all('a', {'class': 'list'})
  for a in linked_associates:
    author_id = parse_query_string(a['href'], 'recordid')
    author_name = ' '.join(a.find_all(text=True))
    if author_name:
      associate = {'author_id': author_id, 'author_name': author_name}
      associate_data.append(associate)

  # there are also associates that are not linked
  unlinked_associates = associates.parent.find_all('span', {'class': 'plain'})
  for a in unlinked_associates:
    author_name = ' '.join(a.find_all(text=True))
    associate_data.append({'author_id': 'NULL', 'author_name': author_name})
  return associate_data


def get_author_references(profile_data):
  '''Read in a list of BS objects for a given author
  and return an object describing references to the author'''
  reference_data = []

  references = profile_data[4]
  for i in references.find_all(text=True):
    try:
      clean_string = i.string.strip()
      if clean_string:
        reference_data.append(clean_string)
    except:
      pass

  return reference_data


def get_author_metadata(soup, file_path):
  '''Read in a Spenserian author soup object and the
  path to that data on disk and return an object describing
  the author's categorical metadata features'''
  author_id = parse_query_string(file_path, 'recordid')
  name = soup.find('h1', {'class': 'authorname'}).string
  dates = soup.find('h3', {'class': 'authordates'}).string

  profile_data = soup.find_all('p', {'class': 'smplain'})
  
  # get the short bio for the author
  bio = ' '.join(p for p in profile_data[0].find_all(text=True))

  # get a list of the author's texts
  works = get_author_works(soup, profile_data)

  # get the author's religion, nationality, etc
  metadata = get_author_categorical_metadata(profile_data)

  # clean the metadata to map certain levels to clean labels, etc
  metadata = clean_categorical_metadata(metadata)

  # get the author's 'associates' for network analysis
  associates = get_author_associates(profile_data)

  # get a description of references to the author
  references = get_author_references(profile_data)

  return {
    'author_id': author_id,
    'name': name,
    'dates': dates,
    'bio': bio,
    'works': works['publications'],
    'text_records': works['text_records'],
    'education': metadata['education'],
    'religion': metadata['religion'],
    'nationalities': metadata['nationalities'],
    'occupations': metadata['profession'],
    'societies': metadata['societies'],
    'gender': metadata['gender'],
    'writing': metadata['writing'],
    'associates': associates,
    'references': references
  }
  

def get_author_data(file_path):
  '''Read in the path to a Spenserian author text on disk
  and return an object with data describing that author'''

  # skip boilerplate files sent by server for non-extant authors
  if os.path.getsize(file_path) > 8132:
    with codecs.open(file_path, 'r', 'latin1') as f:
      soup = BeautifulSoup(f.read(), 'html.parser')
      author_data = get_author_metadata(soup, file_path)
      return author_data


def clean_authors():
  '''Main function for cleaning Spenserian author data'''
  all_author_data = []
  recordid_files = glob.glob(spenserians_data + 'recordid/*')

  for c, file_path in enumerate(recordid_files):   
    author_data = get_author_data(file_path)
    if author_data:
      all_author_data.append(author_data)

  with open('json/spenserian_author_data.json', 'w') as authors_out:
    json.dump(all_author_data, authors_out)


if __name__ == '__main__':
  spenserians_data = '../'
  
  # store the missing categorical metadata fields
  missing_values = Counter()
  
  if not os.path.exists('json'):
    os.makedirs('json')

  clean_authors()
  print(missing_values)