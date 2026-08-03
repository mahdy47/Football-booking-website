/*
 * Storage layer for matches.
 *
 * - Default mode: localStorage (key "booking-template.matches").
 * - Optional mode: Supabase (REST API, no client library). If configured
 *   in config.js, matches are also mirrored to the Supabase table so
 *   different visitors see the same matchboard.
 *
 * The local list is always kept as the source of truth for the UI;
 * Supabase calls are fire-and-forget with a fallback to local only.
 */
(function () {
    "use strict";

    const CFG = window.SITE_CONFIG;
    const DB = CFG.database;
    const KEY = "booking-template.matches";

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

    function tableName() {
        return DB.matchesTable || "matches";
    }

    async function loadRemote() {
        const url = supabaseUrl(tableName(), "?select=*&order=time.asc");
        const res = await fetch(url, { headers: supabaseHeaders() });
        if (!res.ok) throw new Error("Supabase select failed (" + res.status + ")");
        const rows = await res.json();
        if (!Array.isArray(rows)) return [];
        return rows.map(function (r) {
            return {
                id: r.id,
                name: r.name,
                teamA: r.team_a,
                teamB: r.team_b,
                location: r.location,
                time: r.time,
                players: r.players,
                phone: r.phone,
                createdAt: r.created_at
            };
        });
    }

    function toRow(match) {
        return {
            id: match.id,
            name: match.name,
            team_a: match.teamA,
            team_b: match.teamB,
            location: match.location,
            time: match.time,
            players: match.players,
            phone: match.phone,
            created_at: match.createdAt
        };
    }

    async function insertRemote(match) {
        const url = supabaseUrl(tableName(), "?on_conflict=id");
        const res = await fetch(url, {
            method: "POST",
            headers: supabaseHeaders(),
            body: JSON.stringify([toRow(match)])
        });
        if (!res.ok) throw new Error("Supabase insert failed (" + res.status + ")");
        return res.json();
    }

    async function deleteRemote(id) {
        const url = supabaseUrl(tableName(), "?id=eq." + encodeURIComponent(id));
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

        async add(match) {
            const list = readLocal();
            const idx = list.findIndex(function (m) { return m.id === match.id; });
            if (idx === -1) {
                list.push(match);
            } else {
                list[idx] = match;
            }
            writeLocal(list);

            if (supabaseConfigured()) {
                try {
                    await insertRemote(match);
                } catch (err) {
                    console.warn("[storage] Match kept locally only (Supabase unavailable).", err);
                }
            }
        },

        async remove(id) {
            writeLocal(readLocal().filter(function (m) { return m.id !== id; }));

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
