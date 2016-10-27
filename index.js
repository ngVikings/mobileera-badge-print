
var participants = require("./participants");
var badgePrint = require('./badgePrint');


badgePrint.badgePrint(participants('3908008463.xls'), 'badges.pdf');

badgePrint.blankBadgePrint(10, 'blank-badges.pdf');

