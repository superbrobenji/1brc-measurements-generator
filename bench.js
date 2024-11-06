"use strict";
const { fork } = require("child_process");
const { writeFile } = require("fs");
const path = require("path");
const pidusage = require("pidusage");
const timesToBench = 10;
let timesRan = 0;
const bench = {
    walltimes_ms: new Array(timesToBench),

    memory_avg_bytes: new Array(timesToBench),
    cpu_avg_percent: new Array(timesToBench),

    memory_max_bytes: new Array(timesToBench),
    cpu_max_percent: new Array(timesToBench),

    stats_per_run: new Array(timesToBench),
};

(function executeScript() {
    let statsPerRun = {
        walltime: 0,
        memory: new Set(),
        cpu: new Set(),
    };
    let watcher = false;
    const scriptPath = path.join(__dirname, "./run.min.js"); // Adjust the path as necessary

    timesRan++;
    const child = fork(scriptPath);

    function compute(cb) {
        if (watcher) {
            pidusage(child.pid, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    statsPerRun.memory.add(stats.memory);
                    statsPerRun.cpu.add(stats.cpu);
                    cb();
                }
            });
        }
    }

    function interval(time) {
        setTimeout(function() {
            compute(function() {
                interval(time);
            });
        }, time);
    }

    child.on("message", (message) => {
        bench.walltimes_ms[timesRan - 1] = message;
        statsPerRun.walltime = message;
    });

    child.on("exit", () => {
        watcher = false;
        pidusage.clear();
        bench.stats_per_run[timesRan - 1] = statsPerRun;
        writeToOutputObj(statsPerRun);
        if (timesRan < timesToBench) {
            executeScript();
        } else {
            writeLog();
            return;
        }
    });

    child.on("spawn", () => {
        watcher = true;
        interval(500);
    });
})();

const getAverage = (array) => {
    return array.reduce((a, b) => a + b) / array.length;
};

const getMax = (array) => {
    return Math.max(...array);
};

const writeToOutputObj = (statsPerRun) => {
    convertPerRunSetToArray(statsPerRun);

    bench.cpu_avg_percent[timesRan - 1] = getAverage(statsPerRun.cpu);
    bench.memory_avg_bytes[timesRan - 1] = getAverage(statsPerRun.memory);

    bench.cpu_max_percent[timesRan - 1] = getMax(statsPerRun.cpu);
    bench.memory_max_bytes[timesRan - 1] = getMax(statsPerRun.memory);
};

const writeLog = () => {
    writeFile("bench_results.json", JSON.stringify(bench), "utf8", (err) => {
        if (err) throw new Error(err);
        console.log('Performance bench done. results are in "bench_results.json"');
    });
};

const convertPerRunSetToArray = (statsPerRun) => {
    statsPerRun.memory = Array.from(statsPerRun.memory.values());
    statsPerRun.cpu = Array.from(statsPerRun.cpu.values());
};
