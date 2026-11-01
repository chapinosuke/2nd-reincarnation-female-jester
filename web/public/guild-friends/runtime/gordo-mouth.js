import { Float32BufferAttribute, MathUtils } from 'three';

// 開いた笑顔を残し、下唇・舌・あごひげをわずかに持ち上げる。
// モーフはスキニングより先に掛かるので、歩行や振り向きにもそのまま追従する。
export function createGordoMouthMotion() {
  let parts = [], time = 0;
  return {
    bind(model) {
      for (const { mesh, source, geometry, influences, dictionary } of parts) {
        mesh.geometry = source;
        mesh.morphTargetInfluences = influences; mesh.morphTargetDictionary = dictionary;
        geometry.dispose();
      }
      parts = []; time = 0;
      model?.traverse(mesh => {
        if (!mesh.isSkinnedMesh || mesh.geometry.morphAttributes.position?.length) return;
        const source = mesh.geometry, geometry = source.clone();
        const influences = mesh.morphTargetInfluences, dictionary = mesh.morphTargetDictionary;
        const p = source.attributes.position, n = source.attributes.normal;
        const positions = new Float32Array(p.count * 3), normals = new Float32Array(p.count * 3);
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
          const weight = (1 - MathUtils.smoothstep(Math.abs(x), .065, .12))
            * MathUtils.smoothstep(y, .555, .605) * (1 - MathUtils.smoothstep(y, .645, .665))
            * MathUtils.smoothstep(z, .07, .135);
          const angle = -MathUtils.degToRad(3) * weight, c = Math.cos(angle), s = Math.sin(angle);
          const dy = y - .665, dz = z - .08;
          positions[i * 3 + 1] = dy * (c - 1) - dz * s;
          positions[i * 3 + 2] = dy * s + dz * (c - 1);
          normals[i * 3 + 1] = n.getY(i) * (c - 1) - n.getZ(i) * s;
          normals[i * 3 + 2] = n.getY(i) * s + n.getZ(i) * (c - 1);
        }
        const target = new Float32BufferAttribute(positions, 3); target.name = 'GordoJaw';
        geometry.morphTargetsRelative = true;
        geometry.morphAttributes.position = [target];
        geometry.morphAttributes.normal = [new Float32BufferAttribute(normals, 3)];
        mesh.geometry = geometry; mesh.updateMorphTargets();
        parts.push({ mesh, source, geometry, influences, dictionary });
      });
    },
    update(dt) {
      time += dt;
      const pulse = (.5 - .5 * Math.cos(time * 1.45)) ** 2;
      const amount = pulse * (.8 + .2 * Math.sin(time * .37));
      for (const { mesh } of parts) mesh.morphTargetInfluences[0] = amount;
    },
  };
}
