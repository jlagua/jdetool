const PlayerService = require('../services/player-service')

module.exports = [{
    method: 'GET',
    path: '/api/players',
    config: {
        validate: {
            options: {
                abortEarly: false
            }
        },
        handler: async (request, h) => {
            const players = await PlayerService.getAllPlayers()
            return h.response(players)
        },
        description: 'Get all the players'
    }
  }]
