# utility for measuring correlation between ESTC metadata and book price changes

library(ggplot2)
#install.packages("GGally")
require(GGally)

price.df <- read.table("df.tsv", 
                       sep="\t", 
                       quote="",
                       fill=NA,
                       na.strings=NA,
                       comment.char = "",
                       header=TRUE,
                       stringsAsFactors = FALSE)

# remove short works to get proper length-normalized prices
# remove works with images to control for expenses associated with images
# remove works with physical descriptions as they contain non-textual material
# remove works with printing details as they also contain non-textual material
# remove works for which we don't know the total page count
# remove works that are an irregular size
clean.df <- subset(price.df, 
                (total_pages > 30) &
                (is.na(total_images)) &
                (nchar(physical_description) == 0) &
                (nchar(printing_details) == 0) &
                (!is.na(as.numeric(as.character(total_pages)))) &
                (size %in% c("2", "4", "8", "12", "16"))
)

# 0.2252
model <- lm(farthings ~ total_pages, data=clean.df)

# add farthings per page to df
clean.df$farthings_per_page <- as.numeric(as.character(clean.df$farthings)) /  as.numeric(as.character(clean.df$total_pages))

# 0.1683
model <- lm(farthings_per_page ~ size, data=subset(clean.df, size %in% c("2", "4", "8", "12", "16")))

# add farthings per sheet, where a sheet is standardized unit of paper
clean.df$farthings_per_sheet <- clean.df$farthings_per_page / (as.numeric(as.character(clean.df$size))/16)

# remove na's introduced by creation of farthings per sheet measurement
clean.df <- subset(clean.df, !is.na(farthings_per_sheet))

# 0.1047
model <- lm(farthings_per_page ~ imprint_city, data=clean.df)

# 0.09568
model <- lm(farthings_per_page ~ imprint_year, data=clean.df)

# 0.06768
model <- lm(farthings_per_page ~ genres, clean.df)

# 0.06233
model <- lm(farthings_per_page ~ as.numeric(as.character(death_date)), data=subset(clean.df, author_date_uncertainty == "0" & nchar(author_age) > 0))

# 0.01712
model <- lm(farthings_per_page ~ as.numeric(as.character(total_volumes)), data=clean.df)

# 0.005952
model <- lm(farthings_per_page ~ author_age, data=subset(clean.df, author_date_uncertainty == "0" & nchar(author_age) > 0))

# 1.564e-05
model <- lm(farthings_per_page ~ as.numeric(as.character(holding_libraries)), data=clean.df)

# 0.004224
model <- lm(farthings_per_sheet ~ publication_state, data=clean.df)

# 0.0001645
model <- lm(farthings_per_sheet ~ gender, data=subset(clean.df, gender %in% c("male", "female")))

# 0.4175
model <- lm(farthings ~ marc_last_name, data=clean.df)

# 0.01162
model <- lm(farthings ~ nchar(publishers), data=clean.df)

# 0.002914
model <- lm(farthings_per_page ~ publication_country, data=clean.df)

# 0.00429
model <- lm(farthings_per_page ~ author_alive, data=subset(clean.df, author_alive %in% c("0", "1")))