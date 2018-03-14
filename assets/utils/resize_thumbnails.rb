require_relative 'resize'

thumbs = Dir.glob('assets/posts/*/*thumb.jpg')

thumbs.each do |t|
  resize(t, 1400, 151)
end