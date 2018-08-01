
// Modules
var vertigo = require('../lib/vertigo');

// Create client
var client = vertigo.createClient( 'http://localhost:8000' );

// Listen petitions
var counter = 0;
var resEnd  = 0;

//setInterval( function(){

	client.request( 'hello', 'John #'+(counter++))
	.then( res => {
		resEnd++
		console.log( 'Server says', res )
	})
	.catch( err => {
		resEnd++
		console.error( 'Server send an error', err)
	})
	
//}, 0 );
/*
setInterval( function(){
	console.log( resEnd, new Date() );
	resEnd = 0;
}, 1000 );
*/
