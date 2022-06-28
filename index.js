/* eslint-disable indent */
/* eslint-disable brace-style */
const { Client, Intents, MessageAttachment } = require('discord.js');
const { token } = require('./config.json');
const Canvas = require('@napi-rs/canvas');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log('Ready!');
});

const { readFile } = require('fs/promises');
const { request } = require('undici');

const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');

	let fontSize = 70;

	do {
		context.font = `${fontSize -= 10}px sans-serif`;
	} while (context.measureText(text).width > canvas.width - 300);

	return context.font;
};

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	} else if (commandName === 'profile') {
		const canvas = Canvas.createCanvas(700, 250);
		const context = canvas.getContext('2d');

		const backgroundFile = await readFile('./canvas.jpg');
		const background = new Canvas.Image();
		background.src = backgroundFile;

		context.drawImage(background, 0, 0, canvas.width, canvas.height);

			context.font = '40px sans-serif';
			context.fillStyle = '#ffffff';
			context.fillText('Perfil', canvas.width / 2.5, canvas.height / 3.5);

		context.strokeStyle = '#0099ff';

		context.strokeRect(0, 0, canvas.width, canvas.height);

			context.font = applyText(canvas, `${interaction.member.displayName}!`);
			context.fillStyle = '#ffffff';
			context.fillText(`${interaction.member.displayName}!`, canvas.width / 2.8, canvas.height / 1.8);

		context.beginPath();

		context.arc(125, 125, 100, 0, Math.PI * 2, true);

		context.closePath();

		context.clip();

		const { body } = await request(interaction.user.displayAvatarURL({ format: 'jpg' }));
		const avatar = new Canvas.Image();
		avatar.src = Buffer.from(await body.arrayBuffer());

		context.drawImage(avatar, 25, 25, 200, 200);

		const attachment = new MessageAttachment(canvas.toBuffer('image/png'), 'profile-image.png');

		interaction.reply({ files: [attachment] });
	}
});

client.login(token);