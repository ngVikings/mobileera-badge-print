var fs = require('fs')
var _ = require('lodash');

function printParticipant(doc, participant) {

    doc.addPage();

    var height = doc.page.height;
    var width = doc.page.width - 20;
    var margin = 10;

    var sessionInfo = participant.sessionInfo;
    var categoryName = participant.categoryName;
    var ticketName = participant.ticketName;


    doc.image(participant.certImage, 0, 0, {
        height,
        width: doc.page.width
    });

    doc.font('fonts/Oswald/Oswald-Bold.ttf')
        .fontSize(36)
        .fillColor("#000000");
    if (doc.widthOfString(participant.fullName) > width) {
        doc.fontSize(30);
        if (doc.widthOfString(participant.fullName) > width) {
            doc.fontSize(26);
        }
    }




}



var PDFDocument = require('pdfkit');

function certPrint(participants, filename) {

    console.log('Started creating ' + filename + '...');

    // Create a document
    doc = new PDFDocument({
        size: 'A4',
        autoFirstPage: false
    });

    doc.pipe(fs.createWriteStream(filename));

    for (var participant of participants) {
        console.log(participant)
        printParticipant(doc, participant);
    }

    // Finalize PDF file
    doc.end();

    console.log('Finished creating ' + filename);
}


module.exports = {
    certPrint
};
