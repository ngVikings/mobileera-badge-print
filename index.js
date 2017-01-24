var participants = require("./participants");
var badgePrint = require('./badgePrint');


badgePrint.badgePrint(participants('./tito-ngvikings-2017-tickets-for-salnikov-gmail-com-1045496.xlsx'), 'badges.pdf');

badgePrint.blankBadgePrint(10, 'blank-badges.pdf');
