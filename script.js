/* =========================================================
   SOMS — interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---- Sticky nav shadow on scroll ---- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (window.scrollY > 20) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById("navToggle");
  var mobile = document.getElementById("navMobile");
  var closeMenu = function () {
    mobile.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", function () {
    var open = mobile.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mobile.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Payment option picker (collapsed until selected) ---- */
  var payOpts = document.querySelectorAll(".paypick__opt");
  var selectPay = function (which, toggle) {
    payOpts.forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var isTarget = btn.getAttribute("data-pay") === which;
      var open = isTarget && !(toggle && btn.getAttribute("aria-expanded") === "true");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (panel) panel.hidden = !open;
    });
  };
  payOpts.forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectPay(btn.getAttribute("data-pay"), true);
    });
  });
  // Pricing-card buttons jump to Register with the matching option open
  document.querySelectorAll("[data-open-pay]").forEach(function (a) {
    a.addEventListener("click", function () {
      selectPay(a.getAttribute("data-open-pay"), false);
    });
  });

  /* =======================================================
     2027 REGISTRATION — attendee capture + Stripe handoff
     ======================================================= */
  var REG = {
    event: "SOMS — August 17-20, 2027 — Fontana Police Department, Fontana, CA",
    price: 500,
    stripeUrl: "https://buy.stripe.com/4gM3cuekk1zafsigzO33W0d",
    // FormSubmit.co emails each registration to this address (no backend needed).
    notifyUrl: "https://formsubmit.co/ajax/justin@intellect-le.com",
    // Early bird ends end of day May 1, 2027 (Pacific).
    earlyBirdEnds: new Date("2027-05-02T00:00:00-07:00")
  };

  var form = document.getElementById("regForm");
  if (form) {
    var list = document.getElementById("attList");
    var addBtn = document.getElementById("attAdd");
    var countEl = document.getElementById("attCount");
    var totalEl = document.getElementById("attTotal");
    var ack = document.getElementById("rfAck");
    var submitBtn = document.getElementById("rfSubmit");
    var note = document.getElementById("rfNote");
    var defaultNote = note.textContent;
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    /* Early bird closed → hide card form */
    if (new Date() >= REG.earlyBirdEnds) {
      form.hidden = true;
      document.getElementById("ebClosed").hidden = false;
    }

    var renumber = function () {
      var rows = list.querySelectorAll(".att");
      rows.forEach(function (row, i) {
        row.querySelector(".att__num").textContent = i + 1;
        row.querySelector(".att__rm").disabled = rows.length === 1;
      });
      var n = rows.length;
      countEl.textContent = n + (n === 1 ? " seat" : " seats");
      totalEl.textContent = "$" + (n * REG.price).toLocaleString();
    };

    var addAttendee = function (name, email) {
      var row = document.createElement("div");
      row.className = "att";
      row.innerHTML =
        '<span class="att__num"></span>' +
        '<input type="text" placeholder="Full name" aria-label="Attendee name" autocomplete="off" />' +
        '<input type="email" placeholder="Email address" aria-label="Attendee email" autocomplete="off" />' +
        '<button type="button" class="att__rm" aria-label="Remove attendee">&times;</button>';
      row.querySelectorAll("input")[0].value = name || "";
      row.querySelectorAll("input")[1].value = email || "";
      row.querySelector(".att__rm").addEventListener("click", function () {
        row.remove();
        renumber();
      });
      list.appendChild(row);
      renumber();
      return row;
    };

    addAttendee();
    addBtn.addEventListener("click", function () {
      addAttendee().querySelector("input").focus();
    });

    // Clear error styling as user types
    form.addEventListener("input", function (e) {
      if (e.target.classList) e.target.classList.remove("invalid");
    });
    ack.addEventListener("change", function () {
      ack.closest(".ack").classList.remove("invalid");
    });

    var setNote = function (msg, cls) {
      note.textContent = msg;
      note.className = "cta__formnote" + (cls ? " " + cls : "");
    };

    var makeRef = function () {
      return "SOMS27-" + Date.now().toString(36).toUpperCase() + "-" +
        Math.random().toString(36).slice(2, 6).toUpperCase();
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var firstBad = null;
      var flag = function (el) { el.classList.add("invalid"); ok = false; if (!firstBad) firstBad = el; };

      var agency = document.getElementById("rfAgency");
      var contact = document.getElementById("rfContact");
      var email = document.getElementById("rfEmail");
      var phone = document.getElementById("rfPhone");

      if (!agency.value.trim()) flag(agency);
      if (!contact.value.trim()) flag(contact);
      if (!EMAIL_RE.test(email.value.trim())) flag(email);

      var attendees = [];
      list.querySelectorAll(".att").forEach(function (row) {
        var inputs = row.querySelectorAll("input");
        var n = inputs[0].value.trim();
        var m = inputs[1].value.trim();
        if (!n) flag(inputs[0]);
        if (!EMAIL_RE.test(m)) flag(inputs[1]);
        attendees.push({ name: n, email: m });
      });

      if (!ack.checked) {
        ack.closest(".ack").classList.add("invalid");
        if (ok) firstBad = ack;
        ok = false;
      }

      if (!ok) {
        setNote("Please complete the highlighted fields and accept the refund policy.", "err");
        if (firstBad && firstBad.focus) firstBad.focus();
        return;
      }

      // Spam trap
      if (form.querySelector('input[name="_honey"]').value) return;

      var ref = makeRef();
      var seats = attendees.length;
      var total = "$" + (seats * REG.price).toLocaleString();
      var attendeeText = attendees.map(function (a, i) {
        return (i + 1) + ". " + a.name + " <" + a.email + ">";
      }).join("\n");

      var payload = {
        _subject: "New SOMS Registration (" + seats + " seat" + (seats === 1 ? "" : "s") + ") — " + agency.value.trim() + " — " + ref,
        _template: "table",
        _captcha: "false",
        _replyto: email.value.trim(),
        "Reference ID": ref,
        "Event": REG.event,
        "Payment Method": "Credit card (Stripe) — Early Bird $" + REG.price + "/person",
        "Agency": agency.value.trim(),
        "Point of Contact": contact.value.trim(),
        "Contact Email": email.value.trim(),
        "Contact Phone": phone.value.trim() || "—",
        "Seats": String(seats),
        "Total Due": total,
        "Attendees": attendeeText,
        "Refund Policy Accepted": "Yes",
        "Submitted": new Date().toLocaleString()
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Saving registration…";
      setNote("");

      var stripe = REG.stripeUrl +
        "?prefilled_email=" + encodeURIComponent(email.value.trim()) +
        "&client_reference_id=" + encodeURIComponent(ref);

      fetch(REG.notifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().catch(function () { return {}; }); })
        .then(function (data) {
          if (String(data.success) !== "true") throw new Error(data.message || "Notification failed");
          setNote("Registration saved (Ref " + ref + "). Redirecting to Stripe — set quantity to " + seats + ".", "ok");
          submitBtn.textContent = "Redirecting…";
          setTimeout(function () { window.location.href = stripe; }, 1400);
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Continue to Secure Payment →";
          setNote("We couldn't save your attendee list. Please try again, or email justin@intellect-le.com with your attendees.", "err");
        });
    });

    // Keep default helper text available when form resets
    form.addEventListener("reset", function () { setNote(defaultNote); });
  }
})();
