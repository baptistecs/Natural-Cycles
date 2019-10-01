"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function htmlEntities(string) {
    return string.replace(/[^a-zA-Z0-9]/gm, function (s) {
        return '&#' + s.charCodeAt(0) + ';';
    });
}
exports.htmlEntities = htmlEntities;
//# sourceMappingURL=string.js.map