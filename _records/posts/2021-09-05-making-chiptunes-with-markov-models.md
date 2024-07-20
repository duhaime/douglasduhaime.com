---
layout: post
title: Making Chiptunes with Markov Models
date: 2021-11-02
categories: posts
thumbnail: /assets/posts/markov-midi/markov-midi-thumb.png
banner: /assets/posts/markov-midi/markov-midi-thumb.png
thumbnail_color: '1D7C2D'
css: /assets/posts/markov-midi/markov-midi.css
js:
  - /assets/posts/markov-midi/js/midi.js
  - /assets/posts/markov-midi/js/markov.js
  - /assets/posts/markov-midi/js/player.js
---

Over the last year or so, several curious circumstances sent me down the rabbit hole of algorithmic music composition. First an intriguing [question](https://stackoverflow.com/questions/61964836/classifying-64x4-images-representing-piano-rolls-as-real-or-fake) on classifying genuine and fake piano rolls, then a brilliant professor writing [an opera on the life of Alan Turing](https://dhlab.yale.edu/projects/i-am-alan-turing/), and finally a gifted graduate student asking probing questions about OpenAI's [VQ-VAE model](https://arxiv.org/abs/2005.00341) all made me increasingly interested in generating music with machine learning. After I shared some early results from my explorations, a few friends were interested in learning more. This post is my attempt to share some of the paths I've been pursuing, and to lay out some relatively easy ways to get started with automatic music generation.

To keep things as simple as possbile, the post below describes how one can use basic Markov models to generate MIDI audio. We'll first examine how Markov models work by building a simple text generation model in a dozen or so lines of Python. Then we'll discuss how one can convert MIDI data to text sequences, which will let us use the same Markov model approach to generate MIDI audio. Finally, to spice things up a bit, we'll convert our generated MIDI files into chiptune waveform audio with a disco dance beat. Let's dive in!

## Building Markov Models

While the term "Markov model" is used to describe a wide range of statistical models, essentially all Markov models follow a simple basic rule: the model generates a sequence of outputs, and each element in the sequence is conditioned only on the prior element in the sequence. Given a single word, a Markov model can [predict the next word](https://medium.com/hackernoon/from-what-is-a-markov-model-to-here-is-how-markov-models-work-1ac5f4629b71) in the sequence. Given a pixel, a Markov model can [predict the next pixel](https://jonnoftw.github.io/2017/01/18/markov-chain-image-generation) in the sequence. Given an item in a sequence, a Markov model can predict the next item in the sequence.

As an example, let's build a Markov model that can accomplish a simple text generation task. Our goal will be to train a model using the plays of William Shakespeare, then to use that model to generate new pseudo-Shakespearean play text. We'll train our model using [tiny-shakespeare.txt](https://douglasduhaime.com/assets/posts/markov-midi/tiny-shakespeare.txt), a single file that contains raw text from Shakespeare's plays. Here are the first few lines from the file:

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

As you can see, the text follows a regular format in which a character's name immediately precedes their speech. To help our model recognize these character speech boundaries, let's add START and END tokens before and after each speech, like so:

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

Those START and END tokens will help our model know what a proper speech looks like so it can create new speeches that have the same format as our training speeches.

Having prepared the training data, we can now train our model. To do so, we just need to build up a dictionary in which we map each word to the list of words by which it is followed. For example, given the sequence `1 2 1 3`, our dictionary would look like this: `{1: [2,3], 2: [1]}`. This dictionary tells us that the value 1 is followed by 2 and 3, while the value 2 is followed by only 1. The value 3 is not followed by anything, because it's the last token in our sequence. Let's build this dictionary using our Shakespearean text data:

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

If we examine `next_words`, we'll find that it maps each key to the list of words by which it is followed. The values of this dictionary contain duplicates by design. If the word "to" is followed by the word "be" often but is only followed by the word "suffer" once, then given the word "to", our model should be more likely to predict "be" than "suffer". In slightly fancier parlance, our `next_words` dictionary represents the weighted probabilities of a particular word following another particular word. To generate new sequences, we'll simply sample from those weighted probabilities and piece together a sequence of text word by word.

Now for the fun part. Let's use the model to generate new speeches. To do so, we'll run the following loop 100 times. First we'll randomly select a word that follows the START token. Character names always follow the START token, so the first word in each speech will contain a character's name. Then we'll use `next_words` to randomly select one of the words that appears after the selected character's name. For example, if our selected character is "Claudius", in this step we'll randomly select one of the words that immediately follows the word "Claudius" (i.e. one of the words with which Cladius begins one of his speeches). Then we'll randomly sample a word that follows that last word. We'll carry on in this way until we hit an END token, at which point we conclude the speech. We can implement this operation in code as follows:

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

That's all it takes to sample from a Markov model! The output of that block should read like a collection of lunatics muttering Shakespearan nonsense:

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

<button id='shakespeare-button'>Sample</button>

<script>
function get(url, handleSuccess) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
      if (xmlhttp.status === 200) {
        if (handleSuccess) handleSuccess(xmlhttp.responseText)
      }
    };
  };
  xmlhttp.open('GET', url, true);
  xmlhttp.send();
};

setTimeout(function() {
  get('/assets/posts/markov-midi/tiny-shakespeare.txt', function(text) {
    // format the text
    text = 'START ' + text.replaceAll('\n\n', ' END \n\nSTART ') + ' END';
    // build model
    var model = new Markov(text, {sequenceLength: 2});
    // sample
    var button = document.querySelector('#shakespeare-button');
    var target = document.querySelector('#shakespeare-target');
    button.addEventListener('click', function() {
      target.innerHTML = model
        .sample(length=1000)
        .split('START ')
        .filter(function(i) { return i.length > 50 })
        .slice(1, 3)
        .map(function(s, sidx) {
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
}, 500)
</script>

The generated text looks pseudo-Shakespearean! Next let's see if we can train some Markov models that generate musical expressions.

## Making Music with Markov Models

As it turns out, we can use essentially the same strategy we used above to generate music with Markov models. To do so, we just need to convert an audio file into a text file. To accomplish this goal, we can parse a midi file and convert each note in the file into a word. The fantastic [music21](https://web.mit.edu/music21/) library in Python written by [Michael Scott Cuthbert](https://mta.mit.edu/person/michael-scott-cuthbert)'s lab at MIT makes this task fairly strightforward. We can install music21 and all the dependencies we'll use below as follows:

```
pip install music21==7.1.0
pip install nltk==3.6.2
pip install pretty-midi==0.2.9
pip install scipy==1.4.0
pip install https://github.com/duhaime/nesmdb/archive/python-3-support.zip
```

After installing music21, we can use the function below to convert `ambrosia.midi` (a charming melody from the 8-bit Nintendo game Ultima III) into a string. [Here's the midi file](https://douglasduhaime.com/assets/posts/markov-midi/midi/ambrosia.midi), and here's how we'll convert it into a string:

{% highlight python %}

from music21.note import Note
import music21

def midi_to_string(midi_path):
  # parse the musical information stored in the midi file
  score = music21.converter.parse(
    midi_path,                     # set midi file path
    quantizePost=True,             # quantize note length
    quarterLengthDivisors=(4,3))   # set allowed note lengths
  # s will store the sequence of notes in string form
  s = ''
  # keep a record of the last time offset seen in the score
  last_offset = 0
  # iterate over each note in the score
  for n in score.flat.notes:
    # measure the time between this note and the previous
    delta = n.offset - last_offset
    # get the duration of this note
    duration = n.duration.components[0].type
    # store the time at which this note started
    last_offset = n.offset
    # if some time elapsed, add a "wait" token
    if delta: s += 'w_{} '.format(delta)
    # add tokens for each note (or each note in a chord)
    notes = [n] if isinstance(n, Note) else n.notes
    for i in notes:
      # add this keypress to the sequence
      s += 'n_{}_{} '.format(i.pitch.midi, duration)
  return s

s = midi_to_string('ambrosia.midi')

{% endhighlight %}

The block above turns ambrosia.midi into the string `s`. Within that string, each note in ambrosia.midi is represented by a token that begins with "n_" and each pause between notes is represented by a token that begins with "w_". If we print `s` we can see the string representation of our MIDI data more clearly:

{% highlight python %}
>>> print(s)
w_1.0
n_65_quarter
n_38_half
w_0.5
n_62_eighth
...
{% endhighlight %}

This string indicates that the file begins with a full bar of rest. Next we play notes 65 and 38 for a quarter bar and half bar respectively, then wait half a bar, then play note 62 for an eighth bar, and so on. In this way, using just two token types ("n_" tokens and "w_" tokens) we can record each keystroke that should be played as well as the durations of time between those keystrokes. We leave note durations in fractional form to prevent floating point truncation.

To test if this conversion worked, let's reverse the process and convert the string `s` into a new midi file. If both conversions were successful, we should expect that new midi file to sound like the original ambrosia.midi file. Happily `music21` makes the conversion from string to midi straightforward as well:

{% highlight python %}

from fractions import Fraction

def string_to_midi(s):
  # initialize the sequence into which we'll add notes
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
    # if the token starts with 'w' it's a wait
    elif i.startswith('w'):
      # add the wait duration to the current time
      time += float(Fraction(i.lstrip('w_')))
  # return the stream we created
  return stream

midi = string_to_midi(s)

{% endhighlight %}

As you can see, the block above simply reverses the operations performed in `midi_to_string`, converting each token into a midi note. The resulting midi file should indeed sound like the midi with which we started:

<div class='midi-block'>
  <img src='/assets/posts/markov-midi/images/ambrosia.png'>
  <div class='icon play-button'>
    <audio id='ambrosia-mp3' src='/assets/posts/markov-midi/mp3/ambrosia.mp3'></audio>
    <img src='/assets/posts/markov-midi/images/play.svg'>
  </div>
</div>

Now we're rolling! From here, all we have to do train a Markov model on the string representation of our MIDI file. To do so, let's transform the Markov model we used above into a reusable function:

```python
from collections import defaultdict
from nltk import ngrams
import random

def markov(s, sequence_length=6, output_length=250):
  # train markov model
  d = defaultdict(list)
  # make a list of lists where sublists contain word sequences
  tokens = list(ngrams(s.split(), sequence_length))
  # store the map from a token to its following tokens
  for idx, i in enumerate(tokens[:-1]):
    d[i].append(tokens[idx+1])
  # sample from the markov model
  l = [random.choice(tokens)]
  while len(l) < output_length:
    l.append(random.choice(d.get(l[-1], tokens)))
  # format the result into a string
  return ' '.join([' '.join(i) for i in l])

# sample a new string from s then convert that string to midi
generated_midi = string_to_midi(markov(s))
# save the midi data in "generated.midi"
generated_midi.write('midi', 'generated.midi')
```

If we run the `markov` function we'll get a new string that contains a sequence of notes expressed in text form. We can then then convert that string to a proper midi file using the `string_to_midi` function we defined above. The result sounds like a pair of drunken sailors wailing away on a piano:

<div class='midi-block'>
  <img src='/assets/posts/markov-midi/images/generated.png'>
  <div class='icon play-button'>
    <audio id='generated-mp3' src='/assets/posts/markov-midi/mp3/generated.mp3'></audio>
    <img src='/assets/posts/markov-midi/images/play.svg'>
  </div>
</div>

The good news is if you don't like that audio you can just rerun the `markov` function until you get a keeper. Before you banish our sample, though, let's try pushing it through the chiptune meat grinder we'll write below.

## Markov Models Meet Chiptunes

[Chris Donahue](https://chrisdonahue.com/), a brilliant postdoc in Computer Science at Stanford University, accomplished the Herculean task of converting the original 8-bit Nintendo synthesizer, or "audio processing unit", into a simple API exposed in the Python package [nesmdb](https://github.com/chrisdonahue/nesmdb). Nesmdb exports a function `midi_to_wav` that converts a midi file into nostalgic 8-bit audio that captures the raw energy of the original NES soundtracks. In what follows below, we'll use that function to convert a midi file to chiptune waveform audio.

{% highlight python %}

from pretty_midi import Instrument as Tone
from nesmdb.convert import midi_to_wav
from music21.note import Note
import pretty_midi, math, scipy

def midi_to_nintendo_wav(midi_path, length=None, scalar=0.3):
  # create a list of tones and the time each is free
  tones = [Tone(0, name=n) for n in ['p1', 'p2', 'tr', 'no']]
  for t in tones: t.free = 0
  # get the start and end times of each note in `midi_path`
  score = music21.converter.parse(midi_path)
  for n in score.flat.notes[:length]:
    for i in [n] if isinstance(n, Note) else n.notes:
      start = n.offset * scalar
      end = start + (n.seconds * scalar)
      # identify the index position of the first free tone
      tone_index = None
      for index, t in enumerate(tones[:3]):
        if t.free <= start:
          if tone_index is None: tone_index = index
          t.free = 0
      if tone_index is None: continue
      tones[tone_index].free = end
      # play the midi note using the selected tone
      tones[tone_index].notes.append(pretty_midi.Note(
        velocity=10,
        pitch=i.pitch.midi,
        start=start,
        end=end))
  # add drums: 1 = kick, 8 = snare, 16 = high hats
  for i in range(math.ceil(end * 8)):
    note = tones[3].notes.append(pretty_midi.Note(
      velocity=10,
      pitch=1 if (i%4) == 0 else 8 if (i%4) == 2 else 16,
      start=(i/2 * scalar),
      end=(i/2 * scalar) + 0.1))
  midi = pretty_midi.PrettyMIDI(resolution=22050)
  midi.instruments.extend(tones)
  # store midi length, convert to binary, and then to wav
  time_signature = pretty_midi.TimeSignature(1, 1, end)
  midi.time_signature_changes.append(time_signature)
  midi.write('chiptune.midi')
  return midi_to_wav(open('chiptune.midi', 'rb').read())

# convert our generated midi sequence to a numpy array
wav = midi_to_nintendo_wav('generated.midi')
# save the numpy array as a wav file
scipy.io.wavfile.write('generated.wav', 44100, wav)
{% endhighlight %}

The original NES synthesizer supported five concurrent audio tracks: two pulse-wave tracks ("p1", "p2"), a triangle-wave track ("tr"), a noise track ("no"), and a sampling track that's not implemented in nesmdb. In the function above, we simply assign each note from the input midi file to the first unused track in our synthesizer (excluding the "no" track, which is assigned a dance beat later in the function). There are certainly more clever ways to assign notes to the synthesizer tracks, but we'll use this approach for the sake of simplicity. Here are some sample results:

<div class='row'>
  <audio id='generated-0' src='/assets/posts/markov-midi/mp3/0.mp3' controls preload='auto'></audio>
  <audio id='generated-1' src='/assets/posts/markov-midi/mp3/1.mp3' controls preload='auto'></audio>
</div>

<div class='row'>
  <audio id='generated-2' src='/assets/posts/markov-midi/mp3/2.mp3' controls preload='auto'></audio>
  <audio id='generated-3' src='/assets/posts/markov-midi/mp3/3.mp3' controls preload='auto'></audio>
</div>

<div class='row'>
  <audio id='generated-4' src='/assets/posts/markov-midi/mp3/4.mp3' controls preload='auto'></audio>
  <audio id='generated-5' src='/assets/posts/markov-midi/mp3/5.mp3' controls preload='auto'></audio>
</div>

<div class='row'>
  <audio id='generated-6' src='/assets/posts/markov-midi/mp3/6.mp3' controls preload='auto'></audio>
  <audio id='generated-7' src='/assets/posts/markov-midi/mp3/7.mp3' controls preload='auto'></audio>
</div>

<div class='row'>
  <audio id='generated-8' src='/assets/posts/markov-midi/mp3/8.mp3' controls preload='auto'></audio>
  <audio id='generated-9' src='/assets/posts/markov-midi/mp3/9.mp3' controls preload='auto'></audio>
</div>

<div class='row'>
  <audio id='generated-10' src='/assets/posts/markov-midi/mp3/10.mp3' controls preload='auto'></audio>
  <audio id='generated-11' src='/assets/posts/markov-midi/mp3/11.mp3' controls preload='auto'></audio>
</div>

If you're curious to try making your own audio, feel free to try this [Colab notebook](https://colab.research.google.com/drive/1sFzItp1ZdQr_eKpDMpHb0dlsWorDxkrP?usp=sharing), which will download the `ambrosia.midi` file and process it using the steps discussed above. There's a cell in that notebook to make it easier to upload custom MIDI files for processing as well.

## Going Further with Markov-Generated MIDI

The foregoing discussion is meant only to serve as a relatively straightforward way to get started generating audio with Markov models. We've barely scratched the surface of what's possible though. If you get interested in automatic music generation, you might want to experiment with more sophisticated text sampling techniques, such as an [LSTM Network](https://keras.io/examples/generative/lstm_character_level_text_generation/) or a transformer model like [GPT2](https://github.com/minimaxir/gpt-2-simple). It could also be interesting to train your model with a larger collection of data, such as Colin Raffel's [Lakh MIDI Dataset](https://colinraffel.com/projects/lmd/#get) (possibly stripping the drum tracks and transposing each training file to a common relative major to prevent overfitting).

If you generate some fun audio using some of these techniques, please feel free to get in touch! I'd love to hear from you.

<div class='center-text'>* * *</div>

I would like to thank Christine Mcleavey, whose [<i>Clara</i> project](http://christinemcleavey.com/clara-a-neural-net-music-generator/
) first introduced me to the idea of transforming MIDI files into text data, and Professor [Matthew Suttor](https://www.drama.yale.edu/bios/matthew-suttor-2/) in Yale's School of Drama, whose opera <i>I Am Alan Turing</i> has inspired me to continue pursuing algorithmic music composition.