/*
 * Booking engine.
 *
 * Flow: choose service -> choose coach (optional) -> pick date ->
 * pick a time slot -> fill contact details -> confirm.
 *
 * - Slots are generated from config.js (openHour/closeHour/duration)
 *   for the selected service.
 * - Slots in the past and slots already booked are disabled.
 * - Bookings are persisted through Storage2 (localStorage and,
 *   when configured, Supabase).
 */
(function () {
    "use strict";

    const CFG = window.SITE_CONFIG;
    const RULES = CFG.booking;
    const DAY_MS = 86400000;

    const $ = function (id) { return document.getElementById(id); };

    const form = $("booking-form");
    const serviceSelect = $("field-service");
    const coachSelect = $("field-coach");
    const dateInput = $("field-date");
    const slotsEl = $("field-slots");
    const slotsHint = $("slots-hint");
    const errorEl = $("booking-error");
    const submitBtn = $("booking-submit");
    const storageHint = $("storage-hint");

    const scheduleList = $("schedule-list");
    const scheduleEmpty = $("schedule-empty");
    const scheduleCount = $("schedule-count");

    let bookings = [];
    let selectedSlot = null;   // { start, end, label }

    /* ---------- helpers ---------- */

    function pad(n) { return String(n).padStart(2, "0"); }

    function toISODate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

    function todayISO() { return toISODate(new Date()); }

    function nowMinutes() { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); }

    function formatClock(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        const period = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        return hour12 + ":" + pad(m) + " " + period;
    }

    function getService(title) {
        return (CFG.services || []).find(function (s) { return s.title === title; });
    }

    function isWorkingDay(dateStr) {
        const d = new Date(dateStr + "T00:00:00");
        return RULES.workingDays.indexOf(d.getDay()) !== -1;
    }

    function findConflicting(dateStr, start, end) {
        return bookings.find(function (b) {
            return b.date === dateStr && start < b.end && end > b.start;
        });
    }

    function slotIsPast(dateStr, start) {
        if (dateStr < todayISO()) return true;
        if (dateStr === todayISO()) return start <= nowMinutes();
        return false;
    }

    /* ---------- toasts ---------- */

    function showToast(message, type) {
        const toast = $("toast");
        toast.textContent = message;
        toast.classList.remove("is-success", "is-error");
        if (type === "success") toast.classList.add("is-success");
        if (type === "error") toast.classList.add("is-error");
        toast.hidden = false;
        window.clearTimeout(showToast._t);
        showToast._t = window.setTimeout(function () { toast.hidden = true; }, 3600);
    }

    function showError(message) {
        if (!message) { errorEl.hidden = true; errorEl.textContent = ""; return; }
        errorEl.textContent = message;
        errorEl.hidden = false;
    }

    /* ---------- form population ---------- */

    function populateSelects() {
        CFG.services.forEach(function (s) {
            const opt = document.createElement("option");
            opt.value = s.title;
            opt.textContent = s.title;
            serviceSelect.appendChild(opt);
        });

        (CFG.coaches || []).forEach(function (c) {
            const opt = document.createElement("option");
            opt.value = c.name;
            opt.textContent = c.name;
            coachSelect.appendChild(opt);
        });

        serviceSelect.addEventListener("change", function () {
            selectedSlot = null;
            renderSlots();
        });
    }

    /* ---------- slot grid ---------- */

    function renderSlots() {
        slotsEl.innerHTML = "";
        selectedSlot = null;

        const serviceTitle = serviceSelect.value;
        const dateStr = dateInput.value;

        if (!serviceTitle) {
            slotsHint.textContent = "Select a service to see available times.";
            return;
        }
        if (!dateStr) {
            slotsHint.textContent = "Pick a date to see available times.";
            return;
        }
        if (!isWorkingDay(dateStr)) {
            slotsHint.textContent = "This day is closed. Pick another day.";
            return;
        }

        const service = getService(serviceTitle);
        const duration = (service && service.durationMinutes) || RULES.slotMinutes || 60;
        const open = RULES.openHour * 60;
        const close = RULES.closeHour * 60;
        let count = 0;

        for (let start = open; start + duration <= close; start += duration) {
            const end = start + duration;
            const label = formatClock(start);
            const past = slotIsPast(dateStr, start);
            const conflict = findConflicting(dateStr, start, end);

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "slot";
            btn.textContent = label;
            btn.setAttribute("aria-label", label + (past ? " (unavailable)" : conflict ? " (booked)" : ""));

            if (past) { btn.disabled = true; btn.classList.add("is-past"); }
            else if (conflict) { btn.disabled = true; btn.classList.add("is-booked"); }
            else {
                btn.addEventListener("click", function () {
                    const prev = slotsEl.querySelector(".is-selected");
                    if (prev) prev.classList.remove("is-selected");
                    btn.classList.add("is-selected");
                    selectedSlot = { start: start, end: end, label: label };
                    showError(null);
                });
            }

            slotsEl.appendChild(btn);
            count += 1;
        }

        slotsHint.textContent = count === 0
            ? "No times available on this day."
            : duration + "-minute session. Select a time to continue.";
    }

    /* ---------- validation ---------- */

    const PHONE_RE = /^[+]?[0-9\s()-]{7,20}$/;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateForm() {
        const errors = [];

        if (!serviceSelect.value) errors.push("Choose a service.");
        if (!dateInput.value) errors.push("Choose a date.");
        else if (!isWorkingDay(dateInput.value)) errors.push("That day is closed.");
        if (!selectedSlot) errors.push("Choose a time slot.");

        const name = $("field-name").value.trim();
        const phone = $("field-phone").value.trim();
        const email = $("field-email").value.trim();

        if (!name) errors.push("Enter your full name.");
        if (!phone) errors.push("Enter your phone number.");
        else if (!PHONE_RE.test(phone)) errors.push("That phone number does not look valid.");
        if (!email) errors.push("Enter your email.");
        else if (!EMAIL_RE.test(email)) errors.push("That email does not look valid.");

        if (errors.length) return errors;

        if (findConflicting(dateInput.value, selectedSlot.start, selectedSlot.end)) {
            return ["That time was just taken. Please pick another slot."];
        }

        return [];
    }

    /* ---------- submit ---------- */

    async function onSubmit(e) {
        e.preventDefault();
        showError(null);

        const errors = validateForm();
        if (errors.length) {
            showToast(errors[0], "error");
            showError(errors.join(" "));
            return;
        }

        const booking = {
            id: "b_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            service: serviceSelect.value,
            coach: coachSelect.value || "Any coach",
            date: dateInput.value,
            start: selectedSlot.start,
            end: selectedSlot.end,
            timeLabel: selectedSlot.label,
            name: $("field-name").value.trim(),
            phone: $("field-phone").value.trim(),
            email: $("field-email").value.trim(),
            notes: $("field-notes").value.trim(),
            createdAt: new Date().toISOString()
        };

        submitBtn.disabled = true;
        try {
            await Storage2.add(booking);
            bookings.push(booking);
            renderSchedule();
            form.reset();
            serviceSelect.value = "";
            coachSelect.value = "";
            slotsEl.innerHTML = "";
            slotsHint.textContent = "Select a service and date to see times.";
            selectedSlot = null;
            showToast("Session booked for " + booking.timeLabel + ". See you there!", "success");
        } finally {
            submitBtn.disabled = false;
        }
    }

    /* ---------- schedule management ---------- */

    function sortBookings(list) {
        return list.slice().sort(function (a, b) {
            if (a.date !== b.date) return a.date < b.date ? -1 : 1;
            return a.start - b.start;
        });
    }

    function renderSchedule() {
        const sorted = sortBookings(bookings);
        scheduleList.innerHTML = "";
        scheduleCount.textContent = sorted.length + (sorted.length === 1 ? " booking" : " bookings");
        scheduleEmpty.hidden = sorted.length !== 0;

        sorted.forEach(function (b) {
            const li = document.createElement("li");
            li.className = "schedule-item";

            const titleRow = document.createElement("div");
            titleRow.className = "schedule-item-title";
            titleRow.appendChild(document.createTextNode(b.service));
            const time = document.createElement("time");
            time.textContent = b.timeLabel;
            titleRow.appendChild(time);

            const meta = document.createElement("p");
            meta.className = "schedule-item-meta";
            meta.textContent = b.name + " - " + b.coach + " - " + b.date;

            const actions = document.createElement("div");
            actions.className = "schedule-item-actions";
            const cancel = document.createElement("button");
            cancel.type = "button";
            cancel.className = "btn-link";
            cancel.textContent = "Cancel booking";
            cancel.addEventListener("click", function () {
                cancelBooking(b.id);
            });
            actions.appendChild(cancel);

            li.appendChild(titleRow);
            li.appendChild(meta);
            li.appendChild(actions);
            scheduleList.appendChild(li);
        });
    }

    async function cancelBooking(id) {
        await Storage2.remove(id);
        bookings = bookings.filter(function (b) { return b.id !== id; });
        renderSchedule();
        renderSlots();
        showToast("Booking cancelled.", "success");
    }

    /* ---------- init ---------- */

    async function init() {
        populateSelects();
        dateInput.min = todayISO();
        dateInput.addEventListener("change", function () {
            selectedSlot = null;
            renderSlots();
        });
        form.addEventListener("submit", onSubmit);

        storageHint.textContent = Storage2.provider() === "supabase"
            ? "Bookings sync to your Supabase table."
            : "Your booking is saved in this browser.";

        try {
            bookings = await Storage2.load();
        } catch (err) {
            console.warn("[booking] Could not load bookings.", err);
            bookings = [];
        }
        renderSchedule();
        renderSlots();
    }

    window.Booking = { init: init };
})();
