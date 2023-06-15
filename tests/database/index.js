require('dotenv').config()
const mongoose = require('mongoose')
const { logs } = require('../../logger')

const { env } = process
const { TEST_MONGODB_URI: DB_URL, DEBUG_QUERIES = true } = env

const migrateMongoConfig = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: DB_URL,
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    },
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'changelog',

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: '.js',

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'commonjs',
}

const connectDB = async () => {
  const methodName = '[DB connection]'

  try {
    if (!DB_URL) {
      throw new Error('Missing Database Connection URL')
    }
    logs('info', methodName, `Connecting to test Db ${DB_URL}`)
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    mongoose.set('debug', (collectionName, method, query, doc) => {
      DEBUG_QUERIES &&
        logs(
          'info',
          '[MongoDb]',
          `${collectionName}-${method} info ${JSON.stringify({
            query,
            doc,
          })}`
        )
    })
    logs('info', methodName, 'test Db Connected')
  } catch (error) {
    logs('info', methodName, 'Error in DB Connection')
    logs('error', methodName, `${error.stack || error}`)
    process.exit(1)
  }
}

module.exports = { connectDB, DB_URL, migrateMongoConfig }