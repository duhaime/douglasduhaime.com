---
layout: post
title: Making Chiptunes with Markov Models
date: 2021-09-05
categories: posts
thumbnail: /assets/posts/markov-midi/markov-midi-thumb.png
banner: /assets/posts/markov-midi/markov-midi-thumb.png
thumbnail_color: '1aa432'
css: /assets/posts/markov-midi/markov-midi.css
js:
  - /assets/posts/markov-midi/js/midi.js
  - /assets/posts/markov-midi/js/markov.js
  - /assets/posts/markov-midi/js/player.js
---

## Building Markov Models

To better understand Markov models, let's start with a simple text generation task. Our goal will be to train a model using the writings of William Shakespeare, then to generate new pseudo-Shakespearean text with that trained model. We can download the training data with the following command:

{% highlight bash %}
wget https://bit.ly/tiny-shakespeare
{% endhighlight %}

If you open that file, you'll see it contains the raw text from Shakespeare's plays. Here are the first few lines:

```
First Citizen:
Before we proceed any further, hear me speak.

All:
Speak, speak.

First Citizen:
You are all resolved rather to die than to famish?

All:
Resolved. resolved.
```

As you can see, the text follows a regular format in which a character's name immediately precedes their speech. To help our Markov model recognize these character speech boundaries, let's add START and END tokens before and after each speech, like so:

{% highlight python %}
from collections import defaultdict

# read the file
text = open('tiny-shakespeare.txt').read()
# add START before each speech and END after
formatted = text.replace('\n\n', ' END \n\nSTART ')
# create the full training data string
training_data = 'START ' + formatted + ' END'
{% endhighlight %}

If you print `training_data`, you'll see that it includes the word START before each speech and the word END after each speech:

```
START First Citizen:
Before we proceed any further, hear me speak. END

START All:
Speak, speak. END

START First Citizen:
You are all resolved rather to die than to famish? END

START All:
Resolved. resolved. END
```

Those START and END tokens will help the Markov model know what a proper speech looks like so it can create new speeches that have the same format as our training speeches.

Having prepared the training data, we can now train our Markov model. To do so, we just need to build up a dictionary in which we map each word to the list of words by which it is followed. For example, given the sequence `1 2 1 3`, our dictionary would look like: `{1: [2,3], 2: [1]}`. This dictionary tells us that the value 1 is followed by 2 and 3, while the value 2 is followed by only 1. (The value 3 is not followed by anything, because it's the last token in our sequence.) Let's build this dictionary using our Shakespearean text data:

{% highlight python %}
from collections import defaultdict

# split our training data into a list of words
words = training_data.split(' ')
# next_words will store the list of words that follow a word
next_words = defaultdict(list)
# examine each word up to but not including the last
for word_index, word in enumerate(words[:-1]):
  # indicate that the first word is followed by the next
  next_words[word].append( words[word_index+1] )
{% endhighlight %}

That's all it takes to train a Markov model!

Now for the fun part. Let's use the model to generate new speeches. To do so, we'll run the following loop 100 times. First we'll randomly select a word that follows the START token. Character names always follow the START token, so the first word in each speech will contain a character's name. Then we'll randomly select one of the words that appears after that character's name. If our character is Claudius, in this step we'll randomly select one of the words that immediately follows the word Claudius (i.e. one of the words with which Cladius begins one of his speeches). Then we'll randomly sample a word that follows that last word. We'll carry on in this way until we hit an END token, at which point we conclude the speech. We can implement this operation in code as follows:

{% highlight python %}
import random

# generate 100 samples from the model
for i in range(100):
  # initialize a string that will store our output
  output = ''
  # select a random word that follows START
  word = random.choice(next_words['START'])
  # continue selecting the next word until we hit the END marker
  while word != 'END':
    # add the current word to the output
    output += word + ' '
    # get the next word in the sequence
    word = random.choice(next_words[word])
  # display out the output
  print(output.strip(), '\n')
{% endhighlight %}

The output should read like an lunatic muttering Shakespearan nonsense:

<div id='shakespeare-target' class='highlight'>
BUCKINGHAM:<br/>
Upon the way to see.<br/>
I have vouchsafed,<br/>
With your promise pass'd:<br/>
I do you confine yourself desired of your favour,<br/>
I do foretell of mine.<br/>
<br/>
MARCIUS:<br/>
May these men should say you must<br/>
change this second Grissel,<br/>
And Roman camp conduct him with your soul<br/>
</div>

<button id='shakespeare-button'>Mutter!</button>

<script>
fetch('/assets/posts/markov-midi/tiny-shakespeare.txt')
  .then(r => r.text())
  .then(text => {
    // format the text
    text = 'START ' + text.replaceAll('\n\n', ' END \n\nSTART ') + ' END';
    // build model
    var model = new Markov(text, sequenceLength=2);
    // sample
    var button = document.querySelector('#shakespeare-button');
    var target = document.querySelector('#shakespeare-target');
    button.addEventListener('click', function() {
      target.innerHTML = model
        .sample(length=1000)
        .split('START ')
        .filter(i => i.length > 50)
        .slice(1, 3)
        .map((s, sidx) => {
          s = s
            .replaceAll('\n', '<br/>')
            .replaceAll('END', '')
            .trim()
          if (sidx == 1) { // remove trailing linebreaks
            while (s.substring(s.length-5, s.length) == '<br/>') {
              s = s.substring(0, s.length-5)
            }
          }
          return s;
        })
        .join('');
    })
  })
</script>

The generated text looks vaguely Shakespearean! Next let's see if we can train some Markov models that generate vaguely musical expressions.

## Making Music with Markov Models

As it turns out, we can use essentially the same strategy we used above to generate music with Markov models. To do so, we just need to convert an audio file into a text file. To accomplish this goal, we can parse a midi file and convert each note into a word in that file. The fantastic [`music21`](https://web.mit.edu/music21/) library in Python, written by Michael Scott Cuthbert's lab at MIT, makes this task fairly strightforward. In what follows below, we'll convert `ambrosia.midi`, a banger from the 8-bit Nintendo game Ultima III: Exodus, into a string. [Here's the midi file](https://douglasduhaime.com/assets/posts/markov-midi/midis/mid/ambrosia.midi), and here's how we'll convert it into a string:

{% highlight python %}

import music21

# identify the midi file to analyze
path = 'ambrosia.midi'
# parse the musical information stored in the midi file
score = music21.converter.parse(path, quantizePost=False)
# create the string that will store the sequence of notes
s = ''
# keep a record of the last time offset seen in the score
last_offset = 0
# iterate over each note in the score
for n in score.flat.notes:
    # handle the case that n is a note
    if isinstance(n, music21.note.Note):
        # measure the time between this note and the previous
        delta = n.offset - last_offset
        # if some time elapsed, add a "wait" token
        if delta: s += 'w_{} '.format(delta)
        # else add a "note" token with pitch and duration
        pitch = n.pitch.midi
        duration = n.duration.components[0].type
        s += 'n_{}_{} '.format(pitch, duration)
        # store the time at which the last event occurred
        last_offset = n.offset

{% endhighlight %}

The block above turns `ambrosia.midi` into the string `s`. Each note in `ambrosia.midi` is represented by a token that begins with "n_" and each pause between notes is represented by a token that begins with "w_". This string format is quite flexible, and can handle polyphony, syncopation, and any number of other musical features with ease.

To determine if this conversion worked, let's reverse the process and convert the string `s` into a new midi file. If both conversions were successful, we should expect that new midi file to sound like the original `ambrosia.midi` file. Happily `music21` makes the conversion from string to midi straightforward as well:

{% highlight python %}

from fractions import Fraction

# initialize the stream into which we'll add notes
stream = music21.stream.Stream()
# keep track of the last observed time
time = 1
# iterate over each token in our string
for i in s.split():
    # if the token starts with 'n' it's a note
    if i.startswith('n'):
        # identify the note and its duration
        note, duration = i.lstrip('n_').split('_')
        # create a new note object
        n = music21.note.Note(int(note))
        # specify the note's duration
        n.duration.type = duration
        # add the note to the stream
        stream.insert(time, n)
    # if the token starts with 'w' it's a wait, or pause
    elif i.startswith('w'):
        # add the wait duration to the current time
        time += float(Fraction(i.lstrip('w_')))
# save the stream as a midi file named 'converted.midi'
stream.write('midi', 'converted.midi')

{% endhighlight %}

The resulting midi file should indeed sound like the original:

<div class='midi-block'>
  <img src='/assets/posts/markov-midi/midis/images/ambrosia.png'>
  <div class='icon play-button' data-id='ambrosia.midi'>
    <img src='/assets/posts/markov-midi/images/play.svg'>
  </div>
</div>

Now we're rolling! From here, all we have to do is convert a bunch of midi files into strings, add START and END tokens before and after each (to mark song boundaries), and train a Markov model on that text stream.

There are a few other curliques (we should probably only process songs in one time signature, say 4/4, and we should convert all songs to C major )






Mozart

<div class='midi-block'>
  <img src='https://via.placeholder.com/600x80'>
  <div class='icon play-button' data-id='mozart.txt'>
    <img src='/assets/posts/markov-midi/images/play.svg'>
  </div>
</div>

Chopin

<div class='midi-block'>
  <img src='https://via.placeholder.com/600x80'>
  <div class='icon play-button' data-id='chopin.txt'>
    <img src='/assets/posts/markov-midi/images/play.svg'>
  </div>
</div>

Bach

<div class='midi-block'>
  <img src='https://via.placeholder.com/600x80'>
  <div class='icon play-button' data-id='bach.txt'>
    <img src='/assets/posts/markov-midi/images/play.svg'>
  </div>
</div>

Lakh

<div class='midi-block'>
  <img src='https://via.placeholder.com/600x80'>
  <div class='icon play-button' data-id='lakh.txt'>
    <img src='/assets/posts/markov-midi/images/play.svg'>
  </div>
</div>

Tokens

<div class='midi-block'>
  <img src='https://via.placeholder.com/600x80'>
  <div class='icon play-button' data-id='constrained.txt'>
    <img src='/assets/posts/markov-midi/images/play.svg'>
  </div>
</div>