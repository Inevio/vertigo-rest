'use strict'

const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.should()
const vertigo = require('.')

// Create server & client
const server = vertigo.createServer(8000)
const client = vertigo.createClient('http://localhost:8000', {
  retryLimit: 1,
  retryInterval: 0,
  retryIncremental: 0,
  timeout: 100
})

// Listen petitions
server.on('simple', name => `Hi ${name}`)
server.on('promise', name => Promise.resolve(`Hi ${name}`))
server.on('async/await', async name => await Promise.resolve(`Hi ${name}`))
server.on('error', () => Promise.reject(new Error('Generic error')))
server.on('throw', () => { throw new Error('Throwed error') })
server.on('multiple', (name, time) => `Hi ${name} at ${(new Date(time)).toString()}`)
server.on('tooSlow', name => new Promise(resolve => setTimeout(() => resolve(`Hi ${name}`), 200)))

describe('request', () => {
  it('Reply returning a primitive', async () => {
    const [reply] = await client.request('simple', 'John')
    reply.should.be.equals('Hi John')
  })

  it('Reply returning a promise', async () => {
    const [reply] = await client.request('promise', 'John')
    reply.should.be.equals('Hi John')
  })

  it('Reply returning using async/await', async () => {
    const [reply] = await client.request('async/await', 'John')
    reply.should.be.equals('Hi John')
  })

  it('Catch a simple error', async () => {
    try {
      await client.request('error')
      throw 'Error not received'
    } catch (err) { err.message.toString().should.be.equals('Generic error') }
  })

  it('Catch a throwed error', async () => {
    try {
      await client.request('throw')
      throw 'Error not received'
    } catch (err) { err.message.toString().should.be.equals('Throwed error') }
  })

  it('Reply a request with multiple arguments', async () => {
    const time = new Date()
    const [reply] = await client.request('multiple', 'John', time.getTime())
    reply.should.be.equals(`Hi John at ${time.toString()}`)
  })

  it('Fail a request too slow', async () => {
    try {
      await client.request('tooSlow', 'John')
      throw 'Error not received'
    } catch (err) { err.message.toString().should.be.equals('SERVER UNAVAILABLE') }
  })
})
