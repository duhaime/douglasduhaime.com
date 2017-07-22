# creates a 1380xY image for a full-width image post
# usage: ruby utils/resize_post_image.rb {input.jpg} {output.jpg}
# nb: requires imagemagick (brew install imagemagick)

input = ARGV[0]
output = ARGV[1]

# if necessary, use 1x and 2x output filenames
extension = File.extname(output)
one_x_extension = output.sub(extension, '-1x' + extension)
two_x_extension = output.sub(extension, '-2x' + extension)

# make 2x thumbnail
command =  'convert ' + input
command += ' -resize "1380x"'
command += ' -sampling-factor 4:2:0'
command += ' -quality 85'
command += ' ' + output
system(command)
