from sklearn.manifold import TSNE
import numpy as np
import glob, json, os

# create datastores
vector_files = []
image_vectors = []
chart_data = []
maximum_imgs = 500

# build a list of image vectors
vector_files = glob.glob('image_vectors/*.npz')[:maximum_imgs]
for c, i in enumerate(vector_files):
  image_vectors.append(np.loadtxt(i))
  print(' * loaded', c, 'of', len(vector_files), 'image vectors')

# build the tsne model on the image vectors
print('building tsne model')
model = TSNE(n_components=2, random_state=0)
np.set_printoptions(suppress=True)
fit_model = model.fit_transform( np.array(image_vectors) )
 
# store the coordinates of each image in the chart data
for c, i in enumerate(fit_model):
  image_name = os.path.basename(vector_files[c]).replace('.npz', '') 
  chart_data.append({
    'image': os.path.join('images', image_name),
    'x': i[0],
    'y': i[1]
  })

with open('image_tsne_projections.json', 'w') as out:
  json.dump(chart_data, out)
