/*
 * ============================================================
 *  SITE CONFIG - EDIT THIS FILE TO CUSTOMIZE THE SITE
 * ============================================================
 *  Everything a client may want to change lives here:
 *  business name, logo, colors, contact info, the "how it
 *  works" steps, match packages and data storage.
 *
 *  Replace the placeholder values below with the client's
 *  real information. Text is rendered safely (as text, not
 *  HTML), so plain text only.
 * ============================================================
 */
window.SITE_CONFIG = {
    /* ---------- Branding ---------- */
    business: {
        name: "Your League",                              // Business name (also used in the browser tab)
        tagline: "Organize. Find opponents. Play.",       // Short tagline shown near the logo and in the hero
        /* Logo: "text" shows the business name as the logo.
           "image" uses logo.image instead. */
        logo: {
            type: "text",
            image: "",                                     // e.g. "assets/img/logo.png" (for type: "image")
            alt: ""                                        // Alt text for the logo image
        },
        primaryColor: "#059669",                           // Main brand color (buttons, links, accents)
        secondaryColor: "#0f766e",                         // Secondary brand color (gradients)
        accentColor: "#fbbf24"                             // Accent color (highlights, focus rings)
    },

    /* ---------- Hero ---------- */
    hero: {
        tagline: "Football Match Organizer",               // Small eyebrow text above the headline
        headline: "Create a match. Find your opponent.",
        subtext: "Post a football match with your team and let another team claim the opposing slot. No registration, no fees — just play.",
        primaryCta: "Create a Match",                      // Main button (scrolls to the create/join form)
        secondaryCta: "View Matches",                      // Secondary button (scrolls to upcoming matches)
        pills: [                                           // Small info chips under the hero buttons
            "Free to use",
            "One opponent per match",
            "No registration needed"
        ]
    },

    /* ---------- "How it works" steps (3 cards) ----------
       Set steps: [] to hide the section entirely.          */
    steps: [
        {
            title: "Create a match",
            description: "Add the venue, date and time, then publish your match with your team.",
            icon: "football"                               // Icon: "football" | "share" | "shield" | "user" | "users" | "heart"
        },
        {
            title: "Share it with teams",
            description: "Your match shows up instantly for other teams looking to play.",
            icon: "share"
        },
        {
            title: "Opponent joins",
            description: "One team claims the opposing slot and the match is locked in.",
            icon: "shield"
        }
    ],

    /* ---------- Contact information ---------- */
    contact: {
        phone: "+20 100 000 0000",                         // Replace with the real phone number
        whatsapp: "+20 100 000 0000",                      // WhatsApp number (link opens a chat)
        email: "hello@yourleague.example.com",             // Replace with the real email
        address: "123 Sports Street, Your City",           // Replace with the real address
        hours: "Mon - Sat, 7:00 AM - 10:00 PM"             // Opening hours text
    },

    /* ---------- Match packages (shown in the Pricing section)
       Set price: 0 to show "Contact Us" instead of a number.
       Set packages: [] to hide the section entirely.          */
    packages: [
        {
            name: "Match Fee",
            price: 0,                                      // e.g. 150 (per match). 0 = "Contact Us"
            priceNote: "per match",
            features: [
                "Match published to all teams",
                "Opponent booking link",
                "Venue and time confirmed"
            ],
            highlight: false,                              // true = featured card
            cta: "Contact Us"
        },
        {
            name: "Season Plan",
            price: 0,
            priceNote: "per season",
            features: [
                "Everything in Match Fee",
                "Priority match placement",
                "Season schedule view"
            ],
            highlight: true,
            cta: "Contact Us"
        },
        {
            name: "Club Package",
            price: 0,
            priceNote: "custom",
            features: [
                "Everything in Season Plan",
                "Multiple venues",
                "White-label branding"
            ],
            highlight: false,
            cta: "Contact Us"
        }
    ],

    /* ---------- Match defaults ---------- */
    match: {
        defaultPlayers: 11                                 // Pre-filled player count in the create form
    },

    /* ---------- Data storage ----------
       Default: "local" saves matches in the browser (localStorage).
       To sync matches across visitors, set provider: "supabase"
       and fill in supabaseUrl + supabaseAnonKey (see README for
       the exact table setup). Matches still work in "local" mode. */
    database: {
        provider: "local",                                 // "local" | "supabase"
        supabaseUrl: "",                                   // e.g. "https://xyzcompany.supabase.co"
        supabaseAnonKey: "",                               // anon/public key (safe to expose)
        matchesTable: "matches"                            // Table name to use
    }
};
