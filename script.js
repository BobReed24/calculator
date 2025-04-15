const display = document.getElementById("display");
const buttonsContainer = document.getElementById("buttons");
const precisionSelect = document.getElementById("precision");

const layout = [
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "+", "="],
  ["sqrt", "^", "cos", "sin"],
  ["tan", "log", "exp", "("],
  [")", "pi", "e", "C"]
];

const variables = {};

layout.flat().forEach(text => {
  const btn = document.createElement("button");
  btn.textContent = text;

  btn.addEventListener("click", () => handleInput(text));
  buttonsContainer.appendChild(btn);
});

function handleInput(text) {
  if (text === "=") {
    calculate();
  } else if (text === "C") {
    display.value = "";
  } else if (text === "pi") {
    display.value += Math.PI;
  } else if (text === "e") {
    display.value += Math.E;
  } else {
    display.value += text;
  }
}

function calculate() {
  let expr = display.value.trim();

  try {
    // Variable assignment (e.g., x=5)
    if (/^[a-zA-Z]\w* *=/.test(expr)) {
      const [name, valExpr] = expr.split("=");
      const val = evalExpression(valExpr);
      variables[name.trim()] = val;
      display.value = `${name.trim()}=${formatResult(val)}`;
    } else {
      const result = evalExpression(expr);
      display.value = formatResult(result);
    }
  } catch {
    display.value = "Error";
  }
}

function evalExpression(expression) {
  let expr = expression;

  // Replace math functions
  expr = expr
    .replace(/sqrt/g, "Math.sqrt")
    .replace(/cos/g, "Math.cos")
    .replace(/sin/g, "Math.sin")
    .replace(/tan/g, "Math.tan")
    .replace(/log/g, "Math.log")
    .replace(/exp/g, "Math.exp")
    .replace(/(\d+)\s*\^\s*(\d+)/g, "Math.pow($1,$2)");

  // Replace variables
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`\\b${key}\\b`, "g");
    expr = expr.replace(regex, val);
  }

  return eval(expr);
}

function formatResult(result) {
  const precision = parseInt(precisionSelect.value);
  if (precision === -1) return result.toString();
  return parseFloat(result).toFixed(precision);
}

// Keyboard support
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (/^[0-9a-zA-Z.+\-*/^=() ]$/.test(key)) {
    display.value += key;
  } else if (key === "Enter") {
    calculate();
  } else if (key === "Backspace") {
    display.value = display.value.slice(0, -1);
  } else if (key === "Escape") {
    display.value = "";
  }
});
