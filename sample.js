import "./style.css";
import * as THREE from "./modules/Three.module.js";

import { OrbitControls } from "./modules/OrbitControls.js";
import { Water } from "./modules/jsm/objects/Water.js";
import { Sky } from "./modules/jsm/objects/Sky.js";
import { GLTFLoader } from "./modules/jsm/objects/GLTFLoader";
    // global variables
    var renderer;
    var scene;
    var camera;

    var control;

    function init() {

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();

        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        // position and point the camera to the center of the scene
        camera.position.x = 15;
        camera.position.y = 6;
        camera.position.z = 15;
        camera.lookAt(scene.position);

        // create a render, sets the background color and the size
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000, 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true;


        var spotLight = new THREE.SpotLight();
        spotLight.position.set(0, 80, 30);
        spotLight.castShadow = true;
        scene.add(spotLight);

        // add the output of the renderer to the html element
        document.body.appendChild(renderer.domElement);


        addFloor();
        addBouncingSphere();
        addCube();

        // call the render function
        render();
    }

    function addBouncingSphere() {
        var sphereGeometry = new THREE.SphereGeometry(1.5, 20, 20);
        var matProps = {

            specular: '#a9fcff',
            color: '#00abb1',
            emissive: '#006063',
            shininess: 10
        }

        var sphereMaterial = new THREE.MeshPhongMaterial(matProps);
        var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.castShadow = true;
        sphereMesh.position.y = 0.75 * Math.PI / 2;
        sphereMesh.name = 'sphere';
        scene.add(sphereMesh);
    }

    function addFloor() {
        var floorGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
        var floorMaterial = new THREE.MeshPhongMaterial();
        floorMaterial.map = THREE.ImageUtils.loadTexture("../assets/textures/floor_2-1024x1024.png");

        floorMaterial.map.wrapS = floorMaterial.map.wrapT = THREE.RepeatWrapping;
        floorMaterial.map.repeat.set(8, 8);
        var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
        floorMesh.receiveShadow = true;
        floorMesh.rotation.x = -0.5 * Math.PI;
        scene.add(floorMesh);
    }

    function addCube() {
        var cubeGeometry = new THREE.BoxGeometry(2.5, 4.5, 20);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
        var cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.castShadow = true;
        cubeMesh.receiveShadow = true;
        cubeMesh.position.z = -5;
        scene.add(cubeMesh);
    }

    var step = 0;
    function render() {
        var sphere = scene.getObjectByName('sphere');
        renderer.render(scene, camera);

        camera.lookAt(sphere.position);
        step += 0.02;
        sphere.position.x = 0 + ( 10 * (Math.cos(step)));
        sphere.position.y = 0.75 * Math.PI / 2 + ( 6 * Math.abs(Math.sin(step)));
        requestAnimationFrame(render);
    }
    init()

   