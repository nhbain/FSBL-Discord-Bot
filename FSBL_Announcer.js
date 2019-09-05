var Discord = require('discord.js');
var logger = require('winston');
var schedule = require('node-schedule');
var giphy = require('giphy-api')();
var auth = require('./auth.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client();
bot.login(process.env.DISCORD_TOKEN);
bot.on('ready', function (evt) {
    logger.info('Connected\n');
});

// ----------------- Free Agency Announcements -----------------
var startAnnouncement;
var endAnnouncement;

bot.on('message', message => {
    // Bot will listen for messages that will start with `!`
    if (message.content.substring(0, 1) == '!') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            case 'FA_start':
                message.channel.send('Starting Free Agency Announcements! '
                    + 'Announcements will be made for start and end times every week.');
                startAnnouncements(message);
            break;

            case 'FA_end':
                message.channel.send('Ending Free Agency Announcements.');
                stopAnnouncements();
            break;
         }
     }
});

// ----------------- Member Greeting -----------------
bot.on('guildMemberAdd', member => {
    greetNewMember(member);
});

// ------------- Helper Functions -----------------
function startAnnouncements(message) {
    startAnnouncement = schedule.scheduleJob({ rule: '0 59 23 * * 3', tz: "US/Pacific" }, () => {
        giphy.random('excited', function(err, res) {
            message.channel.send('@here This week\'s Free Agency period has started! '
                +'It will end tomorrow at 11:59.\n' + res.data.embed_url);
        });
    });

    endAnnouncement = schedule.scheduleJob({ rule: '0 59 23 * * 4', tz: "US/Pacific" }, () => {
        giphy.random('bye', function(err, res) {
            message.channel.send('@here This week\'s Free Agency period has ended!\n' + res.data.embed_url);
        });
    });
    logger.info('Scheduled Announcements have started!\n');
}

function stopAnnouncements() {
    startAnnouncement.cancel();
    endAnnouncement.cancel();
    logger.info('Successfully canceled Announcement Jobs.');
}

function greetNewMember(member){
    const generalChannel = member.guild.channels.find(ch => ch.name === 'general');
    const friendCodeExchangeChannel = member.guild.channels.find(ch => ch.name === 'friend-code-exchange');
    const matchmakingChannel = member.guild.channels.find(ch => ch.name === 'matchmaking');
    const commissioner = member.guild.roles.find(r => r.name === 'League Commissioner');
    if (!generalChannel) return;
    generalChannel.send(`Welcome ${member}! Please feel free to snoop around. `
        + `Add your friend code in the ${friendCodeExchangeChannel} `
        + `and look for matches using the ${matchmakingChannel} channel. `
        + `If you want the role that will allow you to `
        + `spectate the FSBL please let me or any ${commissioner} know.`);
}