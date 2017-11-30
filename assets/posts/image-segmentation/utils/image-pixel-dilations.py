from skimage import io
from scipy import ndimage
import sys

image_file = sys.argv[1]
file_extension = image_file.split(".")[-1]

if file_extension in ["jpg", "jpeg"]:
  im = ndimage.imread(image_file)

elif file_extension in ["jp2"]:
  im = io.imread(image_file, plugin='freeimage')

else:
  print("your input file isn't jpg or jp2")
  sys.exit()

row_vals = list([sum(r) for r in im  ])
col_vals = list([sum(c) for c in im.T])

with open('cols.txt', 'w') as out:
  for c, i in enumerate(col_vals):
    out.write(str(i) + '\t' + str(c) + '\n') 
