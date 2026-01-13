// ==================== 3D DRIFTING CAR CURSOR FOLLOWER ====================
(function() {
  // Check if mobile device - disable on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  if (isMobile) return;

  // Car physics configuration
  const config = {
    friction: 0.90,        
    acceleration: 0.25,    
    rotationSpeed: 0.12,   
    driftFactor: 0.25,     
    maxSpeed: 35,          
    minSpeed: 0.1,         
    trailLength: 20,       // Increased unused config, but logic handles it below
  };

  // Car state
  const car = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0, 
    vy: 0, 
    rotation: 0,
    targetRotation: 0,
    speed: 0,
    tilt: 0, 
  };

  // Mouse position
  const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    isMoving: false,
  };

  // Create car element with 3D perspective
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
        <div class="wheel front-left"><div class="wheel-inner"></div><div class="wheel-rim"></div></div>
        <div class="wheel front-right"><div class="wheel-inner"></div><div class="wheel-rim"></div></div>
        <div class="wheel back-left"><div class="wheel-inner"></div><div class="wheel-rim"></div></div>
        <div class="wheel back-right"><div class="wheel-inner"></div><div class="wheel-rim"></div></div>
        <div class="mirror left"></div>
        <div class="mirror right"></div>
        <div class="exhaust-container"><div class="exhaust-smoke"></div></div>
      </div>
    </div>
  `;
  document.body.appendChild(carElement);

  // Create trail container
  const trailContainer = document.createElement('div');
  trailContainer.className = 'car-trail-container';
  document.body.appendChild(trailContainer);

  // Track mouse movement
  let mouseTimeout;
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.isMoving = true;
    
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => {
      mouse.isMoving = false;
    }, 100);
  });

  // Calculate distance between two points
  function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  // Calculate angle between two points
  function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  // Normalize angle to -PI to PI range
  function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  // Create drift trail particle
  function createTrailParticle(x, y, rotation) {
    const particle = document.createElement('div');
    particle.className = 'drift-particle';
    
    // Add randomness to position for "cloud" effect
    const randomOffset = (Math.random() - 0.5) * 10;
    particle.style.left = (x + randomOffset) + 'px';
    particle.style.top = (y + randomOffset) + 'px';
    
    // Initialize opacity (handled by CSS animation now, but safe to set)
    particle.style.opacity = '1';
    
    trailContainer.appendChild(particle);
    
    // Remove after animation completes (1.2s defined in CSS)
    setTimeout(() => {
      particle.remove();
    }, 1200);
  }

  // Animation loop
  let frameCount = 0;
  function animate() {
    // Calculate distance to mouse
    const dx = mouse.x - car.x;
    const dy = mouse.y - car.y;
    const dist = distance(car.x, car.y, mouse.x, mouse.y);

    // Only move if mouse is far enough
    if (dist > 5) {
      const targetAngle = angle(car.x, car.y, mouse.x, mouse.y);
      const ax = Math.cos(targetAngle) * config.acceleration;
      const ay = Math.sin(targetAngle) * config.acceleration;
      
      car.vx += ax;
      car.vy += ay;

      if (car.vx !== 0 || car.vy !== 0) {
        car.targetRotation = Math.atan2(car.vy, car.vx);
      }
    }

    // Apply friction
    car.vx *= config.friction;
    car.vy *= config.friction;

    // Limit maximum speed
    car.speed = Math.sqrt(car.vx ** 2 + car.vy ** 2);
    if (car.speed > config.maxSpeed) {
      car.vx = (car.vx / car.speed) * config.maxSpeed;
      car.vy = (car.vy / car.speed) * config.maxSpeed;
      car.speed = config.maxSpeed;
    }

    if (car.speed < config.minSpeed) {
      car.vx = 0;
      car.vy = 0;
      car.speed = 0;
    }

    car.x += car.vx;
    car.y += car.vy;

    let rotationDiff = normalizeAngle(car.targetRotation - car.rotation);
    car.rotation += rotationDiff * config.rotationSpeed;
    car.rotation = normalizeAngle(car.rotation);

    const targetTilt = rotationDiff * 15;
    car.tilt += (targetTilt - car.tilt) * 0.15;

    // === UPDATED SMOKE LOGIC ===
    // Generate smoke if moving reasonably fast
    // Increased frequency and relaxed speed threshold for more smoke
    if (car.speed > 5 && frameCount % 3 === 0) {
      // Calculate Turning intensity
      const isTurning = Math.abs(rotationDiff) > 0.05;
      
      // Emit smoke if drifting (turning) OR moving very fast
      if (isTurning || car.speed > 15) {
        const backOffset = -25;
        const sideOffset = 14;
        
        const backX = car.x + Math.cos(car.rotation) * backOffset;
        const backY = car.y + Math.sin(car.rotation) * backOffset;
        
        // Left wheel smoke
        const leftX = backX + Math.cos(car.rotation + Math.PI / 2) * sideOffset;
        const leftY = backY + Math.sin(car.rotation + Math.PI / 2) * sideOffset;
        createTrailParticle(leftX, leftY, car.rotation);
        
        // Right wheel smoke
        const rightX = backX + Math.cos(car.rotation - Math.PI / 2) * sideOffset;
        const rightY = backY + Math.sin(car.rotation - Math.PI / 2) * sideOffset;
        createTrailParticle(rightX, rightY, car.rotation);
      }
    }

    const rotationDeg = (car.rotation * 180 / Math.PI) + 90;
    const perspective = 1000;
    const tiltX = Math.sin(car.rotation) * car.tilt;
    const tiltY = -Math.cos(car.rotation) * car.tilt;
    
    const bounce = car.speed > 8 ? Math.sin(frameCount * 0.3) * 1.5 : 0;
    
    carElement.style.left = car.x + 'px';
    carElement.style.top = car.y + 'px';
    carElement.style.transform = `
      translate(-50%, -50%) 
      perspective(${perspective}px) 
      rotateX(${tiltX}deg) 
      rotateY(${tiltY}deg) 
      rotateZ(${rotationDeg}deg)
      translateZ(${bounce}px)
    `;

    const wheelSpinSpeed = Math.max(0.1, 0.5 - (car.speed / 30));
    carElement.style.setProperty('--wheel-spin-speed', `${wheelSpinSpeed}s`);

    frameCount++;
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    if (car.x > window.innerWidth) car.x = window.innerWidth - 50;
    if (car.y > window.innerHeight) car.y = window.innerHeight - 50;
  });

  window.addEventListener('beforeunload', () => {
    carElement.remove();
    trailContainer.remove();
  });

  console.log('🏎️ 3D Drifting car cursor follower initialized!');
})();