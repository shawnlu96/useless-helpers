export class Lazy<T> {
  private obj: T | undefined
  private hasValue: boolean = false

  constructor(private initializer: () => T) {}

  public get value(): T {
    if (!this.hasValue) {
      this.obj = this.initializer()
      this.hasValue = true
    }
    return this.obj as T
  }

  public get isValueCreated(): boolean {
    return this.hasValue
  }
}
