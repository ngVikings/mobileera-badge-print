var fs = require('fs')


var XLSX = require('xlsx');
var workbook = XLSX.readFile('3908008463.xls');
var worksheet = workbook.Sheets[workbook.SheetNames[0]]; 
var participants = XLSX.utils.sheet_to_json(worksheet);

var yaml = require('node-yaml');
var speakers = yaml.readSync('data/speakers-data.yml');
var schedules = yaml.readSync('data/schedule-data.yml');
var sessions = yaml.readSync('data/sessions-data.yml');

var PDFDocument = require('pdfkit');
var qr = require('qr-image')

// Create a document
doc = new PDFDocument({
   size: 'A6',
   autoFirstPage: false
});
doc.pipe(fs.createWriteStream('badges.pdf'));

// Embed a font, set the font size, and render some text

for (var participant of participants) {
   var fullName = participant['Fornavn'] + " " + participant["Etternavn"];
   var contactCard = fullName + " <" + participant["Epost"] + ">";
   var sessionInfo = null;
   //console.log(participant['Company'] + " " + participant["Epost"]);

   var ticketName = participant['Billettkategori'];
   var categoryName = ticketName;
   if (ticketName.indexOf('Blind Bird') === 0) {
      categoryName = 'Normal';
   } else if (ticketName.indexOf('Early Bird') === 0) {
      categoryName = 'Normal';
   } else if (ticketName.indexOf('Late Bird') === 0) {
      categoryName = 'Normal';
   } else if (ticketName.indexOf('Directly invoiced tickets') === 0) {
      categoryName = 'Normal';
   } else if (ticketName.indexOf('Free Marketing Ticket') === 0) {
      categoryName = 'Normal';
   } else if (ticketName.indexOf('Sponsorship included ticket') === 0) {
      categoryName = 'Normal';
   } else if (ticketName.indexOf('ONLY FOR CFP SUBMISSIONS: Early Bird speaker candidate') === 0) {
      categoryName = 'Normal';
   } else if (ticketName.indexOf('Mobile Era Speaker') === 0) {
      categoryName = 'Speaker';

      var speakerObj = null;
      for (var speaker of speakers) {
         if (speaker.name === participant['Fornavn'] && speaker.surname === participant['Etternavn']) {
            speakerObj = speaker;
         }
      }
      if (speakerObj) {
         var sessionObj = null;
         for (var session of sessions) {
            if (session.speakers && session.speakers.indexOf(speakerObj.id) >= 0) {
               sessionObj = session;
            }
         }
         if (sessionObj) {
            var timeInfo = null;
            for (var schedule of schedules) {
               for (var timeslot of schedule.timeslots) {
                  if (!timeslot.sessionIds) continue;
                  var sessionIndex = timeslot.sessionIds.indexOf(sessionObj.id);
                  if (sessionIndex >= 0) {
                     timeInfo = schedule.dateReadable + " " + timeslot.startTime + " in " + schedule.tracks[sessionIndex].title;
                  }
               }               
            }
            if (timeInfo) {
               sessionInfo = sessionObj.title + " " + timeInfo;
            } else {
               console.log("Unscheduled speaker " + fullName);
            }
         } else {
            console.log("unknown session for speaker " + fullName);
         }
      } else {
         console.log("Unknown speaker " + fullName);
      }
   } else {
      console.log("Unknown category " + categoryName);
   }

   doc
      .addPage()
      .image('images/Mobile era oslo 2016 white-01.jpg')
      .font('fonts/PalatinoBold.ttf')
      .fontSize(15);
   doc.text(fullName, 100, 200)
      .text(categoryName);
   if (sessionInfo) {
      doc.fontSize(10).text(sessionInfo);
   }
   doc.image(qr.imageSync(contactCard, {type: 'png'}), {
         width: 60
      })
}


// Finalize PDF file
doc.end();
