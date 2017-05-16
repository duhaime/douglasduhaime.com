##
# Call webpack whenever the site resets
##

Jekyll::Hooks.register :site, :post_render do |jekyll|
  system('npm run build')
end