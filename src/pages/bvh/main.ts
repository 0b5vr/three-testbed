import * as THREE from 'three';
import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import pirouetteBvh from '../../assets/pirouette.bvh?url';

const _v3A = new THREE.Vector3();

const canvas = document.getElementById( 'canvas' ) as HTMLCanvasElement;
const { width, height } = canvas.getBoundingClientRect();

// -- renderer -----------------------------------------------------------------------------------
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

// -- helpers --------------------------------------------------------------------------------------
const gridHelper = new THREE.GridHelper( 20 );
scene.add( gridHelper );

const axesHelper = new THREE.AxesHelper( 10 );
scene.add( axesHelper );

// -- bvh ------------------------------------------------------------------------------------------
let currentBoneGroup: THREE.Group | null = null;
let currentSkeletonHelper: THREE.SkeletonHelper | null = null;
let currentMixer: THREE.AnimationMixer | null = null;

const loader = new BVHLoader();

async function loadBVH( url: string ) {
  if ( currentSkeletonHelper != null ) {
    scene.remove( currentSkeletonHelper );
    currentSkeletonHelper.dispose();
  }

  if ( currentMixer != null ) {
    currentMixer.stopAllAction();
  }

  if ( currentSkeletonHelper != null ) {
    scene.remove( currentSkeletonHelper );
  }

  const bvh = await loader.loadAsync( url );
  console.log( bvh );

  const boundingBox = new THREE.Box3();
  for ( const bone of bvh.skeleton.bones ) {
    boundingBox.expandByPoint( bone.getWorldPosition( _v3A ) );
  }
  console.log( boundingBox );

  currentSkeletonHelper = new THREE.SkeletonHelper( bvh.skeleton.bones[ 0 ] );
  ( currentSkeletonHelper as any ).skeleton = bvh.skeleton;

  scene.add( currentSkeletonHelper );

  const scale = 1.6 / boundingBox.getSize( _v3A ).y;
  currentBoneGroup = new THREE.Group();
  currentBoneGroup.scale.set( scale, scale, scale );
  scene.add( currentBoneGroup );
  currentBoneGroup.add( bvh.skeleton.bones[ 0 ] );

  currentMixer = new THREE.AnimationMixer( currentSkeletonHelper );
  const action = currentMixer.clipAction( bvh.clip );
  action.setEffectiveWeight( 1.0 ).play();
}

loadBVH( pirouetteBvh );

// -- loop -----------------------------------------------------------------------------------------
const clock = new THREE.Clock();
clock.start();

renderer.setAnimationLoop( () => {
  const delta = clock.getDelta();

  controls.update();
  currentMixer?.update( delta );
  // currentSkeletonHelper?.update();
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
    await loadBVH( url );
    URL.revokeObjectURL( url );
  }
} );
