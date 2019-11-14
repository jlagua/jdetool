var mongoose = require('mongoose')
const {teams} = require('../utils/constant')

// All values are for the 3 last games

const playerSchema = new mongoose.Schema({
    playerId: {
        type: Number,
        min: [0, 'Player Id must be superior or equal than 0']
    },
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    team: {
        type: String,
        enum: {
            values: Object.keys(teams),
            message: 'Team must be valid'
        },
        required: [true, 'Team is required']
    },
    price: {
        type: Number,
        min: [0, 'Price must be superior than 0'],
        required: [true, 'Price is required']
    },
    position: {
        type: String,
        enum: {
            values: ['M', 'A', 'I'],
            message: 'Position must be "M", "A" or "I"'
        },
        required: [true, 'Position is required']
    },
    isOnInjuryReport: {
        type: Boolean
    },
    minutesPerGame: {
        type: Number,
        min: [0, 'Minutes per game must be superior or equal than 0']
    },
    pointsPerGame: {
        type: Number,
        min: [0, 'Points per game must be superior or equal than 0']
    }
})
mongoose.model('Player', playerSchema)

module.exports = mongoose.model('Player');