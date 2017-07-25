---
layout: post
title: CRUD Operations on Static File Sites
date: 2017-04-28
description: A brief guide to using Google App script to Create, Read, Update, and Destroy database records from static file sites.
categories: javascript databases
thumbnail: /assets/posts/crud-operations/crud-operations-thumb.jpg
banner: /assets/posts/crud-operations/crud-operations-banner.png
js: /assets/posts/crud-operations/crud-operations.js
css: /assets/posts/crud-operations/crud-operations.css
---

Frameworks like Jekyll, Middleman, and Gatsby make it fun and easy to build static file websites. Static file sites are fast, flexible, and can be hosted essentially for free using something like Github Pages or Amazon Web Services' S3 service. The catch to static sites, however, is they lack any real server-side code, which makes it hard to allow users to Create, Read, Update, or Destroy (CRUD) records in a database. This post shows how one can use [Google Apps Script](https://www.google.com/script/start/) and Google Sheets to create a free dynamic backend and database for static file sites.

## Sample Application

For a quick example of the way Google App Script stores data, try the following minigame and save your score and name at the end.

<iframe id='ghost-iframe' name='ghost-iframe' style='display:none;'></iframe>

<div class='ghost-container'>
  <div class='greeting'>
    <div class='text'>Press Start</div>
    <button class='start'>Start</button>
  </div>
  <div class='game'>
    <div class='score'>Score: 0</div>
    <div class='timer'>Time: 11</div>
    <div class='instructions'>Click the ghost!</div>
  </div>
  <div class='game-over'>
    <div class='text'>Game Over</div>
    <div class='end-score'></div>
    <form target='ghost-iframe' method='post' action='https://script.google.com/macros/s/AKfycbzJhcQAb01-jNJyNhU3OOxoSga2JiTu8HhnDlChJExVJJSSGiU/exec'>
      <input class='user-name' name='name' placeholder='Enter your name' required maxlength="14">
      <input class='user-score' name='score' style='display:none'>
      <input class='save-score' type='submit' value='submit'>
    </form>
  </div>
  <div id='loader'>{% include posts/loader.html %}</div>
  <div class='ghost'></div>
</div>

If you then refresh the page and click <span id='load-scores'>this div</span> or play again, you'll see the score data persists.

## Saving Forms on Traditional Websites

Traditional websites use a server and database combination to store data like the points users achieved in a game session. Wordpress and Squarespace, for example, allow users to create, edit, or delete database items such as blog posts. These web forms send POST requests to the site's backend to create, edit, or delete appropriate entries in the site's database, and then submit GET requests to fetch data from the database so it can be shown to users.

Static file frameworks like those listed above, by contrast, do not have a backend or database, so they lack built-in support for saving user submissions. One way around this problem is to pay for a Software As A Service ("SAAS") platform such as [Formspree](https://formspree.io/) or [Formkeep](https://formkeep.com/), which will allow admins to add web forms to their sites. These services have the advantage of being supported full time by dedicated teams, but they have the disadvantage of costing money. As it turns out, however, with Google Apps Script and Google Sheets one can implement a free solution to the same problem.

## Saving Forms with Google Apps Script

Using Google Sheets and Google Apps Script, one can easily save form submissions from static file sites. To get started with this approach, let's suppose we want users to be able to submit their name and email address to sign up for a mailing list. To support this functionality, we'll make a web form, a Google Sheet to store user responses, and some Google App Script to save form submissions to the Sheet. Let's get started!

### Creating the web form

To allow users to send forms from a static site, the first thing we'll need is a form to submit. In our case we want users to be able to send their name and email addresses to sign up for a mailing list, so let's create a form with Name and Email fields:

{% highlight html %}

<form>
  <div>Name:</div>
  <input type='text' name='Name'>
  <div>Email:</div>
  <input type='text' name='Email'>
  <input type='submit' value='Submit'>
</form>

{% endhighlight %}

### Creating the Google Sheet

With our form in place, let's create a new Google Sheet to store user responses. In the spreadsheet, enter "Timestamp", "Name", and "Email" in cells A1, B1, and C1 [[example](https://docs.google.com/spreadsheets/d/1ev0FF_BOgLGrYAWpQry1lK2XiboTAVQBaQhhrVVi45s/edit?usp=sharing)]:

<img class='center-image medium' src='/assets/posts/crud-operations/google-sheet-template.png'>

### Creating the Google App Script

Given this spreadsheet, one can prepare to accept post requests by adding a little Google App Script to the sheet. To do so, go to <b>Tools &rarr; Script Editor</b>. You should see a text editor appear with a placeholder function defined. Replace the placeholder function with the following script:

{% highlight javascript %}

/**
* Save HTTP POST data to the current spreadsheet
* 
* @params: {Object} e: an event object that contains post data in e.parameters
* @returns: a success/failure object with data in event.parameters
* @documentation: https://developers.google.com/apps-script/guides/web
**/
function doPost(e) {

  try {
    writeToSheet(e);
    var result = 'success'

  } catch(error) {
    Logger.log(e);
    Logger.log(error);
    var result = 'error'
  }

  // send a success/failure message
  return ContentService.createTextOutput(JSON.stringify({
    'result': result,
    'event': e,
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
* Write the submitted form data to a given sheet
* @params: {Object} e: an event object that contains post data in e.parameters
**/
function writeToSheet(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet(); // get active sheet
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var nextRow = sheet.getLastRow()+1; // get the next row in the sheet
    var row = [ new Date() ]; // initialize row data with a timestamp

    // add each field to the row data
    // start at index = 1 because the timestamp is already added
    for (var i = 1; i < headers.length; i++) {
      if (headers[i].length > 0) {
        row.push(e.parameter[headers[i]]);
      }
    }

    // write the row data to the sheet
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
  }
  
  catch(error) {
    Logger.log(e); // log any errors
  }

  finally {
    return;
  }
}

{% endhighlight %}

This script has two main methods. `doPost()` is a [special function]((https://developers.google.com/apps-script/guides/web)) defined within Google Apps Script that is called when an app receives a HTTP POST request. `writeToSheet()` is a custom function that adds the posted data to the sheet. Together, they receive data sent through POST requests and save them to your Google Sheet.

After adding these functions to your script, click <b>Save</b> and type a name for your project when prompted. Then we need to publish the script as an app so that we can allow other web services to send POST requests to the script. To do so, one can click <b>Publish &rarr; Deploy as Web App</b>. Select "Execute the app as me", and grant "Everyone, even anonymous" access to the app, in order to allow outside web traffic to communicate with the app. Once those values are set, click <b>Deploy</b>, then click <b>Review Submissions</b> and accept the permissions. You should then see a modal that indicates your "Current web app URL". Copy this url to your clipboard and save it for later use.

### Adding the App Url to the Form

Finally, we can make our form post responses to our Sheet by modifying the form we defined above. Let's make the form submit a POST request, and let's use the "Current web app URL" from the Google Sheet as the form action: 

{% highlight html %}
<form id='google-form' method='post' action='https://script.google.com/macros/s/AKfycbyVS-FMaTegLw0tYrr00ZhOdwfHD4EYP6vwJSpdwGMywBkir9Y/exec'>
  <div>Name:</div>
  <input type='text' name='Name'>
  <div>Email:</div>
  <input type='text' name='Email'>
  <input type='submit' value='Submit'>
</form>
{% endhighlight %}

### Submitting the form

If we add a touch of CSS and render this form on a web page, we should see something like the following:

<iframe name='hidden-iframe' style='display: none'></iframe>
<form id='google-form' method='post' target='hidden-iframe' action='https://script.google.com/macros/s/AKfycbyVS-FMaTegLw0tYrr00ZhOdwfHD4EYP6vwJSpdwGMywBkir9Y/exec'>
  <div>Name:</div>
  <input type='text' name='Name'>
  <div>Email:</div>
  <input type='text' name='Email'>
  <input type='submit' value='Submit'>
</form>

If you fill out and submit the form, you should see your responses in your new spreadsheet. Voila!

<img class='center-image medium' src='/assets/posts/crud-operations/completed-form.png'>

### Submitting the form without changing the page

In the code above, we submit a sample web form and are redirected to a new page with a JSON response from the server. This is suboptimal for lots of reasons, not least because it's confusing to users accustomed to single page applications.

One traditional way around this problem is to add CORS headers to the server that's sending responses, then to use AJAX calls to fetch data from that server. In this case, however, we don't control the Google servers so can't add CORS headers to the responses.

A suitable workaround is to add a hidden iframe to the page, then specify that iframe as the 'target' for the data returned from the server:

{% highlight html %}
<iframe name='hidden-iframe' style='display: none'></iframe>
<form id='google-form' method='post' target='hidden-iframe' action='https://script.google.com/macros/s/AKfycbyVS-FMaTegLw0tYrr00ZhOdwfHD4EYP6vwJSpdwGMywBkir9Y/exec'>
  <div>Name:</div>
  <input type='text' name='Name'>
  <div>Email:</div>
  <input type='text' name='Email'>
  <input type='submit' value='Submit'>
</form>
{% endhighlight %}

If you resubmit the form, you'll now stay on the same page!

### Going Further

Google Apps Script is pretty interesting, especially for those working in static-site contexts. To read more about their services, check out their [sample applications](https://developers.google.com/apps-script/articles).