let reservations = [];

const form = document.getElementById('reservation-form');
const activeList = document.getElementById('activeList');
const historyList = document.getElementById('historyList');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const filterDate = document.getElementById('filterDate');
const filteredList = document.getElementById('filteredList');

const sharedBeds = ["1s","2s","3s","4s","5s","6s","1m","2m","3m","4m","5m","6m","1i","2i","3i","4i","5i","6i"];
const volunteerBeds = ["1s","2s","3s","1m","2m","3m","1i","2i","3i"];
const privateRooms = [1, 2, 3, 4, 5, 6];

const sharedRoomDiv = document.getElementById('sharedRoom');
const volunteerRoomDiv = document.getElementById('volunteerRoom');
const privateRoomsDiv = document.getElementById('privateRooms');

const toggleDarkMode = document.getElementById('toggleDarkMode');
toggleDarkMode.onclick = () => document.body.classList.toggle('dark');

// Inicialização
renderBeds();
renderReservations();

form.onsubmit = (e) => {
  e.preventDefault();
  const res = {
    name: document.getElementById('name').value,
    nationality: document.getElementById('nationality').value,
    roomBed: document.getElementById('roomBed').value.trim().toUpperCase(),
    checkin: document.getElementById('checkin').value,
    checkout: document.getElementById('checkout').value,
    payment: parseFloat(document.getElementById('payment').value)
  };
  reservations.push(res);
  renderReservations();
  form.reset();
};

function renderBeds() {
  sharedRoomDiv.innerHTML = sharedBeds.map(b => renderBed(`C-${b}`)).join('');
  volunteerRoomDiv.innerHTML = volunteerBeds.map(b => renderBed(`V-${b}`)).join('');
  privateRoomsDiv.innerHTML = privateRooms.map(n => renderBed(`P-${n}`)).join('');
}

function renderBed(id) {
  const occupied = reservations.some(r => r.roomBed === id && !isPast(r.checkout));
  return `<div class="bed ${occupied ? 'occupied' : ''}">${id}</div>`;
}

function renderReservations() {
  activeList.innerHTML = '';
  historyList.innerHTML = '';
  renderBeds();

  reservations.forEach((r, i) => {
    const li = document.createElement('li');
    li.textContent = `${r.name} (${r.nationality}) - ${r.roomBed} de ${r.checkin} até ${r.checkout} - R$${r.payment}`;
    
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.onclick = () => openEditModal(i);
    li.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Excluir';
    delBtn.onclick = () => { reservations.splice(i, 1); renderReservations(); };
    li.appendChild(delBtn);

    const isHistory = isPast(r.checkout);
    (isHistory ? historyList : activeList).appendChild(li);
  });
}

function isPast(date) {
  return new Date(date) < new Date();
}

// 🔎 Busca
searchInput.oninput = () => {
  const value = searchInput.value.toLowerCase();
  searchResults.innerHTML = '';
  reservations.forEach(r => {
    if (r.name.toLowerCase().includes(value)) {
      const li = document.createElement('li');
      li.textContent = `${r.name} - ${r.roomBed} (${r.checkin} → ${r.checkout})`;
      searchResults.appendChild(li);
    }
  });
};

// 📅 Filtro por data
filterDate.onchange = () => {
  const date = filterDate.value;
  filteredList.innerHTML = '';
  reservations.forEach(r => {
    if (date >= r.checkin && date <= r.checkout) {
      const li = document.createElement('li');
      li.textContent = `${r.name} - ${r.roomBed} (${r.checkin} → ${r.checkout})`;
      filteredList.appendChild(li);
    }
  });
};

// 📤 Exportar JSON
document.getElementById('exportJson').onclick = () => {
  const blob = new Blob([JSON.stringify(reservations, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, 'reservas.json');
};

// 📤 Exportar CSV
document.getElementById('exportCsv').onclick = () => {
  const csv = 'Nome,Nacionalidade,Quarto/Cama,Entrada,Saída,Valor\n' +
    reservations.map(r => `${r.name},${r.nationality},${r.roomBed},${r.checkin},${r.checkout},${r.payment}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, 'reservas.csv');
};

function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 📥 Importar JSON
document.getElementById('importJson').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      reservations = JSON.parse(reader.result);
      renderReservations();
    } catch (e) {
      alert('Erro ao importar JSON.');
    }
  };
  reader.readAsText(file);
};

// ✏️ Edição via modal
function openEditModal(index) {
  const r = reservations[index];
  document.getElementById('editIndex').value = index;
  document.getElementById('editName').value = r.name;
  document.getElementById('editNationality').value = r.nationality;
  document.getElementById('editRoomBed').value = r.roomBed;
  document.getElementById('editCheckin').value = r.checkin;
  document.getElementById('editCheckout').value = r.checkout;
  document.getElementById('editPayment').value = r.payment;
  document.getElementById('editModal').classList.remove('hidden');
}

document.getElementById('edit-form').onsubmit = (e) => {
  e.preventDefault();
  const i = parseInt(document.getElementById('editIndex').value);
  reservations[i] = {
    name: editName.value,
    nationality: editNationality.value,
    roomBed: editRoomBed.value.trim().toUpperCase(),
    checkin: editCheckin.value,
    checkout: editCheckout.value,
    payment: parseFloat(editPayment.value)
  };
  document.getElementById('editModal').classList.add('hidden');
  renderReservations();
};

document.getElementById('closeModal').onclick = () => {
  document.getElementById('editModal').classList.add('hidden');
};
