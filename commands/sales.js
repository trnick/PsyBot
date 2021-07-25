const { channelID } = require('../config.json');
const { MessageAttachment } = require('discord.js');
const { prefix, token, serverID } = require('../config.json');
const Discord = require('discord.js');

module.exports = {
    name: 'sale',
    description: 'Finds steam games on sale',
    guildOnly: true,
    args: true,
    execute(message, args) {

        const puppeteer = require('puppeteer-extra')

        const StealthPlugin = require('puppeteer-extra-plugin-stealth')
        puppeteer.use(StealthPlugin())

        puppeteer.launch({ headless: true }).then(async browser => {
            console.log('Running...')

            // trims content of message by removing prefix
            const GAME_NAME = message.content.slice(prefix.length + 4).trim();
            const nameGame = GAME_NAME.toUpperCase();

            // price checker
            const page = await browser.newPage()
            await page.goto('https://www.steamprices.com/us/', { waitUntil: 'load', timeout: 0 })
            await page.waitFor(500)

            // inputs corrected name in steamprice checker
            await page.type('input[type="search"]', GAME_NAME);
            await page.keyboard.press('Enter');
            await page.waitForNavigation();
            console.log('Page changed');

            //checks if page has a certain string
            const stringIsIncluded = await page.evaluate(() => {
                const string = 'If there is an existing item in the Steam store that meets the search criteria, then it might not appear in the Steam Store search results. Thus it is not found by our scripts.';
                return document.querySelector("body").innerText.includes(string);
            });

            const gameFree = await page.evaluate(() => {
                const string = 'Free';
                return document.querySelector("body").innerText.includes(string);
            });

            try {

                //if game doesn't exist
                if (stringIsIncluded === true) {
                    const notFound = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('STEAM GAME SEARCH')
                        .setDescription('Game does not exist.');

                    message.channel.send(notFound);
                    console.log('Image failed to send.')

                }

                //if game is free
                else if (gameFree === true) {
                    await page.waitForSelector('#product_items > div:nth-child(1) > div > div.details > h4 > a');
                    const clickO1 = await page.$('#product_items > div:nth-child(1) > div > div.details > h4 > a')
                    await clickO1.click()

                    await page.waitForSelector('#shop_product > div > div > div.col-sm-12.details > div.col-sm-8.details.no_padding_left > h1 > a');
                    const clickT2 = await page.$('#shop_product > div > div > div.col-sm-12.details > div.col-sm-8.details.no_padding_left > h1 > a');
                    await clickT2.click();

                    await page.waitForNavigation();
                    //await page.waitForSelector('#game_highlights > div.rightcol > div > div.game_header_image_ctn > img');

                    //URL of steam page
                    const urlClick1 = await page.url();
                    const isFree = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setURL(urlClick1)
                        .setTitle(`Steam Link : ${nameGame}`)
                        .setDescription('Game is free, dumbass.');

                    message.channel.send(isFree);
                    console.log('Image sent.')
                }

                //if game exists and costs money
                else {

                    //screenshots game
                    await page.waitForSelector('#product_items > div:nth-child(1) > div > div.details')
                    const gameW = await page.$('#product_items > div:nth-child(1) > div > div.details')
                    await gameW.screenshot({ path: 'images/steamgame.png' });

                    //navigates towards first page
                    await page.waitForSelector('#product_items > div:nth-child(1) > div > div.details > h4 > a')
                    const clickO = await page.$('#product_items > div:nth-child(1) > div > div.details > h4 > a')
                    await clickO.click()

                    //navigates towards second page
                    await page.waitForNavigation();

                    const clickT = await page.$('#shop_product > div > div > div.col-sm-12.details > div.col-sm-8.details.no_padding_left > h1 > a')
                    await clickT.click();

                    await page.waitForNavigation();
                    //takes review
                    const element = await page.$("#game_highlights > div.rightcol > div > div.glance_ctn_responsive_left > div > div:nth-child(1) > div.summary.column");
                    const text = await page.evaluate(element => element.textContent, element);

                    //URL of steam page
                    const urlClick = await page.url();

                // exits headless chrome 
                await browser.close()
                console.log(`Check screenshot.`)

                //embed screenshot and send in channel
                    const imageE = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`Steam Link : ${nameGame}`)
                        .setURL(urlClick)
                        .addFields(
                            { name: `${message.author.username}`, value: `searched results : ` },
                        )
                        .setThumbnail('https://i.imgur.com/Jch96fi.gif')
                        .attachFiles(['./images/steamgame.png'])
                        .setImage('attachment://steamgame.png')
                        .setFooter('Ratings: ', ` ${text} `);


                message.channel.send(imageE);

                    console.log('Image Sent.');

                }

            } catch (error) {
                console.log('Error', error);
                await browser.close();
                return;
            }
        })
    },

};
