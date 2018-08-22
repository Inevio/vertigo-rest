'use strict'

// Modules
const async = require('async')
const axios = require('axios')
const pause = duration => new Promise(res => setTimeout(res, duration))
const Promise = require('bluebird')

// Export Module
module.exports = (host, opts) => {
  opts = opts || {}

  opts.retryLimit = (opts.retryLimit < 0 ? 10 : opts.retryLimit) || 10
  opts.retryInterval = (opts.retryInterval < 10 ? 10 : opts.retryInterval) || 50
  opts.retryIncremental = typeof opts.retryIncremental === 'undefined' ? true : !!opts.retryIncremental
  opts.timeout = (typeof opts.timeout === 'number' ? parseInt(opts.timeout) : 0) || 30000
  opts.stats = typeof opts.stats === 'function' ? opts.stats : null

  const request = (config) => {
    if(!(config instanceof Object)) return Promise.reject(new Error('request() argument is not an object'))
    if(typeof config.name !== 'string') return Promise.reject(new Error('request() config.name is not a string'))

    config.data = config.data instanceof Array ? config.data : (config.hasOwnProperty('data') ? [config.data] : [])
    config.retryLimit = (config.retryLimit < 0 ? 10 : config.retryLimit) || opts.retryLimit
    config.retryInterval = (config.retryInterval < 10 ? 10 : config.retryInterval) || opts.retryInterval
    config.retryIncremental = config.retryIncremental || opts.retryIncremental
    config.timeout = (typeof config.timeout === 'number' ? parseInt(config.timeout) : 0) || opts.timeout

    let retries = 0
    let success = false
    let error = null
    const start = Date.now()
    const data = {name: config.name, data: config.data}
    const requestConfig = {timeout: config.timeout}

    const doRequest = () => {
      return axios.post(host, data, requestConfig).catch(function (err) {
        if( retries++ < config.retryLimit ) return pause(config.retryInterval * (config.retryIncremental ? retries + 1 : 1)).then(doRequest)
        error = err
        throw err
      })
    }

    return doRequest()
      .then(response => {
        if(response.data[0]){
          error = response.data[0]
          throw new Error(response.data[0])
        }

        success = true
        return response.data[1]
      })
      .finally(() => {
        const stats = {
          name: config.name,
          data: data,
          start,
          end: Date.now(),
          retries: retries < 0 ? 0 : retries,
          success,
          error
        }

        if(config.stats) setImmediate(() => config.stats(stats))
        if(opts.stats) setImmediate(() => opts.stats(stats))
      })
  }

  return {request}
}
