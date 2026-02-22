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
        if(person) response.json(person[0])
        else response.status(404).end()
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    }).catch(error => next(error))
})

const generateId = ()  => {
    return Math.floor(Math.random() * 1000000000)
}

app.post('/api/persons', (request, response, next) => { 

    const body = request.body

    Person.find({name: body.name.trim()}).then(findPerson => {
        if(findPerson.length != 0) {
            response.status(400).json({error: 'Name must be unique.'})
        }
        else {
            const person = new Person({
                name: body.name.trim(),
                number: body.number.trim()
            })

            person.save().then(savedPerson => response.json(savedPerson)).catch(error => next(error))
        }
    })
})

app.put('/api/persons/:id', (request, response, next) => {

    const person = {
        name: request.body.name,
        number: request.body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true, context: 'query'}).then(updatedPerson => {
        if(updatedPerson) response.json(updatedPerson)
        else response.status(404).end()

    }).catch(error => next(error))
    
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') return response.status(400).send({ error: 'malformatted id' })
    else if(error.name === 'ValidationError') return response.status(400).json( { error: error.message } )
    next(error)
}

app.use(errorHandler)



