import { HttpsProxyAgent } from 'https-proxy-agent'
import { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'

function generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export function generate2CaptchaProxyAgent(key: string, sessionTime: number = 20) {
  const username = `${key}-zone-custom-session-${generateRandomString(9)}-sessTime-${sessionTime}`
  return new HttpsProxyAgent(`http://${username}:${key}@43.152.113.55:2334`)
}

export function generateIPRoyalProxyAgent(
  username: string,
  password: string,
  sessionHours: number = 1,
  region: string = '',
) {
  const regionStr = region ? `country-${region}_` : ''
  const pwd = `${password}_${regionStr}session-${generateRandomString(8)}_lifetime-${sessionHours}`
  return new HttpsProxyAgent(`http://${username}:${pwd}@geo.iproyal.com:12321`)
}

export function generateAxiosClientWithProxy(
  axiosClient: AxiosInstance,
  proxyFactory: () => HttpsProxyAgent<any>,
  retries: number,
) {
  axiosClient.defaults.httpsAgent = proxyFactory()
  axiosRetry(axiosClient, {
    retries,
    retryDelay: () => {
      // rotate proxy
      axiosClient.defaults.httpsAgent = proxyFactory()
      return 0
    },
    retryCondition: error => {
      // if retry condition is not specified, by default idempotent requests are retried
      return error.message.includes('socket hang up') || error.message.includes('Proxy')
    },
  })
}
