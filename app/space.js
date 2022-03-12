const canvas = document.getElementById("final-frontier");
const c = canvas.getContext("2d");

let w, h, notNow;
let universe = celestialBodies(10000);

setCanvasExtents();
requestAnimationFrame(letThereBeLight);
window.onresize = setCanvasExtents;

function letThereBeLight(time) {
  notNow = time;
  requestAnimationFrame(pulse);
}

function pulse(time) {
  const elapsed = time - notNow;
  notNow = time;

  hyperjump(elapsed);
  clear();

  const cx = w / 2;
  const cy = h / 2;

  universe.forEach((star) => {
    const x = cx + star.x / (star.z * 0.001);
    const y = cy + star.y / (star.z * 0.001);
    const offScreen = x < 0 || x >= w || y < 0 || y >= h;

    if (offScreen) return;

    const distance = star.z / 1000.0;
    const z = 1 - distance * distance;

    createStar(x, y, z);
  });

  requestAnimationFrame(pulse);
}

function celestialBodies(count) {
  const { random } = Math;
  const { clientWidth, clientHeight } = document.body;
  return [...Array(count)].map(() => ({
    x: random() * clientWidth - clientWidth / 2,
    y: random() * clientHeight - clientHeight / 2,
    z: random() * 1000,
  }));
}

function setCanvasExtents() {
  const { clientWidth, clientHeight } = document.body;
  w = clientWidth;
  h = clientHeight;
  canvas.width = clientWidth;
  canvas.height = clientHeight;
}

function clear() {
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
}

function createStar(x, y, z, px = 4) {
  const intensity = 0.6;
  const alpha = z * intensity;
  const size = px * z;
  c.fillStyle = `rgba(255,255,255,${alpha})`;
  c.fillRect(x, y, size, size);
}

function hyperjump(epoc) {
  const warpspeed = 0.03;
  const velocity = epoc * warpspeed;

  // update the star position on z axis
  universe.forEach((s) => {
    s.z -= velocity;
    s.z += s.z <= 1 ? 1000 : 0;
  });
}
