import { Logger } from 'tslog'

export function newLogger(name: string) {
  return new Logger({
    name,
    prettyLogTemplate: '{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t[{{name}}]\t',
    prettyErrorTemplate: '\n{{errorName}} {{errorMessage}}\nerror stack:\n{{errorStack}}',
    prettyErrorStackTemplate: '  • {{fileName}}\t{{method}}\n\t{{filePathWithLine}}',
    prettyErrorParentNamesSeparator: ':',
    prettyErrorLoggerNameDelimiter: '\t',
    stylePrettyLogs: true,
    prettyLogTimeZone: 'UTC',
  })
}
