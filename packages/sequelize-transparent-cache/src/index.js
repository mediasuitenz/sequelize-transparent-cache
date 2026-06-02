const buildClassMethods = require('./methods/class')
const buildInstanceMethods = require('./methods/instance')

module.exports = (client) => ({
  withCache(modelClass) {
    modelClass.cache = function (customId, ttl = undefined) {
      return customId ? buildClassMethods.manual(client, this, customId, ttl) : buildClassMethods.auto(client, this)
    }

    modelClass.prototype.cache = function () {
      return buildInstanceMethods(client, this)
    }

    return modelClass
  },
})
