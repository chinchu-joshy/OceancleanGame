import "./style.css";
import * as THREE from "./modules/Three.module.js";

import { OrbitControls } from "./modules/OrbitControls.js";
import { Water } from "./modules/jsm/objects/Water.js";
import { Sky } from "./modules/jsm/objects/Sky.js";
import { GLTFLoader } from "./modules/jsm/objects/GLTFLoader";
("");
let camera, scene, renderer;
let controls, water, sun;
const loader = new GLTFLoader();
function random(min, max) {
  return Math.random() * (max - min) + min;
}
class Boat {
  constructor() {
    loader.load("./Model/boat/scene.gltf", (gltf) => {
      gltf.scene.position.set(5, 13, 50);
      gltf.scene.scale.set(3, 3, 3);
      gltf.scene.rotation.set(0, 1.5, 0);
      scene.add(gltf.scene);
      this.boatmodel = gltf.scene;
      this.speed = {
        velocity: 0,
        rotation: 0,
      };
      gltf.scene.attach(camera)
      camera.updateProjectionMatrix()
    });
  }
  stop() {
    this.speed.rotation = 0;
    this.speed.velocity = 0;
  }
  update() {
    if (this.boatmodel) {
      this.boatmodel.rotation.y += this.speed.rotation;
      this.boatmodel.translateX(this.speed.velocity);
      // camera.position.x += this.speed.velocity
    } else {
      console.log("errr");
    }
  }
}
const boat = new Boat();

class Trash {
  constructor(_scene) {
   
    _scene.scale.set(1.5, 1.5, 1.5);
    _scene.position.set(random(-1000, 1000), -0.7, random(-1000, 1000));
    scene.add(_scene);
    this.trashmodel = _scene;
  }
}
async function loadModel(url) {
  return new Promise((resolve, reject) => [
    loader.load(url, (gltf) => {
      resolve(gltf.scene);
    }),
  ]);
}
let trashModel = null;
async function createTrash() {
  if (!trashModel) {
    trashModel = await loadModel("./Model/garbage_bag/scene.gltf");
  }
  return new Trash(trashModel.clone());
}

let trashes = [];
const TRASH_COUNT = 1000;
class Thirdpersoncamera  {
 
  constructor(params){
   
  
  
    this.camera=params;
    this.currentPosition=new THREE.Vector3()
    this.currentLookAt=new THREE.Vector3()
   
  }
  CalculateIdealOffset(){
    
    const idealOffset=new THREE.Vector3(-15,20,-30)
   const value= boat.boatmodel?.position
  console.log(this.camera.target)
   
  //  if(value) idealOffset.applyQuaternion(boat.boatmodel?.rotation)
    this.camera.updateProjectionMatrix();
    if(value) idealOffset.add(boat.boatmodel?.position)
   
    // console.log(boat.boatmodel?.rotation)
    if(idealOffset)  return idealOffset;
   
  }
  CalculateIdealLookAt(){
    const idealLookAt=new THREE.Vector3(0,10,50)
    const value= boat.boatmodel?.position
    // if(value) idealLookAt.applyQuaternion(boat.boatmodel?.rotation)
    if(value) idealLookAt.add(boat.boatmodel?.position)
    return idealLookAt;
  }
  Update(){
   
const idealOffset=this.CalculateIdealOffset()
const idealLookAt=this.CalculateIdealLookAt();
this.currentPosition.copy(idealOffset)
this.currentLookAt.copy(idealLookAt)
// console.log(camera)
// this.camera.position.copy(this.currentPosition)
// this.camera.lookAt( this.currentLookAt)
  }
}
function test(){
  console.log(boat.boatmodel)
}

init();

const thirdpersoncamera=new Thirdpersoncamera(camera)
thirdpersoncamera.Update()

animate();



async function init() {
  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);

  //

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  camera.position.set(20, 30, 100);
  // const helper = new THREE.CameraHelper( camera );
  // scene.add( helper );
  
  //

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180,
  };
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);
    water.material.uniforms["sunDirection"].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;
  }

  updateSun();

  //

  //

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  // controls.minDistance = 40.0;
  // controls.maxDistance = 200.0;
  controls.update();
controls.enabled=false
  //

  // GUI

  const waterUniforms = water.material.uniforms;
  for (let i = 0; i < TRASH_COUNT; i++) {
    const trash = await createTrash();
    trashes.push(trash);
  }

  //
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("keydown", function (e) {
    if (e.key == "ArrowUp") {
      boat.speed.velocity = 0.5;
      
    }
    if (e.key == "ArrowDown") {
      boat.speed.velocity = -0.5;
    }
    if (e.key == "ArrowRight") {
      boat.speed.rotation = 0.1;
    }
    if (e.key == "ArrowLeft") {
      boat.speed.rotation = -0.1;
    }
  });
  window.addEventListener("keyup", function (e) {
    boat.stop();
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function isColliding(obj1, obj2) {
  return (
    Math.abs(obj1.position.x - obj2.position.x) < 15 &&
    Math.abs(obj1.position.z - obj2.position.z) < 15
  );
}
function checkCollisions() {
  if (boat.boatmodel) {
    trashes.forEach((trash) => {
      if (trash.trashmodel) {
        if (isColliding(boat.boatmodel, trash.trashmodel)) {
          scene.remove(trash.trashmodel);
        }
      }
    });
  }
}
function animate() {
  requestAnimationFrame(animate);
  render();
thirdpersoncamera.Update()
  boat.update();
 
  checkCollisions();
  // if (boat.boatmodel && trash.trashmodel) {
  //   if (isColliding(boat.boatmodel, trash.trashmodel)) {
  //     trash.trashmodel.position.y = -100;
  //   }
  // }
}

function render() {
  water.material.uniforms["time"].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}
