/* =====================================================================
   Wil's Martini Lounge — GA4 event tracking
   ---------------------------------------------------------------------
   Fires structured conversion + engagement events for the actions that
   drive the business:

     reservation_start   click to the Moon Lounge reservation page   (KEY EVENT)
     generate_lead       Moon Lounge reservation form submitted       (KEY EVENT)
     contact_email       click a mailto: link                        (KEY EVENT)
     contact_phone       click a tel:/sms: link                      (KEY EVENT)
     get_directions      click the Google Maps / directions link     (KEY EVENT)
     view_menu           menu opened (click or scrolled into view)
     view_menu_category  a menu category tab was selected
     social_click        click an Instagram / social link

   Every event carries a `link_location` param (nav / hero / visit /
   footer / reservation_form / body) derived automatically from where the
   link lives, so GA4 reports can answer "which CTA drives reservations?"

   The Measurement ID is configured once in the gtag loader inside each
   HTML <head>. This file only *sends* events, so there is nothing to
   configure here. Safe no-op until gtag.js has loaded.
   ===================================================================== */
(function () {
  "use strict";

  /* Thin wrapper — never throws if GA isn't loaded/consented yet. */
  function track(name, params) {
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", name, params || {});
      }
    } catch (e) {
      /* analytics must never break the page */
    }
  }
  /* Exposed so inline handlers (e.g. the reservation form) can report. */
  window.wilsTrack = track;

  /* Where does this element live? Drives the link_location param. */
  function locationOf(el) {
    if (!el || !el.closest) return "body";
    if (el.closest("#rsvForm, .cta-block, .rsv-form")) return "reservation_form";
    if (el.closest("header.nav, #navLinks, nav.nav")) return "nav";
    if (el.closest(".hero")) return "hero";
    if (el.closest(".visit")) return "visit";
    if (el.closest("footer")) return "footer";
    return "body";
  }

  /* view_menu should count once per page load, whether the guest clicks a
     menu link, lands on #menuSection, or simply scrolls the menu into view. */
  var menuViewed = false;
  function trackMenuView(loc) {
    if (menuViewed) return;
    menuViewed = true;
    track("view_menu", { link_location: loc });
  }

  /* ---- Delegated click tracking ---------------------------------- */
  document.addEventListener(
    "click",
    function (e) {
      var el = e.target;
      var a = el && el.closest ? el.closest("a[href], button") : null;
      if (!a) return;

      /* Menu category tabs (buttons inside .menu-tabs) */
      if (a.tagName === "BUTTON" && a.closest && a.closest(".menu-tabs")) {
        var cat = (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
        track("view_menu_category", {
          menu_category: cat || "unknown",
          link_location: "menu_tabs"
        });
        return;
      }

      var href = a.getAttribute("href") || "";
      /* Explicit override wins; otherwise infer the event from the href. */
      var name = a.getAttribute("data-ga-event");
      if (!name) {
        if (/^mailto:/i.test(href)) name = "contact_email";
        else if (/^tel:/i.test(href) || /^sms:/i.test(href)) name = "contact_phone";
        else if (/(?:maps\.google|google\.[a-z.]+\/maps|goo\.gl\/maps|maps\.app\.goo\.gl)/i.test(href)) name = "get_directions";
        else if (/moon-lounge\.html/i.test(href)) name = "reservation_start";
        else if (/#menuSection/.test(href)) name = "view_menu";
        else if (/instagram\.com/i.test(href)) name = "social_click";
        else return; /* not an action we track */
      }

      var loc = a.getAttribute("data-ga-loc") || locationOf(a);
      var params = { link_location: loc };
      var text = (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
      if (text) params.link_text = text;

      if (name === "contact_email") {
        params.email_address = href.replace(/^mailto:/i, "").split("?")[0];
        track(name, params);
      } else if (name === "contact_phone") {
        params.contact_method = /^sms:/i.test(href) ? "sms" : "call";
        track(name, params);
      } else if (name === "get_directions") {
        params.destination = "1478 W Catalpa Ave, Chicago";
        track(name, params);
      } else if (name === "social_click") {
        params.social_network = "instagram";
        track(name, params);
      } else if (name === "view_menu") {
        trackMenuView(loc);
      } else {
        /* reservation_start and any explicit data-ga-event links */
        track(name, params);
      }
    },
    true
  );

  /* ---- view_menu on scroll / direct navigation ------------------- */
  var menuSec = document.getElementById("menuSection");
  if (menuSec && "IntersectionObserver" in window) {
    var mo = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            trackMenuView("scroll_into_view");
            mo.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 }
    );
    mo.observe(menuSec);
  }
  if (window.location.hash === "#menuSection") {
    trackMenuView("direct_link");
  }
})();
