/*
 * Storage layer for bookings.
 *
 * - Default mode: localStorage (key "booking-template.bookings").
 * - Optional mode: Supabase (REST API, no client library). If configured
 *   in config.js, bookings are also mirrored to the Supabase table so
 *   different visitors see the same schedule.
 *
 * The local list is always kept as the source of truth for the UI;
 * Supabase calls are fire-and-forget with a fallback to local only.
 */
(function () {
    "use strict";

    const CFG = window.SITE_CONFIG;
    const DB = CFG.database;
    const KEY = "booking-template.bookings";

    function readLocal() {
        try {
            const raw = localStorage.getItem(KEY);
            const list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list : [];
        } catch (err) {
            console.warn("[storage] Could not read localStorage.", err);
            return [];
        }
    }

    function writeLocal(list) {
        try {
            localStorage.setItem(KEY, JSON.stringify(list));
        } catch (err) {
            console.warn("[storage] Could not write localStorage.", err);
        }
    }

    function supabaseConfigured() {
        return DB.provider === "supabase" &&
            typeof DB.supabaseUrl === "string" && DB.supabaseUrl.length > 0 &&
            typeof DB.supabaseAnonKey === "string" && DB.supabaseAnonKey.length > 0;
    }

    function supabaseHeaders() {
        return {
            "apikey": DB.supabaseAnonKey,
            "Authorization": "Bearer " + DB.supabaseAnonKey,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        };
    }

    function supabaseUrl(table, query) {
        return DB.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + table + (query || "");
    }

    async function loadRemote() {
        const url = supabaseUrl(DB.bookingsTable, "?select=*&order=date.asc");
        const res = await fetch(url, { headers: supabaseHeaders() });
        if (!res.ok) throw new Error("Supabase select failed (" + res.status + ")");
        const rows = await res.json();
        if (!Array.isArray(rows)) return [];
        return rows.map(function (r) {
            return {
                id: r.id,
                service: r.service,
                coach: r.coach,
                date: r.date,
                start: r.start,
                end: r.end,
                timeLabel: r.time_label,
                name: r.name,
                phone: r.phone,
                email: r.email,
                notes: r.notes,
                createdAt: r.created_at
            };
        });
    }

    function toRow(booking) {
        return {
            id: booking.id,
            service: booking.service,
            coach: booking.coach,
            date: booking.date,
            start: booking.start,
            end: booking.end,
            time_label: booking.timeLabel,
            name: booking.name,
            phone: booking.phone,
            email: booking.email,
            notes: booking.notes,
            created_at: booking.createdAt
        };
    }

    async function insertRemote(booking) {
        const url = supabaseUrl(DB.bookingsTable, "?on_conflict=id");
        const res = await fetch(url, {
            method: "POST",
            headers: supabaseHeaders(),
            body: JSON.stringify([toRow(booking)])
        });
        if (!res.ok) throw new Error("Supabase insert failed (" + res.status + ")");
        return res.json();
    }

    async function deleteRemote(id) {
        const url = supabaseUrl(DB.bookingsTable, "?id=eq." + encodeURIComponent(id));
        const res = await fetch(url, {
            method: "DELETE",
            headers: supabaseHeaders()
        });
        if (!res.ok) throw new Error("Supabase delete failed (" + res.status + ")");
        return res.json();
    }

    window.Storage2 = {
        async load() {
            if (supabaseConfigured()) {
                try {
                    return await loadRemote();
                } catch (err) {
                    console.warn("[storage] Falling back to local data.", err);
                }
            }
            return readLocal();
        },

        async add(booking) {
            const list = readLocal();
            list.push(booking);
            writeLocal(list);

            if (supabaseConfigured()) {
                try {
                    await insertRemote(booking);
                } catch (err) {
                    console.warn("[storage] Booking kept locally only (Supabase unavailable).", err);
                }
            }
        },

        async remove(id) {
            writeLocal(readLocal().filter(function (b) { return b.id !== id; }));

            if (supabaseConfigured()) {
                try {
                    await deleteRemote(id);
                } catch (err) {
                    console.warn("[storage] Could not delete from Supabase.", err);
                }
            }
        },

        provider: function () {
            return supabaseConfigured() ? "supabase" : "local";
        }
    };
})();
