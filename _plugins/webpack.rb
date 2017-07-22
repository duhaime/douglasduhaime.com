##
# Call webpack whenever the site resets
##

Jekyll::Hooks.register :site, :post_write do |jekyll|
  system('npm run compress')
end