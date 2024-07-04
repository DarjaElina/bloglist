const logger = require('./logger')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  }

  next(error)
}

const userExtractor = async (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.replace('Bearer ', '')
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      request.user = null
    } else {
      const user = await User.findById(decodedToken.id)
      request.user = user
    }
  } else {
    request.user = null
  }
  next()
}

module.exports = {
  errorHandler,
  userExtractor
}
