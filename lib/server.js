'use strict'

// Modules
const bodyParser = require('body-parser')
const express = require('express')

// Export module
module.exports = function (port) {
  const server = express()
  const operations = {}
  let current = 0

  server.use(bodyParser.json({limit: '64mb'}))

  server.post('/', async (req, res) => {
    if (!(req.body.data instanceof Array)) return res.status(400).end()
    if (!operations[ req.body.name ]) return res.status(404).end()

    current++
    Promise.resolve()
      .then(() => operations[ req.body.name ].apply(null, req.body.data))
      .then(function () {
        current--
        res.send([null].concat(Array.from(arguments))).end()
      })
      .catch(err => {
        current--
        if(err instanceof Error) err = err.message.toString()
        res.send([err]).end()
      })
  })

  server.get('/health', (req, res) => {
    res.write('{"status":"OK","current":' + current + '}')
    res.end()
  })

  server.listen(port)

  const api = {
    on: (event, callback) => {
      operations[ event ] = callback
      return api
    }
  }

  return api
}
