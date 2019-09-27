/* declare global {
  interface String {
    htmlEntities(string: string): string
  }
} */

export function htmlEntities(string: string): string {
  return string.replace(/./gm, function(s) {
    return '&#' + s.charCodeAt(0) + ';'
  })
}

// export default String.prototype.htmlEntities
