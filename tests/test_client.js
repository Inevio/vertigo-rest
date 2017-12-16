
// Modules
	var vertigo = require('../lib/vertigo');

// Create client
	var client = vertigo.createClient( 'http://localhost:8000' );

// Listen petitions

	var counter = 0;
	var resEnd  = 0;

	//setInterval( function(){

		client.request( 'hello', 'John #'+(counter++), function( err, res ){
			resEnd++;
			console.log( 'Server says', err, res );
		});

	//}, 0 );
/*
	setInterval( function(){
		console.log( resEnd, new Date() );
		resEnd = 0;
	}, 1000 );
*/
