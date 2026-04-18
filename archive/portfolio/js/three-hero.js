/* ============================================================
   THREE-HERO — Three.js 3D particle system for the hero section
   ============================================================ */

(function () {
  'use strict';

  function init() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // Reduced motion check
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle system
    var particleCount = 1500;
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    var velocities = new Float32Array(particleCount * 3);

    for (var i = 0; i < particleCount * 3; i += 3) {
      // Sphere distribution
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      var r = 3 + Math.random() * 2;

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);

      velocities[i] = (Math.random() - 0.5) * 0.002;
      velocities[i + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i + 2] = (Math.random() - 0.5) * 0.002;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Get theme color
    function getParticleColor() {
      var theme = document.documentElement.getAttribute('data-theme');
      return theme === 'light' ? 0x2d8a9c : 0x5ba4b5;
    }

    var material = new THREE.PointsMaterial({
      color: getParticleColor(),
      size: 0.025,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    var particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;

    // Mouse tracking
    var mouse = { x: 0, y: 0 };
    var targetRotation = { x: 0, y: 0 };

    document.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Mouse-reactive rotation
      targetRotation.y = mouse.x * 0.3;
      targetRotation.x = mouse.y * 0.15;

      particles.rotation.y += (targetRotation.y - particles.rotation.y) * 0.02;
      particles.rotation.x += (targetRotation.x - particles.rotation.x) * 0.02;

      // Slow auto-rotation
      particles.rotation.y += 0.001;
      particles.rotation.z += 0.0003;

      // Subtle particle drift
      var pos = geometry.attributes.position.array;
      for (var i = 0; i < particleCount * 3; i += 3) {
        pos[i] += velocities[i];
        pos[i + 1] += velocities[i + 1];
        pos[i + 2] += velocities[i + 2];

        // Keep particles within bounds
        var dist = Math.sqrt(pos[i] * pos[i] + pos[i + 1] * pos[i + 1] + pos[i + 2] * pos[i + 2]);
        if (dist > 6 || dist < 2) {
          velocities[i] *= -1;
          velocities[i + 1] *= -1;
          velocities[i + 2] *= -1;
        }
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', function () {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // Theme change handler
    window.addEventListener('themechange', function () {
      material.color.setHex(getParticleColor());
    });
  }

  // Expose for app.js
  window.DSThreeHero = { init: init };
})();
