require 'date'

def get_date()
  d = Date.parse(Time.now.to_s)
  date_offset = rand(0..12)
  return (d >> 0-date_offset)
end

def get_words(min, max)
  words = []
  lorem = 'Lorem ipsum dolor sit amet per causae utamur ornatus an'.split()
  rand(min..max).times do |w|
    word = lorem[rand(0..lorem.length)]
    if word
      words << word
    end
  end

  return words
end

def get_post_text()
  return File.readlines 'utils/html_elements.txt'
end

def get_post_content(d, category)
  images = Dir.glob('assets/images/header/*')
  words = get_words(5, 8)

  lines = []
  lines << '---'
  lines << 'layout: post'
  lines << 'title: "' + words.map{|w| w.capitalize}.join(' ') + '"'
  lines << 'date: ' + d
  lines << 'categories: lorem ' + category
  lines << 'image: ' + images[rand(0..images.length-1)]
  lines << '---'
  lines << ''
  lines << get_post_text()

  return lines.join("\n")
end

def write_post(post_content, formatted_date)
  path = '_posts/'
  words = get_words(2, 4)
  title = formatted_date + '-' + words.join('-') + '.md'
  File.open(path + title, 'w') { |f| f.write(post_content) }
end

def get_post(category)
  d = get_date()
  formatted_date = d.strftime('%Y-%m-%d')
  post_content = get_post_content(formatted_date, category)
  write_post(post_content, formatted_date)
end

['post', 'project'].each do |category|
  rand(5..14).times do |i|
    post = get_post(category)
  end
end
