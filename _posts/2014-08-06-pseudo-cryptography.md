---
layout: post
title:  Pseudo-Cryptography in Jonathan Swift's Tale of a Tub
date:   2014-08-06
categories: digital-humanities cryptography
image: /assets/posts/pseudo-cryptography/pseudo-cryptography-thumb.jpg
banner: /assets/posts/pseudo-cryptography/pseudo-cryptography-banner.png
---

"I do here humbly propose for an Experiment," Jonathan Swift writes near the end of his <i>Tale of a Tub</i>, "that every Prince in Christendom will take seven of the deepest Scholars in his Dominions, and shut them up close for seven Years, in seven Chambers, with a Command to write seven ample Commentaries upon [<i>A Tale of a Tub</i>]." In order to promote so useful a Work, Swift informs readers that he has encrypted some hidden messages in the <i>Tale</i>: "I have couched a very profound Mystery in the Number of O's multiply'd by Seven, and divided by Nine." Not wishing to leave the alchemically inclined out of his game, Swift adds: "Also, if a devout Brother of the Rosy Cross will pray fervently for sixty three Mornings, with a lively Faith, and then transpose certain Letters and Syllables according to Prescription, in the second and fifth Section; they will certainly reveal into a full Receipt of the <i>Opus Magnum</i>." Swift then completes his triumvirate of puzzles with the following remark: "Lastly, Whoever will be at the Pains to calculate the whole Number of each Letter in this Treatise, and sum up the Difference exactly between the several Numbers, assigning the true natural Cause for every such Difference; the Discoveries in the Product, will plentifully reward his Labour" (Section X).

The probability that Swift actually altered his language so as to conceal occult knowledge in his already-overstuffed <i>Tale</i> may seem rather minimal to many readers. For those familiar with Swift's delight in word games and ciphers, though, the odds might look a bit brighter. In fact, readers who have discovered Paul Childs' essay "Cipher Against Ciphers: Jonathan Swift's Latino-Anglicus Satire of Medicine" in <i>Cryptologia</i>—which analyzes the ways Swift transformed his suffering under Ménière's disease into cleverly encrypted messages—might wonder whether the Dean has in fact buried some treasure in his <i>Tale</i>. With this question in mind, I decided to run some experiments to see whether I might be able to resolve some of Swift's long-overlooked riddles.

Riddle One: The Mystery of the Number of O's in Swift’s <i>Tale</i>. Some simple analysis reveals that there are 16,092 O’s in the 1710 edition of Swift’s <i>Tale of a Tub</i>. If we multiply this value by seven and divide the result by nine—the operations Swift suggests one must perform to uncover his profound Mystery—we get 12,516, a number whose significance I leave to others to determine. While this number might carry significance, the more fundamental question is whether Swift’s use of the letter O appears to be unusual or premeditated in any way. To answer this question, we can compare the relative frequency of the letter O in Swift’s Tale to the relative frequency of the letter in other documents from the eighteenth century:

<img class='center-image' src='/assets/posts/pseudo-cryptography/relative_frequency_o.jpg'>

If Swift's usage of the letter O were premeditated or unusual in any way, we should expect to see the relative frequency of the letter depart from the norm established by his contemporaries. As the plot above indicates, however, his use of the letter is perfectly in keeping with the trend of his times, which suggests Swift's first riddle is a jest.

Riddle Two: "[If readers] transpose certain Letters and Syllables according to Prescription, in the second and fifth Section; they will certainly reveal into a full Receipt of the Opus Magnum". To analyze this puzzle, we can again look at the distribution of letters in Swift’s <i>Tale</i>, this time investigating the degree to which the distribution of any letter in sections two and five look out of keeping with the distributions of those letters in other sections. More generally, we can look to see if there are any unusual distributions of letters across the sections of the text, and if there are, we can begin considering appropriate methods of transposing those letters to get the syllables with which the <i>Magnum Opus</i> is communicated.

<img class='center-image' src='/assets/posts/pseudo-cryptography/tale_letter_distributions.png'>

Each section of the <i>Tale</i> is given a consistent color in this plot, so if any section contains an unusual proportion of any particular letter(s), we should expect to see a wider distribution of frequencies for that letter or those letters. Much to the would-be alchemist’s chagrin, however, the plot above indicates that there are no letters in the Tale that have wildly aberrant distributions, which effectively closes the book on the second riddle.

Riddle Three: "Whoever will . . . calculate the whole Number of each Letter in this Treatise, and sum up the Difference exactly between the several Numbers, assigning the true natural Cause for every such Difference; the Discoveries in the Product, will plentifully reward his Labour." We can easily calculate the number of times each letter occurs in Swift’s <i>Tale</i>:

<img class='center-image' src='/assets/posts/pseudo-cryptography/tale_raw_letter_freqs.png'>

Using these frequencies, Swift suggests, one can find "the Discoveries in the Product," which value "will plentifully reward his Labour." He leaves it comically unclear what is meant by "the Product," though: does he mean the product of the difference between each letter and each other letter, or the product between the difference of each letter and the "whole Number of each Letter in this Treatise", or some other mad metric?

Regardless of the answer to this question, it seems clear that Swift means these riddles to be ludic and satirical, rather than genuine encryptions. My question for readers is: who or what is Swift parodying here? Are there other texts from the period that purport to contain hidden messages in their letter counts? I ask not only because I'm fascinated by early modern ciphers, but because I want to have a fuller understanding of the specific works with which Swift was working in these delightfully flippant passages.

<div class='center-text'>* * *</div>

The analysis above was conducted using the [1710 edition][tale] of the Tale digitized by Lehigh University.  The visualizations were produced with [Pyplot][pyplot] using [these scripts][scripts].

[tale]:http://www.lehigh.edu/~amsp/tubb0-0.html
[pyplot]:http://matplotlib.org/api/pyplot_api.html
[scripts]:/assets/scripts/posts/pseudo-cryptography/swift_tale_scripts.zip