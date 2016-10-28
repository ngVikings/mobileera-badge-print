var yaml = require('node-yaml');
var speakers = yaml.readSync('data/speakers-data.yml');
var schedules = yaml.readSync('data/schedule-data.yml');
var sessions = yaml.readSync('data/sessions-data.yml');

var XLSX = require('xlsx');


function speakerInfo(fullName, speakers, schedules, sessions) {
   var speakerObj = null;
   for (var speaker of speakers) {
      if (speaker.name + " " + speaker.surname === fullName) {
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
   "@webstep.no": "Webstep",
   "@samsung.com": "Samsung",
   "@partner.samsung.com": "Samsung",
   "@hoopla.no": "Hoopla",
   "@shortcut.no": "Shortcut",
   "@programutvikling.no": "Programutvikling",
   "@computas.com": "Computas",

   // Long names
   '@norconsult.no': 'Norconsult',
   '@nois.no': 'Norconsult',
   '@evry.com': 'EVRY',
}

var COMPANY_SPECIAL_CASES = {
   "johannes@brodwall.com": "Sopra Steria",
   'hampus.nilsson@mobileera.rocks': "Computas",
   'oivind.jorfald@outlook.com': "Sopra Steria",
   'kjell.g@gmail.com': "Sopra Steria",
   'loginov.k@gmail.com': "NorApps",
   'salnikov@gmail.com': 'ForgeRock',
   'katrineorlova@gmail.com': 'Accenture',
   'anum.qudsia@gmail.com': 'FireTech',


   'oddbjorn.bakke@gmail.com': 'Sopra Steria',

   // Long names
   'linnkristin@gmail.com': 'Norconsult',
}


function companyName(participant) {
   var email = participant["Epost"];
   var domain = email.replace(/.*@/, "@");

   if (COMPANY_SPECIAL_CASES[email]) {
      return COMPANY_SPECIAL_CASES[email];
   }

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

function capitalize(word) {
   return word[0].toUpperCase() + word.substring(1);
}


function createParticipant(participant, speakers, schedules, sessions) {
   var fullName = (capitalize(participant['Fornavn']) + " " + capitalize(participant["Etternavn"])).replace("  ", " ");

   if (fullName === "István Szmozsánszky") {
      fullName = "István 'Flaki' Szmozsánszky"
   }

   var company = companyName(participant);
   var sessionInfo = null;

   var ticketName = participant['Billettkategori'];
   var categoryName = "Normal";
   if (ticketName === "Organizer") {
      categoryName = "Organizer";
   } else if (ticketName === "Volunteer") {
      categoryName = "Volunteer";
   } else if (ticketName === "Mobile Era Speaker" || ticketName === "Mobile Era Lightning Speaker") {
      categoryName = 'Speaker';
      sessionInfo = speakerInfo(fullName, speakers, schedules, sessions);
      if (!sessionInfo) {
         console.log("Unknown speaker " + fullName);
      } else {
         company = sessionInfo.company;
      }
   }

   var email = participant["Epost"];

   if (!company && email.indexOf("@gmailz.com") == -1) {
      console.log("Could not find company name for", email, categoryName);
   }

   var image = IMAGES[categoryName];
   var contactCard = fullName + " <" + email + ">";
   if (company) {
      contactCard += " of " + company;
   }
   return { fullName, company, contactCard, categoryName, sessionInfo, image };
}


function participants(filename, filterOnType) {
   var workbook = XLSX.readFile(filename);
   var worksheet = workbook.Sheets[workbook.SheetNames[0]]; 
   var participantsRaw = XLSX.utils.sheet_to_json(worksheet);
   return participantsRaw.map(function(participant) {
      return createParticipant(participant, speakers, schedules, sessions);
   }).filter(function(p) {
      return !filterOnType || filterOnType === p.categoryName;
   }).sort(function(a, b) {
      if (a.categoryName.localeCompare(b.categoryName) != 0) {
         return a.categoryName.localeCompare(b.categoryName);
      }
      return a.fullName.localeCompare(b.fullName);
   });
}

module.exports = participants;
