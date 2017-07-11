# creates a 400x240px image for landing page post thumbnail
# usage: ruby utils/resize_post_thumbnail.rb {input.jpg} {output.jpg}
# nb: requires imagemagick (brew install imagemagick)

input = ARGV[0]
output = ARGV[1]

# if necessary, use 1x and 2x output filenames
extension = File.extname(output)
one_x_extension = output.sub(extension, '-1x' + extension)
two_x_extension = output.sub(extension, '-2x' + extension)

# make 2x thumbnail
command =  'convert ' + input
command += ' -resize "400x240^"'
command += ' -gravity center'
command += ' -crop 400x240+0+0'
command += ' -sampling-factor 4:2:0'
command += ' -strip'
command += ' -quality 85'
command += ' ' + output
system(command)
