import THREE from 'https://xrpackage.org/xrpackage/three.module.js';
import {XRPackageEngine, XRPackage} from 'https://xrpackage.org/xrpackage.js';
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
  // engine
  const pe = new XRPackageEngine({
    orbitControls: true,
  });
  document.body.appendChild(pe.domElement);
  pe.domElement.style.backgroundColor = '#111';
  
  pe.camera.position.set(0, 1, 1);
  pe.camera.updateMatrixWorld();
  pe.setCamera(pe.camera);

  pe.orbitControls.target.set(0, 1, 0);

  // ui
  const wbnUrls = [
    './augs/blob/a.wbn',
    './augs/lightsaber/a.wbn',
    './augs/sprite/a.wbn',
    './augs/tree/a.wbn',
  ];

  let p = null;
  let loadingPackage = false;
  Array.from(document.querySelectorAll('.icons')).forEach((iconsEl, index) => {
    const iconsEls = Array.from(iconsEl.querySelectorAll('.icon'));
    iconsEls.forEach((iconEl, index2) => {
      iconEl.addEventListener('click', async e => {
        console.log('click', index, loadingPackage);
        iconsEls.forEach(iconEl => {
          iconEl.classList.remove('selected');
        });
        iconEl.classList.add('selected');

        if (index === 0 && !loadingPackage) {
          loadingPackage = true;

          if (p) {
            await pe.remove(p);
            p = null;
          }

          const res = await fetch(wbnUrls[index2]);
          const ab = await res.arrayBuffer();
          const uint8Array = new Uint8Array(ab);
          p = new XRPackage(uint8Array);
          p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
          await pe.add(p);

          loadingPackage = false;
        }
      });
    });
    if (index === 0) {
      iconsEls[0].click();
    }
  });

  // xr

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