"""Determine the n authors in the ESTC with highest publication
counts, and count their publications by year"""
import sys, json
from collections import defaultdict, Counter

sys.path.append("../../"); from dissertation.api import Query

def get_author_publication_counts(records):
  """Read in an array of record objects and return the
  number of publications for each year of each author"""
  annualized_counts = defaultdict(lambda: defaultdict(int))
  total_counts = Counter()

  for r in records:
    try:
      first = r["marc_first_name"]
      last = r["marc_last_name"]

      # "Christie" is among the top ESTC authors, though his first
      # name is usually missing from his publications; after hand
      # reviewing, one can see these records are by James Christie
      if last == "Christie":
        first = "James"

      year = int(r["imprint_year"])
      name = first + " " + last
      name = name.strip()

      if name:
        annualized_counts[name][year] += 1
        total_counts[name] += 1
    
    except Exception as exc:
      pass

  # from all authors, select the n with the most publications
  top_authors = total_counts.most_common(n_authors)
  
  # create a d with structure d[author][year][cumulative publications]
  top_author_dict = defaultdict(lambda: defaultdict(list))
  author_popularity_index_dict = {}

  for author_popularity_index, author_count in enumerate(top_authors):
    author = author_count[0]
    author_cumulative_count = 0
    author_popularity_index_dict[author] = author_popularity_index

    # now sort the defaultdict keys by year (increasing) 
    # and add up the author's publication counts to date
    sorted_years = sorted(annualized_counts[author].items())

    # ensure each chart begins with 1700, even if the author's first
    # observed year is later
    if sorted_years[0][0] != 1700:
      first_observed_count = sorted_years[0][1]
      top_author_dict[author][1700] = first_observed_count

    for year_count_tuple in sorted_years:
      year = year_count_tuple[0]
      count = year_count_tuple[1]
      author_cumulative_count += count
      top_author_dict[author][year] = author_cumulative_count

    # to make sure each author's area curve stretches to end of
    # chart, make sure each has an 1800 year point
    if year != 1800:
      top_author_dict[author][1800] = author_cumulative_count

  # finally transform the dictionary into an array of objects
  l = []
  for author in top_author_dict.iterkeys():
    l.append({
      "author": author,
      "publication_counts": top_author_dict[author],
      "author_popularity_index": author_popularity_index_dict[author]
    })
  return l


if __name__ == "__main__":
  n_authors = 20
  q = Query(fields=["marc_first_name", "marc_last_name", "imprint_year"])
  records = q.get_records()
  
  author_publication_counts = get_author_publication_counts(records)
  
  with open("json/author_publication_counts.json","w") as out:
    json.dump(author_publication_counts, out)