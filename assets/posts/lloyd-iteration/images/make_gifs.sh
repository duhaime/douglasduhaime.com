convert constrained/*.png -coalesce -set delay 20  -repage 0x0 -crop 1208x812+150+100 +repage constrained.gif && \
convert unconstrained/*.png -coalesce -set delay 20 -repage 0x0 -crop 1208x812+150+122 +repage unconstrained.gif
