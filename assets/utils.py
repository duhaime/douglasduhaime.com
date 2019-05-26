from os.path import basename
from os import system
from sys import argv

# target bucket locations
stage = 's3://duhaime-staging/'
deploy = 's3://douglasduhaime.com/'

# build jekyll site
build = 'JEKYLL_ENV=production bundle exec jekyll build'

# push to bucket
def push(bucket):
  return build + ' && ' + \
    "aws s3 cp _site/ " + bucket + " " + \
      "--include '*' " + \
      "--acl public-read " + \
      "--cache-control max-age=604800 " + \
      "--recursive " + \
      "--metadata-directive='REPLACE' " + \
      "--profile default "

# resize sys.argv[2]
def resize(img_path, w, h):
  out_path = basename(img_path).split('.')[0] + '-resized.jpg'
  return 'convert ' + img_path + ' ' + \
    '-sampling-factor 4:2:0 ' + \
    '-strip ' + \
    '-colorspace sRGB ' + \
    '-quality 85 ' + \
    '-resize "' + str(w) + 'x' + str(h) + '^" ' + \
    '-crop ' + str(w) + 'x' + str(h) + '+0+0 ' + \
    out_path

# parse user command
cmd = argv[1]
if len(argv) > 2: img = argv[2]

if cmd == 'build': system(build)
elif cmd == 'stage': system(push(stage))
elif cmd == 'deploy': system(push(deploy))
elif cmd == 'post_thumbnail': system(resize(img, 1400, 151))
elif cmd == 'project_thumbnail': system(resize(img, 1380, 580))