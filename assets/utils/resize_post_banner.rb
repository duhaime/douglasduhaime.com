# reduces the image size of a post banner
# usage: ruby utils/resize_post_banner.rb {input.png} {output.png}
# nb: requires imagemagick (brew install imagemagick)

input = ARGV[0]
output = ARGV[1]

# if necessary, use 1x and 2x output filenames
extension = File.extname(output)
one_x_extension = output.sub(extension, '-1x' + extension)
two_x_extension = output.sub(extension, '-2x' + extension)

# reduce banner size
command =  'convert ' + input
command += ' -sampling-factor 4:2:0'
command += ' -strip'
command += ' -quality 85'
command += ' ' + output
system(command)