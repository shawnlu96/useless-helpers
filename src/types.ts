import { TimeoutError } from './exceptions'

export interface ForEachAsyncOptions {
  timeoutArgs?: TimeoutArgs
  retries?: number | number[]
  showProgress?: boolean
  skipError?: boolean
}

export interface TimeoutArgs {
  timeout: number
  onTimeout?: (e: TimeoutError) => void
}
