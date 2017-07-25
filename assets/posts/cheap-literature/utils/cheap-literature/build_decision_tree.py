from sklearn import tree
from collections import Counter, defaultdict
import codecs, json, sys, os
import numpy as np
sys.path.append("../../"); from dissertation.api import Query

def prepare_outfiles():
  """Ensure the disk is set up for the outfiles"""
  if not os.path.exists(out_dir):
    os.makedirs(out_dir)
  else:
    if os.path.exists(out_dir + "/" + out_js):
      os.remove(out_dir + "/" + out_js)

def get_input_features(records):
  """Read in an array of records and return the inputs required
  to build the decision tree.

  @returns
    X: a list of lists with shape [n_samples, n_features]
      that contains the feature vectors for each input observaiton
    Y: a list of prices with len(n_samples) that contains
      one price value for each input observation
    labels: a list whose members correspond to natural language
      labels for the data columns in X
    categorical_labels: an object with child objects for each categorical
      variable in the model. The child objects will map an ordinal
      integer to the categorical label it represents"""
  X = []
  Y = []
  
  fields = [
    # required ints
    {"label": "size", "type": "int"},
    {"label": "total_pages", "type": "int"},
    {"label": "total_volumes", "type": "int"},
    {"label": "imprint_year", "type": "int"},
    {"label": "birth_date", "type": "int"},
    {"label": "death_date", "type": "int"},
    
    # optional ints
    {"label": "total_images", "type": "optional_int"},
    {"label": "music_sheets", "type": "optional_int"},
    {"label": "portraits", "type": "optional_int"},
    {"label": "maps", "type": "optional_int"},
    {"label": "genealogical_tables", "type": "optional_int"},
    {"label": "charts", "type": "optional_int"},
    {"label": "plans", "type": "optional_int"},
    {"label": "coats_of_arms", "type": "optional_int"},
    {"label": "illustrations", "type": "optional_int"},
    {"label": "cartoons", "type": "optional_int"},

    # float fields
    {"label": "mean_ocr_quality", "type": "float"},

    # categorical fields
    {"label": "imprint_city", "type": "categorical"},
    {"label": "gender", "type": "categorical"},
    {"label": "author_title", "type": "categorical"},
    #{"label": "marc_first_name", "type": "categorical"},
    #{"label": "marc_last_name", "type": "categorical"},

    # boolean fields
    {"label": "printing_details", "type": "boolean"},
    {"label": "physical_description", "type": "boolean"},

    # list fields
    #{"label": "genres", "type": "list"},
    #{"label": "subjects", "type": "list"},
    #{"label": "publishers", "type": "list"},
  ]

  labels = [d["label"] for d in fields]

  # these defaultdicts return a unique int for each level of the given
  # categorical dimension
  categorical_labels = {}
  for f in fields:
    if f["type"] == "categorical":
      label = f["label"]
      categorical_labels[label] = defaultdict(lambda: len(categorical_labels[label]))

  for r in records:
    features = []

    try:
      # field to be predicted
      farthings = int(r["farthings"])

      for f in fields:
        label = f["label"]

        if f["type"] == "int":
          features.append( int(r[label]) )

        elif f["type"] == "optional_int":
          features.append( int(r[label]) if label in r.iterkeys() else 0 )

        elif f["type"] == "float":
          features.append( float(r[label]))

        elif f["type"] == "categorical":
          features.append( categorical_labels[label][r[label]] )

        elif f["type"] == "boolean":
          features.append( 1 if len(r[label]) > 0 else 0 )

        elif f["type"] == "list":
          features.append( "|".join(r[label]) )

      X.append(features)
      Y.append(farthings)

      if len(Y) >= 100:
        return X, Y, labels

    except Exception as exc:
      pass

  return X, Y, labels

def build_tree(X, Y):
  """Read in the input vectors X, Y and use those inputs to
  create a decision tree classifier"""
  clf = tree.DecisionTreeClassifier(max_depth=100, min_samples_leaf=1)
  clf = clf.fit(X, Y)
  return clf

def get_javascript_decision_tree(tree, feature_names):
  """Generates js source code that implements the decision
  tree contained in the input tree

  @args:
    tree: a trained decision tree classifier
    feature_names: a list of the features used in the original construction
      of the decision tree

  @author: Daniele
    See SO question 20224526
  """
  left = tree.tree_.children_left
  right = tree.tree_.children_right
  threshold = tree.tree_.threshold
  features = [feature_names[i] for i in tree.tree_.feature]
  value = tree.tree_.value
  js_tree = ""

  def recurse(left, right, threshold, features, node):
    if (threshold[node] != -2):
      write_js("if ( " + features[node] + " <= " + str(threshold[node]) + " ) {")
      if left[node] != -1:
        recurse (left, right, threshold, features,left[node])
      write_js("} else {")
      if right[node] != -1:
        recurse (left, right, threshold, features,right[node])
      write_js("}")
    else:
      write_js("return " + str(value[node]))

  recurse(left, right, threshold, features, 0)

def write_js(s):
  """Read in a string of js code and write that logic to disk"""
  with open(out_dir + "/" + out_js, "a") as out:
    out.write(s)

def write_price_labels(Y):
  """Read in a list of prices, dedupe, sort, and write the result
  to disk. This list of deduped and sorted prices corresponds to
  the values inside the return statements of the javascript decision
  tree"""
  Y = sorted(list(set(Y)))
  idx_to_label = {}
  for c, i in enumerate(Y):
    idx_to_label[c] = i
  with open(out_dir + "/price_labels.json", "w") as out:
    json.dump(idx_to_label, out)

if __name__ == "__main__":
  out_dir = "decision_tree"
  out_js = "priceDecisionTree.js"
  prepare_outfiles()

  records = Query(params={
    "farthings": "true", 
    "price_options": "0",
    "subjects": "!Advertisement+!Advertisements+!Prospectus+!Prospectuses+!Prices+!Catalogs"
    }, limit=1000, max_records=1000).get_records()

  X, Y, labels = get_input_features(records)
  clf = build_tree(X, Y)
  get_javascript_decision_tree(clf, labels)
  write_price_labels(Y)