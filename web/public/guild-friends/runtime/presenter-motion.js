import { groundWalkClip, approachWeight, measureStrideSpeed } from './walk-clip.js';

// りの・映画館・ジムの新しいモデル。移動距離に足の再生速度を合わせ、停止は待機へつなぐ。
export function createPresenterMotion(height) {
  let mixer, walk, idle, bow, stride = 0, weight = 0;
  return {
    prepareClips(clips) {
      return ['Walk', 'Idle', 'Bow'].map((name) => clips.find((c) => c.name === name))
        .filter(Boolean).map((c) => groundWalkClip(c, { pinHorizontal: false }).clip);
    },
    attach(model, extra) {
      if (!model || !extra?.mixer) {
        mixer = walk = idle = bow = null;
        stride = weight = 0;
        return;
      }
      weight = 0;
      mixer = extra.mixer;
      [walk, idle, bow] = extra.actions;
      if (walk) {
        walk.play().setEffectiveWeight(0);
        stride = measureStrideSpeed(model, mixer, walk) * height / 0.98;
      }
      idle?.play().setEffectiveWeight(1);
      if (bow) {
        bow.play().setEffectiveWeight(0);
        bow.paused = true;
        bow.time = bow.getClip().duration * 0.4;
      }
    },
    update(dt, speed, bowAmount = 0) {
      if (!mixer) return;
      weight = approachWeight(weight, speed > 0 ? 1 : 0, dt, 0.22);
      walk?.setEffectiveWeight(weight);
      // 止まる瞬間も足を下ろせるよう、フェード中だけ歩行を進める。
      walk?.setEffectiveTimeScale(weight > 0 ? (speed || 0.35) / (stride || 0.5) : 0);
      const b = bow ? Math.max(0, Math.min(1, bowAmount)) * (1 - weight) : 0;
      idle?.setEffectiveWeight(1 - weight - b);
      bow?.setEffectiveWeight(b);
      mixer.update(dt);
    },
  };
}
