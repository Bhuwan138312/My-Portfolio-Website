// ==================== 3D DRIFTING CAR CURSOR FOLLOWER ====================
(function() {
  // Check if mobile device - disable on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  if (isMobile) return;

  // Enhanced car physics configuration
  const config = {
    friction: 0.88,           // Slightly less friction for smoother movement
    acceleration: 0.4,        // Faster acceleration
    rotationSpeed: 0.15,      // Smoother rotation
    driftFactor: 0.3,         
    maxSpeed: 50,             
    minSpeed: 0.2,            
    smoothing: 0.18,          // Smoother camera follow
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
    prevX: window.innerWidth / 2,
    prevY: window.innerHeight / 2,
  };

  // Mouse position
  const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    isMoving: false,
  };

  // Create car element with enhanced 3D perspective
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

  // Helper functions
  function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  // Create enhanced drift trail particle
  function createTrailParticle(x, y, rotation, intensity = 1) {
    const particle = document.createElement('div');
    particle.className = 'drift-particle';
    
    // More pronounced offset based on intensity
    const spreadX = (Math.random() - 0.5) * 15 * intensity;
    const spreadY = (Math.random() - 0.5) * 15 * intensity;
    
    // Position behind the wheel
    const backAngle = rotation + Math.PI;
    const pushBack = 8;
    const finalX = x + Math.cos(backAngle) * pushBack + spreadX;
    const finalY = y + Math.sin(backAngle) * pushBack + spreadY;
    
    particle.style.left = finalX + 'px';
    particle.style.top = finalY + 'px';
    particle.style.opacity = Math.min(intensity * 0.8, 1);
    
    // Slight rotation for visual variety
    const rotationDeg = (rotation * 180 / Math.PI) + (Math.random() - 0.5) * 30;
    particle.style.transform = `rotate(${rotationDeg}deg)`;
    
    trailContainer.appendChild(particle);
    
    // Fade out animation
    setTimeout(() => {
      particle.style.opacity = '0';
      particle.style.transform = `rotate(${rotationDeg}deg) scale(1.5)`;
    }, 50);
    
    setTimeout(() => {
      particle.remove();
    }, 800);
  }

  // Create exhaust smoke effect
  function createExhaustSmoke() {
    const exhaustContainer = carElement.querySelector('.exhaust-container');
    if (!exhaustContainer) return;

    const smoke = document.createElement('div');
    smoke.className = 'exhaust-smoke';
    smoke.style.animation = 'exhaustPuff 0.8s ease-out forwards';
    
    exhaustContainer.appendChild(smoke);

    setTimeout(() => {
      if (smoke.parentElement) {
        smoke.remove();
      }
    }, 800);
  }

  // Main animation loop
  let frameCount = 0;
  let lastExhaustTime = 0;
  
  function animate(currentTime) {
    frameCount++;
    
    // Calculate distance to mouse
    const dx = mouse.x - car.x;
    const dy = mouse.y - car.y;
    const dist = distance(car.x, car.y, mouse.x, mouse.y);

    // Apply acceleration when mouse is far enough
    if (dist > 10) {
      const targetAngle = angle(car.x, car.y, mouse.x, mouse.y);
      
      // Smooth acceleration based on distance
      const accelMultiplier = Math.min(dist / 100, 1);
      const ax = Math.cos(targetAngle) * config.acceleration * accelMultiplier;
      const ay = Math.sin(targetAngle) * config.acceleration * accelMultiplier;
      
      car.vx += ax;
      car.vy += ay;

      // Update target rotation based on velocity
      if (car.vx !== 0 || car.vy !== 0) {
        car.targetRotation = Math.atan2(car.vy, car.vx);
      }
    }

    // Apply friction
    car.vx *= config.friction;
    car.vy *= config.friction;

    // Calculate speed
    car.speed = Math.sqrt(car.vx ** 2 + car.vy ** 2);
    
    // Limit maximum speed
    if (car.speed > config.maxSpeed) {
      const scale = config.maxSpeed / car.speed;
      car.vx *= scale;
      car.vy *= scale;
      car.speed = config.maxSpeed;
    }

    // Stop completely if too slow
    if (car.speed < config.minSpeed) {
      car.vx = 0;
      car.vy = 0;
      car.speed = 0;
    }

    // Update position
    car.prevX = car.x;
    car.prevY = car.y;
    car.x += car.vx;
    car.y += car.vy;

    // Smooth rotation
    let rotationDiff = normalizeAngle(car.targetRotation - car.rotation);
    car.rotation += rotationDiff * config.rotationSpeed;
    car.rotation = normalizeAngle(car.rotation);

    // Calculate tilt based on turning (3D effect)
    const targetTilt = rotationDiff * 20;
    car.tilt += (targetTilt - car.tilt) * 0.2;

    // Enhanced drift particle generation
    if (car.speed > 6) {
      const isTurning = Math.abs(rotationDiff) > 0.04;
      const isDrifting = car.speed > 15 && isTurning;
      
      // More frequent particles when drifting
      const particleFrequency = isDrifting ? 2 : 4;
      
      if (frameCount % particleFrequency === 0) {
        const backOffset = -28;
        const sideOffset = 12;
        
        // Calculate wheel positions
        const backX = car.x + Math.cos(car.rotation) * backOffset;
        const backY = car.y + Math.sin(car.rotation) * backOffset;
        
        const intensity = Math.min(car.speed / 20, 1) * (isDrifting ? 1.5 : 1);
        
        // Left wheel smoke
        const leftX = backX + Math.cos(car.rotation + Math.PI / 2) * sideOffset;
        const leftY = backY + Math.sin(car.rotation + Math.PI / 2) * sideOffset;
        createTrailParticle(leftX, leftY, car.rotation, intensity);
        
        // Right wheel smoke  
        const rightX = backX + Math.cos(car.rotation - Math.PI / 2) * sideOffset;
        const rightY = backY + Math.sin(car.rotation - Math.PI / 2) * sideOffset;
        createTrailParticle(rightX, rightY, car.rotation, intensity);
      }
    }

    // Exhaust smoke when accelerating
    if (car.speed > 3 && currentTime - lastExhaustTime > 200) {
      createExhaustSmoke();
      lastExhaustTime = currentTime;
    }

    // Enhanced 3D transform
    const rotationDeg = (car.rotation * 180 / Math.PI) + 90;
    const perspective = 1200;
    
    // Tilt calculation for realistic banking
    const tiltX = Math.sin(car.rotation) * car.tilt;
    const tiltY = -Math.cos(car.rotation) * car.tilt;
    
    // Subtle bounce when moving fast
    const bounce = car.speed > 10 ? Math.sin(frameCount * 0.4) * Math.min(car.speed / 20, 2) : 0;
    
    // Forward tilt when accelerating
    const forwardTilt = Math.min(car.speed / 15, 5);
    
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

    // Dynamic wheel spin speed based on car speed
    const wheelSpinSpeed = car.speed > 0.5 
      ? Math.max(0.05, 0.5 - (car.speed / 40)) 
      : 10; // Very slow when stopped
    carElement.style.setProperty('--wheel-spin-speed', `${wheelSpinSpeed}s`);

    requestAnimationFrame(animate);
  }

  // Start animation
  requestAnimationFrame(animate);

  // Handle window resize
  window.addEventListener('resize', () => {
    if (car.x > window.innerWidth) car.x = window.innerWidth - 50;
    if (car.y > window.innerHeight) car.y = window.innerHeight - 50;
    if (car.x < 50) car.x = 50;
    if (car.y < 50) car.y = 50;
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    carElement.remove();
    trailContainer.remove();
  });

  console.log('🎮 Enhanced 3D Drifting Car Cursor Initialized! Move your mouse to drive!');
})();