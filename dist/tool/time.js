"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Time {
    static microsleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static hrtimeToMicroPlusNano(time, previousTime) {
        return (Math.round(((time[0] +
            '.' +
            time[1]) -
            (previousTime[0] +
                '.' +
                previousTime[1])) *
            1000000) / 1000);
    }
}
exports.default = Time;
Time.measurementTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let html = '';
    let html2 = '';
    let nsTime;
    let times = [];
    let times2 = [];
    nsTime = process.hrtime();
    console.log(nsTime);
    times.push(nsTime);
    html += `${JSON.stringify(times[times.length - 1])}<br>\n`;
    times2.push(new Date().getTime());
    Time.microsleep(5)
        .then(() => {
        nsTime = process.hrtime();
        console.log(nsTime);
        times.push(nsTime);
        html += `${JSON.stringify(times[times.length - 1])}<br>\n`;
        times2.push(new Date().getTime());
        return Time.microsleep(50);
    })
        .then(() => {
        nsTime = process.hrtime();
        console.log(nsTime);
        times.push(nsTime);
        html += `${JSON.stringify(times[times.length - 1])}<br>\n`;
        times2.push(new Date().getTime());
        return Time.microsleep(500);
    })
        .then(() => {
        nsTime = process.hrtime();
        console.log(nsTime, '\n');
        times.push(nsTime);
        html += `${JSON.stringify(times[times.length - 1])}<br>\n`;
        times2.push(new Date().getTime());
    })
        .finally(() => {
        times.forEach((time, index) => {
            if (index > 0) {
                let previousTime = times[index - 1];
                html += `${Time.hrtimeToMicroPlusNano(time, previousTime)} ms<br>\n`;
            }
        });
        times2.forEach((time, index) => {
            if (index > 0) {
                let previousTime = times2[index - 1];
                html2 +=
                    index + ' ' + JSON.stringify(time - previousTime) + '<br>\n';
            }
        });
        res.send(html + '<br><br><br>' + html2);
    });
});
//# sourceMappingURL=time.js.map