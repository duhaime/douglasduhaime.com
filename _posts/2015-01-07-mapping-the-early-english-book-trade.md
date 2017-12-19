---
layout: post
title: Mapping the Early English Book Trade
date: 2015-01-07
description: |
  Charting the geographic terrain of the early book market before and after the 1710 Statute of Anne.
categories: mapping digital-humanities
thumbnail: |
  /assets/posts/mapping-early-books/mapping-early-books-thumb.jpg
banner: |
  /assets/posts/mapping-early-books/mapping-early-books-banner.jpg
css:
  - https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.1/leaflet.css
  - /assets/posts/mapping-early-books/mapping-early-books.css
js:
  - https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.1/leaflet.js
  - https://mapzen.com/tangram/0.12/tangram.min.js
  - /assets/posts/mapping-early-books/mapping-early-books.js
---

{% capture dir %}{{ site.baseurl }}/assets/posts/mapping-early-books{% endcapture %}

Historians often call attention to the tremendous influence the 1710 Act of Anne had on the early English book trade. Commonly identified as the origin of modern copyright law, the Act laid the statutory foundations for fixed-term copyright in England, extended the ability to hold such copyrights to all individuals, and eventually toppled the monopoly that London booksellers had held on English printing since the incorporation of the Stationers' Company in 1557. Reading scholarship on this legal development over the last few months, I became curious to see how well the English Short Title Catalogue ([ESTC][estc-link]) could substantiate some of the claims made in discussions of the Act. The ESTC seemed an ideal resource for this kind of analysis because, as Stephen Tabor has written, it represents "the fullest and most up-to-date bibliographical account of 'English' printing (in the broadest sense) for its first 328 years" ([367][tabor-link]). The database lists the authors, titles, imprint lines, publication dates, and many other metadata fields for each of the ~470,000 editions known to have been printed in England or its colonies between 1473 and 1800, and can therefore serve as a helpful resource with which to investigate the relationship between copyright law and literary history in the early modern period.

One of the debates surrounding the Act of Anne concerns the degree to which the statute altered the geography of the English book trade. Prior to the passage of the Act, legal historian Diane Zimmerman notes, the Stationers' Company dominated the book industry, and because the company's printers were primarily stationed in London, the book trade was also centered in the metropole. With the passage of the Statute of Anne, however, authors could sell or trade their copyrights to printers outside of London: "Now any printer [or] bookseller, wherever located within the country, could register a copyright with the Company" and "since purchasers of the copies could be located anywhere in the United Kingdom, the Stationers' Company did not regain its monopoly [on the book trade]" (7). Contra Zimmerman, William Patry argues that the Act of Anne failed to undermine London's control of the book trade: "After the Statute of Anne, as before," he writes, "the only purchasers of authors' works were a small group of London booksellers" ([84][patry-link]). To investigate what the ESTC had to say on this question, I analyzed the geographical distribution of English printers before and after the passage of the 1710 Act:

<div id='map'>
  <div id='current-year'></div>
</div>

The usual cautions concerning false imprints and varying survival rates notwithstanding, the ESTC clearly demonstrates the decentralization of English printing in the wake of the Act of Anne. London of course remained the primary site of publication throughout the years covered by the ESTC—publishing two-thirds of all records from the period—though its annual share in the trade fell quite dramatically across the eighteenth century:

<img class='large' src='{{ dir }}/images/london_printing.png' alt='Visualization of the percent of English printing in London, 1473-1800.'>

One can explain some of that decline by examining the growth of printing in major metropolitan areas outside of London, such as Edinburgh (responsible for 6.5% of total editions in the ESTC), Dublin (5.4%), and Boston (3.7%), which claimed the second, third, and fourth overall largest shares of the book trade according to the ESTC:

<img class='large' src='{{ dir }}/images/publishing_beyond_london.png' alt='Visualization of the percent of English printing in major publishing cities outside London, 1473-1800.'>

Among these figures, the explosion of printing in Edinburgh after 1750 is particularly interesting, and appears to be the result of further changes in the legal code. As John Feather notes, "The Copyright Act of 1710 (8 Anne c. 21) implied, but did not state, that it was illegal to import any English-language books into England and Wales if they had been previously printed there" (<a href='{{ dir }}/feather_english_book_trade.pdf'>58</a>). However, he continues, "the legislation in relation to Scotland seems to have lapsed in 1754-1755," after which one observes tremendous growth in Scottish printing. Between 1750 and 1755, the five year average of Edinburgh printing as a percent of all printing recorded in the ESTC is 7.5%. This figure only continues to grow after the lapse of Scottish printing regulations noted by Feather: From 1755-1760, Edinburgh printing climbs to 9.0% of all printing for the five year period, from 1760-1765, the figure rises to 12.3%, and from 1765-1770, it reaches 14.4% of the ESTC totals for the five year range. These values are significant, because they suggest the real surge in the Scottish reprinting industry did not take place in the aftermath of the Donaldson v. Becket decision, as is commonly supposed, but rather with the lapse of Scottish reprinting regulations in 1755.

<div class='center-text'>* * *</div>

I want to thank Benjamin Pauley, Brian Geiger, and Virginia Schilling—each of whom kindly helped me to acquire the ESTC data on which the analysis above was performed—as well as Elliott Visconsi, whose intriguing questions on copyright history continue to motivate my ongoing research.

[estc-link]: http://estc.bl.uk/
[tabor-link]: http://muse.jhu.edu/journals/lbt/summary/v008/8.4tabor.html
[patry-link]: https://books.google.com/books?id=8-4catWPy84C&q=%22small+group+of+London+booksellers%22#v=snippet&q=%22small%20group%20of%20London%20booksellers%22&f=false
[greene-link]: https://books.google.com/books?id=PFQchrtgYwcC&q=To+claim+responsibility+for+a+work+after+1710&hl=en#v=onepage&q=%22To%20claim%20responsibility%22&f=false
[griffin-link]: https://muse.jhu.edu/journals/new_literary_history/v030/30.4griffin.html
[raymond-link]: https://books.google.com/books?id=DyMjW21HwHwC&q=168#v=onepage&q=%22Other%20changing%20tendencies%22&f=false
