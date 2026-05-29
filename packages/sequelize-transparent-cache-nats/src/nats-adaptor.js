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
    try {
      return this.client.put(this._withNamespace(key), JSON.stringify(value))
    } catch (error) {
      console.error('adaptor: ', error)
    }
  }

  get(key) {
    return this.client.get(this._withNamespace(key)).then((data) => {
      if (!data) return data
      return JSON.parse(data.string())
    })
  }

  del(key) {
    return this.client.purge(this._withNamespace(key))
  }
}

module.exports = NatsAdaptor
