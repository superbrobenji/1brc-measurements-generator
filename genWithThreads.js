'use strict';
const fs = require('fs')
const os = require('os');
const { Worker, isMainThread, workerData } = require('worker_threads');
if (isMainThread) {
    if (fs.existsSync('measurements.txt')) {
        fs.unlinkSync('measurements.txt');
    }
    const startTime = performance.now();
    const maxMeasurements = 1000000000;
    const maxStations = 10000;
    const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
    const stations = new Array(maxStations);
    for (let i = 0; i < maxStations; i++) {
        let word = '';
        if (Math.random() < 0.3) word += getRandomElement(['pre', 're', 'un', 'dis', 'mis', 'in', 'im', 'en', 'ex', 'pro']);
        const syllableCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < syllableCount; i++) {
            if (Math.random() < 0.2) word += getRandomElement(['bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sc', 'sh', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'th', 'tr', 'tw', 'wh', 'wr']);
            else word += String.fromCharCode(97 + Math.floor(Math.random() * 26));
            word += getRandomElement(['a', 'e', 'i', 'o', 'u']);
        }
        if (Math.random() < 0.5) word += getRandomElement(['ing', 'ed', 'ly', 'es', 's', 'er', 'able', 'ible', 'ive', 'ness']);
        stations[i] = word
    }
    const threads = new Set();
    const threadCount = os.cpus().length;
    const range = Math.floor(maxMeasurements / threadCount);
    for (let i = 0; i < threadCount - 1; i++) {
        threads.add(new Worker(__filename, { workerData: { range, stations: stations } }));
    }
    threads.add(new Worker(__filename, { workerData: { range: range + ((maxMeasurements) % threadCount), stations: stations } }));
    for (let worker of threads) {
        worker.on('error', (err) => { throw err; });
        worker.on('exit', () => {
            threads.delete(worker);
            if (threads.size === 0) {
                console.log(`Time taken to execute add function is ${(performance.now() - startTime) / 1000}s.`);
                return
            }
        })
    }
} else {
    const linesPerWrite = 50000;
    const writesPerWorker = Math.ceil(workerData.range / linesPerWrite);
    for (let j = 0; j < writesPerWorker; j++) {
        let measurements = '';
        const remainingLines = workerData.range - j * linesPerWrite;
        const adjustedLines = Math.min(remainingLines, linesPerWrite);
        for (let i = 0; i < adjustedLines; i++) {
            const word = workerData.stations[Math.floor(Math.random() * workerData.stations.length)];
            const temperature = (Math.random() * (199.8) - 99.9).toFixed(1);
            measurements += `${word};${temperature}\n`;
        }
        fs.appendFileSync('measurements.txt', measurements, (err) => {
            if (err) throw err;
        });
    }
}
