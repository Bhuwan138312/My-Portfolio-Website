// ==================== 3D DRIFTING CAR CURSOR FOLLOWER ====================
(function() {
  // Check if mobile device - disable on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  if (isMobile) return;

  // Car physics configuration
  const config = {
    friction: 0.90,        // How quickly the car slows down (0-1)
    acceleration: 0.25,    // How fast the car accelerates toward cursor
    rotationSpeed: 0.12,   // How fast the car rotates to face direction
    driftFactor: 0.25,     // Amount of overshoot/drift on direction changes
    maxSpeed: 35,          // Maximum speed pixels per frame
    minSpeed: 0.1,         // Minimum speed before stopping
    trailLength: 8,        // Length of drift trail effect
  };

  // Car state
  const car = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0,  // velocity x
    vy: 0,  // velocity y
    rotation: 0,
    targetRotation: 0,
    speed: 0,
    tilt: 0, // 3D tilt effect
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
      <!-- Car shadow (separate for 3D effect) -->
      <div class="car-shadow"></div>
      
      <!-- Main 3D car body -->
      <div class="car-body">
        <!-- Top view for 3D effect -->
        <div class="car-roof">
          <div class="roof-detail"></div>
        </div>
        
        <!-- Front section -->
        <div class="car-front">
          <div class="headlight left"></div>
          <div class="headlight right"></div>
          <div class="front-grille"></div>
        </div>
        
        <!-- Middle body -->
        <div class="car-middle">
          <div class="window-left"></div>
          <div class="racing-stripe"></div>
          <div class="window-right"></div>
          <div class="car-door-left"></div>
          <div class="car-door-right"></div>
        </div>
        
        <!-- Back section -->
        <div class="car-back">
          <div class="taillight left"></div>
          <div class="taillight right"></div>
          <div class="spoiler"></div>
        </div>
        
        <!-- Wheels with 3D depth -->
        <div class="wheel front-left">
          <div class="wheel-inner"></div>
          <div class="wheel-rim"></div>
        </div>
        <div class="wheel front-right">
          <div class="wheel-inner"></div>
          <div class="wheel-rim"></div>
        </div>
        <div class="wheel back-left">
          <div class="wheel-inner"></div>
          <div class="wheel-rim"></div>
        </div>
        <div class="wheel back-right">
          <div class="wheel-inner"></div>
          <div class="wheel-rim"></div>
        </div>
        
        <!-- Side mirrors -->
        <div class="mirror left"></div>
        <div class="mirror right"></div>
        
        <!-- Exhaust smoke when moving fast -->
        <div class="exhaust-container">
          <div class="exhaust-smoke"></div>
        </div>
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
  function createTrailParticle(x, y, rotation, speed) {
    const particle = document.createElement('div');
    particle.className = 'drift-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.transform = `rotate(${rotation}rad)`;
    
    const opacity = Math.min(speed / config.maxSpeed, 1) * 0.7;
    particle.style.opacity = opacity;
    
    trailContainer.appendChild(particle);
    
    // Fade out and remove
    setTimeout(() => {
      particle.style.opacity = '0';
      setTimeout(() => particle.remove(), 400);
    }, 50);
  }

  // Animation loop
  let frameCount = 0;
  function animate() {
    // Calculate distance to mouse
    const dx = mouse.x - car.x;
    const dy = mouse.y - car.y;
    const dist = distance(car.x, car.y, mouse.x, mouse.y);

    // Only move if mouse is far enough and moving
    if (dist > 5) {
      // Calculate acceleration toward mouse
      const targetAngle = angle(car.x, car.y, mouse.x, mouse.y);
      
      // Apply acceleration
      const ax = Math.cos(targetAngle) * config.acceleration;
      const ay = Math.sin(targetAngle) * config.acceleration;
      
      car.vx += ax;
      car.vy += ay;

      // Calculate target rotation based on velocity direction
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

    // Stop if moving very slowly
    if (car.speed < config.minSpeed) {
      car.vx = 0;
      car.vy = 0;
      car.speed = 0;
    }

    // Update position
    car.x += car.vx;
    car.y += car.vy;

    // Smooth rotation interpolation
    let rotationDiff = normalizeAngle(car.targetRotation - car.rotation);
    car.rotation += rotationDiff * config.rotationSpeed;
    car.rotation = normalizeAngle(car.rotation);

    // Calculate 3D tilt based on speed and rotation change
    const targetTilt = rotationDiff * 15; // Tilt amount based on turning
    car.tilt += (targetTilt - car.tilt) * 0.15;

    // Create drift trail particles when moving fast
    if (car.speed > 3 && frameCount % 2 === 0) {
      // Create particles at back wheels
      const backOffset = -20;
      const sideOffset = 12;
      
      const backX = car.x + Math.cos(car.rotation) * backOffset;
      const backY = car.y + Math.sin(car.rotation) * backOffset;
      
      // Left wheel trail
      const leftX = backX + Math.cos(car.rotation + Math.PI / 2) * sideOffset;
      const leftY = backY + Math.sin(car.rotation + Math.PI / 2) * sideOffset;
      createTrailParticle(leftX, leftY, car.rotation, car.speed);
      
      // Right wheel trail
      const rightX = backX + Math.cos(car.rotation - Math.PI / 2) * sideOffset;
      const rightY = backY + Math.sin(car.rotation - Math.PI / 2) * sideOffset;
      createTrailParticle(rightX, rightY, car.rotation, car.speed);
    }

    // Update car element position with 3D transforms
    const rotationDeg = (car.rotation * 180 / Math.PI) + 90; // Convert to degrees and adjust
    const perspective = 1000;
    const tiltX = Math.sin(car.rotation) * car.tilt;
    const tiltY = -Math.cos(car.rotation) * car.tilt;
    
    // Add bounce effect when moving fast
    const bounce = car.speed > 8 ? Math.sin(frameCount * 0.3) * 1.5 : 0;
    
    // Apply 3D transform
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

    // Add exhaust smoke effect when moving fast
    const exhaustSmoke = carElement.querySelector('.exhaust-smoke');
    if (exhaustSmoke) {
      if (car.speed > 10) {
        exhaustSmoke.style.opacity = '0.6';
        exhaustSmoke.style.animation = 'exhaustPuff 0.4s ease-out infinite';
      } else if (car.speed > 5) {
        exhaustSmoke.style.opacity = '0.3';
        exhaustSmoke.style.animation = 'exhaustPuff 0.6s ease-out infinite';
      } else {
        exhaustSmoke.style.opacity = '0';
        exhaustSmoke.style.animation = 'none';
      }
    }

    // Wheel spin animation speed based on car speed
    const wheelSpinSpeed = Math.max(0.1, 0.5 - (car.speed / 30));
    carElement.style.setProperty('--wheel-spin-speed', `${wheelSpinSpeed}s`);

    frameCount++;
    requestAnimationFrame(animate);
  }

  // Start animation
  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    if (car.x > window.innerWidth) car.x = window.innerWidth - 50;
    if (car.y > window.innerHeight) car.y = window.innerHeight - 50;
  });

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    carElement.remove();
    trailContainer.remove();
  });

  console.log('🏎️ 3D Drifting car cursor follower initialized!');
})();