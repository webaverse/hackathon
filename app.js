import THREE from 'https://xrpackage.org/xrpackage/three.module.js';
import {XRPackageEngine, XRPackage} from 'https://xrpackage.org/xrpackage.js';
// import THREE from 'http://127.0.0.1:3000/xrpackage/three.module.js';
// import {XRPackageEngine, XRPackage} from 'http://127.0.0.1:3000/xrpackage.js';
import {GLTFLoader} from 'https://xrpackage.org/xrpackage/GLTFLoader.js';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();

const _findObject = (o, name) => {
  let result = null;
  o.traverse(o => {
    if (!result && o.name === name) {
      result = o;
    }
  });
  return result;
};

(async () => {
  Array.from(document.querySelectorAll('.icons')).forEach(iconsEl => {
    const iconsEls = Array.from(iconsEl.querySelectorAll('.icon'));
    iconsEls.forEach(iconEl => {
      iconEl.addEventListener('click', e => {
        iconsEls.forEach(iconEl => {
          iconEl.classList.remove('selected');
        });
        iconEl.classList.add('selected');
      });
    });
  });

  console.log('start engine 1');
  const pe = new XRPackageEngine({
    orbitControls: true,
  });
  console.log('start engine 1');
  document.body.appendChild(pe.domElement);
  pe.domElement.style.backgroundColor = '#111';
  
  pe.camera.position.set(0, 1, 1);
  pe.camera.updateMatrixWorld();
  pe.setCamera(pe.camera);

  pe.orbitControls.target.set(0, 1, 0);

  /* {
    const renderer = new THREE.WebGLRenderer({
      canvas: pe.domElement,
      context: pe.getContext('webgl'),
      // antialias: true,
      // alpha: true,
      // preserveDrawingBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false;
    renderer.sortObjects = false;
    renderer.physicallyCorrectLights = true;
    renderer.xr.enabled = true;
    renderer.xr.setSession(pe.getProxySession());

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 1);

    const {scene: logoMesh} = await new Promise((accept, reject) => {
      new GLTFLoader().load('assets/logo.glb', accept, xhr => {}, reject);
    });
    const wMesh = _findObject(logoMesh, 'Webaverse');
    wMesh.position.set(0, 3 + 1.5, -2);
    // wMesh.rotation.order = 'YXZ';
    wMesh.scale.multiplyScalar(1.5, 1.5, 1.5);
    wMesh.originalPosition = wMesh.position.clone();
    wMesh.originalQuaternion = wMesh.quaternion.clone();
    scene.add(wMesh);
    const webaverseMesh = _findObject(logoMesh, 'W');
    webaverseMesh.position
      .sub(new THREE.Box3().setFromObject(webaverseMesh).getCenter(new THREE.Vector3()))
      .add(new THREE.Vector3(0, 3, -2));
    // webaverseMesh.rotation.order = 'YXZ';
    webaverseMesh.originalPosition = webaverseMesh.position.clone();
    webaverseMesh.originalQuaternion = webaverseMesh.quaternion.clone();
    scene.add(webaverseMesh);

    function animate(timestamp, frame) {
      wMesh.position.copy(wMesh.originalPosition).add(new THREE.Vector3(0, Math.sin((Date.now() % 3000) / 3000 * Math.PI * 2) * 0.8, 0));
      wMesh.quaternion.copy(wMesh.originalQuaternion)
        .premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.sin((Date.now() % 1500) / 1500 * Math.PI * 2) * 0.15));
      webaverseMesh.position.copy(webaverseMesh.originalPosition).add(new THREE.Vector3(0, Math.sin((Date.now() % 3000) / 3000 * Math.PI * 2) * 0.5, 0));

      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);
  } */

  {
    console.log('load blob');
    const res = await fetch('./augs/blob/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }

  let currentSession = null;
  function onSessionStarted(session) {
    session.addEventListener('end', onSessionEnded);
    
    currentSession = session;

    pe.setSession(session);
  }
  function onSessionEnded() {
    currentSession.removeEventListener('end', onSessionEnded);

    currentSession = null;

    pe.setSession(null);
  }
  document.getElementById('enter-xr-button').addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentSession === null) {
      navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: [
          'local-floor',
          'bounded-floor',
        ],
      }).then(onSessionStarted);
    } else {
      currentSession.end();
    }
  });

})();