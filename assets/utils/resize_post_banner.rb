# reduces the image size of a post banner
# usage: ruby utils/resize_post_banner.rb {input.png} {output.png}
# nb: requires imagemagick (brew install imagemagick)

input = ARGV[0]
output = ARGV[1]

# reduce banner size
command =  'convert ' + input
command += ' -sampling-factor 4:2:0'
command += ' -strip'
command += ' -quality 85'
command += ' ' + output
system(command)