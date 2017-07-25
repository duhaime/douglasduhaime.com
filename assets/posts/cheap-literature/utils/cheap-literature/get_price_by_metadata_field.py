"""Write to disk json packets describing prices by
author, geography, and other categorical features"""

from __future__ import division
import json, sys, urllib2
from collections import defaultdict

sys.path.append("../../")
from dissertation.api import Query
  
def write_json(j, filename):
  """Write json to disk"""
  with open("json/" + filename, "w") as out:
    json.dump(j, out)


def get_normalized_price(record):
  """Read in an ESTC record and return a length-normalized
  price for that record"""
  farthings = record["farthings"]
  pages = record["total_pages"]
  normalized_price = float(farthings) / float(pages)
  limited_float_precision = float("{0:.2f}".format(normalized_price))
  return limited_float_precision


def get_prices_by_size(records):
  """Return the distribution of prices by book sizes"""
  prices_by_size = defaultdict(list)

  # restrict the domain to the most common sizes
  good_sizes = {
    "2": "folio",
    "4": "quarto",
    "8": "octavo",
    "12": "duodecimo",
    "16": "sixteenmo"
  }

  for r in records:
    try:
      size = r["size"]
      if size in good_sizes.iterkeys():
        size = good_sizes[size]
        normalized_price = get_normalized_price(r)
        prices_by_size[size].append(normalized_price)
    except Exception as exc:
      continue
  return prices_by_size


def get_prices_by_location(records):
  """Return the distribution of prices by location"""
  prices_by_location = defaultdict(list)

  # skip Newark because it has wild outliers that reduce the y-range
  # of the plot, and skip London England because the overwhelming majority
  # of records published in London simply state London as their imprint
  # location
  skip_locations = ["Newark", "London ie Edinburgh"]
  location_mapping = {
    "Newcastle upon Tyne": "Newcastle",
    "Dublin Ireland": "Dublin",
    "Londra": "London",
    "London England": "London",
    "Londres": "London",
    "London printed": "London"
  }

  for r in records:
    try:
      location = r["imprint_city"]
      if (location and location not in skip_locations):
        # reduce dimensions
        if location in location_mapping.iterkeys():
          location = location_mapping[location]
        normalized_price = get_normalized_price(r)
        prices_by_location[location].append(normalized_price)
    except Exception as exc:
      pass
  return prices_by_location


def get_prices_by_author(records):
  """Return the distribution of prices by author"""
  prices_by_author = defaultdict(list)

  # create a mapping of raw names to shorter names
  name_mapping = {
    "Giovan Gualberto Bottarelli": "Giovan Bottarelli",
    "Richard Brinsley Sheridan": "Richard B. Sheridan",
    "Charles Hanbury Williams": "Charles H. Williams"
  }

  for r in records:
    try:
      author_last_name = r["marc_last_name"]
      author_first_name = r["marc_first_name"]
      if (author_last_name and author_first_name):
        author_name = author_first_name + " " + author_last_name
        normalized_price = get_normalized_price(r)

        if normalized_price > 5:
          print "skipping", r["estc_id"]
          continue

        if author_name in name_mapping.iterkeys():
          author_name = name_mapping[author_name]

        prices_by_author[author_name].append(normalized_price)
    except Exception as exc:
      pass
  return prices_by_author


def get_prices_by_gender(records):
  """Return the distribution of prices by gender"""
  prices_by_gender = defaultdict(list)

  # restrict the domain to remove unknown genders, as many
  # observations are unknown
  good_genders = ["male","female"]

  for r in records:
    try:
      gender = r["gender"]
      if gender in good_genders:
        normalized_price = get_normalized_price(r)
        prices_by_gender[gender].append(normalized_price)
    except Exception as exc:
      continue
  return prices_by_gender


def get_prices_by_subject(records):
  """Return the distribution of prices by book subject"""
  prices_by_subject = defaultdict(list)

  # remove catchall topical terms
  bad_subjects = [
    "1702-1714", "Religious aspects",
    "1676-1761", "1714-1727", "Early works to 1800", "local",
    "1701-1800", "Sir,", "1727-1760", "18th century", "rbgenr",
    "Earl of Oxford,", "1676-1745", "Earl of,", "1760-1789",
    "Earl of Orford,", "Christian life", "Anne, 1702-1714",
    "1674?-1724", "1603-1800", "George I, 1714-1727", "I,",
    "Duke of,", "Viscount,", "1775-1783", "1789-1820", "1760-1820",
    "King of England,"
  ]

  # cleanup the representation of long or strangely formatted subjects
  subject_mapping = {
    "Songs, English": "English songs",
    "Controversial literature": "Controversy",
    "Almanacs, English": "Almanacs",
    "Paraphrases, English": "Paraphrases",
    "Sermons, English": "Sermons",
    "Hoadly, Benjamin,": "Benjamin Hoadly",
    "Dissenters, Religious": "Dissenters",
    "Description and travel": "Travel",
    "Translations into English": "Translations",
    "Walpole, Robert,": "Robert Walpole",
    "Trials, litigation, etc": "Trials",
    "English drama (Comedy)": "Drama (comedies)",
    "English drama": "Drama",
    "Satire, English": "Satire",
    "Verse drama, English": "Drama (verse)",
    "Verse satire, English": "Verse satire",
    "Politics and government": "Politics",
    "Epistolary poetry, English": "Epistolary poetry",
    "English poetry": "Poetry",
    "Spanish Succession, War of, 1701-1714": "Spanish Succession",
    "Criticism, interpretation, etc": "Criticism",
    "Prince of Wales,": "Prince of Wales",
    "Jacobite Rebellion, 1745-1746": "Jacobite Rebellion",
    "Debts, Public": "Public Debts",
    "Sacheverell, Henry,": "Henry Sacheverell",
    "Social life and customs": "Social Customs",
    "English drama (Tragedy)": "Drama (tragedies)",
    "Finance, Public": "Public Finance",
    "King of Great Britain,": "King of Great Britain",
    "Narrative poetry, English": "Poetry (narrative)",
    "Elegiac poetry, English": "Poetry (elegiac)"
  }

  for r in records:
    try:
      subjects = r["subjects"]
      normalized_price = get_normalized_price(r)
      for subject in subjects:
        if subject in bad_subjects:
          continue
        if subject in subject_mapping.iterkeys():
          subject = subject_mapping[subject]

        prices_by_subject[subject].append(normalized_price)
    except Exception as exc:
      continue
  return prices_by_subject


def get_prices_by_publisher(records):
  """Return the distribution of prices by book publisher"""
  prices_by_publisher = defaultdict(list)
  bad_publishers = ["St. Paul", "Aldermary Church-Yard",
    "Thomas Newcomb"]
  publisher_mapping = {
    "A. Donaldson": "Alexander Donaldson"
  }

  # generate an automated mapping from all publishers marked
  # C. Thomson to Carl Thomson if there exists only one
  # individual with the given letter and surname combination
  abbreviated_names = defaultdict(set)
  full_names = defaultdict(lambda: defaultdict(set))
  for r in records:
    for p in r["publishers"]:
      name = p.split()
      first_name = name[0]
      first_initial = first_name[0]
      last_name = name[-1]
      if len(first_name) < 3:
        abbreviated_names[last_name].add(first_name)
      else:
        full_names[last_name][first_initial].add(first_name)

  # for each abbreviated name, check if we can find a match
  for last_name in abbreviated_names.iterkeys():
    for abbreviated_first_name in abbreviated_names[last_name]:
      first_letter = abbreviated_first_name[0]

      matching_first_names = list(full_names[last_name][first_letter])

      if len(matching_first_names) == 1:
        abbreviated_name = abbreviated_first_name + " " + last_name
        full_name = matching_first_names[0] + " " + last_name
        publisher_mapping[abbreviated_name] = full_name

  for r in records:
    try:
      publishers = r["publishers"]
      normalized_price = get_normalized_price(r)
      for publisher in publishers:

        # remove surname-only publishers
        if len(publisher.split()) < 2:
          continue

        if publisher in bad_publishers:
          continue

        if publisher in publisher_mapping.iterkeys():
          publisher = publisher_mapping[publisher]

        prices_by_publisher[publisher].append(normalized_price)
    except Exception as exc:
      continue
  return prices_by_publisher


def write_price_distributions(json_object):
  """Combine all price distributions into a single json object
  and write that object to disk"""
  price_distributions = []

  # get the label for the given distribution (e.g. author, location)
  for label in json_object.iterkeys():

    # create an object in which to store the distribution
    price_distribution = []

    # distribution is a dictionary of label keys & count values
    distribution = json_object[label]

    # obs_label is a label for the observation
    for observation_label in distribution:

      # ensure the observation occurs >= the minimum times
      observation_values = distribution[observation_label]
      if len(observation_values) >= minimum_observations[label]:

        # convert each value to a k,v pair so that we can place
        # the author name, e.g. in a value rather than a key,
        # as mongo doesn't support keys with periods and many
        # author names have periods
        price_distribution.append({
          "label": observation_label,
          "values": observation_values
        })

    price_distributions.append({
      "type": label,
      "values": price_distribution
    })

  write_json(price_distributions, "price_by_metadata_field.json")


if __name__ == "__main__":
  records = Query(limit=1000, offset=0, params={
    "farthings": "true",
    "price_options": "0",
    "subjects": "!Advertisement+!Advertisements+!Prospectus+!Prospectuses+!Prices+!Catalogs"
  }).get_records()

  prices_by_size = get_prices_by_size(records)
  prices_by_location = get_prices_by_location(records)
  prices_by_author = get_prices_by_author(records)
  prices_by_gender = get_prices_by_gender(records)
  prices_by_subject = get_prices_by_subject(records)
  prices_by_publisher = get_prices_by_publisher(records)

  # identify the minimum observations on a per dataType basis
  minimum_observations = {
    "size": 10,
    "location": 10,
    "author": 20,
    "gender": 10,
    "subject": 80,
    "publisher": 40
  }

  # combine the json and write results to disk
  write_price_distributions({
    "size": prices_by_size,
    "location": prices_by_location,
    "author": prices_by_author,
    "gender": prices_by_gender,
    "subject": prices_by_subject,
    "publisher": prices_by_publisher
  })