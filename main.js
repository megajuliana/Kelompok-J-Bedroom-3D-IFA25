import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

// --- PENYIMPANAN OBJEK 3D ---
const objectsMap = {
  bed: null,
  wardrobe: null,
  desk: null,
  window: null,
  lamp: null,
  frame1: null,
  frame2: null,
  frame3: null
};

// Loading Textures & Models
const loader = new GLTFLoader();
const loadingEl = document.getElementById('loader');
let loadedCount = 0;
const totalAssets = 8;

function checkLoading() {
  loadedCount++;
  if (loadedCount >= totalAssets) {
    loadingEl.style.opacity = '0';
    setTimeout(() => loadingEl.remove(), 500);
  }
}

// Load 3 Tekstur Foto Anggota
const textureLoader = new THREE.TextureLoader();
const texture1 = textureLoader.load('textures/dinar.jpg', () => applyPhotoTexture(objectsMap.frame1, texture1));
const texture2 = textureLoader.load('textures/mega.jpg', () => applyPhotoTexture(objectsMap.frame2, texture2));
const texture3 = textureLoader.load('textures/foto3.jpg', () => applyPhotoTexture(objectsMap.frame3, texture3));

function applyPhotoTexture(model, texture) {
  if (!model) return;   
  model.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.2
      });
    }
  });
}

// layout awal asset 3d
const assetFiles = [
  { key: 'wardrobe', path: 'assets/wardrobe.glb', pos: [2.5, 0, -3.3] }, 
  { key: 'bed', path: 'assets/bed.glb', pos: [-1.6, 0, -2.5] },          
  { key: 'lamp', path: 'assets/lamp.glb', pos: [-0.1, 0, -3.4] },        
  { key: 'window', path: 'assets/window.glb', pos: [-3.5, 2, 1.4] },     
  { key: 'desk', path: 'assets/desk.glb', pos: [-3.5, 0, 1.3] },         
  { key: 'frame1', path: 'assets/frame1.glb', pos: [-0.6, 2.5, -3.9] },  
  { key: 'frame2', path: 'assets/frame2.glb', pos: [-2.8, 2.5, -3.9] },  
  { key: 'frame3', path: 'assets/frame3.glb', pos: [-1.7, 2.5, -3.9] }   
];      

assetFiles.forEach(item => {
  loader.load(item.path, (gltf) => {
    const obj = gltf.scene;
    obj.position.set(...item.pos);
    obj.scale.set(1, 1, 1);
    obj.castShadow = true;
    obj.receiveShadow = true;
    
    if (item.key === 'frame1') applyPhotoTexture(obj, texture1);
    if (item.key === 'frame2') applyPhotoTexture(obj, texture2);
    if (item.key === 'frame3') applyPhotoTexture(obj, texture3);

    scene.add(obj);
    objectsMap[item.key] = obj;
    checkLoading();
  }, undefined, (error) => {
    console.warn(`Gagal memuat ${item.path}, menggunakan fallback box.`, error);
    const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const fallbackMesh = new THREE.Mesh(geo, mat);
    fallbackMesh.position.set(...item.pos);
    scene.add(fallbackMesh);
    objectsMap[item.key] = fallbackMesh;
    checkLoading();
  });
});

// --- UI INTERAKTIVITAS & KONTROL ---
// 1. Kamera Views
document.getElementById('btn-front').addEventListener('click', () => {
  camera.position.set(0, 2, 7);
  controls.target.set(0, 1, 0);
  controls.enabled = false;
});

document.getElementById('btn-top').addEventListener('click', () => {
  camera.position.set(0, 10, 0);
  controls.target.set(0, 0, 0);
  controls.enabled = false;
});

document.getElementById('btn-orbit').addEventListener('click', () => {
  camera.position.set(0, 5, 10);
  controls.target.set(0, 0, 0);
  controls.enabled = true;
});

// 2. Mode Siang / Malam
let isNight = false;
const btnMode = document.getElementById('btn-mode');
btnMode.addEventListener('click', () => {
  isNight = !isNight;
  if (isNight) {
    scene.background = new THREE.Color(0x0a1128);
    ambientLight.intensity = 0.3;
    dirLight.intensity = 0.5;
    btnMode.innerText = "Mode: Malam";
  } else {
    scene.background = new THREE.Color(0xbfe3ff);
    ambientLight.intensity = 3;
    dirLight.intensity = 2;
    btnMode.innerText = "Mode: Siang";
  }
});

// 3. Slider Intensitas & Warna Cahaya
const rangeIntensity = document.getElementById('range-intensity');
const valIntensity = document.getElementById('val-intensity');
rangeIntensity.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  dirLight.intensity = val;
  valIntensity.innerText = val.toFixed(1);
});

const selectColor = document.getElementById('select-color');
selectColor.addEventListener('change', (e) => {
  dirLight.color.set(e.target.value);
});

// 4. Transformasi Objek dengan Batasan Anti-Tembus Dinding & Lantai
const selectObject = document.getElementById('select-object');
const rangePosX = document.getElementById('range-posx');
const rangePosZ = document.getElementById('range-posz');
const rangeRotY = document.getElementById('range-roty');
const rangeScale = document.getElementById('range-scale');
const valPosX = document.getElementById('val-posx');
const valPosZ = document.getElementById('val-posz');
const valRotY = document.getElementById('val-roty');
const valScale = document.getElementById('val-scale');

// Fungsi untuk memperbarui posisi slider sesuai dengan objek yang sedang dipilih
function updateControlValues() {
  const activeObjKey = selectObject.value;
  const obj = objectsMap[activeObjKey];
  if (obj) {
    rangePosX.value = obj.position.x;
    valPosX.innerText = obj.position.x.toFixed(1);
    
    rangePosZ.value = obj.position.z;
    valPosZ.innerText = obj.position.z.toFixed(1);
    
    const rotDeg = THREE.MathUtils.radToDeg(obj.rotation.y) % 360;
    rangeRotY.value = rotDeg >= 0 ? rotDeg : rotDeg + 360;
    valRotY.innerText = Math.round(rangeRotY.value);

    rangeScale.value = obj.scale.x;
    valScale.innerText = obj.scale.x.toFixed(1);
  }
}

selectObject.addEventListener('change', updateControlValues);

// Fungsi pembatas agar objek tidak keluar dari batas ruangan (-3.5 s/d 3.5)
function clampPosition(val) {
  const limit = 3.5;
  return Math.max(-limit, Math.min(limit, val));
}

rangePosX.addEventListener('input', (e) => {
  const obj = objectsMap[selectObject.value];
  if (obj) {
    let newX = parseFloat(e.target.value);
    newX = clampPosition(newX);
    obj.position.x = newX;
    rangePosX.value = newX;
    valPosX.innerText = newX.toFixed(1);
  }
});

rangePosZ.addEventListener('input', (e) => {
  const obj = objectsMap[selectObject.value];
  if (obj) {
    let newZ = parseFloat(e.target.value);
    newZ = clampPosition(newZ);
    obj.position.z = newZ;
    rangePosZ.value = newZ;
    valPosZ.innerText = newZ.toFixed(1);
  }
});

rangeRotY.addEventListener('input', (e) => {
  const obj = objectsMap[selectObject.value];
  if (obj) {
    const deg = parseFloat(e.target.value);
    obj.rotation.y = THREE.MathUtils.degToRad(deg);
    valRotY.innerText = Math.round(deg);
  }
});

rangeScale.addEventListener('input', (e) => {
  const obj = objectsMap[selectObject.value];
  if (obj) {
    const scl = parseFloat(e.target.value);
    obj.scale.set(scl, scl, scl);
    valScale.innerText = scl.toFixed(1);
  }
});

// D. Dinding Samping Kanan
const rightWallGeo = new THREE.BoxGeometry(0.2, wallHeight, roomSize);
const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
rightWall.position.set(roomSize / 2, wallHeight / 2, 0);
rightWall.receiveShadow = true;
scene.add(rightWall);

// Window Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function checkLoading() {
  loadedCount++;
  if (loadedCount >= totalAssets) {
    loadingEl.style.opacity = '0';
    setTimeout(() => loadingEl.remove(), 500);
    updateControlValues(); // Sinkronkan slider setelah objek termuat
  }
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
