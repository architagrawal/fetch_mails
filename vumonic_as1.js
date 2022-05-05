const Imap = require('imap');
const {simpleParser} = require('mailparser');
var {convert} = require('html-to-text');
var jsonfile = require('jsonfile')
let jsonVariable = []
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const imapConfig = {
  user: '',
  password: '',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
};

const getEmails = () => {
  try {
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['ALL', ['SINCE','May 03, 2022']], (err, results) => {
          const f = imap.fetch(results, {bodies: ''});
          f.on('message', msg => {
            msg.on('body', stream => {
              simpleParser(stream, async (err, parsed) => {
                const {from, to,subject, date, textAsHtml, html,text} = parsed;
                let frm = from.value[0].address
                let t = to.value[0].address
                let txt=convert(text);
                let dat = {"from":frm,"to":t,"subject":subject,"date": date, "text":txt,}
jsonVariable.push(dat)
              });

            });
            msg.once('attributes', attrs => {
              const {uid} = attrs;
              imap.addFlags(uid, ['\\Seen'], () => {
                console.log('Marked as read!');
              });
            });
          });
          f.once('error', ex => {
            return Promise.reject(ex);
          });
          f.once('end', () => {


            console.log('Done fetching all messages!');
            imap.end();
          });
        });

      });
    });

    imap.once('error', err => {
      console.log(err);
    });

    imap.once('end', () => {
      jsonfile.writeFile('ArchitAssigned.json', jsonVariable, {spaces:2}, function(err){
        console.log(err);})
      console.log('Connection ended');
    });

    imap.connect();
  } catch (ex) {
    console.log('an error occurred');
  }
};

getEmails();

//part 2
const recentEmails = () => {
  try {
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['RECENT', ['SINCE','May 03, 2021']], (err, results) => {
          const f = imap.fetch(results, {bodies: ''});
          f.on('message', msg => {
            msg.on('body', stream => {
              simpleParser(stream, async (err, parsed) => {
                const {from, to,subject, date, textAsHtml, html,text} = parsed;
                let frm = from.value[0].address
                let t = to.value[0].address
                let txt=convert(text);
                let dat = {"from":frm,"to":t,"subject":subject,"date": date, "text":txt,}
console.log(dat)
              });

            });
            msg.once('attributes', attrs => {
              const {uid} = attrs;
              imap.addFlags(uid, ['\\Seen'], () => {
                console.log('Marked as read!');
              });
            });
          });
          f.once('error', ex => {
            return Promise.reject(ex);
          });
          f.once('end', () => {


            console.log('Done fetching all messages!');
            imap.end();
          });
        });

      });
    });

    imap.once('error', err => {
      console.log(err);
    });

    imap.once('end', () => {
      console.log('Connection ended');
    });

    imap.connect();
  } catch (ex) {
    console.log('an error occurred');
  }
};
// recentEmails();

/*
Ideally , our code should listen for MAIL connection event. it pings when there is any update.
 But as I am not able to implement that, I used a easy way. Uncomment line 128 recentEmails(); and comment line 72 getEmails();
 for part 2 of assignment.
  */
