// ==================== 3D DRIFTING CAR CURSOR FOLLOWER (steering-based, more natural) ====================
(function() {
  // Disable on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  if (isMobile) return;

  // Utility
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function normalizeAngle(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
  function angle(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1); }
  function distance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

  // Config: steering style (vel is forward speed in px/s)
  const config = {
    acceleration: 2500,     // px/s^2 when throttle applied
    braking: 0,          // px/s^2 when braking (applied when close to pointer)
    drag: 3.0,              // exponential drag coefficient (per second)
    baseTurnRate: Math.PI * 1.8, // radians per second at low speed (~324 deg/s)
    turnSpeedReduction: 0.75,    // how much turning reduces with speed (0..1)
    maxSpeed: 1000,         // px/s
    minSpeed: 2,            // below this, speed snaps to 0
    stopDistance: 18,       // px: close enough to pointer => brake to stop
    accelDistance: 500,     // px: scaling for throttle by distance
    tiltFactor: 18,         // degrees tilt multiplier from steering
    particleBaseInterval: 0.05,
    driftParticleInterval: 0.02,
  };

  // Car state: using forward speed and heading (rotation)
  const car = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    rotation: 0,        // radians - heading direction
    speed: 0,           // forward speed px/s
    tilt: 0,            // visual banking
    prevX: window.innerWidth / 2,
    prevY: window.innerHeight / 2,
  };

  // Mouse
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, isMoving: false };

  // DOM
  const carElement = document.createElement('div');
  carElement.className = 'cursor-car';
  carElement.innerHTML = `
    <div class="car-3d-container">
      <div class="car-shadow"></div>
      <div class="car-body">
        <div class="car-roof"><div class="roof-detail"></div></div>
        <div class="car-front">
          <div class="headlight left"></div>
          <div class="headlight right"></div>
          <div class="front-grille"></div>
        </div>
        <div class="car-middle">
          <div class="window-left"></div>
          <div class="racing-stripe"></div>
          <div class="window-right"></div>
          <div class="car-door-left"></div>
          <div class="car-door-right"></div>
        </div>
        <div class="car-back">
          <div class="taillight left"></div>
          <div class="taillight right"></div>
          <div class="spoiler"></div>
        </div>
        <div class="wheel front-left"><div class="wheel-inner"><div class="wheel-rim"></div></div></div>
        <div class="wheel front-right"><div class="wheel-inner"><div class="wheel-rim"></div></div></div>
        <div class="wheel back-left"><div class="wheel-inner"><div class="wheel-rim"></div></div></div>
        <div class="wheel back-right"><div class="wheel-inner"><div class="wheel-rim"></div></div></div>
        <div class="mirror left"></div>
        <div class="mirror right"></div>
        <div class="exhaust-container"><div class="exhaust-smoke"></div></div>
      </div>
    </div>
  `;
  document.body.appendChild(carElement);

  const trailContainer = document.createElement('div');
  trailContainer.className = 'car-trail-container';
  document.body.appendChild(trailContainer);

  // Mouse tracking
  let mouseTimeout;
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.isMoving = true;
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => mouse.isMoving = false, 120);
  });

  // Particles & exhaust
  function createTrailParticle(x, y, rotation, intensity = 1) {
    const particle = document.createElement('div');
    particle.className = 'drift-particle';
    const spreadX = (Math.random() - 0.5) * 12 * intensity;
    const spreadY = (Math.random() - 0.5) * 12 * intensity;
    const backAngle = rotation + Math.PI;
    const pushBack = 8;
    const finalX = x + Math.cos(backAngle) * pushBack + spreadX;
    const finalY = y + Math.sin(backAngle) * pushBack + spreadY;
    particle.style.left = finalX + 'px';
    particle.style.top = finalY + 'px';
    particle.style.opacity = Math.min(intensity * 0.9, 1);
    const rotationDeg = (rotation * 180 / Math.PI) + (Math.random() - 0.5) * 25;
    particle.style.transform = `rotate(${rotationDeg}deg)`;
    trailContainer.appendChild(particle);
    requestAnimationFrame(() => {
      particle.style.opacity = '0';
      particle.style.transform = `rotate(${rotationDeg}deg) scale(${1.4 + Math.random()*0.3})`;
    });
    setTimeout(() => particle.remove(), 800);
  }

  function createExhaustSmoke() {
    const exhaustContainer = carElement.querySelector('.exhaust-container');
    if (!exhaustContainer) return;
    const smoke = document.createElement('div');
    smoke.className = 'exhaust-smoke';
    smoke.style.animation = 'exhaustPuff 0.7s ease-out forwards';
    exhaustContainer.appendChild(smoke);
    setTimeout(() => { if (smoke.parentElement) smoke.remove(); }, 700);
  }

  // Animation loop: steering-based car
  let lastTime = performance.now();
  let particleTimer = 0;
  let lastExhaustTime = 0;
  let totalTime = 0;

  function animate(now) {
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    dt = Math.min(dt, 0.05);
    totalTime += dt;

    // compute target direction and distance
    const targetAngle = angle(car.x, car.y, mouse.x, mouse.y);
    const dist = distance(car.x, car.y, mouse.x, mouse.y);
    let angleDiff = normalizeAngle(targetAngle - car.rotation);

    // compute max turn rate reduced with speed (so at high speed turning is gentler)
    const speedRatio = clamp(car.speed / config.maxSpeed, 0, 1);
    const maxTurn = config.baseTurnRate * (1 - config.turnSpeedReduction * speedRatio);
    // apply turning limited by maxTurn * dt
    const turn = clamp(angleDiff, -maxTurn * dt, maxTurn * dt);
    car.rotation = normalizeAngle(car.rotation + turn);

    // throttle depends on how aligned we are and distance
    const alignment = 1 - clamp(Math.abs(angleDiff) / Math.PI, 0, 1); // 1 when aligned, 0 when opposite
    const distanceFactor = clamp(dist / config.accelDistance, 0, 1);
    const throttle = distanceFactor * Math.pow(alignment, 1.4); // penalize large angle more

    // braking when very close to mouse or when opposite direction & slow down faster
    if (dist < config.stopDistance) {
      // apply heavy braking to stop
      car.speed -= config.braking * dt;
    } else {
      // accelerate forward
      car.speed += config.acceleration * throttle * dt;
    }

    // apply drag (exponential)
    car.speed *= Math.exp(-config.drag * dt);

    // clamp speed and snap to zero
    car.speed = clamp(car.speed, 0, config.maxSpeed);
    if (car.speed < config.minSpeed) car.speed = 0;

    // integrate position along heading
    car.prevX = car.x; car.prevY = car.y;
    car.x += Math.cos(car.rotation) * car.speed * dt;
    car.y += Math.sin(car.rotation) * car.speed * dt;

    // tilt (bank) - based on steering turn rate and speed
    const targetTilt = (-turn / (maxTurn || 1)) * config.tiltFactor * clamp(car.speed / config.maxSpeed, 0.25, 1);
    // smooth tilt
    const tiltAlpha = 1 - Math.exp(-8 * dt);
    car.tilt += (targetTilt - car.tilt) * tiltAlpha;

    // Particle emission: more when turning or at high speed
    if (car.speed > 120) {
      const isTurning = Math.abs(angleDiff) > 0.08;
      const isDrifting = isTurning && car.speed > (config.maxSpeed * 0.45);
      const baseInterval = isDrifting ? config.driftParticleInterval : config.particleBaseInterval;
      const speedFactor = clamp(car.speed / 600, 0.5, 3);
      const interval = baseInterval / speedFactor;

      particleTimer += dt;
      if (particleTimer >= interval) {
        particleTimer = 0;
        const backOffset = -26;
        const sideOffset = 12;

        const backX = car.x + Math.cos(car.rotation) * backOffset;
        const backY = car.y + Math.sin(car.rotation) * backOffset;
        const intensity = clamp(car.speed / config.maxSpeed, 0.2, 1) * (isDrifting ? 1.6 : 1);

        const leftX = backX + Math.cos(car.rotation + Math.PI / 2) * sideOffset;
        const leftY = backY + Math.sin(car.rotation + Math.PI / 2) * sideOffset;
        createTrailParticle(leftX, leftY, car.rotation, intensity);

        const rightX = backX + Math.cos(car.rotation - Math.PI / 2) * sideOffset;
        const rightY = backY + Math.sin(car.rotation - Math.PI / 2) * sideOffset;
        createTrailParticle(rightX, rightY, car.rotation, intensity);
      }
    } else {
      particleTimer = 0;
    }

    // exhaust when accelerating (throttle large)
    if (throttle > 0.25 && (now - lastExhaustTime) > 140) {
      createExhaustSmoke();
      lastExhaustTime = now;
    }

    // visual transform
    const rotationDeg = (car.rotation * 180 / Math.PI) + 90;
    const perspective = 1200;
    const tiltX = Math.sin(car.rotation) * car.tilt;
    const tiltY = -Math.cos(car.rotation) * car.tilt;
    const bounce = car.speed > 500 ? Math.sin(totalTime * 4) * Math.min(car.speed / 1600, 2) : 0;
    const forwardTilt = Math.min(car.speed / 400, 5);

    carElement.style.left = car.x + 'px';
    carElement.style.top = car.y + 'px';
    carElement.style.transform = `
      translate(-50%, -50%)
      perspective(${perspective}px)
      rotateX(${tiltX - forwardTilt}deg)
      rotateY(${tiltY}deg)
      rotateZ(${rotationDeg}deg)
      translateZ(${bounce}px)
    `;

    // wheel spin speed (faster when speed is higher)
    const wheelSpinSpeed = car.speed > 10 ? Math.max(0.02, 0.8 - (car.speed / 2200)) : 10;
    carElement.style.setProperty('--wheel-spin-speed', `${wheelSpinSpeed}s`);

    requestAnimationFrame(animate);
  }

  // start
  requestAnimationFrame(animate);

  // keep car on-screen when resizing
  window.addEventListener('resize', () => {
    if (car.x > window.innerWidth) car.x = window.innerWidth - 50;
    if (car.y > window.innerHeight) car.y = window.innerHeight - 50;
    if (car.x < 50) car.x = 50;
    if (car.y < 50) car.y = 50;
  });

  window.addEventListener('beforeunload', () => {
    carElement.remove();
    trailContainer.remove();
  });

  console.log('🚗 Steering-based car cursor loaded — more natural handling.');
})();