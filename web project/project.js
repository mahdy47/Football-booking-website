const form = document.getElementById('match-form');
const submitBtn = document.getElementById('submit-btn');
const joinBtn = document.getElementById('join-btn');
const matchesList = document.getElementById('matches-list');
const existingMatchesDropdown = document.getElementById('existing-matches');

window.onload = function () {
    const savedMatches = JSON.parse(localStorage.getItem('matches')) || [];
    savedMatches.forEach(match => {
        addMatchToList(match);
        addMatchToDropdown(match);
    });
};

submitBtn.addEventListener('click', function (event) {
    event.preventDefault();

    const match = collectFormData();
    if (!match) return;

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches.push(match);
    localStorage.setItem('matches', JSON.stringify(matches));

    addMatchToList(match);
    addMatchToDropdown(match);
    form.reset();
});

joinBtn.addEventListener('click', function (event) {
    event.preventDefault();

    const selectedMatchName = existingMatchesDropdown.value;
    if (!selectedMatchName) return alert("Please select a match to join.");

    const joinTeamName = document.getElementById('team-name').value;
    if (!joinTeamName) return alert("Please enter your team name.");

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    let updated = false;

    matches = matches.map(match => {
        if (match.matchName === selectedMatchName && !match.opponentTeamName) {
            match.opponentTeamName = joinTeamName;
            updated = true;
        }
        return match;
    });

    if (!updated) {
        alert("This match already has two teams or couldn't be updated.");
        return;
    }

    localStorage.setItem('matches', JSON.stringify(matches));
    refreshMatchesUI();
    form.reset();
});

function collectFormData() {
    const matchName = document.getElementById('match-name').value;
    const teamName = document.getElementById('team-name').value;
    const location = document.getElementById('location').value;
    const matchTime = document.getElementById('match-time').value;
    const players = document.getElementById('players').value;
    const phone = document.getElementById('phone').value;

    if (!matchName || !teamName || !location || !matchTime || !players || !phone) {
        alert("Please fill in all fields.");
        return null;
    }

    return {
        matchName,
        teamName,
        opponentTeamName: "", 
        location,
        matchTime,
        players,
        phone
    };
}


function addMatchToList(match) {
    const matchItem = document.createElement('div');
    matchItem.classList.add('match-item');

    const teamsDisplay = match.opponentTeamName
        ? `${match.teamName} vs ${match.opponentTeamName}`
        : `${match.teamName} (waiting for opponent)`;

    matchItem.innerHTML = `
        <h3>${match.matchName}</h3>
        <p><strong>Teams:</strong> ${teamsDisplay}</p>
        <p><strong>Date:</strong> ${match.matchTime}</p>
        <p><strong>Location:</strong> ${match.location}</p>
        <p><strong>Players:</strong> ${match.players}</p>
    `;

    matchesList.appendChild(matchItem);
}

function addMatchToDropdown(match) {
    const option = document.createElement('option');
    option.value = match.matchName;
    option.textContent = match.matchName;
    existingMatchesDropdown.appendChild(option);
}

function refreshMatchesUI() {
    matchesList.innerHTML = "";
    existingMatchesDropdown.innerHTML = '<option value="">-- Select Match to Join --</option>';

    const matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches.forEach(match => {
        addMatchToList(match);
        if (!match.opponentTeamName) {
            addMatchToDropdown(match);
        }
    });
}
