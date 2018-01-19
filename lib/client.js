
// Modules
const async = require('async')
const request = require('request')

// Export Module
module.exports = function( host, opts ){

  opts = opts || {}

  opts.retryLimit       = ( opts.retryLimit < 0 ? 10 : opts.retryLimit ) || 10
  opts.retryInterval    = ( opts.retryInterval < 10 ? 10 : opts.retryInterval ) || 50
  opts.retryIncremental = typeof opts.retryIncremental === 'undefined' ? true : !!opts.retryIncremental
  opts.timeout          = ( typeof opts.timeout === 'number' ? parseInt( opts.timeout ) : 0 ) || 30000

  var callToEndpoint = function( withCallback, args ){

    if( withCallback ){
      var data = args.slice( 1, -1 )
      var callback = args[ args.length - 1 ]
    }else{
      var data = args.slice( 1 )
      var callback = function(){}
    }

    if( typeof callback !== 'function' ){
      callback = function(){}
    }

    var retry = 0
    var success = false

    async.doWhilst( function( callback ){

      request({

        url: host,
        method : 'post',
        json : true,
        body : {

          name : args[ 0 ],
          data : data

        },
        timeout : opts.timeout

      }, function( err, res, body ){

        if( err ){
          return setTimeout( callback, opts.retryInterval * ( opts.retryIncremental ? retry + 1 : 1 ) )
        }

        if( res.statusCode >= 400 ){
          return setTimeout( callback, opts.retryInterval * ( opts.retryIncremental ? retry + 1 : 1 ) )
        }

        success = true

        callback.apply( null, body || [] )

      })

    }, function(){
      return retry++ < opts.retryLimit && !success
    }, function( err, args ){

      if( !success || err ){
        callback( err || 'SERVER UNAVAILABLE')
      }else{
        callback.apply( null, arguments )
      }

    })

  }

  var api = {

    request : function(){
      callToEndpoint( true, Array.from( arguments ) )
      return api
    },

    send : function(){
      callToEndpoint( false, Array.from( arguments ) )
      return api
    }

  }

  return api

}
