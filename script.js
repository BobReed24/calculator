const display = document.getElementById("display");
const buttonsContainer = document.getElementById("buttons");

const layout = [
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "+", "="],
  ["sqrt", "^", "cos", "sin"],
  ["tan", "log", "exp", "("],
  [")", "pi", "e", "C"]
];

layout.flat().forEach(text => {
  const btn = document.createElement("button");
  btn.textContent = text;

  btn.addEventListener("click", () => {
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
  });

  buttonsContainer.appendChild(btn);
});

function calculate() {
  let expression = display.value;
  try {
    expression = expression
      .replace(/sqrt/g, "Math.sqrt")
      .replace(/cos/g, "Math.cos")
      .replace(/sin/g, "Math.sin")
      .replace(/tan/g, "Math.tan")
      .replace(/log/g, "Math.log")
      .replace(/exp/g, "Math.exp")
      .replace(/(\d+)\s*\^\s*(\d+)/g, "Math.pow($1,$2)");

    const result = eval(expression);
    display.value = result;
  } catch {
    display.value = "Error";
  }
}
