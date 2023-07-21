require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const app = express()
app.use(express.json());
const cors = require('cors')
app.use(cors())
app.use(express.static('build'))

const Person = require('./models/person');
const { ObjectId } = require('mongodb');
//const Person = mongoose.model('Person', personSchema)
//const Person = require('./mongo')
//const Person = mongoose.model('Person', personSchema)

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(function (tokens, req, res) {
	return [
	  tokens.method(req, res),
	  tokens.url(req, res),
	  tokens.status(req, res),
	  tokens.res(req, res, 'content-length'), '-',
	  tokens['response-time'](req, res), 'ms',
	  tokens['body'](req, res)
	].join(' ')
  }))

app.get('/api/persons/', (request, response, next) => {
	//console.log(Person)
	Person.find({})
		.then(persons => {
			response.json(persons)
		})
		.catch(error => next(new Error('Error finding persons')))
});

app.get('/info', (request, response, next) => {
	Person.countDocuments({})
		.then(personCount => {
			const time = new Date();
			response.send(`
				<div>
						<p>Phonebook has info for ${personCount} people</p>
						<p>${time}</p>
				</div>`);	
		})
		.catch(error => next(new Error('Error in counting the documents')))
});

app.get('/api/persons/:id', (request, response, next) => {
	//const id = Number(request.params.id)
	const id = request.params.id
	Person.findById(id)
		.then(person => {
			if (person) {
				response.json(person)
			} else {
			response.status(404).end();
			}
		})
		.catch(error => next(new Error('malformatted id')))
});

app.delete('/api/persons/:id', (request, response, next) => {
	const id = request.params.id

	Person.findByIdAndRemove(id)
		.then (() => {
			response.status(204).end();
		})
		.catch(error => next(new Error('malformatted id (delete)')))
})

app.post('/api/persons', (request, response, next) => {
	const body = request.body
	if (!body.name || !body.number) {
		return next(new Error('Name or number missing'))
	}

	Person.findOne({name: body.name})
		.then(personExists => {
			if (personExists) {
				return next(new Error('name must be unique'))
			}
			const person = new Person({
				name: body.name,
				number: body.number
			});
			person.save()
				.then(savedPerson => {
					response.json(savedPerson);
				})
				.catch(error => next(new Error('Error adding new person')))
		})
		.catch(error => next(new Error('error in person exist? (creating new)')))
})

app.put('/api/persons/:id', (request, response, next) => {
	const id = request.params.id
	const updatedPerson = request.body
	Person.findByIdAndUpdate(id, updatedPerson, {new: true})
		.then(updatedPerson => {
			if (updatedPerson) {
				response.json(updatedPerson)
			}
			else {
				response.status(404).end()
			}
		})
		.catch(error => next(new Error('error updating person')))
})

const errorHandler = (error, request, response, next) => {
	let message = error.message

	if (message) {
		console.log("Error: ", message)
		return response.status(400).json({message})
	}
	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
