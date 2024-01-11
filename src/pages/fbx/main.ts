import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import capoeiraFbx from '../../assets/Capoeira.fbx?url';
import { VRMUtils } from '@pixiv/three-vrm';

const canvas = document.getElementById( 'canvas' ) as HTMLCanvasElement;
const { width, height } = canvas.getBoundingClientRect();

// -- renderer -------------------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer( { canvas } );
renderer.setSize( width, height, false );
renderer.setPixelRatio( window.devicePixelRatio );

// -- camera ---------------------------------------------------------------------------------------
const camera = new THREE.PerspectiveCamera( 45.0, width / height, 0.01, 100.0 );
camera.position.set( 0.0, 1.0, 5.0 );

const controls = new OrbitControls( camera, canvas );
controls.target.set( 0.0, 1.0, 0.0 );

// -- scene ----------------------------------------------------------------------------------------
const scene = new THREE.Scene();

// -- light ----------------------------------------------------------------------------------------
const directionalLight = new THREE.DirectionalLight( 0xffffff );
directionalLight.intensity = Math.PI;
directionalLight.position.set( 3.0, 4.0, 5.0 );
scene.add( directionalLight );

// -- fbx ------------------------------------------------------------------------------------------
const loader = new FBXLoader();
let currentFbx: THREE.Group | null = null;
let currentMixer: THREE.AnimationMixer | null = null;

async function loadFBX( url: string ) {
  if ( currentFbx ) {
    currentMixer?.stopAllAction();
    scene.remove( currentFbx );
    VRMUtils.deepDispose( currentFbx );
  }

  currentFbx = await loader.loadAsync( url );
  currentFbx.scale.setScalar( 0.01 );

  const clip = currentFbx.animations[ 0 ];
  currentMixer = new THREE.AnimationMixer( currentFbx );
  const action = currentMixer.clipAction( clip );

  action.play();

  scene.add( currentFbx );
}
loadFBX( capoeiraFbx );

// -- loop -----------------------------------------------------------------------------------------
const clock = new THREE.Clock();
clock.start();

renderer.setAnimationLoop( () => {
  const delta = clock.getDelta();

  controls.update();
  currentMixer?.update( delta );
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
    await loadFBX( url );
    URL.revokeObjectURL( url );
  }
} );
