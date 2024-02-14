import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRMUtils } from '@pixiv/three-vrm';
import avocadoGlb from '../../assets/Avocado.glb?url';

const canvas = document.getElementById( 'canvas' ) as HTMLCanvasElement;
const { width, height } = canvas.getBoundingClientRect();

// -- renderer -------------------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer( { canvas } );
renderer.setSize( width, height, false );
renderer.setPixelRatio( window.devicePixelRatio );

// -- camera ---------------------------------------------------------------------------------------
const camera = new THREE.PerspectiveCamera( 45.0, width / height, 0.01, 100.0 );
camera.position.set( 0.0, 0.0, 0.5 );

const controls = new OrbitControls( camera, canvas );

// -- scene ----------------------------------------------------------------------------------------
const scene = new THREE.Scene();

// -- light ----------------------------------------------------------------------------------------
const directionalLight = new THREE.DirectionalLight( 0xffffff );
directionalLight.intensity = Math.PI;
directionalLight.position.set( 3.0, 4.0, 5.0 );
scene.add( directionalLight );

// -- gltf -----------------------------------------------------------------------------------------
const loader = new GLTFLoader();

let currentGltfScene: THREE.Group | null = null;

async function loadGLTF( url: string ) {
  if ( currentGltfScene ) {
    scene.remove( currentGltfScene );
    VRMUtils.deepDispose( currentGltfScene );
  }

  const gltf = await loader.loadAsync( url );

  currentGltfScene = gltf.scene;

  scene.add( gltf.scene );
}
loadGLTF( avocadoGlb );

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
    await loadGLTF( url );
    URL.revokeObjectURL( url );
  }
} );
