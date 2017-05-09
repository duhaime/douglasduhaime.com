require 'date'

# usage:
# ruby utils/new_post.rb 'My New Title'

def get_post_content(title, date)
  lines = []
  lines << '---'
  lines << 'layout: post'
  lines << 'title: ' + title
  lines << 'date: ' + date.to_s
  lines << 'categories: '
  lines << 'image: '
  lines << 'header: '
  lines << 'js: '
  lines << 'css: '
  lines << '---'
  lines << ''

  return lines.join("\n")
end

def get_outfile_name(title, date)
  formatted_title = title.downcase.split(' ').join('-')
  formatted_date = date.strftime('%Y-%m-%d')
  outfile = formatted_date + '-' + formatted_title + '.md'
end

# get the title
title = ARGV[0]
if not title
  puts 'please provide a post title: '
  puts 'ruby utils/new_post.rb "My New Post"'
  exit
end

# get the date
date = Date.parse(Time.now.to_s)
outfile_path = '_posts/'

# get the post content and outfile name
post_content = get_post_content(title, date)
outfile_name = get_outfile_name(title, date)
outfile = outfile_path + outfile_name

# write the output
File.open(outfile, 'w') { |f| f.write(post_content) }