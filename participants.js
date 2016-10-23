var yaml = require('node-yaml');
var speakers = yaml.readSync('data/speakers-data.yml');
var schedules = yaml.readSync('data/schedule-data.yml');
var sessions = yaml.readSync('data/sessions-data.yml');

var XLSX = require('xlsx');


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
   var fullName = (participant['Fornavn'] + " " + participant["Etternavn"]).replace("  ", " ");
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


function participants(filename) {
   var workbook = XLSX.readFile(filename);
   var worksheet = workbook.Sheets[workbook.SheetNames[0]]; 
   var participantsRaw = XLSX.utils.sheet_to_json(worksheet);
   return participantsRaw.map(function(participant) {
      return createParticipant(participant, speakers, schedules, sessions);
   }).sort(function(a, b) {
      return a.fullName.localeCompare(b.fullName);
   });
}

module.exports = participants;
