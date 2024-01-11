import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import sampleVrm from '../../assets/VRM1_Constraint_Twist_Sample.vrm?url';

const canvas = document.getElementById( 'canvas' ) as HTMLCanvasElement;
const { width, height } = canvas.getBoundingClientRect();

// -- renderer -------------------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer( { canvas } );
renderer.setSize( width, height, false );
renderer.setPixelRatio( window.devicePixelRatio );

// -- camera ---------------------------------------------------------------------------------------
const camera = new THREE.PerspectiveCamera( 45.0, width / height, 0.01, 100.0 );
camera.position.set( 0.0, 1.0, 2.0 );

const controls = new OrbitControls( camera, canvas );
controls.target.set( 0.0, 1.0, 0.0 );

// -- scene ----------------------------------------------------------------------------------------
const scene = new THREE.Scene();

// -- light ----------------------------------------------------------------------------------------
const directionalLight = new THREE.DirectionalLight( 0xffffff );
directionalLight.intensity = Math.PI;
directionalLight.position.set( 3.0, 4.0, 5.0 );
scene.add( directionalLight );

// -- vrm ------------------------------------------------------------------------------------------
const loader = new GLTFLoader();
loader.register( ( parser ) => {
  return new VRMLoaderPlugin( parser );
} );

let currentVrm: VRM | null = null;

async function loadVRM( url: string ) {
  if ( currentVrm ) {
    scene.remove( currentVrm.scene );
    VRMUtils.deepDispose( currentVrm.scene );
  }

  const gltf = await loader.loadAsync( url );

  const vrm: VRM = currentVrm = gltf.userData.vrm;

  VRMUtils.removeUnnecessaryVertices( vrm.scene );
  VRMUtils.removeUnnecessaryJoints( vrm.scene );

  vrm.scene.traverse( ( obj ) => {
    obj.frustumCulled = false;
  } );

  VRMUtils.rotateVRM0( vrm );

  scene.add( vrm.scene );
}
loadVRM( sampleVrm );

// -- loop -----------------------------------------------------------------------------------------
const clock = new THREE.Clock();
clock.start();

renderer.setAnimationLoop( () => {
  const delta = clock.getDelta();

  controls.update();
  currentVrm?.update( delta );
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
    await loadVRM( url );
    URL.revokeObjectURL( url );
  }
} );
