const express = require('express')
const morgan = require('morgan')

let persons = 
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
]

const app = express()
app.use(express.json())

morgan.token('data', (request, response) => {
    if(request.method === 'POST') {
        return JSON.stringify(request.body)
    }
    return ' '
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

const PORT = 3001
app.listen(PORT)

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => { 
    const date = new Date().toString()

    response.send(`<div>
                    <p>Phonebook has info for ${persons.length} people</p>
                    <p>${date}</p>
                </div>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if(person) response.json(person)
    else response.status(404).end()
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

    const findPerson = persons.find(p => p.name.toLowerCase().trim() === body.name.toLowerCase().trim())
    if(findPerson) {
        return response.status(400).json({error: 'name must be unique'})
    }

    const person = {
        "id": generateId(),
        "name": body.name.trim(),
        "number": body.number.trim()
    }

    persons = persons.concat(person)

    response.json(person)

})

