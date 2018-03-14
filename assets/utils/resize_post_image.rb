# creates a 1380xY image for a full-width image post
# usage: ruby utils/resize_post_image.rb {input.jpg} {output.jpg}
# nb: requires imagemagick (brew install imagemagick)

require_relative 'resize'

input = ARGV[0]
width = 1380
resize(input)