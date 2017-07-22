---
layout: post
title: Testing the Cheap Literature Hypothesis
date: 2017-02-10
description: Scholars claim the creation of fixed-term copyright in 1774 led to lower book prices. New data from half a million text records suggests otherwise.
categories: d3
thumbnail: /assets/posts/cheap-literature/cheap-literature-thumb.jpg
banner: /assets/posts/cheap-literature/cheap-literature-banner.png
css: /assets/posts/cheap-literature/cheap-literature.css
js:
  - https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js
  - https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js
  - /assets/posts/cheap-literature/js/price-data-sampler.js
  - /assets/posts/cheap-literature/js/price-sample-size.js
  - /assets/posts/cheap-literature/js/price-by-size-boxplot.js
  - /assets/posts/cheap-literature/js/price-by-factor-boxplot.js
  - /assets/posts/cheap-literature/js/price-by-factor-brush.js
  - /assets/posts/cheap-literature/js/dd.init.js
  - /assets/posts/cheap-literature/js/dd.scales.js
  - /assets/posts/cheap-literature/js/dd.grid.js
  - /assets/posts/cheap-literature/js/dd.axes.js
  - /assets/posts/cheap-literature/js/dd.circle.js
  - /assets/posts/cheap-literature/js/dd.line.js
  - /assets/posts/cheap-literature/js/dd.area.js
  - /assets/posts/cheap-literature/js/dd.chart.js
  - /assets/posts/cheap-literature/js/price-over-time-scatterplot.js
  - /assets/posts/cheap-literature/js/price-by-subject.js
  - /assets/posts/cheap-literature/js/price-by-title.js
  - /assets/posts/cheap-literature/js/price-before-after-donaldson.js
  - /assets/posts/cheap-literature/js/author-publications.js
---

The Donaldson v. Beckett case (1774) has long been identified as a fundamental turning point in literary history. Prior to the case, English and European printing was governed by a 'perpetual copyright' system in which writers could sell the 'right to copy' a work to publishers, who would retain their legal right to publish the purchased work forever. After the case, England became the first country to institute a fixed-term copyright, whereby copyright holders could maintain monopoly control over their copyrights for a maximum of 28 years, after which the work would enter the public domain. Because this ruling pushed works published before 1746 into the public domain, any publisher could now print the works of deceased writers like Homer, Petrarch, and Milton. Analyzing this history, proponents of the 'Cheap Literature Hypothesis' argue that fixed-term copyright led publishers to flood the market with cheap copies of out-of-copyright books, thereby creating a wide readership of works that would come to define the western canon. While this hypothesis holds intuitive appeal, it has not yet been subjected to adequate analytical scrutiny, which motivates the analysis below.

## Introduction

The landmark Donaldson v. Beckett case (1774) is often upheld as the birthplace of modern copyright, as it effectively instituted the limited-term copyright that continues to define contemporary legal standards. Prior to 1774, copyright had no fixed duration. Authors could sell the 'right to copy' their manuscripts, and those who bought such copy rights held them indefinitely. In 1710, Queen Anne attempted to overturn this system of perpetual copyright in her Act for the Encouragement of Learning, which attempted to institute a 14-year fixed-term copyright, renewable for an additional 14-year period. Under this statutory regulation, those who purchased the right to copy a work from an author were intended to hold those rights for a maximum of 28 years. The statute never took root, however, which allowed members of the London bookseller conglomerate like Thomas Becket to maintain monopoly rights over texts whose copyright terms had long exceeded this 28-year window.

In 1774, the perpetual copyright system that had guided the British legal system from time immemorial was brought to a grinding halt by Donaldson v. Beckett. This celebrated case ruled that the Scottish printer Alexander Donaldson was well within his legal right when he printed James Thomson’s The Seasons, a text for which the London bookseller Thomas Becket and his associates had purchased the copyright in 1729. The upshot of this legal decision was that authors who held copyrights over the works—or those to whom they sold such rights—could only defend their copyrights for a fixed period of time, after which the copyrighted works would enter the public domain.

## The Cheap Literature Hypothesis

According to scholars such as Marjorie Plant and Mark Rose, the creation of fixed-term copyright in 1774 played a decisive role in determining the future of the literary canon. Because the Donaldson vs. Becket decision upheld the limited-term copyright outlined in Queen Anne's statutory regulation, their argument goes, the verdict allowed a wide range of booksellers to print and disseminate cheap copies of already-successful literary works. This virtuous cycle of reprinting enshrined a selective canon of best-sellers in the hands of countless readers, who could at last afford to purchase cheap copies of well-known works.

J. E. Elliott has referred to this theory as the 'cheap literature hypothesis,' and has helpfully consolidated the thesis in the following terms: 'After the House of Lords issued its 1774 ruling in favor of limited copy, upholding a 1710 statute to that effect, the prominent London publishing houses that controlled remunerative copy shares in William Shakespeare, John Milton, Alexander Pope, and others suddenly found themselves without legal protection for their literary property' [353]. Soon enough, 'these bookseller oligopolies began to splinter and strain,' and 'entrepreneurial printers and retailers jumped in to seize new economic rents. A dramatically enlarged and more competitive book market, in turn, led to a significantly inflated supply of what were often called 'approved works' at prices substantially lower than had been the case only a few years earlier' [353]. In short, 'with the market awash in newly affordable texts, a middle-class reading public began to take shape. These readers set the boundaries for a poetic canon, dividing popular from serious literature and enshrining a literary history that was also, conveniently, the promulgation of a national culture' [353].

Many of the most prominent scholars of the early modern book market have endorsed the cheap literature hypothesis. The following passages offer a small sample of the many voices that have contributed to the hypothesis:

<div class='quotebox'>
  <div class='quotebox-entry well'>
    <div class='quotebox-headshot background-image patry'></div>
    <div class='quotebox-name'>William Patry</div>
    <div class='quotebox-quote'>"As a result of the rejection of booksellers' claims [in the Donaldson case], 'a huge previously suppressed, demand for reading was met by a huge surge in the supply of books, and was soon caught up in a virtuous circle of growth.' The new, powerful demand [...] lowered dramatically the cost of classic texts [...] resulting in considerable economic and cultural changes" [85].</div>
  </div>

  <div class='quotebox-entry well'>
    <div class='quotebox-headshot background-image rose'></div>
    <div class='quotebox-name'>Mark Rose</div>
    <div class='quotebox-quote'>"One of the immediate consequences of the end of perpetual copyright was the legitimation of reprint enterprises such as Donaldson’s. In the years following the decision, readily affordable editions of classic writers […] poured into the marketplace, contributing significantly to the further development of the reading public" [69].</div>
  </div>

  <div class='quotebox-entry well'>
    <div class='quotebox-headshot background-image woodmansee'></div>
    <div class='quotebox-name'>Martha Woodmansee</div>
    <div class='quotebox-quote'>The reading public as a whole considered itself well served by [the creation of limited-term copyright], which not only made inexpensive reprints available but could also be plausibly credited with holding down the price of books in general through the competition it created" [441].</div>
  </div>
</div>

According to the defenders of the cheap literature hypothesis, the introduction of limited term copyright in England forever altered the literary canon by creating rampant competition in the book market. Because fixed term copyright allowed booksellers to create and sell titles that had previously been protected by copyright, and because booksellers were economically incentivized to produce and sell those works that had already proven to be top sellers, the introduction of fixed term copyright helped establish an echo chamber of printing in which those works that had already gone through the greatest number of editions continued to go through additional editions. Because anyone could print these high-demand titles, however, the price of out-of-copyright works sank dramatically, opening up new markets wherein would-be readers could connect with vendors.

The previous arguments notwithstanding, the cheap literature hypothesis has also had its share of detractors. Isabella Alexander has argued that the Statute of Anne and its codification after the Donaldson case both failed to significantly change book prices: "In the years following its enactment the statute had little effect on the book trade . . . . Nor does it appear that the prices offered and paid for shares of books amongst the booksellers changed in response to the fixed period of duration of the right" [1359-1360]. Arguing from hand-reviewed price data, J. E. Elliott has asserted that "average book prices for standard authors at the lower end of the price spectrum changed very little between 1750 and 1790" [355], and John Feather has even argued that there was a "steady increase in the price of books after about 1780" [42].

Despite this rich scholarly debate, the cheap literature hypothesis hasn't yet been subjected to adequate analytic scrutiny. The few available quantitative studies of the question have relied on diminishingly small data samples: David Fielding and Shef Rogers use a sample of 439 payments from the period [1], William St. Clair uses a sample of 534 titles, Macgarvie et al. use a sample of 93 author payments [1]. By contrast, the analysis below leverages a new dataset of 30,000 publications from the period with identified prices in order to help achieve a more representative account of book price trends in the eighteenth-century.

## Data and Methods

Price data for the following analysis was collected from the English Short Title Catalogue, the authoritative bibliography of works printed in England and English speaking countries before 1800. The ESTC database represents each publication from the early modern period as a MARC record, and these MARC records contain structured metadata describing attributes of the given publication, such as its author, the publication date, the Library of Congress 'subject codes' for the record, and so forth.

One of the fields associated with each publication in the ESTC database—the 500 MARC field—documents notes associated with the record. These notes include an array of non-structured metadata associated with the given title, such as scholarly claims regarding the authorship of anonymously published texts, or documentation on marginalia found within the record. In many cases, a record's 500 field also documents the price for the given work, as advertised on the initial sheet of the publication.

These ESTC notes on a publication's advertised price are almost always expressed in natural language using a syntactic construction similar to the following: Price from imprint: Price One Shilling, Price on title page: Price Two Shillings, and so forth. The predictable structure of these printed prices makes them fairly easy to automatically parse into structured data fields amenable to computational analysis.

To prepare data for the analysis below, these printed representations of record prices were mechanically parsed from the notes field of the given ESTC record. To make these prices comparable to one another, all price values were converted to the smallest unit of currency in the English monetary system, the farthing, using the following conversion table:

<div class='well farthings-table'>
  <table>
    <tbody>
      <tr>
        <th>UNIT</th><th>VALUE</th>
      </tr>
      <tr>
        <td>1 halfpenny</td>
        <td>2 farthings</td>
      </tr>
      <tr>
        <td>1 penny (d)</td>
        <td>4 farthings</td>
      </tr>
      <tr>
        <td>1 shilling (s)</td>
        <td>12 pennies</td>
      </tr>
      <tr>
        <td>1 crown</td>
        <td>5 shillings</td>
      </tr>
      <tr>
        <td>1 pound (l)</td>
        <td>4 crowns</td>
      </tr>
      <tr>
        <td>1 guinea</td>
        <td>21 shillings</td>
      </tr>
    </tbody>
  </table>
</div>

This parsing process is complicated by the fact that many records from the period list multiple prices on their cover pages. Lindley Murray's 1797 grammar handbook English Exercises, for example, advertises two prices: 2 shillings for the grammar book alone, or 3 shillings for the grammar book plus its answer key. Likewise, pamphlets from the period were sometimes sold for reduced rates if the buyer bought them in bulk, while religious works were sometimes sold for reduced prices if the buyer planned to give them away to those with lesser means. Other works from the period advertise multiple prices according to the paper on which the book was printed, binding of the book (whether stitched or bound, for instance), or listed both the past and current price of the work. A small sample of records that list multiple printed prices are displayed below (click to enlarge):

<div class='lightbox-pages-container'>
  <div class='well lightbox-pages'>
    {% lightbox /assets/posts/cheap-literature/images/resized-page-thumbnails/019930070000010.png %}
    {% lightbox /assets/posts/cheap-literature/images/resized-page-thumbnails/044920050000020.png %}
    {% lightbox /assets/posts/cheap-literature/images/resized-page-thumbnails/046140050000010.png %}
    {% lightbox /assets/posts/cheap-literature/images/resized-page-thumbnails/058410260000010.png %}
    {% lightbox /assets/posts/cheap-literature/images/resized-page-thumbnails/168420110000010.png %}
  </div>
</div>

Works such as those pictured above advertise multiple prices, which could potentially confuse computational models. They were therefore set aside during the analysis below, which focuses solely on works that advertise a single sale price.

Faulty imprint lines are another potentially complicating factor. Early modern scholars have long known that title pages from the period are sometimes unreliable, as hurried printers often made mistakes when setting the type for a given imprint. It's also known that some printers intentionally falsified information such as the city in which a publication was printed to avoid local printing regulations. In some cases one record has been identified as two imprints (see the notes on ESTC records R180212 and S114275), while other new texts continue to be added to the catalogue. It's difficult to estimate the frequency of these omissions and errors, but the database is not flawless. In the case of pricing data, scholars who have contributed to the notes section of the ESTC have documented a small handful of misprinted prices from the period. A scholarly note added to ESTC record [P6352](http://estc.bl.uk/P6352), for example, finds that while one imprint of the work lists 'three pence' as the record's price, a subsequent printing corrects the price to read 'three shillings'. Thankfully for quantitative analysts and historical booksellers, such misprinted prices are fairly rare, which allows one to draw meaningful conclusions from the data in aggregate.

Setting aside the records that advertised multiple prices and any overwhelming doubts about the accuracy of printed prices left a dataset of roughly 30,000 texts with a single identified price, each of which was stored in a database for subsequent analysis. To get a sense of the accuracy of this algorithmic conversion, one can review both the original data from ESTC source records ('MARC_PRICE') and the mechanically parsed price value in farthings ('FARTHINGS') in the random data samples below:

<div id='price-data-sample' class='well'>
  <table>
  </table>
  <button id='refresh-sample'>REFRESH SAMPLE</button>
</div>

By clicking the button to refresh the data sample, one can see that pricing data within the ESTC reflects a wide range of notations printed on eighteenth-century title pages. Some records use shorthand notations [l: pounds, s: shillings, d: pence] while others mix plain text and more bespoke systems. Nevertheless, the farthings data used in the analysis below retains a uniform representation of the price of records to facilitate computation analysis.

This collection of price data has fairly good historical coverage, with at least one hundred price observations for most years in the eighteenth century. Most years have good representation of octavo and quarto book sizes, and relatively strong coverage for folios towards the start of the century and duodecimos towards the end of the century. The following plot offers a high-level description of the historical distribution of the prices captured in this database, as well as the distribution of relevant book formats:

<div class='price-sample-size'>
  <h3 id='price-sample-size-title'></h3>
  <div class='legend'>
    <div class='swatch-container'>
      <div class='swatch octavo'></div>
      <div class='legend-label'>Octavo</div>
    </div>
    <div class='swatch-container'>
      <div class='swatch duodecimo'></div>
      <div class='legend-label'>Duodecimo</div>
    </div>
    <div class='swatch-container'>
      <div class='swatch quarto'></div>
      <div class='legend-label'>Quarto</div>
    </div>
    <div class='swatch-container'>
      <div class='swatch folio'></div>
      <div class='legend-label'>Folio</div>
    </div>
  </div>
  <div id='price-sample-size' class='chart'></div>
  <div class='buttons'>
    <button id='priced'>Sample Size</button>
    <button id='total'>Corpus Size</button>
  </div>
</div>

It's important to keep these book size distributions in mind when examining the figures below, because as we'll see, the size of a record plays a significant role in determining the price of the publication. In order to observe this fact, it's important to recall that early modern books were printed on sheets of a standard size, using the following printing sizes:

<div class='well pages-per-sheet'>
  <table>
    <tbody>
      <tr>
        <th>SIZE</th>
        <th>PAGES PER SHEET</th>
      </tr>
      <tr>
        <td>Folio</td>
        <td>2</td>
      </tr>
      <tr>
        <td>Quarto</td>
        <td>4</td>
      </tr>
      <tr>
        <td>Octavo</td>
        <td>8</td>
      </tr>
      <tr>
        <td>Duodecimo</td>
        <td>12</td>
      </tr>
      <tr>
        <td>Sixteenmo</td>
        <td>16</td>
      </tr>
    </tbody>
  </table>
</div>

In other words, folio pages were twice as large as quarto pages, quarto pages were twice as large as octavo pages, and octavo pages were twice as large as sixteenmo pages. It is therefore not entirely surprising that if one normalizes for publication length, the median price among folio prices is roughly twice that of quartos, which is twice that of octavos and so on:

### ESTC Record Prices by Size

<div id='price-by-size'></div>

Each of the rectangles in the boxplot above represents the price distribution for a given book size. The horizontal bar within each rectangle represents the median price for the given size, while the top and bottom of the rectangle indicate the 75th and 25th price quantiles (respectively) for the given size. The veIrtical bars above and below each rectangle likewise represent the top 90th and 10th price quantiles for the size. By representing these statistics in a single glyph, the boxplot allows one to quickly see that folio records tended to cost roughly twice as much as quarto records, which tended to cost roughly twice as much as octavo records, and so forth. This suggests that the price of an eighteenth-century publication was to some degree a function of the materials used to print that publication, as folio-sized records required twice the paper and twice the cost of quarto-sized records, ceteris paribus.

While the plot above allows one to quickly examine the ways in which a publication's size influenced its price, there are a number of other features that helped influence book price. The plot below helps one examine a small subset of these features:

<div class='price-by-factor'>
  <div class='price-by-factor-buttons'>
    <div class='factor-button' id='subject'>
      <img src='/assets/posts/cheap-literature/images/icons/subject.svg'>
      <span>Subject</span>
    </div>
    <div class='factor-button' id='author'>
      <img src='/assets/posts/cheap-literature/images/icons/author.svg'>
      <span>Author</span>
    </div>
    <div class='factor-button' id='location'>
      <img src='/assets/posts/cheap-literature/images/icons/location.svg'>
      <span>Location</span>
    </div>
    <div class='factor-button' id='publisher'>
      <img src='/assets/posts/cheap-literature/images/icons/publisher.svg'>
      <span>Publisher</span>
    </div>
  </div>

  <div id='price-by-factor-title'>
    <h2 class='factor-title-prefix'>ESTC Record Prices by </h2>
    <h2 class='factor-title'></h2>
  </div>
  <div id='price-by-factor'></div>
  <div id='price-by-factor-brush'></div>
</div>

Just like the boxplot for book sizes above, the horizontal line within each box in these plots represents the median publication price for the given book feature, while the other horizontal lines represent the 10th, 25th, 50th, and 90th price quantiles. These statistics allow one to quickly compare price distributions among book subjects, authors, publication locations, or publishers. Within the 'Author' plot, for example, we can see that John Bunyan's publications were among the cheapest of the early modern period, as the median price for his works was the median price for his works was roughly .2 farthings per page. Additionally, one can see that there was little price variation within Bunyan's works, as the vertical bars above and below each rectangle describe the range within which the vast majority of publication prices for that variable fall, and this range is quite small indeed for Bunyan. While other popular authors like Alexander Pope and John Milton appear among the most expensive authors of the century and exhibit wide fluxuations in prices, we can see that John Bunyan's works were all rather affordable, which suggests his works were published in humbler editions befitting the religious charge of his publications.

Examining the plot of prices by book subject, one can see more generally that religious publications are among the cheapest publications within the ESTC. As David McKitterick has shown, this trend may be due to the fact that the control over the publication of Bible school books and other 'privileged' works opened up in 1678, after which the price of religious works sank [193]. Curiously, this plot also shows that works of fiction were also among the cheapest publications in the ESTC, while poetic and dramatic works were among the most expensive. This finding helps support the hypothesis that the early novel struggled to achieve the stature that drama and poetry had possessed since at least the classical era.

## Book Prices over Time

While the boxplots above help reveal some price trends in the early modern book market, they don't give any indication of the ways book prices changed over time. By plotting the mean length-normalized price of publications along with the price of craftsmen labour over the century, the following plot helps show that publication prices climbed steadily during the eighteenth century:

<div id='prices-over-time-points'>
  <div id='octavos-over-time' class='grid'></div>
  <div id='quartos-over-time' class='grid'></div>
  <div id='labor-over-time' class='grid'></div>
</div>

The first two facets here depict the mean farthings per page (i.e. the length-normalized price) over time for octavo and quarto volumes. Each point in these first two facets represents the mean of all length-normalized prices for the given book size and year. The third facet depicts snapshots from the real wage index as identified by E. A. Wrigley and R. S. Schofield [640]. Examining this plot, one finds that the overall price of publications did not drop after the Donaldson v. Beckett ruling, but instead rose steadily throughout the century to keep pace with inflation.

Given the steady rise of book prices across the century, one could still hypothesize that while book prices as such didn't fall precipitously after 1774, prices for popular literary works did. One way to test this theory is to compare the degree to which literary and non-literary record prices changed during the eighteenth century. The following plot represents these figures by plotting the length-normalized price of each publication as a point:

### ESTC Record Prices by Subject
<div class='price-by-subject'>
  <label>Book Category:</label>
  <select>
    <option value='english-drama' selected>English Drama</option>
    <option value='english-poetry'>English Poetry</option>
    <option value='great-britain'>Great Britain</option>
    <option value='france'>France</option>
    <option value='ireland'>Ireland</option>
    <option value='politics-and-government'>Politics and Government</option>
    <option value='history'>History</option>
    <option value='church-of-england'>Church of England</option>
    <option value='sermons'>Sermons</option>
  </select>

  <div id='price-by-subject' class='grid'></div>
</div>

Examining these price observations, one finds little evidence that indicates literary records fell in price after 1774. In fact, the prices for subjects like 'English drama' help show that prices rose steadily across the century in all examined book subject groups. At the same time, however, one can observe that the variance among book prices rises quite a bit towards the end of the century, where prices fan out to cover a wider range of price ranges. This is initial evidence for the hypothesis that book prices became more varied toward the end of the century, perhaps due to the increasing economic and social diversity of the English language book market.

Even given the observations above, one could argue that while literary records overall rose in price, particular titles tended to fall in price after the Donaldson decision. To test this claim, the plot below identifies each title as a line and shows the price of the given title over time. That is to say, all editions of 'Hamlet' would constitute a single price line, and all editions of 'Macbeth' would constitute another. Furthermore, the plot separates records that rose or fell in price from those that maintained a relatively constant price over time. By toggling the buttons at the top of the chart, one can switch between records with positive, negative and ~0 slope:

### ESTC Record Prices over Time

<div class='price-by-title'>

  <div class='slope-buttons'>
    <label>Filter by slope: </label>
    <div class='slope-button' id='negative'>
      <img src='/assets/posts/cheap-literature/images/slope-buttons/negative-slope.svg' />
    </div>
    <div class='slope-button active' id='neutral'>
      <img src='/assets/posts/cheap-literature/images/slope-buttons/neutral-slope.svg' />
    </div>
    <div class='slope-button' id='positive'>
      <img src='/assets/posts/cheap-literature/images/slope-buttons/positive-slope.svg' />
    </div>
  </div>

  <div id='price-by-title'></div>

  <div class='subject-buttons'>
    <div class='subject-button active' id='england'>
      <img src='/assets/posts/cheap-literature/images/subject-buttons/england.svg' />
      <span>England</span>
    </div>
    <div class='subject-button' id='politics'>
      <img src='/assets/posts/cheap-literature/images/subject-buttons/scales.svg' />
      <span>Politics</span>
    </div>
    <div class='subject-button' id='poems'>
      <img src='/assets/posts/cheap-literature/images/subject-buttons/pen.svg' />
      <span>Poems</span>
    </div>
    <div class='subject-button' id='history'>
      <img src='/assets/posts/cheap-literature/images/subject-buttons/pyramids.svg' />
      <span>History</span>
    </div>
    <div class='subject-button' id='plays'>
      <img src='/assets/posts/cheap-literature/images/subject-buttons/curtain.svg' />
      <span>Plays</span>
    </div>
    <div class='subject-button' id='sermons'>
      <img src='/assets/posts/cheap-literature/images/subject-buttons/church.svg' />
      <span>Sermons</span>
    </div>
  </div>
</div>

The plot above shows a relatively even distribution among records whose prices rose, fell, or did not change greatly. In other words, even if one controls for records by their page length, generic classification, and title, one finds no distintuishable change in the slope of record prices after the Donaldson case, which is a significant blow to the Cheap Literature Hypothesis.

The chart helps show the fluctuations of book prices over the course of the eighteenth century, but doesn't make it easy to compare prices before and after the 1774 Donaldson decision. One way to simplify this comparison is to take the collection of ~1000 records for which prices are available before and after the Donaldson decision and plot and plot the before and after prices in a single scatterplot:

### Record Prices Before and After Donaldson v. Beckett (1774)

<div id='before-after-donaldson' class='grid'></div>

Here one finds perhaps the clearest evidence of the fact that the Donaldson decision did not revolutionize book pricing. Within the plot, a clear line of best fit rests on the x = y line, which indicates that the majority of records had roughly the same price before and after the Donaldson decision. Contrary to the Cheap Literature Hypothesis, this plot suggests that book prices remained quite stable after the institution of fixed term copyright.

James Boswell offers one potential reason why we shouldn't be surprised prices remained constant after the Donaldson case. When describing the publication of Samuel Johnson's Lives of the Poets (1778), Boswell notes that 'The Poets [included in Johnson's edition] were selected by the several Booksellers who had the honorary copy right which is still preserved among them by mutual compact, notwithstanding the decision of the House of Lords against the perpetuity of Literary property' [724]. Despite the fact that the copyright holders no longer had legal protections to buoy up the value of their copyright shares, Boswell writes that copyright shares continued to hold the value they possessed before either Donaldson v. Beckett or the Statute of Anne had transpired.

John Feather elaborates Boswell's insight, suggesting that publishers in fact began upholding 'honorary' copyright shortly after the 1710 Statute of Anne created a statutory limit to copyright duration: 'After the limited copyright terms outlined by the Statute of Anne began to expire in 1732, copy-owners continued to trade in shares without any apparent awareness of the possibility that they might lose their value. The pre-1710 copyrights were due to expire in 1731-32, but shares in Shakespeare, Milton, Bunyan, Stanhope and others continued to be traded at ever-rising prices both before and after that deadline. This merely exacerbated the problem, for as the prices of shares rose the booksellers found themselves more than ever committed to the protection of their investments' [6].

If statutory regulation and common law precedent failed to lower the price publishers paid for copyright shares, they also failed to lower the price consumers paid for books. The mass production of a literary public domain did not create a frantic rush to the bottom of the book market; judged by the prices publishers and consumers paid for literary property, the creation of the world's first open source text market appears to have changed the economic landscape very little.

## Donaldson and the Canon

Even if book prices changed little after the Donaldson v. Beckett case, the question remains just how much the case helped increase reprinting of popular texts. As we saw above, a number of scholars have argued that the institution of fixed-term copyright led to a surge of reprints of classic authors. One way to test this claim is to examine the most popular authors within the ESTC corpus, and to examine their rates of publication over time. This data is presented in the following plot, which shows the cumulative publications of the most published ESTC authors over the course of the eighteenth century:

### Cumulative Publications of the Most Published ESTC Authors

<div class='author-publications'>
  <div id='author-publications'></div>
  <div class='author-publications-range'>
    <span>Showing </span>
    <div class='range-start'></div>
    <span> to </span>
    <div class='range-end'></div>
  </div>
  <div class='author-publications-buttons'>
    <button class='previous'>&larr; Previous</button>
    <button class='next'>Next &rarr;</button>
  </div>
</div>

As one can see, there is very little evidence that the highest sphere of the canon was affected by the creation of fixed-term copyright. Popular authors from earlier centuries, such as Shakespeare, Milton, and Bunyan, show relatively stable growth in publication counts across the century. In fact, one the most sudden bursts of publication surges among later eighteenth-century authors whose works were likely in copyright at the time of publication (James Christie, Hannah More, Thomas Paine). Because out-of-copyright works were now public domain and could be sold by any printer, it makes sense printers would focus on publishing copies of in-copyright works, for which they could collect profits without fear of competition [65].

## Calculating Early Modern Book Prices

If fixed-term copyright had little effect on eighteenth-century book prices, what <i>did</i> shape literary economics during the period? One way to answer this question is to build a series of statistical models that measure the degree to which different variables are correlated with the rise and fall of book prices. The following analysis pursues this approach, using a series of linear models to measure the extent to which book prices can be predicted given different features of a book, such as the age of the book's author or the size of the book.

For each metadata feature available within the corpus described above, I built a simple linear model and obtained a measure of the degree to which the model explained the variance in book prices from the period. Specifically, I took note of the adjusted R² value, a standard measure between 0 and 1 of the extent to which a statistical model accounts for the variance within a dependent variable (in this case book price). For each metadata feature that was tested, the R² value is reported below as a percentage. Taken collectively, these R² values help show the extent to which various features of a publication helped determine that publication's price:

### ESTC Price Model Coefficients

<div class='price-model-coefficients'>
  {% include posts/cheap-literature/model-feature.html
    weight='22'
    label='Length'
    image='length.svg'
    description="The longer the book, the more expensive. Book length in fact shapes prices so strongly that the remainder of R² values are calculated on farthings per page values. The significant correlation between book length and price is perhaps unsurprising, as some of the earliest English printing regulations in fact mandated pricing models that were determined by the number of pages in a work."
  %}
  {% include posts/cheap-literature/model-feature.html
    weight='17'
    label='Size'
    image='size.svg'
    description="As we saw above, folio works tend to be twice as expensive as quarto works, which tend to be twice as expensive as octavo works, ceteris paribus. The linear relationship between a book's size and price is likely due to the fact that folio works required twice as many sheets as octavo works to print an equal number of leaves. Publishers evidently transferred these printing costs to consumers, which creates a linear relationship between publication size and cost."
  %}
  {% include posts/cheap-literature/model-feature.html
    weight='10'
    label='Location'
    image='location.svg'
    description="The city in which a work is printed also has a strong correlation with the price of that work. As we noted above, publications tended to be cheaper in cities like Dublin and Edinburgh than cities like London or Derby. Just why publications were cheaper in these other cities requires additional research and further explanation."
  %}
  {% include posts/cheap-literature/model-feature.html
    weight='10'
    label='Year'
    image='year.svg'
    description="The price of a work is also strongly correlated with the year in which that work was printed. As we saw above, the lenght-normalized cost of mean farthings per page values over time show a steady linear growth for several prominent book sizes, which suggests that book prices tended to increase as a function of inflation over the course of the century."
  %}
  {% include posts/cheap-literature/model-feature.html
    weight='7'
    label='Genre'
    image='subject.svg'
    description="In the eighteenth-century book market, ballads and satirical poems were among the most expensive publications one could buy, while dictionaries and Biblical works were among the cheapest. Explaining what drove the variance among the prices of book subjects would be an interesting task, and would likely require one to delve deep into early modern copyright protections and agreements among the Stationer's Company printers."
  %}
  {% include posts/cheap-literature/model-feature.html
    weight='6'
    label='Death Date'
    image='death.svg'
    description="More recently deceased authors' works tended to be more valuable than those of authors who had long been dead. This could suggest that publications had a well-defined shelf-life after which they became less saleable, or it could suggest that more recent works were more expensive by virtue of inflation."
  %}
  {% include posts/cheap-literature/model-feature.html
    weight='2'
    label='Volumes'
    image='volumes.svg'
    description="As the number of volumes in a work increased, the length-normalized price for those works tended to decrease. One might argue this tendency continues today in large multi-volume sets like the Encyclopedia Brittanica. It would be interesting to investigate whether the price per page that publishers paid authors for copyrights decreased as the number of volumes purchased increased."
  %}
  {% include posts/cheap-literature/model-feature.html
    weight='1'
    label='Author Age'
    image='balloons.svg'
    description="Works by older authors tended to cost more than works by younger authors. This correlation is weak, but is nevertheless remarkable, as it suggests publishers were relatively hesitant to create strongly differentiated pricing for established and novice writers' works."
  %}
</div>

## Conclusion

The Cheap Literature Hypothesis holds that the institution of fixed-term copyright in 1778 inspired a printing revolution in which printers mass-produced cheap copies of already-successful literary works. According to the hypothesis, this virtuous cycle of reprinting enshrined a selective canon of best-sellers in the hands of countless readers, who could at last afford to purchase cheap copies of well-known works.

By leveraging a new database of 30,000 price observations from the century&mdash;which is well over an order of magnitude larger than those used by other studies&mdash;this chapter finds new evidence that suggests there was in fact no printing revolution after the instituition of fixed-term copyright. On the contrary, the evidence above suggests that the pricing and subject material of works in the fixed-term copyright book market largely reflected those of the indefinite copyright book market.

Perhaps more importantly, this chapter has used a range of data visualizations to create a series of new views into the eighteenth-century book market. Within the plots above, one can now for the first time examine trends in book pricing over time, by subject material, and by different authors and publishers. Taken collectively, these plots provide a number of insights into eighteenth-century culture, the nature of early modern celebrity, and the budding English canon. These data views also raise a number of questions concerning the relationship between printers, readers, and the law, some of which we will continue exploring as we turn to investigate the regulation and practice of early modern plagiarism.
