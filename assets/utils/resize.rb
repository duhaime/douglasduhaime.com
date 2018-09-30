def resize(path, width=nil, height=nil, gravity=nil)
  cmd =  'convert ' + path + ' '
  cmd += '-sampling-factor 4:2:0 '
  cmd += '-strip '
  cmd += '-colorspace sRGB '
  cmd += '-quality 85 '

  # add width and height arguments if present
  unless width.nil?
    w = width.to_s
    unless height.nil?
      h = height.to_s
      cmd += '-resize "' + w + 'x' + h + '^" '
      cmd += '-crop ' + w + 'x' + h + '+0+0 '
    else
      cmd += '-resize "' + w + 'x" '
    end
  end

  # allow function caller to add gravity
  unless gravity.nil?
    cmd += 'gravity ' + gravity + ' '
  end

  cmd += get_out_path(path)

  # run the command
  puts(' * ' + cmd)
  system(cmd)
end

# determine where an infile at `path` should be saved
def get_out_path(path)
  out_path = path

  # convert pngs to jpg
  if not out_path.include? '.jpg'
    out_path = out_path.sub! '.png', '.jpg'
  end

  return out_path
end