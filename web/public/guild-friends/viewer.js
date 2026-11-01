import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { characters, loadCharacter } from './runtime/character.js';

const query = new URLSearchParams(location.search);
const embed = query.get('embed') === '1';
document.documentElement.classList.toggle('embed', embed);
const mobile = query.get('quality') === 'mobile' || (query.get('quality') !== 'standard' && matchMedia('(pointer: coarse)').matches);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.querySelector('#view'), stage = document.querySelector('.stage');
const status = document.querySelector('#status');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); }
catch (error) { status.textContent = '3Dを表示できませんでした。別のブラウザでお試しください。'; throw error; }
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
renderer.toneMapping = THREE.NeutralToneMapping; // サイト用：ACES より色が薄まりにくい
renderer.toneMappingExposure = 1;
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, 1, .02, 50);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .09;
controls.enablePan = false; controls.minDistance = .8; controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI * .82;
// scroll=1：ページの途中に置くとき用。ホイールと縦スワイプはページのスクロールに回し、横ドラッグで回す
if (query.get('scroll') === '1') { controls.enableZoom = false; canvas.style.touchAction = 'pan-y'; }
scene.add(new THREE.HemisphereLight(0xf2e7e4, 0x555d7a, 1));
for (const [color, intensity, x, y, z] of [[0xfff4e8, 1.5, 2.5, 3, -3], [0xc3cfff, .65, -3, 2, -1], [0xf0c7b4, 1, 1, 2.5, 3]]) {
  const light = new THREE.DirectionalLight(color, intensity); light.position.set(x, y, z); scene.add(light);
}
let entries = [], selection = 'all', generation = 0, walking = query.get('motion') === 'walk', ready = false;
let visible = true, lastT = null;
const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; lastT = null; }); observer.observe(canvas);
function frame() {
  const all = selection === 'all', width = all ? 5.8 : 1.7;
  const span = all ? 2.15 : 1.95;
  const distance = Math.max(span, width / camera.aspect) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  controls.maxDistance = Math.max(15, distance * 2);
  controls.target.set(0, .82, 0);
  camera.position.set(0, .82 + distance * .035, -distance); controls.update();
}
function resize() {
  const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); frame();
}
new ResizeObserver(resize).observe(stage);
async function select(id) {
  const token = ++generation;
  selection = id === 'all' || characters.some(c => c.id === id) ? id : 'mia';
  ready = false; status.hidden = false; status.textContent = 'なかまたちを呼んでいます…';
  for (const entry of entries) entry.dispose(); entries = [];
  document.querySelectorAll('[data-character]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.character === selection)));
  const specs = selection === 'all' ? characters : characters.filter(c => c.id === selection);
  document.querySelector('#names').replaceChildren(...specs.map(spec => { const tag = document.createElement('span'); tag.textContent = spec.name; return tag; }));
  frame();
  const results = await Promise.allSettled(specs.map(spec => loadCharacter(spec.id, { mobile })));
  const loaded = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  if (token !== generation) { loaded.forEach(entry => entry.dispose()); return; }
  if (results.some(r => r.status === 'rejected')) {
    loaded.forEach(entry => entry.dispose());
    status.textContent = '読み込めませんでした。ページを開き直してください。';
    console.error(results.filter(r => r.status === 'rejected').map(r => String(r.reason)));
    return;
  }
  entries = loaded;
  entries.forEach((entry, index) => { entry.root.position.x = entries.length === 1 ? 0 : (1.5 - index) * 1.4; scene.add(entry.root); });
  await renderer.compileAsync(scene, camera);
  if (token !== generation) return;
  renderer.render(scene, camera);
  ready = true; status.hidden = true;
}
function setMotion(value) {
  walking = !!value;
  document.querySelector('#motion').setAttribute('aria-pressed', String(walking));
  document.querySelector('#motion').textContent = walking ? 'のんびりする' : '歩いてみる';
}
document.querySelectorAll('[data-character]').forEach(button => button.addEventListener('click', () => select(button.dataset.character)));
document.querySelector('#reset').addEventListener('click', frame);
document.querySelector('#motion').addEventListener('click', () => setMotion(!walking));
setMotion(walking); resize();
select(query.get('character') || 'all');
renderer.setAnimationLoop(now => {
  if (document.hidden || !visible) { lastT = null; return; }
  const dt = lastT == null ? 0 : Math.min(.05, (now - lastT) / 1000); lastT = now;
  if (!reduced) entries.forEach(entry => entry.update(dt, walking));
  controls.update(); renderer.render(scene, camera);
});
// ローカル確認用。サイトへ埋め込む場合は HTML の iframe だけで使える。
window.guildPreview = { get ready() { return ready; }, get entries() { return entries; }, scene, camera, renderer, select, setMotion };
