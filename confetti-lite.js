// confetti-lite.js
// Dependency-free confetti that respects prefers-reduced-motion and auto-cleans up.
// Exposes window.fireConfetti(options?). options: {durationMs, particleCount, gravity, scalar}
(function () {
  function prefersReducedMotion() {
    return typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function fireConfetti(opts) {
    if (prefersReducedMotion()) return;

    opts = opts || {};
    var duration = opts.durationMs != null ? opts.durationMs : 1100;
    var particleCount = opts.particleCount != null ? opts.particleCount : 120;
    var gravity = opts.gravity != null ? opts.gravity : 0.25;
    var scalar = opts.scalar != null ? opts.scalar : 1;

    var canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '2147483647';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    function resize() {
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    }
    resize();
    var onResize = function(){ resize(); };
    window.addEventListener('resize', onResize);

    function rand(min, max) { return Math.random() * (max - min) + min; }

    var particles = [];
    for (var i = 0; i < particleCount; i++) {
      var angle = rand(-Math.PI, 0);
      var speed = rand(3, 7);
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.2,
        vx: Math.cos(angle) * speed * dpr,
        vy: Math.sin(angle) * speed * dpr,
        w: rand(4, 7) * scalar * dpr,
        h: rand(6, 10) * scalar * dpr,
        r: rand(0, Math.PI * 2),
        spin: rand(-0.25, 0.25),
        hue: rand(0, 360)
      });
    }

    var start = performance.now();
    function tick(now) {
      var progress = Math.min(1, (now - start) / duration);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i=0;i<particles.length;i++) {
        var p = particles[i];
        p.vy += gravity * dpr;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = 'hsl(' + p.hue + ',80%,60%)';
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      }
      if (progress < 1) requestAnimationFrame(tick);
      else cleanup();
    }

    function cleanup() {
      window.removeEventListener('resize', onResize);
      canvas.remove();
    }

    requestAnimationFrame(tick);
  }

  window.fireConfetti = fireConfetti;
})();
