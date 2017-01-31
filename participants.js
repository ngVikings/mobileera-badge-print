var XLSX = require('xlsx');
var _ = require('lodash');

var IMAGES = {
    'ConferenceAttendee': 'images/badge.png',
    'WorkshopAttendee': 'images/badge5.png',
    'Speaker': 'images/badge2.png',
    'Volunteer': 'images/badge4.png',
    'Organizer': 'images/badge3.png',
    'Sponsorship': 'images/badge.png',
}

var DIET_STOP_LIST = [
    "meat, shrimps",
    "Food",
    "Steak, burgers or pizzas",
    "None, I&#39;m happy with anyting",
    "Nope",
    "nope",
    "sushi",
    "No preferences",
    "No.",
    "cheeseburger :)",
    "Meat! :o)",
    "Nope",
    "I love meat.",
    "I like food",
    "no, thanks",
    "No",
    "no",
    "Beef",
    "Steak, Burgers or pizzas.",
    "Chicken",
    "Roast beef",
    "None, I&#39;m happy with anyting",
    "Steak & Salad",
    "sushi",
    "No preferences",
    "NA",
    "Meet",
    "Meat",
    "Nope.",
    "I love meat.",
    "Sushi!"
]

var STATS = {
    'conf': {
        'tickets': {
            'earlyBird': {
                'numberRegular': 0,
                'numberDiscounted': 0,
                'numberStudent': 0,
                'numberFree': 0,
                'total': 0,
                'number': 0
            },
            'regular': {
                'numberRegular': 0,
                'numberDiscounted': 0,
                'numberStudent': 0,
                'numberFree': 0,
                'total': 0,
                'number': 0
            },
            'total': 0,
            'number': 0
        },
        'people': {
            'attendees': 0,
            'organizers': 0,
            'speakers': 0,
            'volunteers': 0,
            'number': 0
        },
        'diet': {
            'list': [],
            'number': 0
        },
        'referrer': {
            'Twitter / Facebook': 0,
            'Meetup': 0,
            'Google search': 0,
            'Advertisement': 0,
            'Article or blog post': 0,
            'Friend': 0,
            'Other': 0
        }
    },
    'workshops': {
        'tickets': {
            'Workshop Day (Feb 12th): Data flow architecture with Redux and Angular 2': {
                'total': 0,
                'number': 0
            },
            'Workshop Day (Feb 12th): Angular 2: From Zero To Hero Jr in 1 day!': {
                'total': 0,
                'number': 0
            },
            'Workshop Day (Feb 12th): Advanced Angular 2': {
                'total': 0,
                'number': 0
            },
            'Workshop Day (Feb 12th): Reactive applications with Angular2, Rxjs and @ngrx': {
                'total': 0,
                'number': 0
            },
            'Workshop Day (Feb 12th): Migrating Applications from Angular 1 to Angular 2 - FREE WORKSHOP! Use 100% discount code - See details below:': {
                'total': 0,
                'number': 0
            },
            'Workshop Day (Feb 12th): Ionic 2 with Firebase - FREE WORKSHOP! Use 100% discount code - See details below:': {
                'total': 0,
                'number': 0
            },
            'Workshop Day (Feb 12th): ng-girls FREE WORKSHOP!': {
                'total': 0,
                'number': 0
            },
            'total': 0,
            'number': 0
        },
        'people': {
            'attendees': 0,
            'organizers': 0,
            'speakers': 0,
            'volunteers': 0,
            'number': 0
        },
        'diet': {
            'list': [],
            'number': 0
        }
    },
    'tshirts': {
        'attendees': {
            'XS': 0,
            'S': 0,
            'M': 0,
            'L': 0,
            'XL': 0,
            'XXL': 0,
            '-': 0
        },
        'organizers': {
            'XS': 0,
            'S': 0,
            'M': 0,
            'L': 0,
            'XL': 0,
            'XXL': 0,
            '-': 0
        },
        'speakers': {
            'XS': 0,
            'S': 0,
            'M': 0,
            'L': 0,
            'XL': 0,
            'XXL': 0,
            '-': 0
        },
        'volunteers': {
            'XS': 0,
            'S': 0,
            'M': 0,
            'L': 0,
            'XL': 0,
            'XXL': 0,
            '-': 0
        },
        'number': 0
    },
    'total': 0
}

var FREE_WORKSHOPS = {
    'confTicketOwners': [],
    'workshopTicketOwners': [],
    'freeCodeOwners': []
}

function createParticipant(participant) {

    var fullName = participant['Ticket First Name'].trim() + " " + participant["Ticket Last Name"].trim();

    var company = participant['Ticket Company Name'];
    var sessionInfo = null;

    var ticketName = participant['Ticket'];

    var ticketPrice = parseInt(participant['Price']);

    var categoryName = null;

    var tShirt = participant['T-shirt size'];

    var dietAnswer = participant['Do you have any meal preferences?'].trim()

    var diet = (dietAnswer === '-' || _.includes(DIET_STOP_LIST, dietAnswer)) ? null : dietAnswer;

    var discount = participant['Order Discount Code'] !== '-' ? participant['Order Discount Code'] : null;
    var referrer = participant['How did you hear about us?'] !== '-' ? participant['How did you hear about us?'] : null;


    var email = participant["Ticket Email"];

    var contactCard = fullName + " <" + email + ">";

    if (company) {
        contactCard += " of " + company;
    }

    if (ticketName.includes('Conference Day (Feb 11th)')) {

        categoryName = "ConferenceAttendee";

        var confType = ticketName.includes('Early Bird') ? 'earlyBird' : 'regular'

        STATS.conf.tickets.number++;
        STATS.conf.tickets.total += ticketPrice

        STATS.conf.people.attendees++;
        STATS.conf.people.number++;

        STATS.total += ticketPrice

        if (ticketPrice === 0) {

            STATS.conf.tickets[confType].numberFree++;
            STATS.conf.tickets[confType].number++;

            console.log('Free ticket with code: ' + participant['Order Discount Code'] + ' ref: ' + participant['Ticket Reference']);

        } else if ((ticketPrice === 1250 && confType === 'earlyBird') || (ticketPrice === 2000 && confType === 'regular')) {

            STATS.conf.tickets[confType].numberRegular++;
            STATS.conf.tickets[confType].number++;
            STATS.conf.tickets[confType].total += ticketPrice

        } else if ((participant['Order Discount Code'] === 'ngVikingsStud' && confType === 'earlyBird') || (participant['Order Discount Code'] === 'ngStudent' && confType === 'regular')) {

            STATS.conf.tickets[confType].numberStudent++;
            STATS.conf.tickets[confType].number++;
            STATS.conf.tickets[confType].total += ticketPrice

            console.log('Discounted ticket with code: ' + participant['Order Discount Code'] + ' and price ' + ticketPrice + ' ref: ' + participant['Ticket Reference']);

        } else {

            STATS.conf.tickets[confType].numberDiscounted++;
            STATS.conf.tickets[confType].number++;
            STATS.conf.tickets[confType].total += ticketPrice

            console.log('Discounted ticket with code: ' + participant['Order Discount Code'] + ' and price ' + ticketPrice + ' ref: ' + participant['Ticket Reference']);

        }

        STATS.tshirts.attendees[tShirt]++;
        STATS.tshirts.number++;

        if (diet) {
            STATS.conf.diet.list.push(diet)
            STATS.conf.diet.number++
        }

        FREE_WORKSHOPS.confTicketOwners.push(email)

        if (referrer && (STATS.conf.referrer[referrer] === 0 || STATS.conf.referrer[referrer] > 0)) {
            STATS.conf.referrer[referrer]++
        }

    } else if (ticketName.includes('Workshop Day (Feb 12th)')) {

        categoryName = "WorkshopAttendee";

        STATS.workshops.tickets.number++;
        STATS.workshops.tickets.total += ticketPrice

        STATS.workshops.people.attendees++;
        STATS.workshops.people.number++;

        STATS.total += ticketPrice

        STATS.workshops.tickets[ticketName].number++;
        STATS.workshops.tickets[ticketName].total += ticketPrice;

        if (diet) {
            STATS.workshops.diet.list.push(diet)
            STATS.workshops.diet.number++
        }

        if (discount === 'yesIHaveMyConferenceTicket') {
            FREE_WORKSHOPS.freeCodeOwners.push(email)
        }

        FREE_WORKSHOPS.workshopTicketOwners.push(email)

    } else if (ticketName === "Organizer Ticket") {

        categoryName = "Organizer";

        STATS.conf.people.organizers++;
        STATS.workshops.people.organizers++;

        STATS.conf.people.number++;
        STATS.workshops.people.number++;

        STATS.tshirts.organizers[tShirt]++;
        STATS.tshirts.number++;

        if (diet) {
            STATS.conf.diet.list.push(diet)
            STATS.conf.diet.number++;
            STATS.workshops.diet.list.push(diet)
            STATS.workshops.diet.number++;
        }

    } else if (ticketName === "Volunteer Ticket") {

        categoryName = "Volunteer";

        STATS.conf.people.volunteers++;
        STATS.workshops.people.volunteers++;

        STATS.conf.people.number++;
        STATS.workshops.people.number++;

        STATS.tshirts.volunteers[tShirt]++;
        STATS.tshirts.number++;

        if (diet) {
            STATS.conf.diet.list.push(diet)
            STATS.conf.diet.number++;
            STATS.workshops.diet.list.push(diet)
            STATS.workshops.diet.number++;
        }

    } else if (ticketName === "Speaker Ticket") {

        categoryName = 'Speaker';
        sessionInfo = participant['Session']

        STATS.conf.people.speakers++;
        STATS.workshops.people.speakers++;

        STATS.conf.people.number++;
        STATS.workshops.people.number++;

        STATS.tshirts.speakers[tShirt]++;
        STATS.tshirts.number++;

        if (diet) {
            STATS.conf.diet.list.push(diet)
            STATS.conf.diet.number++;
            STATS.workshops.diet.list.push(diet)
            STATS.workshops.diet.number++;
        }

    } else if (ticketName.includes('Sponsorship package')) {
        categoryName = "Sponsorship";
    } else {
        console.log("===== Unknown category for ticket " + participant['Ticket']);
    };

    var image = IMAGES[categoryName];

    return {
        fullName,
        company,
        contactCard,
        sessionInfo,
        image,
        categoryName
    };
}


function participants(filename, filterOnType) {
    var workbook = XLSX.readFile(filename);
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var participantsRaw = XLSX.utils.sheet_to_json(worksheet);
    var participantsProcessed = participantsRaw.map(function(participant) {
        return createParticipant(participant);
    }).filter(function(p) {
        return p.categoryName;
    }).filter(function(p) {
        return !filterOnType || filterOnType === p.categoryName;
    }).sort(function(a, b) {
        if (a.categoryName.localeCompare(b.categoryName) != 0) {
            return a.categoryName.localeCompare(b.categoryName);
        }
        return a.fullName.localeCompare(b.fullName);
    });

    console.log(JSON.stringify(STATS, undefined, 2));

    console.log('Wrong free workshop attendees:');
    console.log(JSON.stringify(_.difference(FREE_WORKSHOPS.freeCodeOwners, FREE_WORKSHOPS.confTicketOwners), undefined, 2));

    console.log('ONLY workshop attendees:');
    console.log(JSON.stringify(_.difference(FREE_WORKSHOPS.workshopTicketOwners, FREE_WORKSHOPS.confTicketOwners), undefined, 2));


    return participantsProcessed;
}

module.exports = participants;
