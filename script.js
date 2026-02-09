let members = [];

function goToPage(n) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(`page${n}`).classList.add("active");
}

function addMember() {
  let name = memberInput.value.trim();
  if (!name || members.find(m => m.name === name)) return;

  members.push({
  name,
  payments: [],
  share: 0
});

  memberInput.value = "";
  renderMembers();
}

function renderMembers() {
  membersDiv = document.getElementById("members");
  membersDiv.innerHTML = "";

  members.forEach(m => {
    membersDiv.innerHTML += `<div class="card">🎮 ${m.name}</div>`;
  });
}

function goToAmounts() {
  goToPage(3);
}

function renderAmountCards() {
  const cards = document.getElementById("amountCards");
  cards.innerHTML = "";

  members.forEach((m, i) => {
    cards.innerHTML += `
      <div class="card">
        <h3>${m.name}</h3>
        <input type="number"
       placeholder="Your share"
       onchange="members[${i}].share = +this.value">

       
<input type="text" placeholder="For what?" id="note-${i}">
<button onclick="addPayment(${i})">Add Payment</button>

<div id="list-${i}" class="payment-list"></div>

    `;
  });
}

function addPayment(index) {
  const amountInput = document.getElementById(`pay-${index}`);
  const noteInput = document.getElementById(`note-${index}`);

  if (!amountInput || !noteInput) {
    console.error("Inputs not found for index", index);
    return;
  }

  const amount = +amountInput.value;
  const note = noteInput.value.trim() || "Payment";

  if (!amount || amount <= 0) return;

  members[index].payments.push({ amount, note });

  amountInput.value = "";
  noteInput.value = "";

  renderPaymentList(index);
}


function renderPaymentList(index) {
  const list = document.getElementById(`list-${index}`);
  const payments = members[index].payments;

  list.innerHTML = payments
    .map(p => `₹${p.amount} <span>(${p.note})</span>`)
    .join("<br>");
}



function calculate() {
  goToPage(4);

  // 1. Total money spent
  let total = members.reduce(
    (sum, m) => sum + m.payments.reduce((a, p) => a + p.amount, 0),
    0
  );

  // 2. Handle unequal + auto shares
  let totalCustomShare = members.reduce((s, m) => s + (m.share || 0), 0);
  let autoMembers = members.filter(m => !m.share);

  members.forEach(m => {
    m.totalPaid = m.payments.reduce((a, p) => a + p.amount, 0);
    m.finalShare = m.share
      ? m.share
      : (total - totalCustomShare) / autoMembers.length;
  });

  // 3. Build creditors & debtors
  let creditors = [];
  let debtors = [];

  members.forEach(m => {
    let diff = m.totalPaid - m.finalShare;

    if (diff > 0) {
      creditors.push({ name: m.name, amt: diff });
    } else if (diff < 0) {
      debtors.push({ name: m.name, amt: -diff });
    }
  });

  // 4. Settlement logic
  let res = `
    <p><b>Total:</b> ₹${total}</p>
    <p><b>Each share:</b></p>
    <hr>
  `;

  debtors.forEach(d => {
    creditors.forEach(c => {
      if (d.amt > 0 && c.amt > 0) {
        let pay = Math.min(d.amt, c.amt);
        d.amt -= pay;
        c.amt -= pay;

        res += `<p>${d.name} pays ₹${pay.toFixed(0)} to ${c.name}</p>`;
      }
    });
  });

  document.getElementById("result").innerHTML = res;
}


function goToPage(n) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(`page${n}`).classList.add("active");

  if (n === 3) {
    renderAmountCards(); // render ONCE when page 3 opens
  }
}



function copyResult() {
  const text = document.getElementById("result").innerText;
  navigator.clipboard.writeText(text);
  alert("Copied to clipboard!");
}

function downloadResult() {
  const text = document.getElementById("result").innerText;
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "settlement.txt";
  link.click();
}
