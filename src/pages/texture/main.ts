import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import uvGridPng from '../../assets/uv-grid.png?url';

const canvas = document.getElementById( 'canvas' ) as HTMLCanvasElement;
const { width, height } = canvas.getBoundingClientRect();

// -- renderer -------------------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer( { canvas } );
renderer.setSize( width, height, false );
renderer.setPixelRatio( window.devicePixelRatio );

// -- camera ---------------------------------------------------------------------------------------
const camera = new THREE.PerspectiveCamera( 45.0, width / height, 0.01, 100.0 );
camera.position.set( 0.0, 0.0, 2.0 );

const controls = new OrbitControls( camera, canvas );

// -- scene ----------------------------------------------------------------------------------------
const scene = new THREE.Scene();

// -- texture --------------------------------------------------------------------------------------
const map = new THREE.TextureLoader().load( uvGridPng );
map.colorSpace = THREE.SRGBColorSpace;

const geometry = new THREE.PlaneGeometry();
const material = new THREE.MeshBasicMaterial( { map } );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

// -- loop -----------------------------------------------------------------------------------------
renderer.setAnimationLoop( () => {
  controls.update();
  renderer.render( scene, camera );
} );

// -- resize handler -------------------------------------------------------------------------------
window.addEventListener( 'resize', () => {
  const { width, height } = canvas.getBoundingClientRect();
  renderer.setSize( width, height, false );

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
} );

// -- dnd handler ----------------------------------------------------------------------------------
window.addEventListener( 'dragover', ( event ) => {
  event.preventDefault();
} );

window.addEventListener( 'drop', async ( event ) => {
  event.preventDefault();

  const file = event.dataTransfer?.files[ 0 ];

  if ( file != null ) {
    const url = URL.createObjectURL( file );
    const map = new THREE.TextureLoader().load( url, () => URL.revokeObjectURL( url ) );
    material.map = map;
    map.colorSpace = THREE.SRGBColorSpace;
  }
} );
