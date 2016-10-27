var fs = require('fs')

function printParticipant(doc, participant, side) {
   doc.addPage();
   var height = doc.page.height;
   doc.image(participant.image, 0, 0, {height, width:doc.page.width});

   if (!participant.sessionInfo || side === "back") {
      var qrWidth = 40;
      doc.image(
         qr.imageSync(participant.contactCard, {type: 'png'}), 
         (doc.page.width-qrWidth)/2, height-80-qrWidth, { width: qrWidth });      
   }

   var width = doc.page.width-20;
   var margin = 10;
   doc.font('fonts/Roboto/Roboto-Bold.ttf')
      .fontSize(36)
      .fillColor("#0E1131");
   if (doc.widthOfString(participant.fullName) > width) {
      doc.fontSize(30);
      if (doc.widthOfString(participant.fullName) > width) {
         console.log(participant.fullName, doc.widthOfString(participant.fullName));
      }
   }

   doc
      .text(participant.fullName, margin, 180, {align: "center", height, width});
   if (participant.company) {
      doc.font('fonts/Roboto/Roboto-Regular.ttf')
         .fontSize(18)
         .fillColor("#0E1131");
      if (doc.widthOfString(participant.company) > width) {
         console.log(participant.company, doc.widthOfString(participant.company));
      }
      doc.text(participant.company, {align: "center", height, width});         
   }
   var sessionInfo = participant.sessionInfo;
   if (sessionInfo && side === "front") {
      doc.moveDown();
      var sessionTime = sessionInfo.date + ", " + sessionInfo.timeslot +  ", " + sessionInfo.track;
      doc.font('fonts/Roboto/Roboto-Medium.ttf')
         .fontSize(14)
         .fillColor("#0E1131");
      if (doc.widthOfString(sessionInfo.title) > width) {
         console.log(sessionInfo.title, doc.widthOfString(sessionInfo.title));
         doc.text(sessionInfo.title.substring(0, 35) + "...", {align: "center", height, width});
      } else {
         doc.text(sessionInfo.title, {align: "center", height, width});
      }
      doc.fontSize(12)
         .fillColor("#6D6E6F")
         .text(sessionTime, {align: "center", height, width});
   }
}



var PDFDocument = require('pdfkit');
var qr = require('qr-image')

function badgePrint(participants, filename) {
   // Create a document
   doc = new PDFDocument({
      size: 'A6',
      autoFirstPage: false
   });
   doc.pipe(fs.createWriteStream(filename));



   for (var participant of participants) {
      printParticipant(doc, participant, "front");
      // Back page
      printParticipant(doc, participant, "back");
   }

   // Finalize PDF file
   doc.end();   
}

function blankBadgePrint(count, filename) {
   doc = new PDFDocument({
      size: 'A6',
      autoFirstPage: false
   });
   doc.pipe(fs.createWriteStream(filename));

   var image = 'images/badge-attendee.png';

   for (var i=0; i<count; i++) {
      doc.addPage();
      var height = doc.page.height;
      doc.image(image, 0, 0, {height, width:doc.page.width});
      doc.addPage();
      doc.image(image, 0, 0, {height, width:doc.page.width});
   }

   doc.end();      
}

module.exports = {badgePrint, blankBadgePrint};
