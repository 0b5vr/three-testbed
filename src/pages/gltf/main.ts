import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRMUtils } from '@pixiv/three-vrm';
import avocadoGlb from '../../assets/Avocado.glb?url';
import GUI from 'lil-gui';
import { GLTFAnimationPointerExtension } from "@needle-tools/three-animation-pointer";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const { width, height } = canvas.getBoundingClientRect();

// -- gui ------------------------------------------------------------------------------------------
const gui = new GUI();

const guiParams = {
  animationIndex: -1,
};

const guiAnimationIndex = gui.add(guiParams, 'animationIndex', {
  '----': -1,
}).name('Animation');

// -- renderer -------------------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(width, height, false);
renderer.setPixelRatio(window.devicePixelRatio);

// -- camera ---------------------------------------------------------------------------------------
const camera = new THREE.PerspectiveCamera(45.0, width / height, 0.01, 100.0);
camera.position.set(0.0, 0.0, 0.5);

const controls = new OrbitControls(camera, canvas);

// -- scene ----------------------------------------------------------------------------------------
const scene = new THREE.Scene();

// -- light ----------------------------------------------------------------------------------------
const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.intensity = Math.PI;
directionalLight.position.set(3.0, 4.0, 5.0);
scene.add(directionalLight);

// -- gltf -----------------------------------------------------------------------------------------
const loader = new GLTFLoader();
loader.register((parser) => new GLTFAnimationPointerExtension(parser));

let currentGltfScene: THREE.Group | null = null;
let currentAnimationMixer: THREE.AnimationMixer | null = null;

async function loadGLTF(url: string) {
  if (currentGltfScene) {
    scene.remove(currentGltfScene);
    VRMUtils.deepDispose(currentGltfScene);
  }

  if (currentAnimationMixer) {
    currentAnimationMixer.stopAllAction();
    currentAnimationMixer = null;
  }

  const gltf = await loader.loadAsync(url);

  currentGltfScene = gltf.scene;
  scene.add(gltf.scene);

  currentAnimationMixer = new THREE.AnimationMixer(currentGltfScene);

  guiAnimationIndex
    .options({
      '----': -1,
      ...gltf.animations.reduce((obj, animation, index) => {
        obj[animation.name || `animation_${index}`] = index;
        return obj;
      }, {} as Record<string, number>),
    })
    .setValue(-1)
    .onChange((index: number) => {
      if (currentAnimationMixer == null) return;
      currentAnimationMixer.stopAllAction();

      if (index >= 0) {
        const animation = gltf.animations[index];
        const action = currentAnimationMixer.clipAction(animation);
        action.play();
      }
    });
}
loadGLTF(avocadoGlb);

// -- loop -----------------------------------------------------------------------------------------
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();

  controls.update();

  if (currentAnimationMixer) {
    currentAnimationMixer.update(delta);
  }

  renderer.render(scene, camera);
});

// -- resize handler -------------------------------------------------------------------------------
window.addEventListener('resize', () => {
  const { width, height } = canvas.getBoundingClientRect();
  renderer.setSize(width, height, false);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

// -- dnd handler ----------------------------------------------------------------------------------
window.addEventListener('dragover', (event) => {
  event.preventDefault();
});

window.addEventListener('drop', async (event) => {
  event.preventDefault();

  const file = event.dataTransfer?.files[0];

  if (file != null) {
    const url = URL.createObjectURL(file);
    await loadGLTF(url);
    URL.revokeObjectURL(url);
  }
});
