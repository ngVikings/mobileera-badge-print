var XLSX = require('xlsx');
var _ = require('lodash');

var IMAGES = {
    'ConferenceAttendee': 'images/badge.png',
    'WorkshopAttendee': 'images/badge5.png',
    'Speaker': 'images/badge2.png',
    'Volunteer': 'images/badge4.png',
    'Organizer': 'images/badge3.png',
    'Unknown': 'images/badge.png',
}

function createParticipant(participant) {

    var fullName = participant['Ticket First Name'].trim() + " " + participant["Ticket Last Name"].trim();

    var company = participant['Ticket Company Name'];
    var sessionInfo = null;

    var ticketName = participant['Ticket'];

    var categoryName = "Unknown";

    if (ticketName.includes('Conference Day (Feb 11th)')) {
        categoryName = "ConferenceAttendee";
    } else if (ticketName.includes('Workshop Day (Feb 12th)')) {
        categoryName = "WorkshopAttendee";
    } else if (ticketName === "Organizer Ticket") {
        categoryName = "Organizer";
    } else if (ticketName === "Volunteer Ticket") {
        categoryName = "Volunteer";
    } else if (ticketName === "Speaker Ticket") {
        categoryName = 'Speaker';
        sessionInfo = participant['Session']
    } else {
        console.log("===== Unknown category for ticket " + participant['Ticket']);
    };

    var email = participant["Ticket Email"];

    var image = IMAGES[categoryName];
    var contactCard = fullName + " <" + email + ">";
    if (company) {
        contactCard += " of " + company;
    }
    return {
        fullName,
        company,
        contactCard,
        categoryName,
        sessionInfo,
        image
    };
}


function participants(filename, filterOnType) {
    var workbook = XLSX.readFile(filename);
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var participantsRaw = XLSX.utils.sheet_to_json(worksheet);
    return participantsRaw.map(function(participant) {
        return createParticipant(participant);
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
