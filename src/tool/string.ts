// escape all non classic alpha-numeric characters
export function htmlEntities(string: string): string {
  return string.replace(/[^a-zA-Z0-9]/gm, function(s) {
    // The charCodeAt() method returns an integer between 0 and 65535
    // representing the UTF-16 code unit at the given index.
    return '&#' + s.charCodeAt(0) + ';'
  })
}

/* String.fromHtmlEntities = function(string) {
  return (string+"").replace(/&#\d+;/gm,function(s) {
      return String.fromCharCode(s.match(/\d+/gm)[0]);
  })
}; */

/* declare global {
  interface String {
    htmlEntities(string: string): string
  }
} */
