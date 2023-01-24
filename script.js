/*--------------------
Setup
--------------------*/
console.clear();
const canvas = document.querySelector('#bubble');
let width = canvas.offsetWidth,
height = canvas.offsetHeight;
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true });

const scene = new THREE.Scene();

const setup = () => {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.setClearColor(0xebebeb, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;

  scene.fog = new THREE.Fog(0x000000, 10, 1000);

  const aspectRatio = width / height;
  const fieldOfView = 80;
  const nearPlane = 0.1;
  const farPlane = 2000;
    
  camera = new THREE.PerspectiveCamera(
  fieldOfView,
  aspectRatio,
  nearPlane,
  farPlane);

  camera.position.x = 0;
  camera.position.y = -25;
  camera.position.z = 300;
};
setup();


/*--------------------
Lights
--------------------*/
let hemispshereLight, light2;
const createLights = () => {
  hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, .5);
  light2 = new THREE.DirectionalLight(0xffffff, .1);
  light2.position.set(-600, 350, 350);
  scene.add(hemisphereLight);
  scene.add(light2);
};
createLights();


/*--------------------
Bubble1
--------------------*/
const vertex = width > 575 ? 80 : 40;
const bubbleGeometry = new THREE.SphereGeometry(150, vertex, vertex);
let bubble;
const createBubble = () => {
  for (let i = 0; i < bubbleGeometry.vertices.length; i++) {
    let vector = bubbleGeometry.vertices[i];
    vector.original = vector.clone();
  }
  const bubbleMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xffffff,
    emissiveIntensity: 0.38,
    roughness: 0.65,
    metalness: 0.1,
    side: THREE.FrontSide
    //wireframe: true
  });
  bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
  bubble.castShadow = false; //shadow
  bubble.receiveShadow = false;
  scene.add(bubble);
};
createBubble();


/*--------------------
Bubble2
--------------------*/
const vertex2 = width > 575 ? 80 : 40;
const bubbleGeometry2 = new THREE.SphereGeometry(130, vertex2, vertex2);
let bubble2;
const createBubble2 = () => {
  for (let i = 0; i < bubbleGeometry2.vertices.length; i++) {
    let vector = bubbleGeometry2.vertices[i];
    vector.original = vector.clone();
  }
  const bubbleMaterial2 = new THREE.MeshStandardMaterial({
    emissive: 0xffffff,
    emissiveIntensity: 0.40,
    roughness: 0.7,
    metalness: 0.1,
    side: THREE.FrontSide,  
    wireframe: true,
  });
  bubble2 = new THREE.Mesh(bubbleGeometry2, bubbleMaterial2);
  bubble2.castShadow = false; //shadow
  bubble2.receiveShadow = false;
  scene.add(bubble2);
};
createBubble2();


/*--------------------
Plane
--------------------*/
const createPlane = () => {
  const planeGeometry = new THREE.PlaneBufferGeometry(2000, 2000);
  const planeMaterial = new THREE.ShadowMaterial({
    opacity: 0.016 });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.y = -200;
  plane.position.x = 0;
  plane.position.z = 0;
  plane.rotation.x = Math.PI / 180 * -90;
  plane.receiveShadow = true;
  scene.add(plane);
};
createPlane();


/*--------------------
Map
--------------------*/
const map = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};


/*--------------------
Distance
--------------------*/
const distance = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  return d;
};


/*--------------------
Mouse
--------------------*/
let mouse = new THREE.Vector2(0, 0);
const onMouseMove = e => {
  TweenMax.to(mouse, 0.8, {
    x: e.clientX || e.pageX || e.touches[0].pageX || 0,
    y: e.clientY || e.pageY || e.touches[0].pageY || 0,
    ease: Power3.easeOut });

};
['mousemove', 'touchmove'].forEach(event => {
  window.addEventListener(event, onMouseMove);
});


/*--------------------
Spring
--------------------*/
let spring = {
  scale: 1 };

const clicking = {
  down: () => {
    TweenMax.to(spring, .7, {
      scale: .8,
      ease: Power3.easeOut });

  },
  up: () => {
    TweenMax.to(spring, .9, {
      scale: 1,
      ease: Power3.easeOut });

  } };

['mousedown', 'touchstart'].forEach(event => {
  window.addEventListener(event, clicking.down);
});
['mouseup', 'touchend'].forEach(event => {
  window.addEventListener(event, clicking.up);
});


/*--------------------
Resize
--------------------*/
const onResize = () => {
  canvas.style.width = '';
  canvas.style.height = '';
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  maxDist = distance(mouse, { x: width / 2, y: height / 2 });
  renderer.setSize(width, height);
};
let resizeTm;
window.addEventListener('resize', function () {
  resizeTm = clearTimeout(resizeTm);
  resizeTm = setTimeout(onResize, 200);
});


/*--------------------
Noise for bubble
--------------------*/
let dist = new THREE.Vector2(0, 0);
let maxDist = distance(mouse, { x: width / 2, y: height / 2 });
const updateVertices = time => {
  dist = distance(mouse, { x: width / 4, y: height / 4 });
  dist /= maxDist;
  dist = map(dist, 1, 0, 0, 1);
  for (let i = 0; i < bubbleGeometry.vertices.length; i++) {
    let vector = bubbleGeometry.vertices[i];
    vector.copy(vector.original);
    let perlin = noise.simplex3(
    vector.x * 0.006 + time * 0.0006,
    vector.y * 0.006 + time * 0.0006,
    vector.z * 0.006);

    let ratio = perlin * 0.3 * (dist + 0.1) + 0.8;
    vector.multiplyScalar(ratio);
  }
  bubbleGeometry.verticesNeedUpdate = true;
};



/*--------------------
Noise for bubble2
--------------------*/
let dist2 = new THREE.Vector2(0, 0);
let maxDist2 = distance(mouse, { x: width / 2, y: height / 2 });
const updateVertices2 = time => {
  dist2 = distance(mouse, { x: width / 4, y: height / 4 });
  dist2 /= maxDist2;
  dist2 = map(dist2, 1, 0, 0, 1);
  for (let i = 0; i < bubbleGeometry2.vertices.length; i++) {
    let vector = bubbleGeometry2.vertices[i];
    vector.copy(vector.original);
    let perlin = noise.simplex3(
    vector.x * 0.006 + time * 0.0006,
    vector.y * 0.006 + time * 0.0006,
    vector.z * 0.006);

    let ratio = perlin * 0.3 * (dist2 + 0.1) + 0.8;
    vector.multiplyScalar(ratio);
  }
    
  bubbleGeometry2.verticesNeedUpdate = true;
};




/*--------------------
Animate
--------------------*/
const render = a => {
  requestAnimationFrame(render);
  bubble.rotation.y = -4 + map(mouse.x, 0, width, 0, 4);
  bubble.rotation.z = 4 + map(mouse.y, 0, height, 0, -4);
  bubble.scale.set(spring.scale, spring.scale, spring.scale);
  updateVertices(a);
  updateVertices2(a);
  renderer.clear();
  renderer.render(scene, camera);
};
requestAnimationFrame(render);
renderer.render(scene, camera);
