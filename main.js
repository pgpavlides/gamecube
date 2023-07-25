import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); 

const loader = new GLTFLoader();
let gltfModel = null;

const uniforms = {
  u_time: { value: 0.0 },
};

const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
    uniform float u_time;
    varying vec2 vUv;

    void main() {
      gl_FragColor = vec4(vUv, sin(u_time), 1.);
    }
  `,
});

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('shadowtexture.png');

const circleGeometry = new THREE.CircleGeometry(1.5, 32);
const circleMaterial = new THREE.MeshBasicMaterial({ 
  map: texture, 
  transparent: true, 
  opacity: 0.5 
});
const shadowCircle = new THREE.Mesh(circleGeometry, circleMaterial);

shadowCircle.rotation.x = -Math.PI / 2;
shadowCircle.position.y = -1.5; // You might need to adjust this according to your cube's position
scene.add(shadowCircle);

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 5;

scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.1;
controls.minDistance = 0;
controls.maxDistance = 15;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();

function loadGLTFModel() {
  loader.load(
    "/cubemain2.glb",
    function (gltf) {
      gltfModel = gltf.scene;
      scene.add(gltf.scene);

      const planes = ["Plane1", "Plane2", "Plane3", "Plane4", "Plane5"];

      planes.forEach((planeName) => {
        const plane = gltfModel.getObjectByName(planeName, true);

        if (plane) {
          plane.material = shaderMaterial;
        }
      });

      gsap.to(gltfModel.rotation, { y: "+=" + Math.PI * 2, duration: 16, ease: "none", repeat: -1 });

      // gsap.to(shadowCircle.position, { duration: 0, follow: gltfModel.position });
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.log("An error happened");
    }
  );
}

function addLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x0000ff, 0.3);
  scene.add(hemisphereLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 2, 2);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.3);
  pointLight.position.set(2, 3, 4);
  scene.add(pointLight);
}

function animate() {
  const elapsedTime = clock.getElapsedTime();

  uniforms.u_time.value = elapsedTime;

  if (gltfModel) {
    gltfModel.rotation.y += 0.01;
  }

  controls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

function onResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
}

function main() {
  addLights();
  loadGLTFModel();
  animate();

  window.addEventListener('resize', onResize);
}

main();
