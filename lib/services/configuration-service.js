const Joi = require('@hapi/joi')

exports.description = {
  PORT: Joi
    .number(),
  MONGO_URL: Joi
    .string(),
  JDE_URL: Joi
    .string(),
  GAME_NUMBER: Joi
    .number(),
  SEASON: Joi
    .string()
}

exports.has = function (key) {
  const { error, value } = validate(key)
  if (error) {
    return false
  } else {
    return value !== undefined
  }
}
exports.get = function (key) {
  const { error, value } = validate(key)

  if (error) {
    throw Error(`${key} is not valid: ${error.message}`)
  } else {
    return value
  }
}
exports.require = function (key) {
  try {
    return Promise.resolve(exports.get(key))
      .then((value) => {
        if (value === undefined) {
          throw Error(`${key} is not set`)
        } else {
          return value
        }
      })
  } catch (error) {
    return Promise.reject(Error(`${key} is not valid: ${error.message}`))
  }
}

// eslint-disable-next-line no-unused-vars
function flag () {
  return Joi
    .boolean()
    .insensitive()
    .truthy('1', 'enabled', 'on', 'yes')
    .falsy('0', 'disabled', 'off', 'no')
}

exports.validate = validate
function validate (key) {
  const description = getDescription(key)
  const value = process.env[key] // eslint-disable-line no-process-env
  return description.validate(value)
}

function getDescription (key) {
  const description = exports.description || {}
  if (description[key]) {
    return description[key]
  } else {
    return Joi.any()
  }
}
