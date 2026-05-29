class NatsAdaptor {
  constructor({ client, namespace, lifetime }) {
    this.client = client // A NATS kv client
    this.namespace = namespace
    this.lifetime = lifetime
  }

  _withNamespace(key) {
    const namespace = this.namespace
    const keyWithNamespace = namespace ? [namespace, ...key] : key

    return keyWithNamespace.join('.')
  }

  set(key, value) {
    console.log('set: ', key)
    try {
      return this.client.put(this._withNamespace(key), JSON.stringify(value))
    } catch (error) {
      console.error('adaptor: ', error)
    }
  }

  get(key) {
    console.log('get: ', key)
    return this.client.get(this._withNamespace(key)).then((data) => {
      return data
    })
  }

  del(key) {
    console.log('del: ', key)
    return this.client.purge(this._withNamespace(key))
  }
}

module.exports = NatsAdaptor
