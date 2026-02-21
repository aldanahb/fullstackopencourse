require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

/*let persons = 
[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]*/

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('data', (request, response) => {
    if(request.method === 'POST') {
        return JSON.stringify(request.body)
    }
    return ' '
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => response.json(persons))
})

app.get('/info', (request, response) => { 
    const date = new Date().toString()

    Person.countDocuments({}).then(persons => {

    response.send(`<div>
                    <p>Phonebook has info for ${persons} people</p>
                    <p>${date}</p>
                </div>`)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const searchId = request.params.id
    Person.find({_id: searchId}).then(person => {
        if(person) response.json(person)
        else response.status(404).end()
    })
    
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateId = ()  => {
    return Math.floor(Math.random() * 1000000000)
}

app.post('/api/persons', (request, response) => { 

    const body = request.body

    if(!body.name || !body.number) {
        return response.status(400).json({error: 'incomplete content, missing name or number'})
    }

    Person.find({name: body.name.trim()}).then(findPerson => {
        if(findPerson.length != 0) {
            response.status(400).json({error: 'name must be unique'})
        }
        else {
            const person = new Person({
                name: body.name.trim(),
                number: body.number.trim()
            })

            person.save().then(savedPerson => response.json(savedPerson))
        }
    })

})

