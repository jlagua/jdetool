const puppeteer = require('puppeteer')
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