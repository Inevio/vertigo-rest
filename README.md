
![Vertigo](https://cloud.githubusercontent.com/assets/1794673/10267561/1b0eef2e-6a99-11e5-9770-71e13744166c.png)

Simple communication between Node.js processes

## How to install Vertigo
You can install Vertigo-REST using Node Package Manager (npm):
```
npm install vertigo-rest
```

## Description
Vertigo-REST is inspired in our module Vertigo's API model. The communication under HTTP protocol isn't so much fastest as TCP, but for some network topologies, HTTP request are prefered over permanent opened TCP Sockets.

This module doesn't have the same features of his parent but still it has the main and most used.

* Supports Request/Reply communication.
* Supports Send without Reply communication.
* Fault tolerant: it will retry in an interval if the request went wrong.

## Examples
### Request/Reply: Server with one client
#### Server
```js
// Modules
  var vertigo = require('vertigo-rest');

// Create server
  var server = vertigo.createServer( 8000 );

// Listen petitions
  server.on( 'hello', function( name, callback ){
    callback( null, 'Hi ' + name + ', I am the server' );
  });

```
#### Client
```js
// Modules
  var vertigo = require('vertigo-rest');

// Create client
  var client = vertigo.createClient( 'localhost:8000' );

// Make a petition
  client.request( 'hello', 'John', function( error, response ){
    console.log( 'Server says', response );
  });
```

### Send: Server with one client
#### Server
```js
// Modules
  var vertigo = require('vertigo-rest');

// Create server
  var server = vertigo.createServer( 8000 );

// Listen petitions
  server.on( 'hello', function( name ){
    console.log( 'I received a message from ' + name );
  });

```
#### Client
```js
// Modules
  var vertigo = require('vertigo-rest');

// Create client
  var client = vertigo.createClient( 'localhost:8000' );

// Make a petition
  client.send( 'hello', 'John' );
```

## Migrating from hermod or vertigo
If you use only `request` or `send` commands you can use the same API without changes. If you use more features this module won't cover all of them.

## To Do List
* Authentication support
* HTTPS support
* Middleware support
* Promises support
