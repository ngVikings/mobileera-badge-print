var fs = require('fs')

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



var PDFDocument = require('pdfkit');
var qr = require('qr-image')

function badgePrint(participants) {
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
}

module.exports = badgePrint;
