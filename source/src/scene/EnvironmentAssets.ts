import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { asset } from "../asset";

/** Authored in Blender's XY/Z-up coordinates; glTF converts to Y-up on export. */
export async function loadEnvironment() {
  // Fetch independent resources together, rather than three network waterfalls.
  const loader = new THREE.TextureLoader();
  const [gltf, wood, pottery, grain] = await Promise.all([
    new GLTFLoader().loadAsync(asset('models/portfolio-environment.glb')),
    loader.loadAsync(asset('images/optimized/walnut.webp')),
    loader.loadAsync(asset('images/optimized/ceramic.webp')),
    loader.loadAsync(asset('images/optimized/paper.webp')),
  ]);
  const root = gltf.scene;
  root.name = 'Environment';
  root.rotation.x = Math.PI / 2;
  wood.colorSpace = THREE.SRGBColorSpace;
  wood.anisotropy = 4;
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(1.6, 1.6); wood.offset.set(-.3,-.3);
  pottery.colorSpace = THREE.SRGBColorSpace; pottery.flipY = false;
  pottery.wrapS = THREE.RepeatWrapping; pottery.anisotropy = 4;
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(3, 3);

  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = !object.name.startsWith('Desk');
    object.receiveShadow = true;
    const material = object.material as THREE.MeshStandardMaterial;
    if (object.name === 'CoffeeCup' || object.name === 'PencilCup') {
      object.material = material.clone();
      const ceramic = object.material as THREE.MeshStandardMaterial;
      ceramic.map = pottery; ceramic.bumpMap = pottery; ceramic.bumpScale = .028;
      ceramic.color.set(0xffffff); ceramic.roughness = .7;
    } else if (/Plant|LampBase|ClipDish/.test(object.name)) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(m => { m.bumpMap = grain; m.bumpScale = .024; m.roughness = .87; });
    }

    if (object.name === 'Desk') {
      const material = object.material as THREE.MeshStandardMaterial;
      material.map = wood;
      material.color.set(0xd8c4b0);
      material.roughness = .88;
      material.bumpMap = wood;
      material.bumpScale = .035;
      material.needsUpdate = true;
    }
  });
  if (!root.getObjectByName('Desk') || !root.getObjectByName('CoffeeCup')) {
    throw new Error('Required authored environment nodes are missing');
  }
  return {root, textures: [wood, pottery, grain]};
}
