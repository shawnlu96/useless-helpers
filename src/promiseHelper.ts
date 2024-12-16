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
    timeoutArgs: null,
    retries: null,
    showProgress: true,
    skipError: false,
    ...options,
  }
  let running = 0
  let completed = 0
  let currentTaskIndex = 0
  return new Promise<void>(resolve => {
    let retriedAsyncFn = asyncFn
    if (options.retries) {
      retriedAsyncFn = async (item, index) =>
        await polly()
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .waitAndRetry(options.retries)
          .executeForPromise(async info => {
            if (options.showProgress && info.count) {
              console.log('retrying...', info.count)
            }
            await asyncFn(item, index)
          })
    }
    let finalAsyncFn = retriedAsyncFn
    if (options.timeoutArgs) {
      finalAsyncFn = async (item, index) => {
        await runWithTimeout(async () => {
          await retriedAsyncFn(item, index)
        }, options.timeoutArgs)
      }
    }
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
          (async () => {
            try {
              if (options.showProgress) console.log(`task ${index + 1}/${array.length} started`)
              await finalAsyncFn(item, index)
            } catch (e) {
              if (options.showProgress) {
                console.error(`task ${index + 1}/${array.length} failed, cause:${e.message}`)
              }
              if (!options.skipError) {
                throw e
              }
            }
            if (options.showProgress) console.log(`task ${index + 1}/${array.length} finished`)

            running--
            completed++
            void runTask()
          })()
        void promise()
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
