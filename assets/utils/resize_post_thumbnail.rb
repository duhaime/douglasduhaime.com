# creates a 1400x151px image for landing page post thumbnail
# usage: ruby utils/resize_post_thumbnail.rb {input.jpg} {output.jpg}
# nb: requires imagemagick (brew install imagemagick)

require_relative 'resize'

input = ARGV[0].dup
width = 1400
height = 151
resize(input, width, height)