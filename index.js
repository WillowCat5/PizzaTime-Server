const express = require('express')
const app = express()

app.use('/public',express.static('public'))

app.get('/', (req, res) => res.send('<html><body><h1>This is bigger</h1></body></html>'))

let jsonObj = { "name": "supreme",
                "size": 12,
                "crust": "deep",
                "imgURL":  "http://www.sugardale.com/sites/default/files/stuffed%20crust%20pizza.jpg"
            }
                

app.get('/deals', (req, res) => res.send(JSON.stringify(jsonObj)))

app.listen(3000, 
    () => console.log("Listening on port 3000"))

