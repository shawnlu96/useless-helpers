import { TimeoutError } from './exceptions'

export interface ForEachAsyncOptions {
  timeout?: TimeoutArgs
  retries?: number | number[]
  showLog?: boolean
  logger?: (...arg0: any[]) => void
}

export interface TimeoutArgs {
  timeout: number
  onTimeout?: (e: TimeoutError) => void
}
