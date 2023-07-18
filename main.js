import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const loader = new GLTFLoader();

let gltfModel = null;

const vertexShader = `
  varying vec3 vUv; 

  void main() {
    vUv = position; 

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  varying vec3 vUv;

  void main() {
    vec3 colorA = vec3(1.0, 0.0, 0.0); // red color
    vec3 colorB = vec3(0.0, 0.0, 1.0); // blue color

    // Calculate a blend factor based on the time
    float blendFactor = 0.5 * (1.0 + sin(u_time));

    // Interpolate between the colors using the blend factor
    vec3 color = mix(colorA, colorB, blendFactor);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const uniforms = {
  u_time: { value: 0.0 },
};

const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});
//========================================= CUVE GLTF==================


loader.load(
  "/cubemain2.glb", // path to your gltf file
  function (gltf) {
    gltfModel = gltf.scene;
    scene.add(gltf.scene);

    const planes = ["Plane1", "Plane2", "Plane3", "Plane4", "Plane5"];

    planes.forEach((planeName) => {
      const plane = gltfModel.getObjectByName(planeName, true);

      // Apply the shader material to the object if it exists
      if (plane) {
        plane.material = shaderMaterial;
      }
    });

    // Define a timeline

    //ANIMATIOn

    let tl = gsap.timeline({ repeat: -1, yoyo: true });

    // // Animate to x+ then x-
    // tl.to(gltfModel.position, { x: 3, duration: 6, ease: "power1.inOut" }).to(
    //   gltfModel.position, { x: -3, duration: 6, ease: "power1.inOut" }
    // );

    gsap.to(gltfModel.rotation, { y: "+=" + Math.PI * 2, duration: 16, ease: "none", repeat: -1 });
  },
  // called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  // called when loading has errors
  function (error) {
    console.log("An error happened");
  }
);

// ============================= FLOOR GLTF =================================================
// loader.load(
//   "/floor.glb", // path to your gltf file
//   function (gltf) {
//     gltfModel = gltf.scene;
//     scene.add(gltf.scene);
   
//   },
//   // called while loading is progressing
//   function (xhr) {
//     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
//   },
//   // called when loading has errors
//   function (error) {
//     console.log("An error happened");
//   }
// );



/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // soft white light
scene.add(ambientLight);

// Hemisphere Light
const hemisphereLight = new THREE.HemisphereLight(0x1fb8b2, 0x0000ff, 0.3);
scene.add(hemisphereLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 2, 2);
scene.add(directionalLight);

// Point Light
const pointLight = new THREE.PointLight(0x00fffc, 0.3);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

// /**
//  * Object
//  */
// const geometry = new THREE.BufferGeometry();
// const count = 50;
// const positionsArray = new Float32Array(count * 3 * 3);
// for (let i = 0; i < count * 3 * 3; i++) {
//   positionsArray[i] = (Math.random() - 0.5) * 500;
// }
// const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
// geometry.setAttribute("position", positionsAttribute);

// const material = new THREE.MeshBasicMaterial({
//   color: 0x1fb8b2,
//   wireframe: true,
// });

// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// /**
//  * New Object
//  */
// const geometry2 = new THREE.BufferGeometry();
// const count2 = 35;
// const positionsArray2 = new Float32Array(count2 * 3 * 3);
// for (let i = 0; i < count2 * 3 * 3; i++) {
//   positionsArray2[i] = (Math.random() - 0.5) * 1000;
// }
// const positionsAttribute2 = new THREE.BufferAttribute(positionsArray2, 3);
// geometry2.setAttribute("position", positionsAttribute2);

// const material2 = new THREE.MeshBasicMaterial({
//   color: 0xffffff,
//   wireframe: true,
// });

// const mesh2 = new THREE.Mesh(geometry2, material2);
// scene.add(mesh2);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;

  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 5;

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.1;
controls.minDistance = 0;
controls.maxDistance = 15;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Raycaster
 */
// let isScaledUp = false;
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();

// function onMouseClick(event) {
//   // calculate mouse position in normalized device coordinates
//   // (-1 to +1) for both components
//   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//   raycaster.setFromCamera(mouse, camera);

//   // calculate objects intersecting the picking ray
//   const intersects = raycaster.intersectObjects(scene.children, true);

//   for (let i = 0; i < intersects.length; i++) {
//     let targetObject = intersects[i].object;

//     // Recursive search to find if the gltfModel is a parent of the intersected object
//     while (targetObject !== null) {
//       if (targetObject === gltfModel) {
//         console.log("GLTF model clicked");

//         // Use GSAP to animate the scale of the GLTF model
//         gsap.to(gltfModel.scale, {
//           x: 1.3,
//           y: 1.3,
//           z: 1.3,
//           duration: 1, // Duration of the animation in seconds
//           ease: "power2.out", // Easing function to use
//         });

//         break;
//       }

//       targetObject = targetObject.parent;
//     }
//   }
// }

// window.addEventListener("click", onMouseClick, false);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  shaderMaterial.uniforms.u_time.value = performance.now() / 2000;

  pointLight.position.x = Math.sin(elapsedTime) * 2;
  pointLight.position.y = Math.sin(elapsedTime) * 2;
  pointLight.position.z = Math.sin(elapsedTime) * 2;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
