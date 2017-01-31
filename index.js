var participants = require("./participants");
var badgePrint = require('./badgePrint');
var argv = require('yargs')
    .usage('Usage: $0 --file [string]')
    .argv;

if (!argv.file) {
    console.log('Only blank badges will be printed. Usage: $0 --file [string]');
} else {
    badgePrint.badgePrint(participants(argv.file), 'badges.pdf');
}

//badgePrint.blankBadgePrint(10, 'blank-badges.pdf');
