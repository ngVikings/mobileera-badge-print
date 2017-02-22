var participants = require("./participants");
var certPrint = require('./certPrint');
var moment = require('moment');
var argv = require('yargs')
    .usage('Usage: $0 --file [string] --category [ConferenceAttendee,WorkshopAttendee,Organizer,Volunteer,Speaker] --date [31.01.2017]')
    .argv;

var category = argv.category || null
var startingDate = argv.date || null

if (!argv.file) {
    console.log('Only blank badges will be printed. Usage: $0 --file [string]');
} else {
    badgePrint.badgePrint(participants(argv.file, category, moment(startingDate, "DD.MM.YYYY")), 'badges-' + category + '.pdf');
    //certPrint.certPrint(participants(argv.file, 'WorkshopAttendee', moment(startingDate, "DD.MM.YYYY")), 'certificates.pdf');
}

//badgePrint.blankBadgePrint(10, '5-blank-badges-' + category + '.pdf', category);
