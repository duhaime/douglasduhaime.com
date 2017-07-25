///////////////////////////////////////////////////
// Google Script to handle GET and POST requests //
///////////////////////////////////////////////////

/**
* Send spreadsheet data to the client
* 
* @params: {Object} e: an event object that contains a get request event
* @returns: an object with the last 100 form submissions
* @documentation: https://developers.google.com/apps-script/guides/web
**/
function doGet(e) {

  try {
    var callback = e.parameter.callback;
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet(); // get active sheet
    var lastCol = sheet.getLastColumn();
    var data = sheet.getRange(1, 1, 100, lastCol).getValues();
    var result = 'success';

  } catch(error) {
    Logger.log(e);
    Logger.log(error);
    var result = 'error';
    var data = '';
  }

  return ContentService.createTextOutput(JSON.stringify({
    'result': result,
    'data': data,
    'event': e,
  })).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

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
    var lastCol = sheet.getLastColumn()
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