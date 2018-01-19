
// Modules
const bodyParser = require('body-parser')
const express = require('express')

// Export module
module.exports = function( port ){

  var server = express()
  var operations = {}
  var current = 0

  server.use( bodyParser.json({limit: '64mb'}) )

  server.post( '/', function( req, res ){

    if( !( req.body.data instanceof Array ) ){
      return res.status( 400 ).end()
    }

    if( !operations[ req.body.name ] ){
      return res.status( 404 ).end()
    }

    req.body.data.push( function(){
      current--
      res.send( Array.from( arguments ) ).end()
    })

    current++
    operations[ req.body.name ].apply( null, req.body.data )

  })

  server.get( '/health', function( req, res ){

    res.write('{"status":"OK","current":' + current + '}')
    res.end()

  })

  server.listen( port )

  var api = {

    on : function( event, callback ){
      operations[ event ] = callback
      return api
    }

  }

  return api

}
