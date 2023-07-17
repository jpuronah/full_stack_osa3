const express = require('express')
const morgan = require('morgan')

const app = express()
app.use(express.json());
const cors = require('cors')

app.use(cors())
app.use(express.static('build'))

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
]

app.get('/api/persons/', (request, response) => {
	response.send(persons);
});
app.get('/info', (request, response) => {
	const time = new Date();
	const personCount = persons.length;
	response.send(`
  	<div>
			<p>Phonebook has info for ${personCount} people</p>
    		<p>${time}</p>
  	</div>`);
});

app.get('/api/persons/:id', (request, response) => {
const id = Number(request.params.id)
const person = persons.find(note => note.id === id)
if (person) {
	response.json(person)
} else {
	response.status(404).end()
}
});

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter(person => person.id !== id)

	response.status(204).end()
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
	const personExists = persons.find(person => person.name === body.name)
	if (personExists) {
		return response.status(400).json({
			error: 'name must be unique'
	})
	}
	randomId = Math.floor(Math.random() * 1000001)
	const person = {
		id: randomId, 
		name: body.name,
		number: body.number,
	}
	persons = persons.concat(person)
	response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
