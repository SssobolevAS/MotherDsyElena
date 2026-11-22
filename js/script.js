/* Логика и анимации. Тексты и фото берутся из js/content.js */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var screens = document.querySelectorAll(".screen");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = -1, timers = [];

  /* ---------- Музыка ---------- */
  var audio = null, musicOn = true;
  if (MUSIC_SRC) { audio = new Audio(MUSIC_SRC); audio.loop = true; }
  function playMusic() { if (audio && musicOn) audio.play().catch(function () {}); }
  $("musicBtn").onclick = function () {
    musicOn = !musicOn; this.classList.toggle("off", !musicOn);
    if (audio) { musicOn ? audio.play().catch(function () {}) : audio.pause(); }
  };

  /* ---------- Индикатор прогресса ---------- */
  for (var i = 0; i < screens.length; i++) $("dots").appendChild(document.createElement("i"));

  /* ---------- Переходы между экранами ---------- */
  function show(n) {
    timers.forEach(clearInterval); timers = [];
    screens.forEach(function (s, k) { s.classList.toggle("active", k === n); });
    $("dots").childNodes.forEach(function (d, k) { d.classList.toggle("on", k <= n); });
    current = n;
    if (enter[n]) enter[n]();
  }
  document.querySelectorAll("[data-next]").forEach(function (b) {
    b.addEventListener("click", function () { show(current + 1); });
  });

  /* ---------- Фон: сердечки, лепестки, огоньки ---------- */
  var bgItems = ["💗", "🌸", "✨", "🌷", "💖", "🪷"];
  setInterval(function () {
    if (document.hidden) return;
    var e = document.createElement("span");
    e.className = "float";
    e.textContent = bgItems[Math.floor(Math.random() * bgItems.length)];
    e.style.left = Math.random() * 100 + "%";
    e.style.fontSize = 14 + Math.random() * 20 + "px";
    e.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
    $("bg").appendChild(e);
    setTimeout(function () { e.remove(); }, 14500);
  }, reduce ? 1800 : 700);

  /* ---------- Конфетти из сердечек ---------- */
  function confetti(count) {
    var set = ["💗", "💖", "🌸", "✨", "💕"];
    for (var k = 0; k < count; k++) {
      var e = document.createElement("span");
      e.className = "conf"; e.textContent = set[k % set.length];
      e.style.left = Math.random() * 100 + "vw";
      e.style.fontSize = 16 + Math.random() * 18 + "px";
      e.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
      e.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
      e.style.animationDelay = Math.random() * .8 + "s";
      document.body.appendChild(e);
      setTimeout(function (el) { el.remove(); }.bind(null, e), 4500);
    }
  }

  /* ---------- Создание фото с заглушкой ---------- */
  function makePhoto(p) {
    var img = document.createElement("img");
    img.src = p.src; img.alt = p.caption; img.loading = "lazy"; img.draggable = false;
    img.onerror = function () {
      var d = document.createElement("div");
      d.className = "ph"; d.textContent = "🌷"; d.setAttribute("role", "img"); d.setAttribute("aria-label", p.caption);
      if (img.parentNode) img.parentNode.replaceChild(d, img);
    };
    return img;
  }

  /* ---------- Хуки входа на экран ---------- */
  var enter = {};
  $("startTitle").textContent = START_TITLE;
  $("envTo").textContent = "Для: " + MOM_NAME;
  $("greetTitle").textContent = GREETING_TITLE;
  $("finalText").textContent = FINAL_WISH;

  $("openBtn").onclick = function () { playMusic(); show(1); };

  // 2. Конверт
  function openEnvelope() {
    var env = $("envelope");
    if (env.classList.contains("open")) return;
    env.classList.add("open"); $("envHint").classList.add("hidden");
    setTimeout(function () { document.querySelector("#s1 .btn").classList.remove("hidden"); }, 1800);
  }
  $("envelope").onclick = openEnvelope;
  $("envelope").onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") openEnvelope(); };
  enter[1] = function () {
    $("envelope").classList.remove("open"); $("envHint").classList.remove("hidden");
    document.querySelector("#s1 .btn").classList.add("hidden");
  };

  // 3. Поздравление — печатная машинка
  enter[2] = function () {
    var el = $("typed"), btn = document.querySelector("#s2 .btn"), n = 0;
    el.textContent = ""; btn.classList.add("hidden");
    if (reduce) { el.textContent = GREETING_TEXT; btn.classList.remove("hidden"); return; }
    var t = setInterval(function () {
      el.textContent = GREETING_TEXT.slice(0, ++n);
      if (n >= GREETING_TEXT.length) { clearInterval(t); btn.classList.remove("hidden"); confetti(12); }
    }, 55);
    timers.push(t);
  };

  // 4. Причины — 3D-карточки
  enter[3] = function () {
    var box = $("cards"), opened = 0, btn = document.querySelector("#s3 .btn");
    box.innerHTML = ""; btn.classList.add("hidden");
    REASONS.forEach(function (text) {
      var c = document.createElement("button");
      c.className = "flip";
      c.innerHTML = '<div class="flip-in"><div class="face front">💗</div><div class="face back"></div></div>';
      c.querySelector(".back").textContent = text;
      c.onclick = function () {
        if (c.classList.contains("on")) return;
        c.classList.add("on"); opened++;
        if (opened === REASONS.length) { confetti(40); btn.classList.remove("hidden"); }
      };
      box.appendChild(c);
    });
  };

  // 5. Галерея
  var gi = 0, stack = $("stack");
  function renderStack() {
    stack.innerHTML = "";
    PHOTOS.forEach(function (p, k) {
      var rel = (k - gi + PHOTOS.length) % PHOTOS.length;
      var d = document.createElement("div");
      d.className = "pol";
      d.appendChild(makePhoto(p));
      var cap = document.createElement("span"); cap.textContent = p.caption; d.appendChild(cap);
      var rot = rel === 0 ? 0 : (k % 2 ? 5 : -5) * Math.min(rel, 3);
      d.style.transform = "rotate(" + rot + "deg) translateY(" + Math.min(rel, 3) * 6 + "px)";
      d.style.zIndex = PHOTOS.length - rel;
      d.style.opacity = rel > 3 ? 0 : 1;
      stack.appendChild(d);
    });
    $("counter").textContent = (gi + 1) + " / " + PHOTOS.length;
  }
  function go(d) { gi = (gi + d + PHOTOS.length) % PHOTOS.length; renderStack(); }
  $("prev").onclick = function () { go(-1); };
  $("next").onclick = function () { go(1); };
  var sx = 0, sy = 0;
  stack.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; });
  stack.addEventListener("pointerup", function (e) {
    var dx = e.clientX - sx;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    else if (Math.abs(e.clientY - sy) < 10) openLightbox();
  });
  enter[4] = function () { gi = 0; renderStack(); };

  // Lightbox
  function openLightbox() {
    var p = PHOTOS[gi];
    $("lbImg").innerHTML = ""; $("lbImg").appendChild(makePhoto(p));
    $("lbCap").textContent = p.caption + (p.date ? " — " + p.date : "");
    $("lightbox").classList.remove("hidden");
  }
  function closeLightbox() { $("lightbox").classList.add("hidden"); }
  $("lbClose").onclick = closeLightbox;
  var ly = 0;
  $("lightbox").addEventListener("pointerdown", function (e) { ly = e.clientY; });
  $("lightbox").addEventListener("pointerup", function (e) { if (Math.abs(e.clientY - ly) > 70) closeLightbox(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
    if (current === 4) { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }
  });

  // 6. Игра
  var playing = false;
  enter[5] = function () {
    playing = false; $("game").innerHTML = "";
    $("score").textContent = "💗 0"; $("timer").textContent = "15";
    $("gameMsg").textContent = "Нажимай на сердечки за 15 секунд";
    $("gameStart").classList.remove("hidden"); $("gameNext").classList.add("hidden");
  };
  $("gameStart").onclick = function () {
    var score = 0, end = Date.now() + 15000; playing = true;
    this.classList.add("hidden");
    var spawn = setInterval(function () {
      if (!playing) return;
      var h = document.createElement("button");
      h.className = "heart"; h.textContent = "💗"; h.setAttribute("aria-label", "Сердечко");
      h.style.left = Math.random() * ($("game").clientWidth - 56) + "px";
      h.onpointerdown = function () { score++; $("score").textContent = "💗 " + score; h.remove(); };
      $("game").appendChild(h);
      setTimeout(function () { h.remove(); }, 3100);
    }, 450);
    var tick = setInterval(function () {
      var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      $("timer").textContent = left;
      if (left <= 0) {
        clearInterval(tick); clearInterval(spawn); playing = false; $("game").innerHTML = "";
        var msg = GAME_RESULTS[0].text;
        GAME_RESULTS.forEach(function (r) { if (score >= r.min) msg = r.text; });
        $("gameMsg").textContent = "Поймано: " + score + ". " + msg;
        $("gameNext").classList.remove("hidden"); confetti(20);
      }
    }, 200);
    timers.push(tick, spawn);
  };

  // 7. Финал — сердце из частиц
  var cv = $("heartCanvas"), ctx = cv.getContext("2d"), raf = 0, parts = [];
  function startHeart() {
    var dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var scale = Math.min(w, h) / 40, cx = w / 2, cy = h * 0.3;
    parts = [];
    for (var k = 0; k < 220; k++) {
      var t = Math.random() * Math.PI * 2, s = 0.6 + Math.random() * 0.5;
      parts.push({
        tx: cx + 16 * Math.pow(Math.sin(t), 3) * scale * s,
        ty: cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale * s,
        x: Math.random() * w, y: Math.random() * h, ph: Math.random() * 6
      });
    }
    var f = 0;
    (function loop() {
      f++; ctx.clearRect(0, 0, w, h);
      var beat = 1 + 0.04 * Math.sin(f / 12);
      parts.forEach(function (p) {
        p.x += (cx + (p.tx - cx) * beat - p.x) * 0.04;
        p.y += (cy + (p.ty - cy) * beat - p.y) * 0.04;
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(f / 15 + p.ph);
        ctx.fillStyle = "#e8628a";
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, 6.3); ctx.fill();
      });
      raf = requestAnimationFrame(loop);
    })();
  }
  enter[6] = function () {
    cancelAnimationFrame(raf); startHeart(); confetti(40);
    if (!reduce) { var t = setInterval(function () { confetti(18); }, 2500); timers.push(t); }
  };
  $("again").onclick = function () { cancelAnimationFrame(raf); show(0); };

  show(0);
})();
