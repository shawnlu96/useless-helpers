export class LazyMap<K, V> {
  private readonly valueFactory: (key: K) => Promise<V>
  private map: Map<K, V>
  constructor(_valueFactory: (key: K) => Promise<V>) {
    this.valueFactory = _valueFactory
    this.map = new Map<K, V>()
  }

  async get(key: K): Promise<V> {
    if (this.map.has(key)) {
      return this.map.get(key)
    } else {
      const value = await this.valueFactory(key)
      this.map.set(key, value)
      return value
    }
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  set(key: K, value: V) {
    this.map.set(key, value)
  }
}
