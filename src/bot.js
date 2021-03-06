const token = process.env.TOKEN;

const Bot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const {typeFilter, getTypeList, leftDateFive, allThings} = require('./notion')

let bot;

if(process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
    bot.setWebHook(process.env.HEROKU_URL + bot.token).then(()=>{
        console.log('bot start production mode in Heroku url')
    }).catch((err)=>{
        console.log('webHook',err)
    });
}
else {
    bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

bot.on("polling_error", console.log);


bot.on('message', async (msg) => {
    if (msg.text.toString().indexOf('μ μ²΄λ³΄κΈ°') === 0) {
        let message = ''
        await allThings().then((value)=>{
            message = value
        })
        bot.sendMessage(msg.chat.id, message).then();
    }

    let typeList = []

    await getTypeList().then((name)=>{
        typeList.push(...name)
    })

    typeList.map(async (name)=>{
        if (msg.text.toString().indexOf(name) === 0) {
            let message = ''
            await typeFilter(name).then((value)=>{
                message = value
            })
            bot.sendMessage(msg.chat.id, message).then();
        }
    })
});

bot.onText(/\/start/, (msg) => {
    const name = msg.from.first_name;
    bot.sendMessage(msg.chat.id, `π μλνμΈμ! ${name} μ λ λμ₯κ³  μ±λ΄μλλ€.\n/help λΌκ³  μλ ₯ν΄λ³΄μΈμ.\n μ κ° μ΄λ€μΌμ νλμ§ μλ €λλ¦΄κ²μ!`).then();
});

bot.onText(/\/help/, async (msg) => {
    bot.sendMessage(msg.chat.id, `πππππππ\n λμ₯κ³  λ¬Όκ±΄λ³΄κΈ° π /list λΌκ³  μλ ₯ν΄λ³΄μΈμ.\n μ ν΅κΈ°ν μ²΄ν¬ π /expire λΌκ³  μλ ₯ν΄λ³΄μΈμ.`).then();
});

bot.onText(/\/list/, async (msg) => {
    const keyboard = [['μ μ²΄λ³΄κΈ°']]
    await getTypeList().then((value)=>{
        keyboard.push(...value.map((value)=> [value]))
    })
    console.log(keyboard)
    bot.sendMessage(msg.chat.id, "πλμ₯κ³ μμ μ°Ύκ³  μΆμ λ¬Όνμ λλ¬μ£ΌμΈμπ", {
        "reply_markup": {
            "keyboard": keyboard
        }
    }).then();
});

bot.onText(/\/expire/, async (msg) => {
    await leftDateFive().then((result)=>{
        if(result.length > 0) {
                let state = ''
                result.map((item)=>{
                    if(item.left === 0){
                        state += `${item.name} μ€λκΉμ§μλλ€.\n`
                    } else if(item.left > 0){
                        state += `${item.name} ${item.left}μΌ λ¨μμ΅λλ€.\n`
                    } else {
                        state += `${item.name} ${Math.abs(item.left)}μΌ μ§λ¬μ΅λλ€.\n`
                    }
                })
                bot.sendMessage(msg.chat.id, state)

        }
    })
});

let rule = new schedule.RecurrenceRule();
rule.tz = 'Asia/Seoul';
let chatList = []
chatList.push(process.env.DEFAULT_CHAT_ID, process.env.VIVI_CHAT_ID)


schedule.scheduleJob('0 18 * * *', async function(){
    await leftDateFive().then((result)=>{
        if(result.length > 0) {
            chatList.map((chatId)=>{
                let state = ''
                result.map((item)=>{
                    if(item.left === 0){
                        state += `${item.name} μ€λκΉμ§μλλ€.\n`
                    } else if(item.left > 0){
                        state += `${item.name} ${item.left}μΌ λ¨μμ΅λλ€.\n`
                    } else {
                        state += `${item.name} ${Math.abs(item.left)}μΌ μ§λ¬μ΅λλ€.\n`
                    }
                })
                bot.sendMessage(chatId, state)
            })
        }
    })
});

module.exports = bot;
