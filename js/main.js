"use strict";

// starfeild 
(function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx   = canvas.getContext("2d");
  const stars = [];
  const COUNT = 200;
  const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars.length = 0;
    for (let i = 0; i < COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        speed:  Math.random() * 0.3 + 0.05,
        alpha:  Math.random(),
        dAlpha: (Math.random() - 0.5) * 0.01,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,240,232,${Math.max(0, Math.min(1, s.alpha))})`;
      ctx.fill();

      if (!noMotion) {
        s.alpha += s.dAlpha;
        if (s.alpha <= 0 || s.alpha >= 1) s.dAlpha *= -1;
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      }
    });
    requestAnimationFrame(drawStars);
  }

  resize(); createStars(); drawStars();
  window.addEventListener("resize", () => { resize(); createStars(); });
})();


// mobile 
(function initMobileNav() {
  const toggle  = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  if (!toggle || !navList) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    navList.classList.toggle("open", !isOpen);
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".nav-inner")) {
      toggle.setAttribute("aria-expanded", "false");
      navList.classList.remove("open");
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      toggle.setAttribute("aria-expanded", "false");
      navList.classList.remove("open");
      toggle.focus();
    }
  });
})();


// high contrast mode 
(function initContrastToggle() {
  const btn  = document.querySelector(".contrast-btn");
  if (!btn) return;

  if (localStorage.getItem("bigplanet-contrast") === "high") {
    document.body.classList.add("high-contrast");
    btn.setAttribute("aria-pressed", "true");
    btn.textContent = "Standard Mode";
  }

  btn.addEventListener("click", () => {
    const isHigh = document.body.classList.toggle("high-contrast");
    btn.setAttribute("aria-pressed", String(isHigh));
    btn.textContent = isHigh ? "Standard Mode" : "High Contrast";
    localStorage.setItem("bigplanet-contrast", isHigh ? "high" : "standard");
    announceToScreenReader(isHigh ? "High contrast mode enabled." : "Standard mode enabled.");
  });
})();


// screen reader
function announceToScreenReader(message) {
  let el = document.getElementById("sr-live");
  if (!el) {
    el = document.createElement("div");
    el.id = "sr-live";
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-atomic", "true");
    el.className = "sr-only";
    document.body.appendChild(el);
  }
  el.textContent = "";
  setTimeout(() => { el.textContent = message; }, 50);
}


const srStyle = document.createElement("style");
srStyle.textContent = `.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}`;
document.head.appendChild(srStyle);


// accordion
(function initAccordion() {
  const btns = document.querySelectorAll(".accordion-btn");
  if (!btns.length) return;

  btns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;

      // close all others
      btns.forEach(other => {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          const p = document.getElementById(other.getAttribute("aria-controls"));
          if (p) p.classList.remove("open");
        }
      });

      btn.setAttribute("aria-expanded", String(!isExpanded));
      panel.classList.toggle("open", !isExpanded);
    });

    btn.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); (btns[i + 1] || btns[0]).focus(); }
      if (e.key === "ArrowUp")   { e.preventDefault(); (btns[i - 1] || btns[btns.length - 1]).focus(); }
    });
  });
})();


// planet quiz 
(function initQuiz() {
  const quiz = document.getElementById("planet-quiz");
  if (!quiz) return;

  const optionBtns = quiz.querySelectorAll(".quiz-option-btn");
  const feedback   = quiz.querySelector(".quiz-feedback");
  const correctIdx = parseInt(quiz.dataset.correct, 10);

  optionBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      optionBtns.forEach(b => { b.disabled = true; b.style.cursor = "not-allowed"; });

      if (i === correctIdx) {
        btn.classList.add("correct");
        feedback.textContent = "🎉 Correct! Well done, space explorer!";
        feedback.style.color = "#4ade80";
        announceToScreenReader("Correct answer! Well done, space explorer!");
      } else {
        btn.classList.add("incorrect");
        optionBtns[correctIdx].classList.add("correct");
        const correctText = optionBtns[correctIdx].textContent;
        feedback.textContent = `Not quite — the correct answer was: ${correctText}`;
        feedback.style.color = "var(--clr-rose)";
        announceToScreenReader(`Incorrect. The correct answer was: ${correctText}`);
      }
    });
  });
})();


// lightbox
(function initLightbox() {
  const overlay     = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCap = document.getElementById("lightbox-caption");
  const closeBtn    = document.getElementById("lightbox-close");
  const triggers    = document.querySelectorAll("[data-lightbox]");
  if (!overlay || !triggers.length) return;

  let previousFocus = null;

  function open(src, alt, caption) {
    previousFocus = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightboxCap.textContent = caption || "";
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
    announceToScreenReader(`Image opened: ${alt || caption || ""}`);
  }

  function close() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (previousFocus) previousFocus.focus();
  }

  triggers.forEach(trigger => {
    trigger.addEventListener("click", () => open(trigger.dataset.lightbox, trigger.dataset.alt, trigger.dataset.caption));
    trigger.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(trigger.dataset.lightbox, trigger.dataset.alt, trigger.dataset.caption);
      }
    });
  });

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && overlay.classList.contains("active")) close(); });

  // focus 
  overlay.addEventListener("keydown", e => {
    if (e.key !== "Tab") return;
    const focusable = overlay.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();


// scroll reveal 
(function initScrollReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

  const style = document.createElement("style");
  style.textContent = `.reveal.revealed{opacity:1!important;transform:translateY(0)!important;}`;
  document.head.appendChild(style);
})();


// font size controls 
(function initFontSizeControls() {
  const increaseBtns = document.querySelectorAll(".font-increase");
  const decreaseBtns = document.querySelectorAll(".font-decrease");
  const resetBtns    = document.querySelectorAll(".font-reset");
  if (!increaseBtns.length && !decreaseBtns.length) return;

  let size = parseFloat(localStorage.getItem("bigplanet-fontsize") || "16");

  function applySize(val) {
    size = Math.max(12, Math.min(24, val));
    document.documentElement.style.fontSize = size + "px";
    localStorage.setItem("bigplanet-fontsize", String(size));
    announceToScreenReader(`Font size set to ${size} pixels.`);
  }

  applySize(size);
  increaseBtns.forEach(btn => btn.addEventListener("click", () => applySize(size + 2)));
  decreaseBtns.forEach(btn => btn.addEventListener("click", () => applySize(size - 2)));
  resetBtns.forEach(btn    => btn.addEventListener("click", () => applySize(16)));
})();


// active nav highlights 
(function highlightActiveNav() {
  const links = document.querySelectorAll(".nav-list a");
  const path  = window.location.pathname.split("/").pop() || "index.html";
  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html"))
      link.setAttribute("aria-current", "page");
  });
})();