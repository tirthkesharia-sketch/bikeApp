const form = document.getElementById("fuelForm");
const errorEl = document.getElementById("error");
const logList = document.getElementById("logList");


const litresInput = document.getElementById("litres");
const amountInput = document.getElementById("amount");
const odometerInput = document.getElementById("odometer");

const lastMileage = document.getElementById("lastMileage");
const avgMileage = document.getElementById("avgMileage");
const monthlySpend = document.getElementById("monthlySpend");

let logs = JSON.parse(localStorage.getItem("fuelLogs")) || [];

function saveLogs() {
  localStorage.setItem("fuelLogs", JSON.stringify(logs));
}

function calculateMetrics() {
  if (logs.length < 2) {
    lastMileage.innerText = "--";
    avgMileage.innerText = "--";
  } else {
    const last = logs[logs.length - 1];
    const prev = logs[logs.length - 2];

    const lastCycle = (last.odometer - prev.odometer) / prev.litres;
    lastMileage.innerText = lastCycle.toFixed(2) + " km/l";

    let totalDistance = 0;
    let totalFuel = 0;

    for (let i = 1; i < logs.length; i++) {
      totalDistance += logs[i].odometer - logs[i - 1].odometer;
      totalFuel += logs[i - 1].litres;
    }

    avgMileage.innerText =
      (totalDistance / totalFuel).toFixed(2) + " km/l";
  }

  calculateMonthlySpend();
}

function calculateMonthlySpend() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const total = logs
    .filter(l => {
      const d = new Date(l.timestamp);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, l) => sum + l.amount, 0);

  monthlySpend.innerText = "₹ " + total.toFixed(2);
}

function renderLogs() {
  logList.innerHTML = "";

  logs.forEach((log, index) => {
    let mileage = "--";
    if (index > 0) {
      const dist = log.odometer - logs[index - 1].odometer;
      mileage = (dist / logs[index - 1].litres).toFixed(2) + " km/l";
    }

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="log-top">
        <span>${log.litres} L • ₹${log.amount}</span>
        <span>${mileage}</span>
      </div>
      <div class="log-sub">
        ${log.odometer} km • ${new Date(log.timestamp).toLocaleDateString()}
      </div>
      <button class="delete-btn" onclick="deleteLog(${index})">Delete</button>
    `;

    logList.appendChild(li);
  });

  calculateMetrics();
}

function deleteLog(index) {
  logs.splice(index, 1);
  saveLogs();
  renderLogs();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  errorEl.innerText = "";

  const litres = parseFloat(litresInput.value);
  const amount = parseFloat(amountInput.value);
  const odometer = parseFloat(odometerInput.value);

  if (litres <= 0 || amount <= 0 || odometer <= 0) {
    errorEl.innerText = "Values must be greater than zero.";
    return;
  }

  if (logs.length > 0 && odometer <= logs[logs.length - 1].odometer) {
    errorEl.innerText = "Odometer must increase.";
    return;
  }

  logs.push({
    litres,
    amount,
    odometer,
    timestamp: new Date().toISOString()
  });

  saveLogs();
  form.reset();
  renderLogs();
});

renderLogs();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
