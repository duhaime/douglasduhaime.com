import glob, os

def subdivide(l, n):
  '''Return n-sized sublists from iterable l'''
  for i in range(0, len(l), n):
    yield l[i:i + n]

# identify the maximum number of images to process
max_imgs = 20480 # 20 atlas files, each with 32x32 images

# get up to `max_imgs` images from a directory of 64x64 images
images = glob.glob('64-thumbs/*')[:max_imgs]

# create a list of files to montage for each montage to make
for idx, atlas_images in enumerate(subdivide(images, 1024)):
  with open('images_to_montage.txt', 'w') as out:
    out.write('\n'.join(atlas_images))

  # identify the name for the new montage to create
  name = 'montage-' + str(idx) + '.jpg'

  # create a new 32x32 image montage with the images in images_to_montage.txt
  os.system('montage `cat images_to_montage.txt` -geometry +0+0 -background none -tile 32x ' + name)
