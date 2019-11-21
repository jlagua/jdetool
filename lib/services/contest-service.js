const puppeteer = require('puppeteer')
const solver = require('javascript-lp-solver')
const Config = require('./configuration-service')
const NBA_TEAMS = require('../utils/constant').teams
const PlayerService = require('./player-service')

exports.updateAllPlayersData = async function () {
    const players = await getNbaPlayersFromWina()
    return PlayerService.upsertPlayers(players)

    async function getNbaPlayersFromWina() {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        const url = Config.get('JDE_URL')
        await page.goto(url, {waitUntil: 'networkidle2'})
        const html = await page.content()
        // We extract the react state corresponding to players and teams
        const teamsAndPlayersString = html.match(new RegExp('"players": ' + "(.*)" + '"contests": '))[0]
        const stringifiedJSON = `{${teamsAndPlayersString.replace(',            "contests": ','')}}`
        const {players, teams} = JSON.parse(stringifiedJSON)
        // We only want nba data
        const nbaTeams = Object.values(teams).filter((team) => {
            return Object.values(NBA_TEAMS).includes(team.name)
        })
        const nbaTeamsIds = nbaTeams.map((nbaTeam) => nbaTeam.id)
        const nbaPlayers = Object.values(players).filter((player) => {
            return nbaTeamsIds.includes(player.team_id)
        }).map((player) => {
            player.team = nbaTeams.find((nbaTeam) => nbaTeam.id === player.team_id).name
            return player
        })
        return nbaPlayers
    }
}

exports.getOptimalTeam = async function (teams = [], salaryMax = 85, bannedPlayer, forcedPlayer) {
    const players = await PlayerService.getAllPlayers()
    let playersFiltered = players.filter((player) => player.pointsPerGame > 0)
    if (teams && teams.length) {
        playersFiltered = playersFiltered.filter((player) => teams.includes(player.teamAbbr))
    }
    if (bannedPlayer) {
        playersFiltered = playersFiltered.filter((player) => player.name !== bannedPlayer)
    }
    const playersWithBinaryPosition = playersFiltered
        .map((player) => {
            return {
                name: player.name,
                salary: player.price,
                points: player.pointsPerGame,
                p: player.position === 'P' ? 1 : 0,
                a: player.position === 'A' ? 1 : 0,
                i: player.position === 'I' ? 1 : 0
            }
        })
    const variables = {}
    const unicityConstraints = {}
    const defaultVariable = {}
    const ints = {}
    playersWithBinaryPosition.forEach((player) => {
        defaultVariable[player.name] = 0
        if (forcedPlayer && player.name === forcedPlayer) {
            unicityConstraints[player.name] = {equal: 1}
        } else {
            unicityConstraints[player.name] = {max: 1}
        }
        ints[player.name] = 1
    })
    playersWithBinaryPosition.forEach((player) => {
        variables[player.name] = Object.assign({
            salary: player.salary,
            points: player.points,
            p: player.p,
            a: player.a,
            i: player.i,
            b: 1
        }, defaultVariable)
        variables[player.name][player.name] = 1
    })
    const constraints = Object.assign({
        salary: {max: salaryMax},
        b: {equal: 5},
        p: {equal: 1},
        a: {equal: 2},
        i: {equal: 2}
    }, unicityConstraints)
    const model = {
        optimize: 'points',
        opType: 'max',
        variables,
        constraints,
        ints
    }
    const solution = solver.Solve(model)
    const optimalTeam = []
    Object.keys(solution).forEach((key) => {
        if (playersWithBinaryPosition.map((player) => player.name).includes(key)) {
            const optimalPlayer = players.find((player) => player.name === key)
            optimalTeam.push({
                name: key,
                position: optimalPlayer.position,
                price: optimalPlayer.price,
                points: optimalPlayer.pointsPerGame
            })
        }
    })
    const totalPoints = optimalTeam.reduce((total, player) => total + player.points, 0)
    const salaryLeft = optimalTeam.reduce((salaryLeft, player) => salaryLeft - player.price, salaryMax)
    return {
        optimalTeam,
        salaryLeft,
        totalPoints
    }
}