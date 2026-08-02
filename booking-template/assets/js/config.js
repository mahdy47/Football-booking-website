/*
 * ============================================================
 *  SITE CONFIG - EDIT THIS FILE TO CUSTOMIZE THE SITE
 * ============================================================
 *  Everything a client may want to change lives here:
 *  business name, logo, colors, contact info, services,
 *  coaches, pricing and booking rules.
 *
 *  Replace the placeholder values below with the client's
 *  real information. Text is rendered safely (as text, not
 *  HTML), so plain text only.
 * ============================================================
 */
window.SITE_CONFIG = {
    /* ---------- Branding ---------- */
    business: {
        name: "Your Academy",                              // Business name (also used in the browser tab)
        tagline: "Train. Compete. Grow.",                  // Short tagline shown near the logo and in the hero
        /* Logo: "text" shows the business name as the logo.
           "image" uses logo.image instead. */
        logo: {
            type: "text",
            image: "",                                     // e.g. "assets/img/logo.png" (for type: "image")
            alt: ""                                        // Alt text for the logo image
        },
        primaryColor: "#16a34a",                           // Main brand color (buttons, links, accents)
        secondaryColor: "#0f766e",                         // Secondary brand color (gradients)
        accentColor: "#f59e0b"                             // Accent color (highlights, focus rings)
    },

    /* ---------- Hero ---------- */
    hero: {
        tagline: "Your Academy",                           // Small eyebrow text above the headline
        headline: "Train Like an Athlete",
        subtext: "Book your training session, meet our coaches and pick the plan that fits your goals — all in one place.",
        primaryCta: "Book a Session",                      // Main button (scrolls to booking)
        secondaryCta: "View Packages"                      // Secondary button (scrolls to pricing)
    },

    /* ---------- Contact information ---------- */
    contact: {
        phone: "+20 100 000 0000",                         // Replace with the real phone number
        whatsapp: "+20 100 000 0000",                      // WhatsApp number (link opens a chat)
        email: "hello@youracademy.example.com",            // Replace with the real email
        address: "123 Sports Street, Your City",           // Replace with the real address
        hours: "Mon - Sat, 7:00 AM - 10:00 PM"             // Opening hours text
    },

    /* ---------- Services (shown in the Services section) ---------- */
    services: [
        {
            title: "Football Academy",
            description: "Age-group technical and tactical training led by licensed coaches.",
            icon: "football"                               // Icon: "football" | "dumbbell" | "user" | "shield" | "heart"
        },
        {
            title: "Strength & Conditioning",
            description: "Structured strength and conditioning programs for athletes and general fitness.",
            icon: "dumbbell"
        },
        {
            title: "Personal Coaching",
            description: "One-to-one sessions tailored to your goals, schedule and level.",
            icon: "user"
        }
    ],

    /* ---------- Coaches (shown in the Coaches section) ----------
       Set coaches: [] to hide the section entirely.            */
    coaches: [
        {
            name: "Coach Name 1",                          // Replace with the real name
            role: "Head Football Coach",                   // Role / specialty
            bio: "Add a short bio in config.js.",          // Short bio
            initials: "C1"                                 // Shown in the avatar circle (no photo needed)
        },
        {
            name: "Coach Name 2",
            role: "Strength Coach",
            bio: "Add a short bio in config.js.",
            initials: "C2"
        },
        {
            name: "Coach Name 3",
            role: "Youth Development",
            bio: "Add a short bio in config.js.",
            initials: "C3"
        }
    ],

    /* ---------- Pricing packages (shown in the Pricing section)
       Set price: 0 to show "Contact Us" instead of a number.
       Set packages: [] to hide the section entirely.          */
    packages: [
        {
            name: "Monthly",
            price: 0,                                      // e.g. 150 (per month). 0 = "Contact Us"
            priceNote: "per month",
            features: [
                "Group training sessions",
                "Structured training plan",
                "Access to academy sessions"
            ],
            highlight: false,                              // true = featured card
            cta: "Choose Monthly"
        },
        {
            name: "3 Months",
            price: 0,
            priceNote: "save with longer plans",
            features: [
                "Everything in Monthly",
                "Personal progress check-ins",
                "Priority slot booking"
            ],
            highlight: true,
            cta: "Choose 3 Months"
        },
        {
            name: "Annual",
            price: 0,
            priceNote: "best value",
            features: [
                "Everything in 3 Months",
                "Free academy kit",
                "Free coach consultation"
            ],
            highlight: false,
            cta: "Choose Annual"
        }
    ],

    /* ---------- Booking rules ---------- */
    booking: {
        openHour: 7,                                       // First slot of the day (24h)
        closeHour: 22,                                     // Last slot of the day (24h)
        slotMinutes: 60,                                   // Default slot length (per service unless overridden)
        workingDays: [1, 2, 3, 4, 5, 6]                    // Days bookings are allowed. 0 = Sunday ... 6 = Saturday
    },

    /* ---------- Data storage ----------
       Default: "local" saves bookings in the browser (localStorage).
       To sync bookings across visitors, set provider: "supabase"
       and fill in supabaseUrl + supabaseAnonKey (see README for
       the exact table setup). Bookings still work in "local" mode. */
    database: {
        provider: "local",                                 // "local" | "supabase"
        supabaseUrl: "",                                   // e.g. "https://xyzcompany.supabase.co"
        supabaseAnonKey: "",                               // anon/public key (safe to expose)
        bookingsTable: "bookings"                          // Table name to use
    }
};
