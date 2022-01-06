const { Client } = require("@notionhq/client")

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
})

const leftDateFive = async () => {
    try {
        const items = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
            filter: {
                property: "left",
                formula: {
                    number: {
                        less_than : 5
                    },
                },
            },
        })
        return items.results.map((list)=>{
            const properties = JSON.parse(JSON.stringify(list.properties))
            return {
                name: properties.name.title[0].text.content,
                left: properties.left.formula.number
            }
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = leftDateFive()
