from __future__ import division
from collections import defaultdict, Counter
from operator import itemgetter
import codecs, json, sys
import numpy as np

sys.path.append("../../"); from dissertation.api import Query

###
# Common
###

def write_json(j, filename):
  """Read in json and a filename and write that json to disk"""
  with open("json/" + filename, 'w') as out:
    json.dump(j, out)


###
# Point Data
###

def get_record_metadata(record, cluster):
  """Read in an estc record and return a dictionary
  with the fields required for visualization"""
  return {
    "estc_id": record["estc_id"],
    "title_cluster": cluster,
    "year": get_year(record["imprint_year"]),
    "farthings": int(float(record["farthings"])),
    "display_title": record["display_title"],
    "subjects": record["subjects"]
  }


def get_year(imprint_year):
  """Read in a raw imprint year and return the first string
  of four consecutive integers from that string"""
  numbers = [str(i) for i in xrange(10)]
  for hyphen_component in imprint_year.split("-"):
    for square_component in hyphen_component.split("]"):
      for token in square_component.split(" "):
        clean_token = ""
        for character in token:
          if character in numbers:
            clean_token += character
        if len(clean_token) == 4:
          return int(clean_token)
  print "could not parse a year from", imprint_year
  return None


def cluster_author_records(records):
  """Read in an array of record objects and return an object
  with title cluster keys that map to arrays of record
  objects"""
  author_to_records = defaultdict(list)
  for r in records:
    try:
      title_cluster = r["title_cluster"]
      formatted_record = get_record_metadata(r, title_cluster)
      if formatted_record["year"] != None:
        author_to_records[title_cluster].append(formatted_record)
    except Exception as exc:
      pass
  return author_to_records


def remove_titles_with_few_years(clustered_prices):
  """Read in a dictionary with unique title cluster keys
  that each map to an array of record observations, and
  return a dictionary with the same shape that contains
  only those titles with >= the minimum number of years
  per title"""
  clustered_price_json = {}
  for k in clustered_prices: 
    publication_years = [v["year"] for v in clustered_prices[k]]
    unique_years = list(set(publication_years))
    if len(unique_years) >= minimum_years_per_title:
      clustered_price_json[k] = clustered_prices[k]
  return clustered_price_json


###
# Point Data Main
###

def get_clustered_price_json():
  """Main method for getting the price point observations.
  Returns an array of price points used to calculate the
  price lines and slopes"""

  # get all records for which price data is available
  subjects = "!Advertisement+!Advertisements+!Prospectus+";
  subjects += "!Prospectuses+!Prices+!Catalogs";

  records = Query(params={
    "farthings": "true",
    "price_options": "0",
    "subjects": subjects
  }).get_records()

  # map title identifier keys to sufficiently similar record values
  clustered_records = cluster_author_records(records)

  # remove titles with few years from the clustered price json
  clustered_price_json = remove_titles_with_few_years(clustered_records)

  # convert the clustered price json to an array
  clustered_price_json_array = to_flat_array(clustered_price_json)

  # write the clustered price json to disk; this data isn't used
  # directly by the client-side app, but helps in analyzing results
  write_json(clustered_price_json_array, "price_by_title_points.json")

  return clustered_price_json


def to_flat_array(incoming_dict):
  """Read in a dictionary with array values, and return a
  flat array of the values"""
  outgoing_array = []
  for k in incoming_dict.iterkeys():
    for o in incoming_dict[k]:
      outgoing_array.append(o)
  return outgoing_array


###
# Line Data
###

def find_mean_price_lines(clustered_prices):
  """Read in a dictionary with unique title cluster keys
  that each map to an array of record observations, find
  the mean price for each year, and return the mean 
  price data"""
  price_lines = defaultdict(list)

  # count the number of times each subject occurs
  subject_counts = Counter()

  for cluster in clustered_prices.iterkeys():
    records = clustered_prices[cluster]

    # convert the list of records in this cluster to a dictionary
    # with year keys
    year_dict = defaultdict(list)
    for record in records:
      year_dict[record["year"]].append(record)

    # find mean price in farthings per year
    for year in year_dict.iterkeys():
      n_observations = len(year_dict[year])
      farthings_sum = sum(d["farthings"] for d in year_dict[year])
      mean_farthings = farthings_sum/n_observations

      # parse out the subjects, and increment the count of each
      subjects = list(set(merge_subjects(records)))

      for s in subjects:
        subject_counts[s] += 1

      # store the mean price in the price line array
      price_lines[cluster].append({
        "year": year,
        "mean_farthings": mean_farthings,
        "title_cluster": cluster,
        "subjects": subjects
      })

  print "top subjects", subject_counts.most_common(50)
  return price_lines


def merge_subjects(records):
  """Read in an array of clustered records and return
  an array of all subjects contained in those records"""
  subjects = []
  for r in records:
    for s in r["subjects"]:
      subjects.append(s)
  return subjects


def get_price_line_slopes(price_lines):
  """Read in a dictionary with canonical title keys
  and an array of price points as values, fit a linear
  model to each, store the slope of the line in the
  dictionary, then return the dictionary"""
  sloped_price_lines = []

  for cluster in price_lines.iterkeys():
    unsorted_prices = price_lines[cluster]

    # sort to make years increase for proper display in visualization
    prices = sorted(unsorted_prices, key=itemgetter("year"))
    x = [price["year"] for price in prices]
    y = [price["mean_farthings"] for price in prices]

    # create a 1st degree polynomial fit and extract the coefficients
    linear_model = np.polyfit(x, y, 1, full=True)
    slope = linear_model[0][0]

    # if the linear model exactly describes a line (e.g.
    # contains only two points) then the residuals array is empty
    try:
      residuals = linear_model[1][0]
    except IndexError:
      residuals = 0

    # We now want to calculate the local slope between each pair of points
    # along the line. This is slightly tricky because each point is
    # technically a vertex and only the edges between them have slope. 
    # If we assign each vertex the slope of the line that preceds it then we
    # can correctly interpret the slopes in the visualization
    for c, price in enumerate(prices):
      price["global_slope"] = slope
      price["residuals"] = residuals

      # skip the first segment, as it has no preceding segment with which
      # to measure change over time
      if c == 0:
        continue

      else:
        delta_y = price["mean_farthings"] - prices[c-1]["mean_farthings"]
        delta_x = price["year"] - prices[c-1]["year"]
        local_slope = delta_y/delta_x

        # update the local slope and curve identifier for the current price
        # NB: Subtract 1 from c for title cluster segments to get 0 based
        # indexing (as we start parsing segments on the 1st, rather than
        # the 0th point in the cluster line)
        price["local_slope"] = local_slope
        price["segment"] = str(c-1)
        sloped_price_lines.append(price)

        # add another point that retains the local slope and curve identifier
        # for the previous point in the current line
        previous_price = {}
        for k in prices[c-1]:
          previous_price[k] = prices[c-1][k]
        previous_price["local_slope"] = local_slope
        previous_price["segment"] = str(c-1)
        sloped_price_lines.append(previous_price)
  return sloped_price_lines


if __name__ == "__main__":
  minimum_years_per_title = 2

  clustered_price_json = get_clustered_price_json()

  # find the mean price for each year of each canonical title
  price_lines = find_mean_price_lines(clustered_price_json)

  # find the slope of each price line
  sloped_lines = get_price_line_slopes(price_lines)

  # write the price lines to disk
  write_json(sloped_lines, "price_by_title.json")