import { MathUtils } from 'three';

// 狭い足幅でも服が引き伸ばされないよう、脚まわりの骨の重みを整える。
// セラの裾と脚は重なるので、靴底からつながる脚の面をたどる。
// ブーツの広い履き口や脛の外側に残っていた腰の重みを、その脚へ戻す。
export function createGuildLegSkin(id) {
  let parts = [];
  return {
    bind(model) {
      for (const { mesh, source, geometry } of parts) {
        mesh.geometry = source; geometry.dispose();
      }
      parts = [];
      model?.traverse(mesh => {
        if (!mesh.isSkinnedMesh) return;
        const source = mesh.geometry, p = source.attributes.position;
        if (id === 'alto') {
          // 足幅を寄せても、ズボンの股の中央は腰に残す。左右の腿を交差させない。
          const geometry = source.clone(), joints = geometry.attributes.skinIndex, weights = geometry.attributes.skinWeight;
          const hips = mesh.skeleton.bones.findIndex(b => b.name === 'Hips');
          for (let i = 0; i < p.count; i++) {
            const pin = (1 - MathUtils.smoothstep(Math.abs(p.getX(i)), .012, .035))
              * MathUtils.smoothstep(p.getY(i), .20, .24) * (1 - MathUtils.smoothstep(p.getY(i), .30, .35));
            if (!pin) continue;
            const mixed = new Map(); let transferred = 0;
            for (let k = 0; k < 4; k++) {
              const bone = joints.getComponent(i, k), w = weights.getComponent(i, k);
              const take = /^(L|R)_Thigh$/.test(mesh.skeleton.bones[bone].name) ? w * pin : 0;
              transferred += take; mixed.set(bone, (mixed.get(bone) || 0) + w - take);
            }
            if (!transferred) continue;
            mixed.set(hips, (mixed.get(hips) || 0) + transferred);
            const top = [...mixed].sort((a, b) => b[1] - a[1]).slice(0, 4), sum = top.reduce((s, pair) => s + pair[1], 0);
            for (let k = 0; k < 4; k++) {
              joints.setComponent(i, k, top[k]?.[0] ?? 0); weights.setComponent(i, k, (top[k]?.[1] ?? 0) / sum);
            }
          }
          mesh.geometry = geometry; parts.push({ mesh, source, geometry });
          return;
        }
        const welded = new Map(), points = [], parent = [];
        for (let i = 0; i < p.count; i++) {
          const key = [p.getX(i), p.getY(i), p.getZ(i)].map(v => Math.round(v * 1e5)).join(',');
          if (!welded.has(key)) { welded.set(key, parent.length); parent.push(parent.length); }
          points.push(welded.get(key));
        }
        const find = i => {
          while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; }
          return i;
        };
        for (let i = 0; i < source.index.count; i += 3) {
          const face = [0, 1, 2].map(k => source.index.getX(i + k));
          if (face.some(v => p.getY(v) > .30)) continue;
          const roots = face.map(v => find(points[v]));
          parent[roots[1]] = parent[roots[2]] = roots[0];
        }
        const geometry = source.clone(), joints = geometry.attributes.skinIndex, weights = geometry.attributes.skinWeight;
        for (const [side, sign] of [['L', 1], ['R', -1]]) {
          const bones = ['Thigh', 'Calf', 'Foot'].map(name => mesh.skeleton.bones.findIndex(b => b.name === `${side}_${name}`));
          let seed = 0, distance = Infinity;
          for (let i = 0; i < p.count; i++) {
            const d = (p.getX(i) - sign * .09) ** 2 + (p.getY(i) - .04) ** 2 + (p.getZ(i) - .07) ** 2;
            if (d < distance) { distance = d; seed = i; }
          }
          const component = find(points[seed]);
          for (let i = 0; i < p.count; i++) {
            if (p.getY(i) >= .30 || find(points[i]) !== component) continue;
            const leg = bones.map(b => {
              let weight = 0;
              for (let k = 0; k < 4; k++) if (joints.getComponent(i, k) === b) weight += weights.getComponent(i, k);
              return weight;
            });
            const total = leg.reduce((a, b) => a + b, 0);
            if (!total) continue;
            const blend = 1 - MathUtils.smoothstep(p.getY(i), .18, .30), mixed = new Map();
            for (let k = 0; k < 4; k++) {
              const b = joints.getComponent(i, k);
              mixed.set(b, (mixed.get(b) || 0) + weights.getComponent(i, k) * (1 - blend));
            }
            bones.forEach((b, k) => mixed.set(b, (mixed.get(b) || 0) + leg[k] / total * blend));
            const top = [...mixed].sort((a, b) => b[1] - a[1]).slice(0, 4), sum = top.reduce((s, pair) => s + pair[1], 0);
            for (let k = 0; k < 4; k++) {
              joints.setComponent(i, k, top[k]?.[0] ?? 0);
              weights.setComponent(i, k, (top[k]?.[1] ?? 0) / sum);
            }
          }
        }
        mesh.geometry = geometry;
        parts.push({ mesh, source, geometry });
      });
    },
  };
}
