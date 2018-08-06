'use strict'

// Modules
const async = require('async')
const request = require('request')

// Export Module
module.exports = (host, opts) => {
  opts = opts || {}

  opts.retryLimit = (opts.retryLimit < 0 ? 10 : opts.retryLimit) || 10
  opts.retryInterval = (opts.retryInterval < 10 ? 10 : opts.retryInterval) || 50
  opts.retryIncremental = typeof opts.retryIncremental === 'undefined' ? true : !!opts.retryIncremental
  opts.timeout = (typeof opts.timeout === 'number' ? parseInt(opts.timeout) : 0) || 30000
  opts.stats = typeof opts.stats === 'function' ? opts.stats : null

  var callToEndpoint = (wait, args) => {
    return new Promise((resolve, reject) => {
      let retries = -1
      let success = false
      let start = Date.now()
      const name = args[ 0 ]
      const data = args.slice(1)

      async.doWhilst(callback => {
        request({
          url: host,
          method: 'post',
          json: true,
          body: {name, data},
          timeout: opts.timeout
        }, (err, res, body) => {
          if (err) return setTimeout(callback, opts.retryInterval * (opts.retryIncremental ? retries + 1 : 1))
          if (res.statusCode >= 400) return setTimeout(callback, opts.retryInterval * (opts.retryIncremental ? retries + 1 : 1))
          success = true
          body = body || []
          callback(body.shift(), body)
        })
      }, () => ++retries < opts.retryLimit && !success, (err, args) => {
        if( !success || err ) err = new Error(err || 'SERVER UNAVAILABLE')
        if (err) reject(err)
        else if(!args.length) resolve()
        else if(args.length === 1) resolve(args[0])
        else resolve(args)
        if(opts.stats) opts.stats({
          name, data, start,
          end: Date.now(),
          retries: retries < 0 ? 0 : retries,
          success: !err || args || null,
          error: err || null
        })
      })
    })
  }

  var api = {
    request: function () { return callToEndpoint(true, Array.from(arguments)) },
    send: function () { return callToEndpoint(false, Array.from(arguments)) }
  }

  return api
}
