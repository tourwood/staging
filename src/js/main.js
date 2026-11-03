(function () {
  'use strict';

  // Mobile nav
  var toggle = document.querySelector('.hdr__toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Footer year
  document.querySelectorAll('.yr').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Email addresses are only assembled here, in the browser, so scrapers reading the HTML never see them.
  document.querySelectorAll('a.em').forEach(function (a) {
    try {
      var addr = atob(a.dataset.u) + '@' + atob(a.dataset.d);
      a.href = 'mail' + 'to:' + addr;
      if (a.dataset.show === '1') a.textContent = addr;
    } catch (e) { /* leave link pointing at the contact page */ }
  });

  // Quote / contact forms
  document.querySelectorAll('form.qform').forEach(function (form) {
    var status = form.querySelector('.qform__status');
    var t = form.querySelector('input[name="t"]');
    if (t) t.value = String(Date.now());
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function say(msg, ok) { status.textContent = msg; status.className = 'qform__status ' + (ok ? 'is-ok' : 'is-err'); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [];
      ['name', 'email', 'property'].forEach(function (n) {
        var f = form.elements[n]; var v = (f.value || '').trim();
        var invalid = !v || (n === 'email' && !emailRe.test(v));
        f.setAttribute('aria-invalid', invalid ? 'true' : 'false');
        if (invalid) bad.push(f);
      });
      if (bad.length) { say('Please check the highlighted fields.', false); bad[0].focus(); return; }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; say('Sending…', true);

      if (form.dataset.demo === '1') {
        setTimeout(function () { say('Preview only: the form is not connected on this staging site, so nothing was sent.', true); btn.disabled = false; }, 600);
        return;
      }
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (d) {
          if (d && d.ok) { form.reset(); if (t) t.value = String(Date.now()); if (window.turnstile) window.turnstile.reset(); say('Thanks. We have your request and will be in touch soon.', true); }
          else { if (window.turnstile) window.turnstile.reset(); say((d && d.error) || 'Sorry, that did not send. Please call us on 03 9853 6330.', false); }
        })
        .catch(function () { say('Sorry, that did not send. Please call us on 03 9853 6330.', false); })
        .then(function () { btn.disabled = false; });
    });
  });
})();
