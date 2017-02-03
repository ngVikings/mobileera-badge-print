var participants = require("./participants");
var badgePrint = require('./badgePrint');
var argv = require('yargs')
    .usage('Usage: $0 --file [string] --category [ConferenceAttendee,WorkshopAttendee,Organizer,Volunteer,Speaker]')
    .argv;

var category = argv.category || null

if (!argv.file) {
    console.log('Only blank badges will be printed. Usage: $0 --file [string]');
} else {
    badgePrint.badgePrint(participants(argv.file, category), 'badges-' + category + '.pdf');
}

//badgePrint.blankBadgePrint(10, 'blank-badges' + category + '.pdf');
