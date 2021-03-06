var fs = require('fs')
var _ = require('lodash');

function printParticipant(doc, participant, side) {

    doc.addPage();

    var height = doc.page.height;
    var width = doc.page.width - 20;
    var margin = 10;

    var sessionInfo = participant.sessionInfo;
    var categoryName = participant.categoryName;
    var ticketName = participant.ticketName;

    if ((categoryName === 'Speaker' && sessionInfo && side === "back") || (categoryName === 'WorkshopAttendee' && side === "back")) {

        if (categoryName === 'Speaker') {

            doc.image('images/badge6.png', 0, 0, {
                height,
                width: doc.page.width
            });

            sessionInfo = sessionInfo.match(/[^\r\n]+/g);

            doc.font('fonts/Oswald/Oswald-Bold.ttf')
                .fontSize(18)
                .fillColor("#000000");
            if (doc.widthOfString(sessionInfo[0]) > width) {
                doc.fontSize(16);
            }
            doc.text(sessionInfo[0], margin, 160, {
                align: "center",
                height,
                width
            });

            doc.font('fonts/Oswald/Oswald-Regular.ttf')
                .fontSize(12)
                .fillColor("#2556a6")
                .text(sessionInfo[1], {
                    align: "center",
                    height,
                    width
                });

            doc.font('fonts/Oswald/Oswald-Regular.ttf')
                .fontSize(12)
                .fillColor("#7a461c")
                .text('\nOffice Hours: ' + sessionInfo[2], {
                    align: "center",
                    height,
                    width
                });

        } else {

            doc.image('images/badge5.png', 0, 0, {
                height,
                width: doc.page.width
            });

            workshopName = ticketName.substring(25);

            doc.font('fonts/Oswald/Oswald-Bold.ttf')
                .fontSize(18)
                .fillColor("#000000");
            if (doc.widthOfString(workshopName) > width) {
                doc.fontSize(16);
            }
            doc.text(workshopName, margin, 160, {
                align: "center",
                height,
                width
            });

            doc.font('fonts/Oswald/Oswald-Regular.ttf')
                .fontSize(12)
                .fillColor("#2556a6")
                .text('February 12th, 10:00-17:00', {
                    align: "center",
                    height,
                    width
                });

            doc.font('fonts/Oswald/Oswald-Regular.ttf')
                .fontSize(12)
                .fillColor("#7a461c")
                .text('\nLunch: 12:30-13:30', {
                    align: "center",
                    height,
                    width
                });

        }



    } else {

        doc.image(participant.image, 0, 0, {
            height,
            width: doc.page.width
        });

        var qrWidth = 60;
        doc.image(
            qr.imageSync(participant.contactCard, {
                type: 'png'
            }),
            (doc.page.width - 210 - qrWidth) / 2, height - 100 - qrWidth, {
                width: qrWidth
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

        doc
            .text(participant.fullName, margin, 160, {
                align: "center",
                height,
                width
            });
        if (participant.company) {
            doc.font('fonts/Oswald/Oswald-Regular.ttf')
                .fontSize(14)
                .fillColor("#2556a6");
            if (doc.widthOfString(participant.company) > width) {
                doc.fontSize(12);
                if (doc.widthOfString(participant.company) > width) {
                    doc.fontSize(10);
                }
            }
            doc.text(participant.company, {
                align: "center",
                height,
                width
            });
        }

    }



}



var PDFDocument = require('pdfkit');
var qr = require('qr-image')

function badgePrint(participants, filename) {

    console.log('Started creating ' + filename + '...');

    // Create a document
    doc = new PDFDocument({
        size: [315, 436],
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

    console.log('Finished creating ' + filename);
}

function blankBadgePrint(count, filename, category) {

    var IMAGES = {
        'ConferenceAttendee': 'images/badge.png',
        'WorkshopAttendee': 'images/badge5.png',
        'Speaker': 'images/badge2.png',
        'Volunteer': 'images/badge4.png',
        'Organizer': 'images/badge3.png',
        'Sponsorship': 'images/badge.png',
    }

    console.log('Started creating ' + filename + '...');

    doc = new PDFDocument({
        size: [315, 436],
        autoFirstPage: false
    });
    doc.pipe(fs.createWriteStream(filename));

    var image = IMAGES[category || 'ConferenceAttendee'];

    for (var i = 0; i < count; i++) {
        doc.addPage();
        var height = doc.page.height;
        doc.image(image, 0, 0, {
            height,
            width: doc.page.width
        });
        doc.addPage();
        doc.image(image, 0, 0, {
            height,
            width: doc.page.width
        });
    }

    doc.end();

    console.log('Finished creating ' + filename);

}

module.exports = {
    badgePrint,
    blankBadgePrint
};
