const ContestService = require('../services/contest-service')

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
