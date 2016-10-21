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
               track: schedule.tracks[sessionIndex].title,
               company: speakerObj.company
            };
         }
      }               
   }
   return null;
}

var COMPANIES = {
   "@agens.no": "Agens",
   "@knowit.no": "KnowIT",
   "@bekk.no": "BEKK",
   "@kantega.no": "Kantega",
   "@soprasteria.com": "Sopra Steria",
   "@giantleap.no": "Giant Leap Technologies AS",
   "@hu.ibm.com": "Ustream",
   "@netlight.com": "Netlight",
   "@bouvet.no": "Bouvet",
   "@mesan.no": "Mesan", 
   "@systek.no": "Systek",
   "@apps.no": "Apps",
   "@webstep.no": "Webstep"
}

function companyName(participant) {
   var email = participant["Epost"];
   var domain = email.replace(/.*@/, "@");

   if (COMPANIES[domain]) {
      return COMPANIES[domain];
   }

   if (participant['Company']) {
      return participant['Company'];
   }

   return;
}


var IMAGES = {
   'Normal': 'images/badge-attendee.png',
   'Speaker': 'images/badge-speaker.png',
   'Volunteer': 'images/badge-volunteer.png',
   'Organizer': 'images/badge-organizer.png'
}


function createParticipant(participant, speakers, schedules, sessions) {
   var fullName = participant['Fornavn'] + " " + participant["Etternavn"];
   var company = companyName(participant);
   var sessionInfo = null;

   var ticketName = participant['Billettkategori'];
   var categoryName = "Normal";
   if (ticketName === "Organizer") {
      categoryName = "Organizer";
   } else if (ticketName === "Volunteer") {
      categoryName = "Volunteer";
   } else if (ticketName === "Mobile Era Speaker") {
      categoryName = 'Speaker';
      sessionInfo = speakerInfo(participant, speakers, schedules, sessions);
      if (!sessionInfo) {
         console.log("Unknown speaker " + fullName);
      } else {
         company = sessionInfo.company;
      }
   }

   var email = participant["Epost"];

   if (!company) {
      console.log("Could not find company name for", email, categoryName);
   }

   var image = IMAGES[categoryName];
   var contactCard = fullName + " <" + email + ">";
   if (company) {
      contactCard += " of " + company;
   }
   return { fullName, company, contactCard, categoryName, sessionInfo, image };
}

function printParticipant(doc, participant) {
   doc.addPage();
   var height = doc.page.height;
   doc.image(participant.image, 0, 0, {height, width:doc.page.width});

   if (!participant.sessionInfo) {
      var qrWidth = 40;
      doc.image(
         qr.imageSync(participant.contactCard, {type: 'png'}), 
         (doc.page.width-qrWidth)/2, height-80-qrWidth, { width: qrWidth });      
   }

   var width = doc.page.width-20;
   var margin = 10;
   doc.font('fonts/Roboto/Roboto-Bold.ttf')
      .fontSize(36)
      .fillColor("#0E1131")
      .text(participant.fullName, margin, 180, {align: "center", height, width});
   if (participant.company) {
      doc.font('fonts/Roboto/Roboto-Regular.ttf')
         .fontSize(18)
         .fillColor("#0E1131")
         .text(participant.company, {align: "center", height, width});         
   }
   var sessionInfo = participant.sessionInfo;
   if (sessionInfo) {
      doc.moveDown();
      var sessionTime = sessionInfo.date + ", " + sessionInfo.timeslot +  ", " + sessionInfo.track;
      doc.font('fonts/Roboto/Roboto-Medium.ttf')
         .fontSize(14)
         .fillColor("#0E1131")
         .text(sessionInfo.title, {align: "center", height, width});
      doc.fontSize(12)
         .fillColor("#6D6E6F")
         .text(sessionTime, {align: "center", height, width});
   }
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
