# creates a 400x240px image for landing page thumbnail
# usage: ruby utils/resize_thumbnail.rb {input.jpg} {output.jpg}
# nb: requires imagemagick (brew install imagemagick)

input = ARGV[0]
output = ARGV[1]

command =  'convert ' + input
command += ' -resize "400x240^"'
command += ' -gravity center'
command += ' -crop 400x240+0+0'
command += ' ' + output

system(command)