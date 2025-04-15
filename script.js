// Global variables
let memory = 0;
let lastAns = 0;
const calcHistory = [];
const parser = math.parser();

// DOM Elements
const display = document.getElementById("display");
const precisionSelect = document.getElementById("precisionSelect");
const historyList = document.getElementById("historyList");

// Tab switching
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.add("hidden"));
    document.getElementById(btn.dataset.tab).classList.remove("hidden");
  });
});

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  document.getElementById("themeToggle").textContent = document.body.classList.contains("light") ? "Dark Theme" : "Light Theme";
});

// --- Calculator Button Handlers ---
document.querySelectorAll(".grid button").forEach(button => {
  button.addEventListener("click", () => {
    const text = button.textContent;
    handleCalcInput(text);
  });
});

function handleCalcInput(input) {
  if (input === "=") {
    evaluateExpression();
  } else if (input === "C") {
    display.value = "";
  }
  // Memory buttons are handled separately via data-action attribute
  else if (input === "pi") {
    display.value += Math.PI;
  } else if (input === "e") {
    display.value += Math.E;
  } else if (input === "!") {
    // Append factorial symbol. math.js supports "!" via its built-in factorial function.
    display.value += "!";
  } else if (input === "|x|") {
    // We'll treat |x| as a call to abs(x)
    display.value += "abs(";
  } else if (input === "Ans") {
    display.value += lastAns;
  } else {
    display.value += input;
  }
}

// Memory Controls
document.querySelectorAll(".memory-controls button").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    performMemoryAction(action);
  });
});

function performMemoryAction(action) {
  try {
    const currentVal = parser.evaluate(display.value || "0");
    switch(action) {
      case "M+":
        memory += currentVal;
        break;
      case "M-":
        memory -= currentVal;
        break;
      case "MR":
        display.value += memory;
        break;
      case "MC":
        memory = 0;
        break;
    }
  } catch (err) {
    display.value = "Error";
  }
}

// Evaluate expression in display
function evaluateExpression() {
  let expr = display.value;
  try {
    // Replace any missing function wrappers.
    // (math.js supports sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, asinh, acosh, atanh, log (as ln), and log10.)
    // For example, convert "ln" to math.log:
    expr = expr.replace(/ln/g, "log");
    // Allow vertical bars to denote absolute value; replace |...| with abs(...)
    expr = expr.replace(/\|([^|]+)\|/g, "abs($1)");
    
    // Evaluate the expression with math.js. Any variable assignment (e.g., "x=5") is handled by the parser.
    const result = parser.evaluate(expr);
    lastAns = result;
    // Format with selected precision if needed.
    display.value = formatResult(result);
    addToHistory(expr, result);
  } catch (error) {
    display.value = "Error";
  }
}

function formatResult(result) {
  const prec = parseInt(precisionSelect.value);
  if (prec === -1 || isNaN(prec)) return result.toString();
  return math.format(result, { precision: prec });
}

// --- Keyboard Support ---
document.addEventListener("keydown", (e) => {
  // Support numerals, letters and common symbols
  if (/[\d+\-*/^().!|a-zA-Z]/.test(e.key)) {
    display.value += e.key;
  } else if (e.key === "Enter") {
    evaluateExpression();
  } else if (e.key === "Backspace") {
    display.value = display.value.slice(0, -1);
  } else if (e.key === "Escape") {
    display.value = "";
  }
});

// --- History Management ---
function addToHistory(expr, result) {
  const item = document.createElement("li");
  item.textContent = `${expr} = ${result}`;
  historyList.appendChild(item);
  calcHistory.push({ expr, result });
}

document.getElementById("clearHistory").addEventListener("click", () => {
  historyList.innerHTML = "";
  calcHistory.length = 0;
});

// --- Graphing Functionality ---
document.getElementById("plotButton").addEventListener("click", () => {
  const fnString = document.getElementById("graphFunction").value;
  const xMin = parseFloat(document.getElementById("xMin").value);
  const xMax = parseFloat(document.getElementById("xMax").value);
  
  if (!fnString) return;
  const points = 500;
  const xValues = math.range(xMin, xMax, (xMax - xMin) / points, true).toArray();
  let yValues = [];
  try {
    // Create a new function using math.js. The variable should be "x".
    const f = parser.evaluate('f(x) = ' + fnString);
    yValues = xValues.map(x => {
      let y = f(x);
      return (typeof y === "number" && isFinite(y)) ? y : null;
    });
    Plotly.newPlot('graphArea', [{
      x: xValues,
      y: yValues,
      mode: 'lines',
      line: { color: '#0f0' }
    }], {
      paper_bgcolor: document.body.classList.contains("light") ? "#fff" : "#222",
      plot_bgcolor: document.body.classList.contains("light") ? "#eee" : "#111",
      font: { color: document.body.classList.contains("light") ? "#000" : "#0f0" },
      margin: { t: 20 }
    });
  } catch (err) {
    alert("Error plotting function");
  }
});

// --- Matrix Operations ---
document.getElementById("matrixCalc").addEventListener("click", () => {
  const A = parseMatrix(document.getElementById("matrixA").value);
  const B = parseMatrix(document.getElementById("matrixB").value);
  const op = document.getElementById("matrixOp").value;
  let result;
  try {
    switch(op) {
      case "add":
        result = math.add(A, B);
        break;
      case "subtract":
        result = math.subtract(A, B);
        break;
      case "multiply":
        result = math.multiply(A, B);
        break;
      case "determinantA":
        result = math.det(A);
        break;
      case "inverseA":
        result = math.inv(A);
        break;
      case "transposeA":
        result = math.transpose(A);
        break;
      default:
        result = "Invalid Operation";
    }
    document.getElementById("matrixResult").textContent = math.format(result, { precision: 4 });
  } catch (err) {
    document.getElementById("matrixResult").textContent = "Error in matrix operation.";
  }
});

function parseMatrix(text) {
  return text.trim().split(/\r?\n/).map(row =>
    row.split(",").map(item => parseFloat(item.trim()))
  );
}
