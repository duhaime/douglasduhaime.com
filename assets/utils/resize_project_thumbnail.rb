# creates a 1380x580px image for landing page project thumbnail
# usage: ruby utils/resize_project_thumbnail.rb {input.jpg} {output.jpg}
# nb: requires imagemagick (brew install imagemagick)

require_relative 'resize'

input = ARGV[0].dup
width = 1380
height = 580
gravity = 'northwest'
resize(input, width, height, gravity)