/*
 * Match engine.
 *
 * Flow: Team A creates a match -> the match appears on the matchboard
 * with an open "Team B" slot -> one team joins as the opponent ->
 * the match is locked in.
 *
 * Rules:
 * - A match has exactly one opposing team (teamB). Once set, it is full.
 * - Matches are persisted through Storage2 (localStorage and,
 *   when configured, Supabase).
 * - The creator of a match (Team A) can cancel it; the joiner of a
 *   full match can release their slot back.
 */
(function () {
    "use strict";

    const CFG = window.SITE_CONFIG;
    const $ = function (id) { return document.getElementById(id); };

    const createForm = $("match-create-form");
    const joinMatchSelect = $("join-match");
    const joinTeamInput = $("join-team");
    const joinSubmitBtn = $("join-submit");
    const matchError = $("match-error");
    const storageHint = $("storage-hint");

    const matchesGrid = $("matches-grid");
    const matchesEmpty = $("matches-empty");
    const matchesCount = $("matches-count");

    const heroSlots = $("hero-card-slots");
    const heroSlotLine = $("hero-card-slot");

    let matches = [];

    /* ---------- helpers ---------- */

    function pad(n) { return String(n).padStart(2, "0"); }

    function fmtDate(value) {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value || "";
        return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    }

    function fmtTime(value) {
        const d = new Date(value);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    function openMatches() {
        return matches.filter(function (m) { return !m.teamB; });
    }

    function sortMatches(list) {
        return list.slice().sort(function (a, b) {
            const at = a.time || "";
            const bt = b.time || "";
            if (at !== bt) return at < bt ? -1 : 1;
            return (a.createdAt || "") < (b.createdAt || "") ? -1 : 1;
        });
    }

    function showToast(message, type) {
        const el = $("toast");
        el.textContent = message;
        el.classList.remove("is-success", "is-error");
        if (type === "success") el.classList.add("is-success");
        if (type === "error") el.classList.add("is-error");
        el.hidden = false;
        window.clearTimeout(showToast._t);
        showToast._t = window.setTimeout(function () { el.hidden = true; }, 3600);
    }

    function showError(message) {
        if (!message) { matchError.hidden = true; matchError.textContent = ""; return; }
        matchError.textContent = message;
        matchError.hidden = false;
    }

    function fieldValue(id) {
        return $(id).value.trim();
    }

    /* ---------- toasts / messaging ---------- */

    function persist(match) {
        return Storage2.add(match).then(function () { return match; });
    }

    /* ---------- matchboard ---------- */

    function renderMatchboard() {
        matchesGrid.innerHTML = "";
        const sorted = sortMatches(matches);

        matchesCount.textContent = sorted.length + (sorted.length === 1 ? " match" : " matches");
        matchesEmpty.hidden = sorted.length !== 0;

        sorted.forEach(function (m) {
            const card = document.createElement("article");
            card.className = "match-card reveal";

            const head = document.createElement("div");
            head.className = "match-card-head";

            const name = document.createElement("h3");
            name.textContent = m.name;
            head.appendChild(name);

            const status = document.createElement("span");
            status.className = "match-status " + (m.teamB ? "is-full" : "is-open");
            status.textContent = m.teamB ? "Full" : "Open";
            head.appendChild(status);

            const meta = document.createElement("div");
            meta.className = "match-card-meta";

            const when = document.createElement("span");
            when.textContent = fmtDate(m.time) + " · " + fmtTime(m.time);
            meta.appendChild(when);

            const where = document.createElement("span");
            where.textContent = m.location;
            meta.appendChild(where);

            const teams = document.createElement("div");
            teams.className = "match-teams";

            const teamA = document.createElement("div");
            teamA.className = "match-team";
            teamA.innerHTML = '<span class="match-team-badge">A</span>';
            const aName = document.createElement("strong");
            aName.textContent = m.teamA || "Team A";
            teamA.appendChild(aName);

            const vs = document.createElement("span");
            vs.className = "match-vs";
            vs.textContent = "VS";

            const teamB = document.createElement("div");
            teamB.className = "match-team" + (m.teamB ? "" : " is-open");
            teamB.innerHTML = m.teamB ? '<span class="match-team-badge">B</span>' : '<span class="match-team-badge">B</span>';
            const bName = document.createElement("strong");
            bName.textContent = m.teamB || "Open slot";
            teamB.appendChild(bName);

            teams.appendChild(teamA);
            teams.appendChild(vs);
            teams.appendChild(teamB);

            const foot = document.createElement("div");
            foot.className = "match-card-foot";

            const players = document.createElement("span");
            players.textContent = m.players ? m.players + "-a-side" : "";
            foot.appendChild(players);

            if (!m.teamB) {
                const joinBtn = document.createElement("button");
                joinBtn.type = "button";
                joinBtn.className = "btn btn-primary btn-sm";
                joinBtn.textContent = "Join as Team B";
                joinBtn.addEventListener("click", function () {
                    joinMatchSelect.value = m.id;
                    document.getElementById("join").scrollIntoView({ behavior: "smooth" });
                });
                foot.appendChild(joinBtn);
            } else {
                const cancelBtn = document.createElement("button");
                cancelBtn.type = "button";
                cancelBtn.className = "btn btn-outline btn-sm";
                cancelBtn.textContent = "Cancel match";
                cancelBtn.addEventListener("click", function () { cancelMatch(m.id); });
                foot.appendChild(cancelBtn);
            }

            card.appendChild(head);
            card.appendChild(meta);
            card.appendChild(teams);
            card.appendChild(foot);
            matchesGrid.appendChild(card);
        });

        renderJoinSelect();
        renderHeroCard();
    }

    /* ---------- join select ---------- */

    function renderJoinSelect() {
        const current = joinMatchSelect.value;
        joinMatchSelect.innerHTML = "";
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "-- Select a match to join --";
        joinMatchSelect.appendChild(placeholder);

        const open = sortMatches(openMatches());
        if (!open.length) {
            joinMatchSelect.disabled = true;
            return;
        }
        joinMatchSelect.disabled = false;
        open.forEach(function (m) {
            const opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.name + " · " + fmtDate(m.time) + " " + fmtTime(m.time);
            joinMatchSelect.appendChild(opt);
        });
        if (current && open.some(function (m) { return m.id === current; })) {
            joinMatchSelect.value = current;
        }
    }

    /* ---------- hero card (live from real match data) ---------- */

    function renderHeroCard() {
        const open = openMatches();

        if (heroSlots) {
            heroSlots.innerHTML = "";
            if (open.length) {
                const chip = document.createElement("span");
                chip.className = "hero-chip is-open";
                chip.textContent = open.length + " open match" + (open.length === 1 ? "" : "es");
                heroSlots.appendChild(chip);
            } else if (matches.length) {
                const chip = document.createElement("span");
                chip.className = "hero-chip is-taken";
                chip.textContent = "Matchboard full";
                heroSlots.appendChild(chip);
            } else {
                const chip = document.createElement("span");
                chip.className = "hero-chip is-open";
                chip.textContent = "No matches yet";
                heroSlots.appendChild(chip);
            }
        }

        if (heroSlotLine) {
            heroSlotLine.textContent = matches.length
                ? matches.length + " match" + (matches.length === 1 ? "" : "es") + " on the board"
                : "Create a match · find an opponent";
        }
    }

    /* ---------- create match (Team A) ---------- */

    function validateCreate() {
        const errors = [];
        if (!fieldValue("match-name")) errors.push("Enter a match name.");
        if (!fieldValue("match-team")) errors.push("Enter your team name.");
        if (!fieldValue("match-location")) errors.push("Enter the venue.");
        const time = fieldValue("match-time");
        if (!time) errors.push("Pick a date and time.");
        else if (new Date(time).getTime() <= Date.now() - 60000) errors.push("Match time must be in the future.");
        const players = parseInt(fieldValue("match-players"), 10);
        if (!players || players < 1) errors.push("Enter a valid number of players per team.");
        const phone = fieldValue("match-phone");
        if (!phone) errors.push("Enter a contact phone.");
        else if (!/^[+]?[0-9\s()-]{7,20}$/.test(phone)) errors.push("That phone number does not look valid.");
        return errors;
    }

    async function onCreate(e) {
        e.preventDefault();
        showError(null);

        const errors = validateCreate();
        if (errors.length) {
            showToast(errors[0], "error");
            showError(errors.join(" "));
            return;
        }

        const match = {
            id: "m_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            name: fieldValue("match-name"),
            teamA: fieldValue("match-team"),
            teamB: "",
            location: fieldValue("match-location"),
            time: fieldValue("match-time"),
            players: parseInt(fieldValue("match-players"), 10),
            phone: fieldValue("match-phone"),
            createdAt: new Date().toISOString()
        };

        const submitBtn = $("match-submit");
        submitBtn.disabled = true;
        try {
            await Storage2.add(match);
            matches.push(match);
            renderMatchboard();
            createForm.reset();
            showToast("Match created! Share the page so Team B can join.", "success");
        } finally {
            submitBtn.disabled = false;
        }
    }

    /* ---------- join match (Team B) ---------- */

    function validateJoin() {
        const errors = [];
        const id = joinMatchSelect.value;
        if (!id) errors.push("Select a match to join.");
        const team = joinTeamInput.value.trim();
        if (!team) errors.push("Enter your team name.");
        if (errors.length) return { errors: errors, match: null, team: team };

        const match = matches.find(function (m) { return m.id === id; });
        if (!match) return { errors: ["That match no longer exists."], match: null, team: team };
        if (match.teamB) return { errors: ["That match already has an opponent."], match: match, team: team };
        return { errors: [], match: match, team: team };
    }

    async function onJoin() {
        const { errors, match, team } = validateJoin();
        if (errors.length) {
            showToast(errors[0], "error");
            showError(errors.join(" "));
            return;
        }

        const full = matches.find(function (m) { return m.id === match.id; });
        if (full.teamB) {
            showToast("That match was just taken by another team.", "error");
            renderMatchboard();
            return;
        }

        joinSubmitBtn.disabled = true;
        try {
            match.teamB = team;
            await Storage2.add(match);
            renderMatchboard();
            joinMatchSelect.value = "";
            joinTeamInput.value = "";
            showToast("You are Team B for \"" + match.name + "\". See you on the pitch!", "success");
        } finally {
            joinSubmitBtn.disabled = false;
        }
    }

    /* ---------- cancel / release ---------- */

    async function cancelMatch(id) {
        await Storage2.remove(id);
        matches = matches.filter(function (m) { return m.id !== id; });
        renderMatchboard();
        showToast("Match removed.", "success");
    }

    /* ---------- init ---------- */

    async function init() {
        createForm.addEventListener("submit", onCreate);
        joinSubmitBtn.addEventListener("click", onJoin);
        joinMatchSelect.addEventListener("change", function () { showError(null); });
        joinTeamInput.addEventListener("input", function () { showError(null); });

        storageHint.textContent = Storage2.provider() === "supabase"
            ? "Matches sync to your Supabase table."
            : "Matches are saved in this browser.";

        try {
            matches = await Storage2.load();
        } catch (err) {
            console.warn("[matches] Could not load matches.", err);
            matches = [];
        }
        renderMatchboard();
    }

    window.Matches = { init: init };
})();
