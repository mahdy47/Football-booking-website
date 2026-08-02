const form = document.getElementById('match-form');
const submitBtn = document.getElementById('submit-btn');
const joinBtn = document.getElementById('join-btn');
const matchesList = document.getElementById('matches-list');
const existingMatchesDropdown = document.getElementById('existing-matches');

function loadMatches() {
    return JSON.parse(localStorage.getItem('matches')) || [];
}

function saveMatches(matches) {
    localStorage.setItem('matches', JSON.stringify(matches));
}

function generateId() {
    return 'm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

// Give an id to matches stored by the previous version so joining stays reliable.
function normalizeMatches(matches) {
    return matches.map((match, index) =>
        match.id ? match : { id: 'm_legacy_' + index, ...match }
    );
}

function formatMatchTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function strong(label) {
    const el = document.createElement('strong');
    el.textContent = label;
    return el;
}

function createInfoLine(label, value) {
    const p = document.createElement('p');
    p.appendChild(strong(label));
    p.appendChild(document.createTextNode(value));
    return p;
}

window.onload = function () {
    refreshMatchesUI();
};

submitBtn.addEventListener('click', function (event) {
    event.preventDefault();

    const match = collectFormData();
    if (!match) return;

    const matches = loadMatches();
    matches.push(match);
    saveMatches(matches);

    addMatchToList(match);
    addMatchToDropdown(match);
    form.reset();
});

joinBtn.addEventListener('click', function (event) {
    event.preventDefault();

    const selectedId = existingMatchesDropdown.value;
    if (!selectedId) return alert("Please select a match to join.");

    const joinTeamName = document.getElementById('team-name').value.trim();
    if (!joinTeamName) return alert("Please enter your team name.");

    let matches = loadMatches();
    let updated = false;

    matches = matches.map(function (match) {
        const isTarget = match.id === selectedId || match.matchName === selectedId;
        if (isTarget && !match.opponentTeamName) {
            match.opponentTeamName = joinTeamName;
            updated = true;
        }
        return match;
    });

    if (!updated) {
        alert("This match already has two teams or couldn't be updated.");
        return;
    }

    saveMatches(matches);
    refreshMatchesUI();
    form.reset();
});

function collectFormData() {
    const matchName = document.getElementById('match-name').value.trim();
    const teamName = document.getElementById('team-name').value.trim();
    const location = document.getElementById('location').value.trim();
    const matchTime = document.getElementById('match-time').value;
    const players = document.getElementById('players').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!matchName || !teamName || !location || !matchTime || !players || !phone) {
        alert("Please fill in all fields.");
        return null;
    }

    return {
        id: generateId(),
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

    const title = document.createElement('h3');
    title.textContent = match.matchName;

    const teamsLine = document.createElement('p');
    teamsLine.className = 'teams-line';
    teamsLine.textContent = match.opponentTeamName
        ? match.teamName + ' vs ' + match.opponentTeamName
        : match.teamName + ' (waiting for opponent)';

    matchItem.appendChild(title);
    matchItem.appendChild(teamsLine);
    matchItem.appendChild(createInfoLine('Date: ', formatMatchTime(match.matchTime)));
    matchItem.appendChild(createInfoLine('Location: ', match.location));
    matchItem.appendChild(createInfoLine('Players: ', match.players));

    matchesList.appendChild(matchItem);
}

function addMatchToDropdown(match) {
    if (match.opponentTeamName) return;

    const option = document.createElement('option');
    option.value = match.id || match.matchName;
    option.textContent = match.matchName;
    existingMatchesDropdown.appendChild(option);
}

function refreshMatchesUI() {
    matchesList.innerHTML = "";
    existingMatchesDropdown.innerHTML = '<option value="">-- Select Match to Join --</option>';

    const matches = normalizeMatches(loadMatches());
    saveMatches(matches);
    if (matches.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No matches yet — create the first one!';
        matchesList.appendChild(empty);
        return;
    }

    matches.forEach(function (match) {
        addMatchToList(match);
        addMatchToDropdown(match);
    });
}
