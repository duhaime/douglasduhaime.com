---
layout: post
title:  Visualizing Shakespearean Characters
date:   2015-12-13
categories: digital-humanities python d3
css: /assets/posts/shakespearean-characters/shakespeare.css
js: 
  - http://d3js.org/d3.v3.min.js
  - http://code.jquery.com/jquery-1.7.2.min.js
  - /assets/posts/shakespearean-characters/character-words.js
  - /assets/posts/shakespearean-characters/min-max-words.js
  - /assets/posts/shakespearean-characters/min-max-entrances.js
  - /assets/posts/shakespearean-characters/shakespeare-cooccurrence.js
thumbnail: /assets/posts/shakespearean-characters/shakespearean-characters-thumb.jpg
banner: /assets/posts/shakespearean-characters/shakespearean-characters-banner.png
---

Some time ago, I was intrigued to discover that Shakespeare’s Histories have a noticeable lack of female characters [[link]][previous-shakes-post]. Since then, I’ve been curious to further explore the nuances of Shakespearean characters, paying particular respect to the gender dynamics of the Bard’s plays. This post is a quick sketch of some of the insights to which that curiosity has led.

To get a closer look at Shakespeare’s characters, I ran some analysis on the Folger Shakespeare Library’s gold-standard set of Shakespearean texts [[link]][folger-digital-library], all of which are encoded in fantastic XML markup that captures a number of character-level attributes, including gender. Using that markup, I extracted data for each character in Shakespeare’s plays, and then scoured through those features in search of patterns. All of the characters with an identified gender in this dataset are plotted below (mouseover for character name and source play):

<!-- Words Spoken by Character Entrance Plot -->
<div id='character-words' class='chart'></div>

Looking at this plot, we can see that the most prominent characters in Shakespearean drama are almost all well-known, titular males. There is also a noticeable inverse-relationship between a character’s prominence and the point in the play wherein that character is introduced. Looking more closely at the plot, I’ve further noticed that Shakespeare was curiously consistent in his treatment of characters who appear in multiple plays. In both <i>1 Henry IV</i> and <i>2 Henry IV</i>, for instance, Falstaff is given ~6,000 words and is introduced only a few hundred words into the work. Looking at the long tail, by contrast, one finds that among the outspoken characters introduced after the ~15,000 word mark—including Westmoreland and Bedford in <i>2 Henry IV</i>, and Cade, Clifford, and Iden from <i>2 Henry VI</i>—nearly all hail from Histories.

While the plot above gives one a birds’ eye view of Shakespeare’s characters, the plot doesn’t make it particularly easy to differentiate male and female character dynamics. As a step in this direction, the plot below visualizes character entrances by gender for each of Shakespeare's plays:

<!-- first and last entrance by gender plot -->
<div id='min-max-entrance' class='chart'></div>

Examining at the distribution along the x-axis, we can see that male characters consistently enter the stage before female characters. An exception to this general rule may be found in the Comedies, as plays like <i>Taming of the Shrew</i>, <i>All’s Well that Ends Well</i>, and <i>Midsummer Nights’ Dream</i> begin with female characters on stage. Looking at the distribution along the y-axis, we can also see that for most plays, male characters continue to be introduced on stage long after the last female characters have been introduced.

Given the plots above, some might conclude that Shakespeare privileged male characters over female characters, as he introduced the former earlier and tended to give them more lines. There is evidence in the plays, however, that points in the opposite direction. Looking at Shakespeare’s minor characters, we see that the smallest and least significant roles in each play were almost universally assigned to males:

<!-- min and max words by gender plot -->
<div id='min-max-words' class='chart'></div>

Here we see that even important males characters such as Fleance in <i>Macbeth</i> and Cornelius in <i>Hamlet</i> are given very few lines indeed, and the smallest female roles are consistently given more lines than the smallest male roles.

In sum, the plots above show that a number of heretofore undisclosed patterns emerge when we analyze Shakespeare’s characters in the aggregate. However, the plots above don’t show the connections between characters. One way to investigate these interconnections is through a co-occurrence matrix, in which each cell represents the degree to which two characters appear on stage concurrently:

<!-- character cooccurrence plot -->
<div class='selection-menu'>
  <div class='select-container'>
    <span>Play:</span>
    <select class='play-menu' id='selected-json'>
      <option value='1H4.json'>Henry_IV_i</option>
      <option value='Ant.json'>Antony_And_Cleopatra</option>
      <option value='MND.json'>Midsummer-Nights_Dream</option>
      <option value='AWW.json'>Alls_Well</option>
      <option value='Cor.json'>Coriolanus</option>
      <option value='Cym.json'>Cymbeline</option>
      <option value='Ham.json'>Hamlet</option>
      <option value='JC.json'>Julius_Caesar</option>
      <option value='Lr.json'>King_Lear</option>
      <option value='LLL.json'>Loves_Labours_Lost</option>
      <option value='Mac.json'>Macbeth</option>
      <option value='MM.json'>Measure_For_Measure</option>
      <option value='Ado.json'>Much_Ado</option>
      <option value='Oth.json'>Othello</option>
      <option value='Per.json'>Pericles</option>
      <option value='Rom.json'>Romeo_And_Juliet</option>
      <option value='Err.json'>Comedy_Of_Errors</option>
      <option value='Jn.json'>King_John</option>
      <option value='MV.json'>Merchant_Of_Venice</option>
      <option value='Wiv.json'>Merry_Wives_Of_Windsor</option>
      <option value='Shr.json'>Taming_Of_The_Shrew</option>
      <option value='Tmp.json'>Tempest</option>
      <option value='TGV.json'>Two_Gentlemen_Of_Verona</option>
      <option value='TNK.json'>Two_Noble_Kinsmen</option>
      <option value='WT.json'>Winters_Tale</option>
      <option value='Tim.json'>Timon_Of_Athens</option>
      <option value='Tit.json'>Titus_Andronicus</option>
      <option value='Tro.json'>Troilus_And_Cressida</option>
      <option value='TN.json'>Twelfth_Night</option>
      <option value='R2.json'>King_Richard_II</option>
      <option value='R3.json'>King_Richard_III</option>
      <option value='2H4.json'>Henry_IV_ii</option>
      <option value='H5.json'>King_Henry_V</option>
      <option value='1H6.json'>Henry_VI_i</option>
      <option value='2H6.json'>Henry_VI_ii</option>
      <option value='3H6.json'>Henry_VI_iii</option>
    </select>
  </div>

  <div class='select-container'>
    <span>Order:</span>
    <select class='play-menu' id='order'>
      <option value='name'>by Name</option>
      <option value='count'>by Frequency</option>
      <option value='group'>by Cluster</option>
      <option value='gender'>by Gender</option>
    </select>
  </div>

  <div class='select-container'>
    <span>Color:</span>
    <select id='color-dropdown'>
      <option value='gender'>by Gender</option>
      <option value='cluster'>by Cluster</option>
    </select>
  </div>
</div>

<div id='cooccurrence' class='chart'></div>

<p>In this visualization, "Frequency" represents the number of times a character appears on stage, "Gender" is indicated by the markup within the Folger Shakespeare Digital Collection XML (red = female, blue = male, green = unspecified), and "Cluster" reflects the subgroup of characters with whom a given character regularly appears, as determined by a fast greedy modularity ranking algorithm. Interacting with this plot allows one to uncover a number of insights. In the first place, we can see that the Histories consistently feature more "clusters" of characters than do Comedies or Tragedies. That is to say, while Comedies tend to be wildly interconnected affairs, Histories tend to include many small, isolated groups of characters that interact rather little with each other.  Looking at the gender dynamics of these groups, we can also see that in Comedies such as <i>Merry Wives of Windsor</i> and Histories such as <i>Richard III</i> and <i>Henry V</i>, female characters tend to appear on stage together, almost creating a coherent collective over the course of the play.</p>

<p>Finally, a number of female characters—such as Queen Margaret in <i>2 Henry VI</i> and Adrianna in <i>Comedy of Errors</i>—appear on stage more frequently than any other character in their respective plays, despite the fact that they say fewer words than their respective plays' most outspoken characters. That is to say, their visual presence on stage is disproportionate to their verbal presence on stage. This raises a number of questions: To what extent were female characters meant to fulfill the role of a spectacle in Shakespearean drama? It’s difficult to imagine that the male players who acted as females projected authentic feminine voices. Did the limitations of imitative speech help mitigate the number of lines given to these prominent female characters? These and other questions remain to be explored in future work.</p> 

[previous-shakes-post]:/posts/classifying-shakespearean-drama-with-sparse-feature-sets.html
[folger-digital-library]:http://www.folgerdigitaltexts.org/
