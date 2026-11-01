import { createPresenterMotion } from './presenter-motion.js';
import { createGordoMouthMotion } from './gordo-mouth.js';
import { createGuildLegSkin } from './guild-leg-skin.js';

// 元モデルの開いた立ち幅をミア・アルト・セラで少し狭める(背丈0.98のモデル座標)。
// 膝や足首の回転は保ち、左右の脚を付け根から寄せる。
const LEG_INSET = { mia: .018, alto: .012, sera: .036 };

export function createGuildMotion(id, height) {
  const motion = createPresenterMotion(height);
  const mouth = id === 'gordo' ? createGordoMouthMotion() : null;
  const legs = id === 'sera' || id === 'alto' ? createGuildLegSkin(id) : null;
  return {
    ...motion,
    attach(model, extra) {
      mouth?.bind(model);
      legs?.bind(model);
      motion.attach(model, extra);
    },
    update(dt, speed, bowAmount = 0) {
      motion.update(dt, speed, bowAmount);
      mouth?.update(dt);
    },
    prepareClips(clips) {
      // 共通処理が複製したクリップだけを変更し、読込キャッシュは触らない。
      const prepared = motion.prepareClips(clips);
      const inset = LEG_INSET[id] ?? 0;
      if (inset) for (const clip of prepared) {
        for (const track of clip.tracks) {
          const side = /^(L|R)_Thigh\.position$/.exec(track.name)?.[1];
          if (!side) continue;
          for (let i = 0; i < track.values.length; i += 3) {
            track.values[i] += side === 'L' ? -inset : inset;
          }
        }
      }
      // 待機にも同じ補正を掛け、発進・停止時に脚が横へ開かないようにする。
      return prepared;
    },
  };
}
