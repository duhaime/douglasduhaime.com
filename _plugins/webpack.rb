##
# Call webpack whenever the site resets
##

Jekyll::Hooks.register :site, :pre_render do |jekyll|
  system('npm run build')
end