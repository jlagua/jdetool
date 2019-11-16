const NBA = require("nba")
const { teams }= require('../utils/constant')
const Config = require('./configuration-service')
const Player = require('../models/player')

exports.getAllPlayers = async function () {
    const players = await Player.find({})
    return players.map((player) => {
        return {
            name: player.firstName + ' ' + player.lastName,
            price: Number((player.price / 1000000).toFixed(1)),
            position: player.position,
            team: teams[player.team],
            teamAbbr: player.team,
            playerId: player.playerId,
            minutesPerGame: player.minutesPerGame ? Number(player.minutesPerGame.toFixed(1)) : 0,
            pointsPerGame: player.pointsPerGame ? Number(player.pointsPerGame.toFixed(1)) : 0,
            value: player.pointsPerGame ? Number((player.pointsPerGame * 1000000 / player.price).toFixed(2)) : 0
        }
    })
}

exports.upsertPlayers = async function (players) {
    const playersStats = await NBA.stats.playerStats({Season: Config.get('SEASON'), LastNGames: Config.get('GAME_NUMBER')})
    const playersToSave = players.map((player) => {
        const playerStats = playersStats.leagueDashPlayerStats.find((stat) => stat.playerName === player.player_name)
        const playerToSave = {
            firstName : player.player_name.split(' ', 2)[0],
            lastName : player.player_name.split(' ', 2)[1],
            price : player.current_price,
            team: Object.keys(teams).find((abbr) => teams[abbr] === player.team),
            position : player.player_position
        }
        if (playerStats) {
            playerToSave.playerId = playerStats.playerId
            playerToSave.minutesPerGame = playerStats.min
            playerToSave.pointsPerGame = exports.calculatePts(playerStats)
        }
        return playerToSave
    })
    return Promise.all(playersToSave.map(async (playerToSave) => {
        return Player.update({
            firstName: playerToSave.firstName,
            lastName: playerToSave.lastName
        }, playerToSave, {upsert: true})
    }))
}

exports.calculatePts = function ({pts, ast, blk, dreb, oreb, stl, tov, pf, fgm, fga, ftm, fta, plusMinus}) {
    return pts + ast + 2 * blk + 0.75 * dreb + oreb + 2 * stl - 0.75 * tov - 0.5 * pf - 0.5 * (fga - fgm) - 0.5 * (fta - ftm) + 0.15 * plusMinus
}