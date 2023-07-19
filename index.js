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

/*
let persons = [
	{
		id: 1,
		name: "Arto Hellas",
		Number: "040-123-1234"
	},
	{
		id: 2,
		name: "Jarkko Kreikka",
		Number: "050-987-9876"
	},	
	{
		id: 3,
		name: "Hannes Ahorn",
		Number: "09-883-4321"
	},
	{
		id: 4,
		name: "Pepe Wilberg",
		Number: "0400-1112221"
	}
]*/

//app.get('/api/persons/', (request, response) => {
//	response.send(persons);
//});


app.get('/api/persons/', (request, response) => {
	//console.log(Person)
	Person.find({})
		.then(persons => {
			response.json(persons)
		})
		.catch(error => {
			console.log(error);
			response.status(400).send('Error finding persons')
		})
});

app.get('/info', (request, response) => {
	Person.countDocuments({})
		.then(personCount => {
			const time = new Date();
			response.send(`
				<div>
						<p>Phonebook has info for ${personCount} people</p>
						<p>${time}</p>
				</div>`);	
		})
		.catch(error => {
			console.log(error);
			response.send('Error in counting the documents')
		})
});

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	
	Person.findOne({id: id})
		.then(person => {
			if (person) {
				response.json(person)
			} else {
			response.status(404).end();
			}
		})
		.catch(error => {
			console.log(error);
			response.status(400).send({ error: 'malformatted id' })
		})
});

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)

	Person.findOneAndDelete({id: id})
		.then (() => {
			response.status(204).end();
		})
		.catch(error => {
			console.log(error);
			response.status(500).send(`Error in finding id (delete)`)
		})
})

app.post('/api/persons', (request, response) => {
	const body = request.body
	if (!body.name) {
		return response.status(400).json({
			error: 'name missing'
		})
	}
	if (!body.number) {
		return response.status(400).json({
			error: 'number missing'
		})
	}

	Person.findOne({name: body.name})
		.then(personExists => {
			if (personExists) {
				return response.status(400).json({
					error: 'name must be unique'
				})
			}
			//randomId = Math.floor(Math.random() * 1000001)
			const person = new Person({
				//_id: new mongoose.Types.ObjectId(),
				id: Math.floor(Math.random() * 1000001),
				name: body.name,
				number: body.number
			});
			person.save()
				.then(savedPerson => {
					response.json(savedPerson);
				})
				.catch(error => {
					console.log(error);
					response.status(500).send('Error adding new person')
				})
		})
		.catch(error => {
			console.log(error);
			response.status(500).send('Error total person error')
		})
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
