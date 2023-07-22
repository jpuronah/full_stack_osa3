const mongoose = require('mongoose')
const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]
const random_id = Math.floor(Math.random() * 1000001)

const url = `mongodb+srv://fullstack:${password}@cluster0.lugvl5v.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log(url)
    console.log('error connecting to MongoDB: ', error.message)
  })

const personSchema = new mongoose.Schema({
  personId: Number,
  name: String,
  number: String
})
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

if (process.argv.length === 3) {
  Person.find().then(result => {
    let personList = 'phonebook:\n'
    result.forEach(person => {
      personList += `${person.name} ${person.number}\n`

    })
    console.log(personList)
    mongoose.connection.close()
  });
}

if (process.argv.length > 3) {
  const person = new Person({
    personId: random_id,
    name,
    number
  })
  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}

module.exports = mongoose.model('Person', personSchema)