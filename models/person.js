
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose.connect(url)
.then(() =>
    {console.log('connected to MongoDB')})
    .catch(error => {console.log('error connecting to MongoDB:', error.message)})

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: [true, 'Name required.']
    },
    number: {
        type: String,
        minLength: 8,
        validate: {
            validator: function(v) {
                return /^\d{2,3}-\d+$/.test(v)
            },
            message: props => `${props.value} is not a valid phone number.`
        },
        required: [true, 'Phone number required.']
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => { // modificar o eliminar partes; lo que no se menciona sigue como está
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v // porque no nos interesa versión
    }
})

module.exports = mongoose.model('Person', personSchema)