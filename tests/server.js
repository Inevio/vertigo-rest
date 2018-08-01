'use strict'

// Modules
const vertigo = require('../lib/vertigo')

// Create server
const server = vertigo.createServer( 8000 )

// Listen petitions
server.on( 'hello', name => {
	return 'Hi ' + name + ', I am the server'
})
