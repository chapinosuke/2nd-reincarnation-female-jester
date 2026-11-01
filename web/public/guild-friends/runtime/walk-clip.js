import { Vector3 } from 'three';

// 骨付き歩行キャラ(Tripo のリグ)のクリップに共通する下ごしらえ。
// キャラ固有の補正(首の除外・関節の起こし方など)はここに入れず、各キャラの *-motion.js が持つ。
//
// 4体(ぐろちゃん・バニー・親分・子分)のリグは親 Root が X=-90° で、
// **Hip のローカル XY が地面、Z が高さ**。Y だけを消す一般的な変換は使わない。
// 歩きクリップには移動そのものが焼き込まれているので、Hip の水平成分だけを最初のキーに
// 固定し、上下動(Z)は接地のために残す。移動は経路側が持つ。
// 固定する前に、1周期の水平移動距離 / 経過時間から元データの前進速度を測って返す。
// 経路速度 / (前進速度 × モデル倍率) が再生倍率になる(各キャラで求め、tempo を二重に掛けない)。
//
// クリップはローダーのキャッシュで共有されるので、必ず複製してから触る。

/**
 * @param source   共有クリップ(変更しない)
 * @param pinHorizontal  Hip の水平移動を固定するか(待機クリップの重心移動を残すときは false)
 * @returns { clip, authoredSpeed, travel, duration }  authoredSpeed はモデル単位/秒
 */
export function groundWalkClip(source, { pinHorizontal = true } = {}) {
  const clip = source.clone();
  const start = Math.min(...clip.tracks.map((tr) => tr.times[0]));
  const end = Math.max(...clip.tracks.map((tr) => tr.times[tr.times.length - 1]));
  let authoredSpeed = 0;
  let travel = 0;
  const hip = clip.tracks.find((tr) => /(^|\.)Hip\.position$/.test(tr.name));
  if (hip) {
    const v = hip.values;
    const last = v.length - 3;
    travel = Math.hypot(v[last] - v[0], v[last + 1] - v[1]);
    if (end > start) authoredSpeed = travel / (end - start);
    if (pinHorizontal) {
      for (let i = 3; i < v.length; i += 3) { v[i] = v[0]; v[i + 1] = v[1]; }
    }
  }
  // 最初のキーまでの空白(1フレーム分)を除き、ループの継ぎ目で一瞬止まらないようにする。
  for (const tr of clip.tracks) for (let i = 0; i < tr.times.length; i++) tr.times[i] -= start;
  clip.resetDuration();
  return { clip, authoredSpeed, travel, duration: clip.duration };
}

/** 歩行アクションのウェイトを時間でつなぐ(開始・停止で片足立ちからレストへ瞬間移動させない)。 */
export function approachWeight(current, target, dt, seconds) {
  const change = seconds > 0 ? dt / seconds : 1;
  return current + Math.max(-change, Math.min(change, target - current));
}

/**
 * 歩きクリップを実際のリグで1周期再生し、**接地中の足骨が後ろへ動く速さ**(モデル単位/秒)を測る。
 * Tripo のクリップは腰の前進量と足の後退量が合っていないことがある(親分は腰 0.77 に対して足 0.56m/s)。
 * 腰の前進量でテンポを合わせると、その差がそのまま足滑りになる。移動は経路側が持つので、
 * 足が地面を蹴る速さに経路速度を合わせる方が滑らない。足の高さが低い25%の区間の中央値を返す。
 * 呼ぶのは読み込み直後の1回(1周期 121 サンプル)。終わると action の時刻・ウェイトを元へ戻す。
 * @param root   骨を含む Object3D(loadChibi の model)
 * @param mixer  その AnimationMixer
 * @param action 歩きの AnimationAction(その場歩きに変換済み)
 * @returns 足の後退速度(モデル単位/秒)。足骨が無ければ 0
 */
export function measureStrideSpeed(root, mixer, action, { foot = /^(L|R)_Foot$/, samples = 120 } = {}) {
  const feet = [];
  root.traverse((o) => { if (o.isBone && foot.test(o.name)) feet.push(o); });
  const duration = action?.getClip().duration;
  if (!feet.length || !(duration > 0)) return 0;
  const prevTime = action.time;
  const prevWeight = action.getEffectiveWeight();
  const prevScale = action.getEffectiveTimeScale();
  action.setEffectiveWeight(1);
  action.setEffectiveTimeScale(1);
  const dt = duration / samples;
  const rows = feet.map(() => []);
  const v = new Vector3();
  for (let i = 0; i <= samples; i++) {
    action.time = (i * dt) % duration;
    mixer.update(0);
    root.updateMatrixWorld(true);
    feet.forEach((bone, k) => {
      bone.getWorldPosition(v);
      root.worldToLocal(v); // モデル空間(+Y 上、+Z 正面。倍率も外れる)
      rows[k].push([v.y, v.z]);
    });
  }
  const speeds = [];
  for (const r of rows) {
    const ys = r.map((p) => p[0]).sort((a, b) => a - b);
    const threshold = ys[Math.floor(ys.length * 0.25)];
    for (let i = 1; i < r.length; i++) {
      if (r[i][0] < threshold && r[i - 1][0] < threshold) speeds.push(Math.abs(r[i][1] - r[i - 1][1]) / dt);
    }
  }
  speeds.sort((a, b) => a - b);
  action.time = prevTime;
  action.setEffectiveWeight(prevWeight);
  action.setEffectiveTimeScale(prevScale);
  mixer.update(0);
  root.updateMatrixWorld(true);
  return speeds.length ? speeds[Math.floor(speeds.length / 2)] : 0;
}
