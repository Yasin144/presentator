/**
 * 3D Hologram Compositor Module
 * Fully Autonomous Plugin - Zero Dependencies on Main App Core Logic
 */

(function () {
  const threeCanvas = document.createElement("canvas");
  threeCanvas.width = 1280;
  threeCanvas.height = 720;
  threeCanvas.style.display = "none";
  document.body.appendChild(threeCanvas);

  let renderer, scene, camera, activeHologram = null;
  let animationId = null;
  let targetHologramScale = 1.0;
  let rotationSpeed = 0.005;

  let userScaleMultiplier = 1.0;
  let moveRight = true;
  let useLipSync = true;
  let mixer = null;
  let clock = null; // we will initialize it when loading THREE


  function applyHologramSettings() {
    if (!activeHologram || !window.activeHologramBaseBox) return;
    const center = window.activeHologramBaseBox.center;
    const maxDim = window.activeHologramBaseBox.maxDim;
    
    // adjust base scale to 3.5 so it's not as insanely huge as 6.0 and scale with user multiplier
    const baseScale = (3.5 / maxDim) * userScaleMultiplier;
    activeHologram.scale.set(baseScale, baseScale, baseScale);

    // Apply offset depending on "moveRight" preference
    const xBase = -center.x * baseScale;
    activeHologram.position.x = moveRight ? xBase + 2.5 : xBase;
    activeHologram.position.y = (-center.y * baseScale) + 0.5; // lower it slightly
    activeHologram.position.z = -center.z * baseScale;
  }

  function init3D() {
    // Transparent layer for WebGL so the main video shows through
    renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true });
    renderer.setSize(1280, 720);
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, 1280 / 720, 0.1, 100);
    camera.position.z = 10;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x90b0d0, 1.0);
    fillLight.position.set(-5, -2, -5);
    scene.add(fillLight);
  }

  function handleHologramUpload(event) {
    if (!renderer) {
      init3D();
      clock = new THREE.Clock();
    }
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const loader = new THREE.GLTFLoader();

    loader.load(url, (gltf) => {
      if (activeHologram) scene.remove(activeHologram);
      activeHologram = gltf.scene;

      // Smart centering math
      const box = new THREE.Box3().setFromObject(activeHologram);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      
      window.activeHologramBaseBox = { center, maxDim }; // save for dynamic changes
      applyHologramSettings();

      const pivot = new THREE.Group();
      scene.add(pivot);
      pivot.add(activeHologram);
      activeHologram = pivot; 

      // Activate any built-in walking/talking/idle animations inside the 3D model!
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(activeHologram);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
      } else {
        mixer = null;
      }

      if (!animationId) {
        function animate() {
          const delta = clock.getDelta();
          if (mixer) {
            mixer.update(delta);
          } else if (activeHologram) {
            activeHologram.rotation.y += rotationSpeed; // Smooth continuous spin fallback if no native animations
          }
          renderer.render(scene, camera);
          animationId = requestAnimationFrame(animate);
        }
        animate();
      }

    }, undefined, (e) => console.error("3D Hologram Load Error:", e));
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Inject the physical UI file block dynamically into the DOM
    const mediaGrid = document.querySelector(".media-upload-grid");
    if (mediaGrid) {
      const block = document.createElement("div");
      block.className = "upload-block";
      block.innerHTML = `
        <label class="field-label" for="hologramInput">3D Hologram Overlay (.glb / .gltf)</label>
        <p class="upload-copy">Upload an autonomous 3D file to render a floating 3D hologram directly over your presentation timeline.</p>
        <input id="hologramInput" class="image-input" type="file" accept=".gltf,.glb" />
        <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
          <label class="field-label" style="display:flex; align-items:center; gap: 8px;">
            <input type="checkbox" id="hologramLipSyncCheck" checked style="width: 16px; height: 16px;">
            <span>Enable Auto-Lip Sync (Reacts to Audio)</span>
          </label>
          <label class="field-label" style="display:flex; flex-direction: column; gap: 4px;">
            <span>Scale Adjuster (Fix Huge Models):</span>
            <input type="range" id="hologramScaleSlider" min="0.1" max="5.0" step="0.1" value="1" style="width: 100%;">
          </label>
          <label class="field-label" style="display:flex; align-items:center; gap: 8px;">
            <input type="checkbox" id="hologramMoveRightCheck" checked style="width: 16px; height: 16px;">
            <span>Position Bottom Right (Avoid Text Block)</span>
          </label>
        </div>
      `;
      mediaGrid.appendChild(block);

      document.getElementById("hologramInput").addEventListener("change", handleHologramUpload);
      
      const scaleSlider = document.getElementById("hologramScaleSlider");
      if (scaleSlider) {
        scaleSlider.addEventListener("input", (e) => {
          userScaleMultiplier = parseFloat(e.target.value);
          applyHologramSettings();
        });
      }

      const moveRightCheck = document.getElementById("hologramMoveRightCheck");
      if (moveRightCheck) {
        moveRightCheck.addEventListener("change", (e) => {
          moveRight = e.target.checked;
          applyHologramSettings();
        });
      }

      const lipSyncCheck = document.getElementById("hologramLipSyncCheck");
      if (lipSyncCheck) {
        lipSyncCheck.addEventListener("change", (e) => {
          useLipSync = e.target.checked;
        });
      }
    }
  });

  // Export purely isolated public draw hook
  window._renderHologramFrame = function (ctx, mouthOpen) {
    if (activeHologram && useLipSync && mouthOpen !== undefined) {
      activeHologram.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences && child.morphTargetDictionary) {
          const keys = Object.keys(child.morphTargetDictionary);
          keys.forEach(k => {
            const kl = k.toLowerCase();
            // Automatically find jaw/mouth morphs
            if (kl.includes('mouth') || kl.includes('jaw') || kl.includes('vowel') || kl.includes('lip')) {
              const idx = child.morphTargetDictionary[k];
              // map mouthOpen (0.08 to ~0.50) to morph target (0.0 to 1.0)
              // Increased multiplier to hit 1.0 much faster, creating a wider, more natural human jaw movement
              const mapped = Math.max(0, Math.min(1, (mouthOpen - 0.12) * 5.5));
              child.morphTargetInfluences[idx] = mapped;
            }
          });
        }
      });
    }

    if (activeHologram && renderer) {
      renderer.render(scene, camera);
      ctx.drawImage(threeCanvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  };

})();
