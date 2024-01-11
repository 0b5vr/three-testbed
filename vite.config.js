import { resolve } from 'path';
import { defineConfig } from 'vite';

console.log(resolve( __dirname, 'src/pages/index.html' ));

export default defineConfig( {
  root: resolve( __dirname, 'src/pages' ),
  base: './',
  build: {
    outDir: resolve( __dirname, 'dist' ),
    rollupOptions: {
      input: {
        main: resolve( __dirname, 'src/pages/index.html' ),
        bvh: resolve( __dirname, 'src/pages/bvh/index.html' ),
        cube: resolve( __dirname, 'src/pages/cube/index.html' ),
        fbx: resolve( __dirname, 'src/pages/fbx/index.html' ),
        fsq: resolve( __dirname, 'src/pages/fsq/index.html' ),
        gltf: resolve( __dirname, 'src/pages/gltf/index.html' ),
        vrm: resolve( __dirname, 'src/pages/vrm/index.html' ),
      },
    },
  },
  optimizeDeps: {
    exclude: [
      'three',
    ],
  },
} );
