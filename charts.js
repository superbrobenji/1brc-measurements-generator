import Chart from "chart.js/auto";
import benchData from "./bench_results.json";

const createWallTimeChart = () => {
    const maxAvg = Math.max(...benchData.walltimes_ms) / 1000;
    new Chart(document.getElementById("walltimes"), {
        type: "bar",
        options: {
            scales: {
                yAxis: {
                    max: maxAvg + maxAvg * 0.5,
                },
            },
        },
        data: {
            labels: benchData.walltimes_ms.map((time, index) => index + 1),
            datasets: [
                {
                    label: "Walltime in seconds",
                    data: benchData.walltimes_ms.map((data) => data / 1000),
                },
            ],
        },
    });
};

const createMemoryCharts = () => {
    const maxMax = Math.max(...benchData.memory_max_bytes) / 1000000;
    const maxAvg = Math.max(...benchData.memory_avg_bytes) / 1000000;
    new Chart(document.getElementById("memory_avg"), {
        type: "bar",
        options: {
            scales: {
                yAxis: {
                    min: 300,
                    max: maxAvg + maxAvg * 0.5,
                },
            },
        },
        data: {
            labels: benchData.memory_avg_bytes.map((time, index) => index + 1),
            datasets: [
                {
                    label: "Average memory usage in MB",
                    data: benchData.memory_avg_bytes.map((data) => data / 1000000),
                },
            ],
        },
    });
    new Chart(document.getElementById("memory_max"), {
        type: "bar",
        options: {
            scales: {
                yAxis: {
                    min: 300,
                    max: maxMax + maxMax * 0.5,
                },
            },
        },
        data: {
            labels: benchData.memory_avg_bytes.map((time, index) => index + 1),
            datasets: [
                {
                    label: "Max memory usage in MB",
                    data: benchData.memory_avg_bytes.map((data) => data / 1000000),
                },
            ],
        },
    });
};

const createCPUCharts = () => {
    const maxMax = Math.max(...benchData.cpu_max_percent);
    const maxAvg = Math.max(...benchData.cpu_avg_percent);
    new Chart(document.getElementById("cpu_avg"), {
        type: "bar",
        options: {
            scales: {
                yAxis: {
                    max: maxAvg + maxAvg * 0.5,
                },
            },
        },
        data: {
            labels: benchData.cpu_avg_percent.map((time, index) => index + 1),
            datasets: [
                {
                    label: "Average CPU usage in %*vcore",
                    data: benchData.cpu_avg_percent.map((data) => data),
                },
            ],
        },
    });
    new Chart(document.getElementById("cpu_max"), {
        type: "bar",
        options: {
            scales: {
                yAxis: {
                    max: maxMax + maxMax * 0.5,
                },
            },
        },
        data: {
            labels: benchData.cpu_avg_percent.map((time, index) => index + 1),
            datasets: [
                {
                    label: "Max CPU usage in %*vcore",
                    data: benchData.cpu_max_percent.map((data) => data),
                },
            ],
        },
    });
};

(async function() {
    createWallTimeChart();
    createMemoryCharts();
    createCPUCharts();
})();
