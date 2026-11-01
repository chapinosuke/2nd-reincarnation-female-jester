import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createGuildMotion } from './guild-motion.js';

export const characters = [
  { id: 'mia', name: 'ミア', height: 1.58, speed: .38 },
  { id: 'alto', name: 'アルト', height: 1.58, speed: .40 },
  { id: 'gordo', name: 'ゴルド', height: 1.54, speed: .30 },
  { id: 'sera', name: 'セラ', height: 1.58, speed: .34 },
];

// 独立したサイト用。GLB と補正は確認済みのゲーム用をそのまま使用する。
export async function loadCharacter(id, { mobile = false } = {}) {
  const spec = characters.find(c => c.id === id);
  if (!spec) throw new Error(`Unknown character: ${id}`);
  const url = new URL(`../models/${mobile ? 'mobile' : 'standard'}/${id}.glb`, import.meta.url);
  const pack = await new GLTFLoader().loadAsync(url.href);
  const model = pack.scene, root = new THREE.Group(), orient = new THREE.Group();
  const materials = new Set(), textures = new Set(), geometries = new Set();
  model.traverse(mesh => {
    if (!mesh.isMesh) return;
    geometries.add(mesh.geometry);
    const convert = src => {
      materials.add(src);
      for (const value of Object.values(src)) if (value?.isTexture) textures.add(value);
      if (!src.isMeshStandardMaterial) return src;
      const options = {
        map: src.map, vertexColors: src.vertexColors, normalMap: src.normalMap,
        aoMap: src.aoMap, color: 0xffffff, metalness: 0, roughness: .62,
        transparent: src.transparent, opacity: src.opacity, side: src.side,
        emissiveMap: src.map, emissive: 0xffffff, emissiveIntensity: .45,
      };
      const material = mobile ? new THREE.MeshStandardMaterial(options)
        : new THREE.MeshPhysicalMaterial({ ...options, sheen: .28, sheenColor: 0xe8c4b0,
          sheenRoughness: .62, clearcoat: .05, clearcoatRoughness: .55 });
      // セラは頭が空洞で、前髪の分け目の付け根の針穴ほどのすき間から帽子の内側や背景が白く見える。
      // 裏面も描き、裏面は影色で塗る（裏面はすき間からしか見えないので外側の見た目は変わらない）
      const shadeInside = id === 'sera';
      if (shadeInside) material.side = THREE.DoubleSide;
      if (material.vertexColors || shadeInside) {
        material.onBeforeCompile = shader => {
          if (material.vertexColors) shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>',
            '#include <emissivemap_fragment>\n#if defined(USE_COLOR) || defined(USE_COLOR_ALPHA)\n totalEmissiveRadiance *= vColor.rgb;\n#endif');
          if (shadeInside) shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>',
            '#include <dithering_fragment>\n if (!gl_FrontFacing) gl_FragColor = vec4(0.08, 0.15, 0.36, gl_FragColor.a);');
        };
        material.customProgramCacheKey = () => `chibi${material.vertexColors ? '-vertex-emission' : ''}${shadeInside ? '-shade-inside' : ''}`;
      }
      materials.add(material);
      return material;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(convert) : convert(mesh.material);
    mesh.castShadow = mesh.receiveShadow = false;
  });
  root.name = id;
  orient.rotation.y = Math.PI;
  orient.scale.setScalar(spec.height / .98);
  orient.add(model); root.add(orient);
  const motion = createGuildMotion(id, spec.height), mixer = new THREE.AnimationMixer(model);
  const actions = motion.prepareClips(pack.animations).map(clip => mixer.clipAction(clip));
  motion.attach(model, { mixer, actions });
  motion.update({ mia: .4, alto: 1.1, gordo: 2.2, sera: 3.1 }[id], 0);
  let disposed = false;
  return {
    ...spec, root, model,
    update(dt, walking = false) {
      if (!disposed) motion.update(Math.min(.05, Math.max(0, dt)), walking ? spec.speed : 0);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      motion.attach(null);
      mixer.stopAllAction(); mixer.uncacheRoot(model);
      root.removeFromParent();
      model.traverse(o => o.skeleton?.dispose());
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      const images = new Set();
      for (const texture of textures) { images.add(texture.image); texture.dispose(); }
      for (const img of images) img?.close?.();
    },
  };
}
