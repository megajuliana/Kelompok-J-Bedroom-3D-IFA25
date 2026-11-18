import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3ff); // Default Day Mode background

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Pencahayaan (Lighting)
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 8, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
scene.add(dirLight);

// Window Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// MEMBUAT LANTAI & DINDING KAMAR
const roomSize = 8;
const wallHeight = 3.5;

// A. Lantai Kamar
const floorGeo = new THREE.BoxGeometry(roomSize, 0.2, roomSize);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xe3cca8 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.position.y = -0.1;
floor.receiveShadow = true;
scene.add(floor);

// Material untuk dinding
const wallMat = new THREE.MeshStandardMaterial({ color: 0xfaf8f5, roughness: 0.9 });

// B. Dinding Belakang
const backWallGeo = new THREE.BoxGeometry(roomSize, wallHeight, 0.2);
const backWall = new THREE.Mesh(backWallGeo, wallMat);
backWall.position.set(0, wallHeight / 2, -roomSize / 2);
backWall.receiveShadow = true;
scene.add(backWall);

// C. Dinding Samping Kiri
const leftWallGeo = new THREE.BoxGeometry(0.2, wallHeight, roomSize);
const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
leftWall.position.set(-roomSize / 2, wallHeight / 2, 0);
leftWall.receiveShadow = true;
scene.add(leftWall);