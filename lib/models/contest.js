var mongoose = require('mongoose')

const contestSchema = new mongoose.Schema({
    winaContestId: {
        type: Number,
        min: [0, 'Wina contest id must be superior than 0'],
        required: [true, 'Price is required']
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    date: {
        type: Date
    }
})
mongoose.model('Contest', contestSchema)

module.exports = mongoose.model('Contest');