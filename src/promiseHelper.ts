import { ForEachAsyncOptions, TimeoutArgs } from './types'
import polly from 'polly-js'
import { TimeoutError } from './exceptions'

export async function forEachAsync<T>(
  array: T[],
  concurrency: number,
  asyncFn: (item: any, index: number) => Promise<void>,
  options?: ForEachAsyncOptions,
) {
  options = {
    timeout: null,
    retries: 0,
    showLog: true,
    logger: console.log,
    ...options,
  }
  let running = 0
  let completed = 0
  let currentTaskIndex = 0
  return new Promise<void>(resolve => {
    const runTask = async () => {
      if (completed >= array.length) {
        resolve()
        return
      }

      while (currentTaskIndex < array.length && running < concurrency) {
        const index = currentTaskIndex
        const item = array[currentTaskIndex]
        currentTaskIndex++
        running++

        const promise = () =>
          options.timeout
            ? runWithTimeout(async () => {
                options.logger(`running ${index}/${array.length}...`)
                await asyncFn(item, index)
                options.logger(`finished ${index}/${array.length}`)
                running--
                completed++
                void runTask()
              }, options.timeout)
            : (async () => {
                options.logger(`running ${index}/${array.length}...`)
                await asyncFn(item, index)
                options.logger(`finished ${index}/${array.length}`)
                running--
                completed++
                void runTask()
              })()
        if (options.retries) {
          if (typeof options.retries === 'number') {
            void polly()
              .waitAndRetry(options.retries)
              .executeForPromise(async info => {
                if (options.showLog && info.count) {
                  options.logger(`retrying ${info.count} times.`)
                }
                try {
                  await promise()
                } catch (e) {
                  if (options.showLog) {
                    options.logger(e, `error on retry: ${info.count}`)
                  }
                  throw e
                }
              })
          } else if (typeof options.retries === 'object') {
            void polly()
              .waitAndRetry(options.retries)
              .executeForPromise(async info => {
                if (options.showLog && info.count) {
                  options.logger(`retrying ${info.count} times.`)
                }
                try {
                  await promise()
                } catch (e) {
                  if (options.showLog) {
                    options.logger(e, `error on retry: ${info.count}`)
                  }
                  throw e
                }
              })
          }
        } else {
          void promise()
        }
      }
    }
    // 初始化并发任务
    runTask()
  })
}

export async function runWithTimeout(fn: () => Promise<void>, timeoutArgs: TimeoutArgs) {
  if (!timeoutArgs.onTimeout) {
    timeoutArgs.onTimeout = (e: TimeoutError) => {
      console.error(e.message)
    }
  }
  try {
    const result = await Promise.race([
      fn(), // 你的 Promise 函数
      rejectAfterTimeout(timeoutArgs.timeout), // 设置 30 秒的超时
    ])

    console.log('Result:', result)
  } catch (error) {
    console.error('Error:', error.message)
    if (error instanceof TimeoutError) {
      timeoutArgs.onTimeout(error)
    } else {
      throw error
    }
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function rejectAfterTimeout(ms: number) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`Timeout: Operation timed out after ${ms} ms`))
    }, ms)
  })
}
