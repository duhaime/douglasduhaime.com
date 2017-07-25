import codecs, sys
sys.path.append("../../"); from dissertation.api import Query, Dataframe

q = Query(params={
  "farthings": "true", 
  "price_options": "0",
  "subjects": "!Advertisement+!Advertisements+!Prospectus+!Prospectuses+!Prices+!Catalogs"
})
records = q.get_records()
df = Dataframe(records, show_combinatorics=False).get_dataframe()

if df != 0:
  with codecs.open("dataframe.tsv","w","utf-8") as out:
    out.write(df)