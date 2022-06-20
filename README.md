# whatsapp-wordle-bot

This bot takes whatsapp messages in a group and parses that though regex to collect the wordle score of a user. The bot is built on [whatsapp-web.js](https://www.npmjs.com/package/whatsapp-web.js/v/1.16.4-alpha.0).

## Instructions

1. First, run the command **`npm i && npm start`** in the console.
2. An authentication qr code will be generated in the console. Scan the qr code with your whatsapp account (from mobile). To scan, open whatsapp and tap the menu icon &#8942; on the top right corner, then select **Linked Devices**. Wait to be authenticated. Once the authentication process is complete, you are good to go.
3. Add the bot to a group, or open a group including the bot. **Note to be remembered**, you cannot create a group from the account that is being used as a bot.
4. You are ready to go! Just share your wordle score and you will get the list of scores

## Corner Cases

It may occur that you want to remove the number that you are using as a bot. In that case, you have to run some commands in the server.

1. First, ssh into the server via terminal.
2. Access to the directory where the code is situated. (`/root/trackdle` in your case. This might change if you relocate your folders, or change the server).
3. Run command `ls -a` and you will see the list of folders thats existing in your current working directory. You will see a folder named `.wwebjs_auth`. This is the folder that contains the authentication files.
4. Run command `rm -R .wwebjs_auth && ls -a`. Again you will see the existing files and folders. If you see that `.wwebjs_auth` still exists, run `sudo rm -R .wwebjs_auth && ls -a`. that should do the job.
5. Logout from the phone (Whatsapp > &#8942; on the top right corner > Linked device > Google Chrome (MacOS) > Logout)
6. Follow the [Instruction](#instructions) section.
