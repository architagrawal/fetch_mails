const Imap = require('imap');
const {simpleParser} = require('mailparser');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

/*const imapConfig = {
  user: '',
  password: '',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
};
*/
const getEmails = () => {
  try {
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['UNSEEN', ['SINCE','April 30, 2022']], (err, results) => {
          const f = imap.fetch(results, {bodies: ''});
          f.on('message', msg => {
            msg.on('body', stream => {
              simpleParser(stream, async (err, parsed) => {
                const {from, subject, textAsHtml, text} = parsed;
                console.log(parsed);
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

getEmails();