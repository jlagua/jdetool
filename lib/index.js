'use strict'

const Config = require('./services/configuration-service')
const Hapi = require('@hapi/hapi')
const nuxtPlugin = require('@nuxtjs/hapi')
const mongoose = require('mongoose')
const routes = require('./routes')

const server = Hapi.server({
    port: Config.get('PORT')
})

const startServer = async () => {
    await mongoose.connect(Config.get('MONGO_URL'), { useNewUrlParser: true })
    await server.register({
        plugin: nuxtPlugin,
        options: {
            rootDir: __dirname
        }
    })
    server.route(routes)
    await server.start()
    console.log('Server running on %s', server.info.uri)
}

startServer()

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})