// Správa cookies a session pro omezení hlasování a návrhů
document.addEventListener('DOMContentLoaded', () => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }
    function setCookie(name, value) {
      document.cookie = `${name}=${value}; path=/`;
    }
    function deleteCookie(name) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  
    let userId = getCookie('userId');
    if (!userId) {
      userId = Math.random().toString(36).substr(2, 9);
      setCookie('userId', userId);
    }
  
    const initialFlavors = [
      { name: 'Citrus & Zázvor', votes: 0 },
      { name: 'Zelený čaj & Broskev', votes: 0 },
      { name: 'Malina', votes: 0 },
      { name: 'Citron', votes: 0 },
      { name: 'Jahoda', votes: 0 },
    ];
    let flavors = JSON.parse(localStorage.getItem('flavors')) || initialFlavors;
    let userVotes = JSON.parse(localStorage.getItem(`userVotes_${userId}`)) || [];
    let userProposals = JSON.parse(localStorage.getItem(`userProposals_${userId}`)) || [];
    let devMode = false;
  
    const flavorList = document.getElementById('flavorList');
    const voteBtn = document.getElementById('voteBtn');
    const addBtn = document.getElementById('addFlavorBtn');
    const input = document.getElementById('newFlavor');
    const voteInfo = document.getElementById('voteInfo');
    const addInfo = document.getElementById('addInfo');
    const devBtn = document.getElementById('devBtn');
  
    devBtn.addEventListener('click', () => {
      devMode = !devMode;
      render();
    });
  
    function save() {
      localStorage.setItem('flavors', JSON.stringify(flavors));
      localStorage.setItem(`userVotes_${userId}`, JSON.stringify(userVotes));
      localStorage.setItem(`userProposals_${userId}`, JSON.stringify(userProposals));
    }
  
    function render() {
      flavorList.innerHTML = '';
      const sorted = flavors.slice().sort((a, b) => b.votes - a.votes);
      sorted.forEach((flav, idx) => {
        const li = document.createElement('li');
        li.className = 'poll__item';
        li.innerHTML = `
          <div class="poll__rank">${idx + 1}</div>
          <div class="poll__name">${flav.name}</div>
          <div class="poll__votes">${flav.votes}</div>
          <input
            type="checkbox"
            class="poll__checkbox"
            data-name="${flav.name}"
            ${userVotes.includes(flav.name) ? 'checked disabled' : ''}
          />
        `;
        if (devMode) {
          const delBtn = document.createElement('button');
          delBtn.textContent = '×';
          delBtn.className = 'poll__delete-btn';
          delBtn.addEventListener('click', () => {
            flavors = flavors.filter(f => f.name !== flav.name);
            userVotes = userVotes.filter(v => v !== flav.name);
            userProposals = userProposals.filter(p => p !== flav.name);
            save(); render();
          });
          li.appendChild(delBtn);
        }
        flavorList.appendChild(li);
      });
      voteInfo.textContent = `Hlasováno: ${userVotes.length}/2`;
      addInfo.textContent = `Navrženo: ${userProposals.length}/2`;
      input.disabled = userProposals.length >= 2;
      addBtn.disabled = userProposals.length >= 2;
      voteBtn.disabled = userVotes.length >= 2;
    }
  
    voteBtn.addEventListener('click', () => {
      const checks = Array.from(document.querySelectorAll('.poll__checkbox'))
        .filter(c => c.checked && !userVotes.includes(c.dataset.name));
      if (checks.length + userVotes.length > 2) {
        alert('Můžete hlasovat maximálně pro 2 příchutě.'); return;
      }
      checks.forEach(c => {
        const name = c.dataset.name;
        const flav = flavors.find(f => f.name === name);
        if (flav) { flav.votes++; userVotes.push(name); }
      });
      save(); render();
    });
  
    addBtn.addEventListener('click', () => {
      const val = input.value.trim(); if (!val) return;
      if (userProposals.length >= 2) { alert('Můžete navrhnout maximálně 2 příchutě.'); return; }
      if (flavors.some(f => f.name.toLowerCase() === val.toLowerCase())) { alert('Tato příchuť již existuje.'); input.value=''; return; }
      flavors.push({ name: val, votes: 0 }); userProposals.push(val);
      input.value=''; save(); render();
    });
  
    window.addEventListener('beforeunload', () => {
      deleteCookie('userId');
      localStorage.removeItem(`userVotes_${userId}`);
      localStorage.removeItem(`userProposals_${userId}`);
    });
  
    render();
  });