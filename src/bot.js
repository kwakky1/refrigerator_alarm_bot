const token = process.env.TOKEN;

const Bot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const notion = require('./notion')

let bot;

if(process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
    bot.setWebHook(process.env.HEROKU_URL + bot.token);
}
else {
    bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

bot.on('message', (msg) => {
    const name = msg.from.first_name;
    console.log(msg.chat.id);
    bot.sendMessage(msg.chat.id, 'Hello, ' + name + '!').then(() => {
        // reply sent!
    });
});

let rule = new schedule.RecurrenceRule();
rule.tz = 'Asia/Seoul';
let chatList = []
chatList.push(process.env.DEFAULT_CHAT_ID, process.env.VIVI_CHAT_ID)


const job = schedule.scheduleJob('18 * * *', async function(){
    console.log('The answer to life, the universe, and everything!');
    await notion.then((result)=>{
        if(result.length > 0) {
            chatList.map((chatId)=>{
                let state = ''
                result.map((item)=>{
                    if(item.left === 0){
                        state += `${item.name} 오늘까지입니다.\n`
                    } else if(item.left > 0){
                        state += `${item.name} ${item.left}일 남았습니다.\n`
                    } else {
                        state += `${item.name} ${Math.abs(item.left)}일 지났습니다.\n`
                    }
                })
                bot.sendMessage(chatId, state)
            })
        }
    })
});

module.exports = bot;
