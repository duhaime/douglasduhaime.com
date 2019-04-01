import os

cmd =  "mogrify -trim -bordercolor white -border 3%x3%  plots/*.png"
os.system(cmd)

cmd = 'convert -delay 20 -loop 0 plots/*.png infinity.gif'
os.system(cmd)
