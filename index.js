var fs = require('fs')

var yaml = require('node-yaml');
var speakers = yaml.readSync('data/speakers-data.yml');
var schedules = yaml.readSync('data/schedule-data.yml');
var sessions = yaml.readSync('data/sessions-data.yml');

var XLSX = require('xlsx');
var workbook = XLSX.readFile('3908008463.xls');
var worksheet = workbook.Sheets[workbook.SheetNames[0]]; 
var participantsRaw = XLSX.utils.sheet_to_json(worksheet);

function speakerInfo(participant, speakers, schedules, sessions) {
   var speakerObj = null;
   for (var speaker of speakers) {
      if (speaker.name === participant['Fornavn'] && speaker.surname === participant['Etternavn']) {
         speakerObj = speaker;
      }
   }
   if (!speakerObj) {
      return null;
   }

   var sessionObj = null;
   for (var session of sessions) {
      if (session.speakers && session.speakers.indexOf(speakerObj.id) >= 0) {
         sessionObj = session;
      }
   }
   if (!sessionObj) {
      return null;
   }

   var timeInfo = null;
   for (var schedule of schedules) {
      for (var timeslot of schedule.timeslots) {
         if (!timeslot.sessionIds) continue;
         var sessionIndex = timeslot.sessionIds.indexOf(sessionObj.id);
         if (sessionIndex >= 0) {
            return {
               title: sessionObj.title,
               date: schedule.dateReadable,
               timeslot: timeslot.startTime,
               track: schedule.tracks[sessionIndex].title
            };
         }
      }               
   }
   return null;
}

function createParticipant(participant, speakers, schedules, sessions) {
   var fullName = participant['Fornavn'] + " " + participant["Etternavn"];
   var contactCard = fullName + " <" + participant["Epost"] + "> of " + participant['Company'];
   var sessionInfo = null;

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
      sessionInfo = speakerInfo(participant, speakers, schedules, sessions);
      if (!sessionInfo) {
         console.log("Unknown speaker " + fullName);
      }
   } else {
      console.log("Unknown category " + categoryName);
   }
   return { fullName, contactCard, categoryName, sessionInfo };
}

function printParticipant(doc, participant) {
   doc
      .addPage()
      .image('images/Mobile era oslo 2016 white-01.jpg')
      .font('fonts/PalatinoBold.ttf')
      .fontSize(15);
   doc.text(participant.fullName, 100, 200)
      .text(participant.categoryName);
   var sessionInfo = participant.sessionInfo;
   if (sessionInfo) {
      doc.fontSize(10)
         .text(sessionInfo.title)
         .text(sessionInfo.date + " " + sessionInfo.timeslot +  " in " + sessionInfo.track);
   }
   doc.image(qr.imageSync(participant.contactCard, {type: 'png'}), {
         width: 60
      });
}


var participants = participantsRaw.map(function(participant) {
   return createParticipant(participant, speakers, schedules, sessions);
}).sort(function(a, b) {
   return a.fullName.localeCompare(b.fullName);
});


var PDFDocument = require('pdfkit');
var qr = require('qr-image')

// Create a document
doc = new PDFDocument({
   size: 'A6',
   autoFirstPage: false
});
doc.pipe(fs.createWriteStream('badges.pdf'));



for (var participant of participants) {
   printParticipant(doc, participant);
   // Back page
   printParticipant(doc, participant);
}

// Finalize PDF file
doc.end();
