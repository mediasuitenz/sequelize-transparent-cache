const { connect } = require('@nats-io/transport-node')
const { jetstream } = require('@nats-io/jetstream')
const { Kvm } = require('@nats-io/kv')

// connect to the default server 127.0.0.1:4222

async function start() {
  nc = await connect()

  const js = jetstream(nc)
  let kvm
  try {
    kvm = await new Kvm(js).create('bucket', {})
  } catch (error) {}

  // You need to find appropriate adaptor or create your own, see "Available adaptors" section below
  const NatsAdaptor = require('../../packages/sequelize-transparent-cache-nats')
  const natsAdaptor = new NatsAdaptor({
    client: kvm,
    namespace: 'model',
    lifetime: 60 * 60,
  })

  const sequelizeCache = require('../../packages/sequelize-transparent-cache')
  const { withCache } = sequelizeCache(natsAdaptor)

  const { Sequelize, DataTypes } = require('sequelize')
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
  })

  // Register your models
  // const User = withCache(sequelize.import('./models/user'))

  const User = withCache(
    sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }),
  )
  await sequelize.sync()

  // Create user in db and in cache
  try {
    await User.cache().create({
      id: 1,
      name: 'Daniel',
    })
  } catch (error) {
    console.error('create: ', error)
  }

  // Load user from cache
  await User.cache().findByPk(1)
  await User.cache().findByPk(1)
  await User.cache().findByPk(1)
  const user = await User.cache().findByPk(1)

  // Update in db and cache
  try {
    await user.cache().update({
      id: 1,
      name: 'Vikki',
    })
  } catch (error) {
    console.error('update: ', error)
  }

  // Cache result of arbitrary query - requires cache key
  try {
    await User.cache('find-dan').findAll({
      where: {
        name: {
          [Sequelize.Op.like]: 'Dan',
        },
      },
    })
  } catch (error) {
    console.error('findAll: ', error)
  }
  kvm.destroy()
  process.exit()
}

start()
