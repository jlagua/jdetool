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
  }, {
    method: 'POST',
    path: '/api/contests/optimal-team',
    config: {
        validate: {
            options: {
                abortEarly: false
            },
            payload: Joi.object({
                teams: Joi.array().default([]),
                salaryMax: Joi.number(),
                bannedPlayer: Joi.string(),
                forcedPlayer: Joi.string()
            })
        },
        handler: async (request, h) => {
            const {teams, salaryMax, bannedPlayer, forcedPlayer} = request.payload
            const optimalTeam = await ContestService.getOptimalTeam(teams, salaryMax, bannedPlayer, forcedPlayer)
            return h.response(optimalTeam)
        },
        description: 'Get optimal team'
    }
  }]
