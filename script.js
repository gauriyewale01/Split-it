// FIXED GITHUB PAGES PAYMENT BUG

let members = [];

/* ---------- NAVIGATION ---------- */
function goToPage(n) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(`page${n}`).classList.add("active");

  if (n === 3) {
    requestAnimationFrame(() => {
      renderAmountCards();
    });
  }
}


/* ---------- MEMBERS ---------- */
function addMember() {
  const input = document.getElementById("memberInput");
  const name = input.value.trim();
  if (!name) return;

  members.push({
    name,
    payments: [],
    share: 0,
    totalPaid: 0
  });

  input.value = "";
  renderMembers();
}

function renderMembers() {
  const div = document.getElementById("members");
  div.innerHTML = "";

  members.forEach(m => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = m.name;
    div.appendChild(card);
  });
}

/* ---------- PAYMENTS ---------- */
function renderAmountCards() {
  const container = document.getElementById("amountCards");
  container.innerHTML = "";

  members.forEach((m, i) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${m.name}</h3>

      <input type="number" placeholder="Amount" id="amt-${i}">
      <input type="text" placeholder="For what?" id="note-${i}">

      <button id="btn-${i}">Add Payment</button>

      <div id="list-${i}" class="payment-list"></div>
    `;

    container.appendChild(card);

    // SAFE event binding
    document.getElementById(`btn-${i}`)
      .addEventListener("click", () => addPayment(i));

    
  });
}

function addPayment(index) {
  const amtInput = document.getElementById(`amt-${index}`);
  const noteInput = document.getElementById(`note-${index}`);

  if (!amtInput || !noteInput) {
    alert("Payment inputs not ready. Try again.");
    return;
  }

  const amount = Number(amtInput.value);
  const note = noteInput.value.trim() || "Payment";

  if (amount <= 0) return;

  members[index].payments.push({ amount, note });

  amtInput.value = "";
  noteInput.value = "";

  renderPaymentList(index);
}


function renderPaymentList(index) {
  const list = document.getElementById(`list-${index}`);
  list.innerHTML = "";

  members[index].payments.forEach(p => {
    const div = document.createElement("div");
    div.textContent = `₹${p.amount} — ${p.note}`;
    list.appendChild(div);
  });
}

/* ---------- CALCULATION ---------- */
function calculate() {
  goToPage(4);

  const total = members.reduce(
    (sum, m) => sum + m.payments.reduce((s, p) => s + p.amount, 0),
    0
  );

  const customTotal = members.reduce((s, m) => s + (m.share || 0), 0);
  const autoMembers = members.filter(m => !m.share);

  members.forEach(m => {
    m.totalPaid = m.payments.reduce((s, p) => s + p.amount, 0);
    m.finalShare = m.share
      ? m.share
      : (total - customTotal) / autoMembers.length;
  });

  let creditors = [];
  let debtors = [];

  members.forEach(m => {
    const diff = m.totalPaid - m.finalShare;
    if (diff > 0) creditors.push({ name: m.name, amt: diff });
    if (diff < 0) debtors.push({ name: m.name, amt: -diff });
  });

  let output = `<p><b>Total:</b> ₹${total}</p><hr>`;

  debtors.forEach(d => {
    creditors.forEach(c => {
      if (d.amt > 0 && c.amt > 0) {
        const pay = Math.min(d.amt, c.amt);
        d.amt -= pay;
        c.amt -= pay;
        output += `<p>${d.name} pays ₹${pay.toFixed(0)} to ${c.name}</p>`;
      }
    });
  });

  document.getElementById("result").innerHTML = output;
}

/* ---------- EXPORT ---------- */
function copyResult() {
  navigator.clipboard.writeText(
    document.getElementById("result").innerText
  );
  alert("Copied!");
}

function downloadResult() {
  const blob = new Blob(
    [document.getElementById("result").innerText],
    { type: "text/plain" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "settlement.txt";
  a.click();
}
