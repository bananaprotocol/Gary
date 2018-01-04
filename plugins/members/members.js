var Discord = require('discord.js'),
    fs = require('fs');

var logChannelName = 'member-log';
var welcomeTextPath = './plugins/members/welcome.md';
var welcomeText;

exports.commands = [
    'members',
    'memberlist'
];

exports.init = function (client, config) {
    fs.readFile(welcomeTextPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        welcomeText = data;
    });
    
    client.on('guildMemberAdd', memberAdd);
    client.on('guildMemberRemove', memberRemove);
}

// Commands
exports['members'] = {
    process: function (message) {
        message.channel.send("There are currently **" + message.guild.memberCount + "** members on this server.");
    }
}

exports['memberlist'] = {
    process: function(message) {
        var roles = message.guild.roles
            .filter(n => n != '@everyone');
        var reply = '';
        
        reply += 'There are currently **' + message.guild.memberCount + '** members on this server\n';

        for (var [_, role] of roles) {
            reply += '**' + role.name + '**: ' + role.members.keyArray().length + '\n';
        }

        message.channel.send(reply);
    }
}

function memberAdd(member) { 
    log(member, member + ' joined the server');

    // TODO: use general roles code for this
    var role = member.guild.roles.find('name', 'Newbies');
    if (role) {
        member.addRole(role)
            .then(() => { })
            .catch(console.error);
    } else {
        console.log('there is no Newbies role on the server');
    }
    
    var embed = new Discord.RichEmbed()
        .setColor(0x7a7a7a)
        .setTitle('Welcome!')
        .setAuthor('Gary', 'https://imgur.com/lVpLGeA.png')
        .setDescription(welcomeText)
        .setTimestamp();

    member.send({embed: embed})
        .then(() => { })
        .catch(() => { });
}

function memberRemove(member) { 
    log(member, member + ' left the server');
}

function log(member, message) {
    var channel = member.guild.channels.find('name', logChannelName);
    if (!channel) {
        console.log('no #' + logChannelName + ' on this server');
        console.log(message);
    } else {
        var embed = new Discord.RichEmbed()
            .setColor(0x18bb68)
            .setAuthor('Gary', 'https://imgur.com/lVpLGeA.png')
            .setDescription(message)
            .setTimestamp();

        channel.send({ embed: embed });
    }
}