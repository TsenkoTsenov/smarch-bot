const { RTMClient } = require('@slack/client');
const cron = require('node-cron');
require('dotenv').config();

const token = process.env.BOT_USER_OAUTH_ACCESS_TOKEN;
const channel = process.env.CHANNEL;

const rtm = new RTMClient(token);

let weeklyTasksUrl = null;
let weeklyTasksCron = null;

rtm.start();

rtm.sendMessage('Hello there', channel)
    .then((res) => {
        console.log('Message sent: ', res.ts);
    })
    .catch(console.error);

rtm.on('message', (event) => {
    let message = event.text;
    let weeklyPattern = /^#weekly <(.+)>$/;
    
    if(weeklyPattern.test(message)) {
        weeklyTasksUrl = weeklyPattern.exec(event.text)[1];

        if(weeklyTasksCron != null) {
            weeklyTasksCron.destroy();
        }

        //TODO: Improve cron - currently server runs with one hour back, so it has to be 1 hour back here too.
        weeklyTasksCron = cron.schedule('* 8 * * *', function(){
            rtm.sendMessage('Good morning <!channel>! \n You can see our weekly tasks here: ' + weeklyTasksUrl, channel)
                .then((res) => {
                    console.log('Weekly tasks message sent: ', res.ts);
                })
                .catch(console.error);
        });

        rtm.sendMessage('Weekly tasks url updated with: ' + weeklyTasksUrl, channel);
    };
});
