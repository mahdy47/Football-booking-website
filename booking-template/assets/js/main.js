/*
 * Main entry point.
 * - Applies branding + theme from config.js (CSS variables, text content).
 * - Renders the Steps, Pricing and Contact sections from config.
 * - Wires the mobile navigation and initialises the match engine.
 *
 * All dynamic text is inserted with textContent (never innerHTML),
 * so config content is rendered as plain text.
 */
(function () {
    "use strict";

    const CFG = window.SITE_CONFIG;
    const $ = function (id) { return document.getElementById(id); };

    /* ---------- icon set (static, trusted SVG) ---------- */

    const ICON_SVG = function (paths, size) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + (size || 24) + '" height="' + (size || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
    };

    const ICONS = {
        football: '<circle cx="12" cy="12" r="10"/><path d="m15 2 4 2"/><path d="m2 13 4 2"/><path d="m20 13 2 3"/><path d="m6.5 4 1 5"/><path d="m15.5 19 1 3"/><path d="m5.5 20 3-1"/><path d="m18 5 2-1"/><path d="m12 2 1 4"/><path d="m6 15 3-2"/><path d="m15 11 3 1"/>',
        share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
        phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
        mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
        pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
        clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
        check: '<polyline points="20 6 9 17 4 12"/>'
    };

    function icon(name, size) {
        return ICONS[name] ? ICON_SVG(ICONS[name], size) : "";
    }

    /* ---------- theme ---------- */

    function shade(hex, percent) {
        let c = String(hex || "").replace("#", "");
        if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(c)) return hex;
        if (c.length === 3) c = c.split("").map(function (x) { return x + x; }).join("");
        const num = parseInt(c, 16);
        const t = percent < 0 ? 0 : 255;
        const p = Math.abs(percent) / 100;
        const r = Math.round(((num >> 16) & 255) * (1 - p) + t * p);
        const g = Math.round(((num >> 8) & 255) * (1 - p) + t * p);
        const b = Math.round((num & 255) * (1 - p) + t * p);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function hexToRgba(hex, alpha) {
        let c = String(hex || "").replace("#", "");
        if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(c)) return "rgba(5,150,105,0.10)";
        if (c.length === 3) c = c.split("").map(function (x) { return x + x; }).join("");
        const num = parseInt(c, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    }

    function applyTheme() {
        const root = document.documentElement.style;
        root.setProperty("--color-primary", CFG.business.primaryColor);
        root.setProperty("--color-primary-dark", shade(CFG.business.primaryColor, -15));
        root.setProperty("--color-primary-strong", shade(CFG.business.primaryColor, -28));
        root.setProperty("--color-primary-tint", hexToRgba(CFG.business.primaryColor, 0.10));
        root.setProperty("--color-secondary", CFG.business.secondaryColor);
        root.setProperty("--color-accent", CFG.business.accentColor);

        const theme = document.querySelector('meta[name="theme-color"]');
        if (theme) theme.setAttribute("content", CFG.business.primaryColor);
    }

    /* ---------- branding ---------- */

    function applyBranding() {
        const biz = CFG.business;

        document.title = biz.name + " - Football Matches";

        const logo = $("brand-logo");
        if (biz.logo && biz.logo.type === "image" && biz.logo.image) {
            const img = document.createElement("img");
            img.className = "brand-img";
            img.src = biz.logo.image;
            img.alt = biz.logo.alt || biz.name;
            logo.appendChild(img);
            logo.appendChild(document.createTextNode(biz.name));
        } else {
            const mark = document.createElement("span");
            mark.className = "brand-mark";
            mark.textContent = (biz.name.trim().charAt(0) || "A").toUpperCase();
            logo.appendChild(mark);
            logo.appendChild(document.createTextNode(biz.name));
        }

        $("hero-tagline").textContent = CFG.hero.tagline || biz.tagline || "";
        $("hero-headline").textContent = CFG.hero.headline || "";
        $("hero-subtext").textContent = CFG.hero.subtext || "";
        $("hero-primary-cta").textContent = CFG.hero.primaryCta || "Create a Match";
        $("hero-secondary-cta").textContent = CFG.hero.secondaryCta || "View Matches";

        $("footer-brand").textContent = biz.name;
        $("footer-copy").textContent = "\u00A9 " + new Date().getFullYear() + " Abdelrahman El-Mahdy. All rights reserved.";
    }

    /* ---------- hero pills (from config) ---------- */

    function renderHeroExtras() {
        const pills = $("hero-pills");
        if (pills) {
            (CFG.hero.pills || []).forEach(function (text) {
                const span = document.createElement("span");
                span.className = "hero-pill";
                span.textContent = text;
                pills.appendChild(span);
            });
        }
    }

    /* ---------- steps ("how it works") ---------- */

    function renderSteps() {
        const section = $("how");
        const grid = $("steps-grid");
        grid.innerHTML = "";
        const list = CFG.steps || [];
        if (!list.length) {
            section.hidden = true;
            return;
        }
        section.hidden = false;

        list.forEach(function (s) {
            const card = document.createElement("article");
            card.className = "service-card reveal";

            const num = document.createElement("span");
            num.className = "step-num";
            num.textContent = (list.indexOf(s) + 1) + ".";

            const ic = document.createElement("span");
            ic.className = "service-icon";
            ic.innerHTML = icon(s.icon || "football");

            const title = document.createElement("h3");
            title.textContent = s.title;

            const desc = document.createElement("p");
            desc.textContent = s.description;

            card.appendChild(num);
            card.appendChild(ic);
            card.appendChild(title);
            card.appendChild(desc);
            grid.appendChild(card);
        });
    }

    /* ---------- pricing ---------- */

    function renderPricing() {
        const section = $("pricing");
        const list = CFG.packages || [];
        if (!list.length) {
            section.hidden = true;
            return;
        }
        section.hidden = false;

        const grid = $("pricing-grid");
        grid.innerHTML = "";
        list.forEach(function (p) {
            const card = document.createElement("article");
            card.className = "pricing-card" + (p.highlight ? " is-featured" : "") + " reveal";

            if (p.highlight) {
                const tag = document.createElement("span");
                tag.className = "pricing-tag";
                tag.textContent = "Popular";
                card.appendChild(tag);
            }

            const name = document.createElement("h3");
            name.className = "pricing-name";
            name.textContent = p.name;

            const price = document.createElement("p");
            price.className = "pricing-price";
            price.textContent = p.price && p.price > 0 ? "$" + p.price : "Contact Us";

            const note = document.createElement("p");
            note.className = "pricing-price-note";
            note.textContent = p.price && p.price > 0 ? p.priceNote : "Reach out for a custom plan";

            const features = document.createElement("ul");
            features.className = "pricing-features";
            (p.features || []).forEach(function (f) {
                const li = document.createElement("li");
                const check = document.createElement("span");
                check.className = "feature-check";
                check.innerHTML = icon("check", 12);
                li.appendChild(check);
                li.appendChild(document.createTextNode(f));
                features.appendChild(li);
            });

            const cta = document.createElement("a");
            cta.className = "btn " + (p.highlight ? "btn-primary" : "btn-outline");
            cta.href = "#contact";
            cta.textContent = p.cta || "Contact Us";

            card.appendChild(name);
            card.appendChild(price);
            card.appendChild(note);
            card.appendChild(features);
            card.appendChild(cta);
            grid.appendChild(card);
        });
    }

    /* ---------- contact ---------- */

    function cleanPhone(value) {
        return String(value || "").replace(/[^\d]/g, "");
    }

    function renderContact() {
        const section = $("contact");
        const c = CFG.contact;
        const grid = $("contact-grid");
        grid.innerHTML = "";

        const items = [];

        if (c.phone) items.push({ icon: "phone", label: "Call us", value: c.phone, href: "tel:" + c.phone.replace(/\s/g, "") });
        if (c.whatsapp) items.push({ icon: "chat", label: "WhatsApp", value: c.whatsapp, href: "https://wa.me/" + cleanPhone(c.whatsapp) });
        if (c.email) items.push({ icon: "mail", label: "Email", value: c.email, href: "mailto:" + c.email });
        if (c.address) items.push({ icon: "pin", label: "Address", value: c.address, href: null });
        if (c.hours) items.push({ icon: "clock", label: "Hours", value: c.hours, href: null });

        if (!items.length) {
            section.hidden = true;
            return;
        }
        section.hidden = false;

        items.forEach(function (item) {
            const el = document.createElement(item.href ? "a" : "div");
            el.className = "contact-card reveal";
            if (item.href) el.href = item.href;

            const ic = document.createElement("span");
            ic.className = "contact-icon";
            ic.innerHTML = icon(item.icon);

            const body = document.createElement("span");

            const label = document.createElement("h3");
            label.textContent = item.label;

            const value = document.createElement("p");
            value.textContent = item.value;

            body.appendChild(label);
            body.appendChild(value);
            el.appendChild(ic);
            el.appendChild(body);
            grid.appendChild(el);
        });
    }

    /* ---------- navigation ---------- */

    function setupNav() {
        const toggle = $("nav-toggle");
        const links = $("nav-links");

        toggle.addEventListener("click", function () {
            const open = links.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
        });

        links.addEventListener("click", function (e) {
            if (e.target.closest("a")) {
                links.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    /* ---------- reveal on scroll ---------- */

    function initReveal() {
        const els = document.querySelectorAll(".reveal");
        if (!els.length) return;

        if (!("IntersectionObserver" in window) ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            els.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }

        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        els.forEach(function (el, i) {
            el.style.setProperty("--d", (i % 4) * 60 + "ms");
            io.observe(el);
        });
    }

    /* ---------- init ---------- */

    function init() {
        applyTheme();
        applyBranding();
        renderHeroExtras();
        renderSteps();
        renderPricing();
        renderContact();
        setupNav();
        initReveal();
        window.Matches.init();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
