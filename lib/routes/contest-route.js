const ContestService = require('../services/contest-service')
const Joi = require('@hapi/joi')

module.exports = [{
    method: 'POST',
    path: '/api/contests/players/update',
    config: {
        validate: {
            options: {
                abortEarly: false
            }
        },
        handler: async (request, h) => {
            await ContestService.updateAllPlayersData()
            return h.response({})
        },
        description: 'Update all the data of the players'
    }
  }]
