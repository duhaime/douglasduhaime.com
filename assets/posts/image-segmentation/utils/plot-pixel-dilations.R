library(ggplot2)
df <- read.table('cols.txt', sep='\t')

p <- ggplot(df, aes(x=V2, y=V1, ymax=V1)) +
  # specify line color
  geom_line(color='#eeeeee') +
  # use a ribbon because geom area doesn't support clipped axes
  geom_ribbon(aes(ymin=600000,), fill = '#17becf') +
  # limit axes
  scale_y_continuous(limits = c(600000, 1050000)) +
  xlab('Pixel Column Index (x-axis)') +
  ylab('Cumulative Brightness') +
  ggtitle('Pixel Column Brightness') +
  # center the title
  theme(plot.title = element_text(hjust = 0.5),
        axis.text=element_text(size=12),
        axis.title=element_text(size=14)
  )

  # to specify background color and grid colors
  # theme(panel.background = element_rect(fill='#27474E'),
  #       panel.grid.major = element_line(colour = "#777777"),
  #       panel.grid.minor = element_line(colour = "#777777")
  # )
  
ggsave('pixel-sums.png')
