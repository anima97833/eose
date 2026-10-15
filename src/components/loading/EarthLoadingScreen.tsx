import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface EarthLoadingScreenProps {
  onFinished: () => void;
  /** 是否强制以演示模式运行（不记录已播放标记） */
  isDemo?: boolean;
}

// 5 大物种主题配色
// 5 大地球 Online 物种服务器配置
const STAGE_THEMES = [
  { id: 0, name: '狗狗服',   subtitle: '犬科伴侣物种 · 晨光绿野区', sky: 0x90E0EF, ground: 0x7CB518, dirt: 0x5C8001, light: 0xFFF9E6, poof: 0xFFEA00 },
  { id: 1, name: '猫猫服',   subtitle: '猫科自由物种 · 午夜暗月区', sky: 0x2B2D42, ground: 0x8D99AE, dirt: 0x4A4E69, light: 0xE8EAF6, poof: 0x00F0FF },
  { id: 2, name: '无机物服', subtitle: '硅基地质原石 · 永恒静止区', sky: 0xFFB703, ground: 0xFB8500, dirt: 0x9C6644, light: 0xFFE8D6, poof: 0xFF5722 },
  { id: 3, name: '昆虫服',   subtitle: '鳞翅目节肢物种 · 花蜜庭院区', sky: 0xFFC8DD, ground: 0xFFAFCC, dirt: 0xB5838D, light: 0xFFFFFF, poof: 0xFF006E },
  { id: 4, name: '人类服',   subtitle: '碳基灵长直立人 · 文明探索区', sky: 0x48CAE4, ground: 0xADE8F4, dirt: 0x0077B6, light: 0xCAF0F8, poof: 0xFFFFFF },
];

const SPLASH_PLAYED_KEY = 'cloudfly_3d_splash_played_v1';

export const EarthLoadingScreen: React.FC<EarthLoadingScreenProps> = ({ onFinished, isDemo }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ dispose: () => void } | null>(null);

  const [currentStage, setCurrentStage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentStageRef = useRef(0);
  const isTransitioningRef = useRef(false);

  const handleEnter = useCallback(() => {
    if (!isDemo) {
      try {
        sessionStorage.setItem(SPLASH_PLAYED_KEY, '1');
      } catch {}
    }
    onFinished();
  }, [isDemo, onFinished]);

  // 触发生命流转 / 切换至下一个服务器（人类服之后再点击直接进入桌面）
  const handleTransform = useCallback(() => {
    if (isTransitioningRef.current) return;
    const current = currentStageRef.current;
    if (current >= STAGE_THEMES.length - 1) {
      // 已经是人类服，再点击就是进入桌面
      handleEnter();
      return;
    }
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    const next = current + 1;
    currentStageRef.current = next;
    setCurrentStage(next);
    (window as any).__splashTransition?.(current, next);
  }, [handleEnter]);

  const handleTransformRef = useRef(handleTransform);
  useEffect(() => {
    handleTransformRef.current = handleTransform;
  }, [handleTransform]);

  // 检查是否在当前会话中已经跳过
  useEffect(() => {
    // 清除曾经永久锁死 localStorage 的旧键，释放开屏动画
    try {
      localStorage.removeItem(SPLASH_PLAYED_KEY);
    } catch {}

    if (!isDemo) {
      const played = sessionStorage.getItem(SPLASH_PLAYED_KEY);
      if (played === '1') {
        onFinished();
        return;
      }
    }
  }, [isDemo, onFinished]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── 场景 & 相机 ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(STAGE_THEMES[0].sky);
    scene.fog = new THREE.FogExp2(STAGE_THEMES[0].sky, 0.02);

    const width = container.clientWidth || 390;
    const height = container.clientHeight || 700;
    const aspect = width / height;
    const viewSize = 7.5;
    const camera = new THREE.OrthographicCamera(
      -viewSize * aspect, viewSize * aspect,
      viewSize, -viewSize, 0.1, 100
    );
    camera.position.set(12, 10, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 内联简易轨道控制器（拖拽旋转 + 滚轮缩放 + 点击屏幕切服）
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let dragDist = 0;
    let pointerDownTime = 0;
    let spherical = { theta: Math.PI / 4, phi: Math.PI / 3.5, radius: Math.sqrt(12 * 12 + 10 * 10 + 12 * 12) };
    const target = new THREE.Vector3(0, 0, 0);
    let autoRotate = true;

    function updateCamera() {
      camera.position.set(
        target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta),
        target.y + spherical.radius * Math.cos(spherical.phi),
        target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
      );
      camera.lookAt(target);
    }
    updateCamera();

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      autoRotate = false;
      dragDist = 0;
      pointerDownTime = Date.now();
      prevMouse = { x: e.clientX, y: e.clientY };
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      dragDist += Math.abs(dx) + Math.abs(dy);
      prevMouse = { x: e.clientX, y: e.clientY };
      spherical.theta -= dx * 0.008;
      spherical.phi = Math.max(0.15, Math.min(Math.PI / 2.1, spherical.phi + dy * 0.008));
      updateCamera();
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {}

      // 用户点击屏幕（位移小于 8px 且非长按拖拽），立即切换到下一个服务器！
      const duration = Date.now() - pointerDownTime;
      if (dragDist < 8 && duration < 450) {
        handleTransformRef.current();
      }
    };
    const onWheel = (e: WheelEvent) => {
      spherical.radius = Math.max(8, Math.min(28, spherical.radius + e.deltaY * 0.02));
      updateCamera();
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

    const controls = {
      update: () => {
        if (autoRotate) {
          spherical.theta += 0.003;
          updateCamera();
        }
      },
      dispose: () => {
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('wheel', onWheel);
      },
    };

    // ── 光照 ─────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(STAGE_THEMES[0].light, 0.85);
    dirLight.position.set(-10, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    const d = 8;
    dirLight.shadow.camera.left = -d; dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d; dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Toon 渐变纹理
    const cvs = document.createElement('canvas'); cvs.width = 4; cvs.height = 1;
    const ctx2d = cvs.getContext('2d')!;
    ['#444','#888','#ccc','#fff'].forEach((c, i) => { ctx2d.fillStyle = c; ctx2d.fillRect(i, 0, 1, 1); });
    const toonGradient = new THREE.CanvasTexture(cvs);
    toonGradient.magFilter = THREE.NearestFilter;
    toonGradient.minFilter = THREE.NearestFilter;

    const getMat = (hex: number) => new THREE.MeshToonMaterial({ color: hex, gradientMap: toonGradient });
    const matGround = getMat(STAGE_THEMES[0].ground);
    const matDirt   = getMat(STAGE_THEMES[0].dirt);

    function createBone(geo: THREE.BufferGeometry, mat: THREE.Material, pivotY: number) {
      geo.translate(0, pivotY, 0);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true; mesh.receiveShadow = true;
      return mesh;
    }

    // ── 生物模型 ──────────────────────────────────────────────────
    const creatures = new THREE.Group(); scene.add(creatures);

    // 【1. 柴犬】
    const dog = new THREE.Group();
    const dBodyMat = getMat(0xE07A5F), dBellyMat = getMat(0xF4F1DE), dDarkMat = getMat(0x3D405B), dRedMat = getMat(0xE63946);
    const dogBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.6), dBodyMat);
    dogBody.position.y = 1.2; dogBody.castShadow = true; dog.add(dogBody);
    const dogBelly = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.2, 1.4), dBellyMat);
    dogBelly.position.set(0, -0.36, 0.1); dogBody.add(dogBelly);
    const dogNeck = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 0.5), dBellyMat);
    dogNeck.position.set(0, 0.2, 0.8); dogBody.add(dogNeck);
    const collar = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.15, 0.55), dRedMat);
    collar.position.set(0, 0.3, 0.78); dogBody.add(collar);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), getMat(0xF2CC8F));
    bell.position.set(0, -0.1, 0.3); collar.add(bell);
    const dogHeadGroup = new THREE.Group(); dogHeadGroup.position.set(0, 0.7, 0.9); dogBody.add(dogHeadGroup);
    const dogHead = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 1.1), dBodyMat); dogHead.castShadow = true; dogHeadGroup.add(dogHead);
    const dogSnout = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.5), dBellyMat); dogSnout.position.set(0, -0.2, 0.8); dogHeadGroup.add(dogSnout);
    const dogNose = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.1), dDarkMat); dogNose.position.set(0, 0.2, 0.25); dogSnout.add(dogNose);
    for (const i of [-1, 1] as const) {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.1), dDarkMat);
      eye.position.set(i * 0.3, 0.15, 0.56); dogHeadGroup.add(eye);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.1), dBellyMat);
      brow.position.set(i * 0.3, 0.4, 0.56); dogHeadGroup.add(brow);
      const earGeo = new THREE.BoxGeometry(0.3, 0.4, 0.2); earGeo.translate(0, 0.2, 0);
      const ear = new THREE.Mesh(earGeo, dBodyMat);
      const earInner = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 0.1), getMat(0xF4A261));
      earInner.position.set(0, 0.2, 0.06); ear.add(earInner);
      ear.position.set(i * 0.4, 0.5, -0.2); ear.rotation.z = i * -0.2; ear.rotation.x = 0.1;
      dogHeadGroup.add(ear);
    }
    const dogLegs: THREE.Object3D[] = [];
    for (let i = 0; i < 4; i++) {
      const leg = createBone(new THREE.BoxGeometry(0.3, 0.8, 0.3), dBodyMat, -0.4);
      leg.position.set(i % 2 === 0 ? 0.45 : -0.45, 0.8, i < 2 ? 0.5 : -0.5);
      const paw = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.35), dBellyMat);
      paw.position.set(0, -0.7, 0.05); leg.add(paw);
      dog.add(leg); dogLegs.push(leg);
    }
    const dogTail = createBone(new THREE.BoxGeometry(0.3, 0.6, 0.3), dBodyMat, 0.3);
    dogTail.position.set(0, 1.5, -0.7); dogTail.rotation.x = 0.5;
    const tailTip = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.32), dBellyMat);
    tailTip.position.set(0, 0.6, 0); dogTail.add(tailTip);
    dogBody.add(dogTail);
    creatures.add(dog);

    // 【2. 燕尾服猫】
    const cat = new THREE.Group();
    const cBlack = getMat(0x1D1E20), cWhite = getMat(0xFFFFFF), cEye = getMat(0xE9C46A);
    const catBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 1.8), cBlack);
    catBody.position.y = 1.1; catBody.castShadow = true; cat.add(catBody);
    const catChest = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.6, 0.6), cWhite);
    catChest.position.set(0, -0.05, 0.65); catBody.add(catChest);
    const catHeadGroup = new THREE.Group(); catHeadGroup.position.set(0, 0.5, 1.0); catBody.add(catHeadGroup);
    const catHead = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.9), cBlack); catHead.castShadow = true; catHeadGroup.add(catHead);
    const catSnout = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), cWhite); catSnout.position.set(0, -0.2, 0.46); catHeadGroup.add(catSnout);
    const catNose = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.1), getMat(0xFFB4A2)); catNose.position.set(0, 0.15, 0.15); catSnout.add(catNose);
    for (const i of [-1, 1] as const) {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), cEye);
      eye.position.set(i * 0.25, 0.1, 0.46);
      const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.11), cBlack); eye.add(pupil); catHeadGroup.add(eye);
      const ear = createBone(new THREE.ConeGeometry(0.2, 0.4, 4), cBlack, 0.2);
      ear.position.set(i * 0.35, 0.4, -0.1); ear.rotation.y = Math.PI / 4; catHeadGroup.add(ear);
      for (let j = 0; j < 2; j++) {
        const whisker = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.02), cWhite);
        whisker.position.set(i * 0.4, -0.2 + j * 0.1, 0.5); whisker.rotation.z = i * (0.1 - j * 0.2); catHeadGroup.add(whisker);
      }
    }
    const catLegs: THREE.Object3D[] = [];
    for (let i = 0; i < 4; i++) {
      const leg = createBone(new THREE.BoxGeometry(0.2, 0.8, 0.2), cBlack, -0.4);
      leg.position.set(i % 2 === 0 ? 0.35 : -0.35, 0.8, i < 2 ? 0.6 : -0.6);
      const paw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.25), cWhite); paw.position.set(0, -0.75, 0.05); leg.add(paw);
      cat.add(leg); catLegs.push(leg);
    }
    const catTailGroup = new THREE.Group(); catTailGroup.position.set(0, 0.3, -0.9); catBody.add(catTailGroup);
    const t1 = createBone(new THREE.BoxGeometry(0.15, 0.5, 0.15), cBlack, 0.25); t1.rotation.x = 1.0; catTailGroup.add(t1);
    const t2 = createBone(new THREE.BoxGeometry(0.15, 0.5, 0.15), cBlack, 0.25); t2.position.set(0, 0.5, 0); t1.add(t2);
    const t3 = createBone(new THREE.BoxGeometry(0.15, 0.5, 0.15), cWhite, 0.25); t3.position.set(0, 0.5, 0); t2.add(t3);
    creatures.add(cat); cat.scale.setScalar(0); cat.visible = false;

    // 【3. 原石】
    const rock = new THREE.Group();
    const rMat = getMat(0x6C7A89), rMossMat = getMat(0x7CB342), rCrystalMat = getMat(0x4DD0E1);
    const mainRock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), rMat);
    mainRock.position.y = 1.0; mainRock.castShadow = true; rock.add(mainRock);
    const moss1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 0.8), rMossMat); moss1.position.set(0.5, 0.8, 0); moss1.rotation.z = -0.4; mainRock.add(moss1);
    const moss2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 1.0), rMossMat); moss2.position.set(-0.6, 0.2, 0.6); moss2.rotation.x = 0.5; mainRock.add(moss2);
    for (let i = 0; i < 3; i++) {
      const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 6), rCrystalMat);
      crystal.position.set(Math.random() - 0.5, Math.random() + 0.5, Math.random() - 0.5);
      crystal.lookAt(0, 0, 0); crystal.rotateX(Math.PI / 2); mainRock.add(crystal);
    }
    creatures.add(rock); rock.scale.setScalar(0); rock.visible = false;

    // 【4. 彩蝶】
    const butterfly = new THREE.Group();
    const bBodyMat = getMat(0x2B2D42), bWingTopMat = getMat(0xFF006E), bWingBotMat = getMat(0xFFBE0B);
    const thorax = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.5, 4, 8), bBodyMat);
    thorax.position.y = 2.5; thorax.rotation.x = Math.PI / 2; thorax.castShadow = true; butterfly.add(thorax);
    const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), bBodyMat); bHead.position.set(0, 0, 0.4); thorax.add(bHead);
    for (const i of [-1, 1] as const) {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4), bBodyMat);
      ant.position.set(i * 0.1, 0.2, 0.1); ant.rotation.z = i * -0.3; ant.rotation.x = 0.5; bHead.add(ant);
    }
    const wingGroupL = new THREE.Group(); wingGroupL.position.set(0.1, 0.1, 0); thorax.add(wingGroupL);
    const wingGroupR = new THREE.Group(); wingGroupR.position.set(-0.1, 0.1, 0); thorax.add(wingGroupR);
    function makeWing(w: number, h: number, mat: THREE.Material, px: number, pz: number, ry: number) {
      const geo = new THREE.BoxGeometry(w, 0.02, h); geo.translate(px, 0, pz);
      const mesh = new THREE.Mesh(geo, mat); mesh.rotation.y = ry; mesh.castShadow = true; return mesh;
    }
    wingGroupL.add(makeWing(1.2, 0.8, bWingTopMat, 0.6, 0.2, 0.2));
    wingGroupL.add(makeWing(0.8, 1.0, bWingBotMat, 0.4, -0.4, -0.2));
    wingGroupR.add(makeWing(1.2, 0.8, bWingTopMat, -0.6, 0.2, -0.2));
    wingGroupR.add(makeWing(0.8, 1.0, bWingBotMat, -0.4, -0.4, 0.2));
    creatures.add(butterfly); butterfly.scale.setScalar(0); butterfly.visible = false;

    // 【5. 旅人】
    const human = new THREE.Group();
    const hSkin = getMat(0xFFC8A2), hHair = getMat(0x3E2723), hJacket = getMat(0x2A9D8F), hPants = getMat(0x264653), hShoe = getMat(0xE76F51);
    const hTorso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.5), hJacket);
    hTorso.position.y = 1.6; hTorso.castShadow = true; human.add(hTorso);
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.4), getMat(0xE9C46A));
    backpack.position.set(0, 0, -0.45); hTorso.add(backpack);
    const hHeadGroup = new THREE.Group(); hHeadGroup.position.set(0, 0.7, 0); hTorso.add(hHeadGroup);
    const hHead = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), hSkin); hHead.castShadow = true; hHeadGroup.add(hHead);
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.7), hHair); hair.position.set(0, 0.35, -0.05); hHeadGroup.add(hair);
    const hairBang = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.2), hHair); hairBang.position.set(0, 0.2, 0.3); hHeadGroup.add(hairBang);
    const hArms: THREE.Object3D[] = [], hLegs: THREE.Object3D[] = [];
    for (const i of [-1, 1] as const) {
      const arm = createBone(new THREE.BoxGeometry(0.25, 0.5, 0.25), hJacket, -0.25);
      arm.position.set(i * 0.55, 0.4, 0); hTorso.add(arm); hArms.push(arm);
      const lowerArm = createBone(new THREE.BoxGeometry(0.22, 0.4, 0.22), hSkin, -0.2);
      lowerArm.position.set(0, -0.5, 0); arm.add(lowerArm);
      const leg = createBone(new THREE.BoxGeometry(0.35, 0.6, 0.35), hPants, -0.3);
      leg.position.set(i * 0.22, -0.5, 0); hTorso.add(leg); hLegs.push(leg);
      const lowerLeg = createBone(new THREE.BoxGeometry(0.32, 0.5, 0.32), hSkin, -0.25);
      lowerLeg.position.set(0, -0.6, 0); leg.add(lowerLeg);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.2, 0.45), hShoe);
      shoe.position.set(0, -0.6, 0.05); lowerLeg.add(shoe);
    }
    creatures.add(human); human.scale.setScalar(0); human.visible = false;

    const forms = [dog, cat, rock, butterfly, human];

    // ── 环境底座 ──────────────────────────────────────────────────
    const environment = new THREE.Group(); scene.add(environment);
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 1, 48), matGround);
    ground.position.y = -0.5; ground.receiveShadow = true; environment.add(ground);
    const dirtRing = new THREE.Mesh(new THREE.CylinderGeometry(7.8, 7.5, 1.5, 48), matDirt);
    dirtRing.position.y = -1.5; environment.add(dirtRing);

    const propsContainer = new THREE.Group(); environment.add(propsContainer);
    const propsGroups: THREE.Group[] = Array.from({ length: 5 }, () => {
      const g = new THREE.Group(); propsContainer.add(g); return g;
    });
    propsGroups.forEach((g, i) => { if (i !== 0) g.scale.setScalar(0); });

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const r = 4.5 + Math.random() * 2.5;
      const x = r * Math.cos(angle), z = r * Math.sin(angle);

      if (i % 2 === 0) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5), getMat(0x795548)); trunk.position.y = 0.75; tree.add(trunk);
        const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2), getMat(0x43A047)); leaves.position.y = 1.8; tree.add(leaves);
        tree.position.set(x, 0, z); propsGroups[0].add(tree);
      } else {
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6, 6), getMat(0x81C784));
        bush.position.set(x, 0.2, z); propsGroups[0].add(bush);
      }
      if (i % 3 === 0) {
        const yarn = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), getMat(0xFF5252));
        yarn.position.set(x, 0.4, z); propsGroups[1].add(yarn);
      } else {
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), getMat(0xD7CCC8));
        box.position.set(x, 0.4, z); box.rotation.y = Math.random(); propsGroups[1].add(box);
      }
      if (i % 2 === 0) {
        const bamboo = new THREE.Group();
        for (let j = 0; j < 4; j++) {
          const sec = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6), getMat(0x8BC34A));
          sec.position.y = j * 0.62 + 0.3; bamboo.add(sec);
        }
        bamboo.position.set(x, 0, z); propsGroups[2].add(bamboo);
      } else {
        const fr = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.2, 6), getMat(0x546E7A));
        fr.position.set(x, 0.1, z); propsGroups[2].add(fr);
      }
      const flower = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0), getMat(0x4CAF50)); stem.position.y = 1.0; flower.add(stem);
      const petals = new THREE.Mesh(new THREE.TorusKnotGeometry(0.4, 0.15, 64, 8), getMat(0xFF9800)); petals.position.y = 2.0; petals.rotation.x = 0.5; flower.add(petals);
      flower.position.set(x, 0, z); propsGroups[3].add(flower);
      if (i === 0 || i === 8) {
        const sign = new THREE.Group();
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2), getMat(0x555555)); post.position.y = 1; sign.add(post);
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.1), getMat(0xFFCC00)); board.position.set(0.2, 1.6, 0); sign.add(board);
        sign.position.set(x, 0, z); propsGroups[4].add(sign);
      } else {
        const ro = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4), getMat(0x90A4AE));
        ro.position.set(x, 0.2, z); propsGroups[4].add(ro);
      }
    }

    // ── 粒子特效 ──────────────────────────────────────────────────
    const pGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const particles: { mesh: THREE.Mesh; vel: THREE.Vector3 }[] = [];
    const particleGroup = new THREE.Group(); scene.add(particleGroup);
    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      mesh.visible = false; particleGroup.add(mesh); particles.push({ mesh, vel: new THREE.Vector3() });
    }
    function triggerBurst(hexColor: number) {
      particles.forEach(p => {
        p.mesh.visible = true;
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(hexColor);
        p.mesh.position.set((Math.random() - 0.5) * 2, 1.5 + (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
        p.mesh.scale.setScalar(Math.random() * 1.5 + 0.5);
        p.vel.set((Math.random() - 0.5) * 6, Math.random() * 5, (Math.random() - 0.5) * 6);
      });
    }

    // ── 形变切换（暴露给 React UI 层） ───────────────────────────
    const triggerTransition = (prevIdx: number, nextIdx: number) => {
      const prevModel = forms[prevIdx];
      const nextModel = forms[nextIdx];
      const nextTheme = STAGE_THEMES[nextIdx];

      gsap.to(prevModel.scale, {
        x: 0.001, y: 0.001, z: 0.001, duration: 0.3, ease: 'back.in(1.5)',
        onComplete: () => {
          prevModel.visible = false;
          triggerBurst(nextTheme.poof);
          nextModel.visible = true;
          gsap.to(nextModel.scale, {
            x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(1.5)',
            onComplete: () => { isTransitioningRef.current = false; setIsTransitioning(false); },
          });
        },
      });
      gsap.to(propsGroups[prevIdx].scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.4, ease: 'power2.in' });
      gsap.to(propsGroups[nextIdx].scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'elastic.out(1,0.7)', delay: 0.2 });

      const tl = gsap.timeline();
      const skyC = new THREE.Color(nextTheme.sky);
      const gndC = new THREE.Color(nextTheme.ground);
      const drtC = new THREE.Color(nextTheme.dirt);
      const lgtC = new THREE.Color(nextTheme.light);
      tl.to(scene.background as THREE.Color, { r: skyC.r, g: skyC.g, b: skyC.b, duration: 1.0 }, 0);
      tl.to((scene.fog as THREE.FogExp2).color,   { r: skyC.r, g: skyC.g, b: skyC.b, duration: 1.0 }, 0);
      tl.to(matGround.color, { r: gndC.r, g: gndC.g, b: gndC.b, duration: 1.0 }, 0);
      tl.to(matDirt.color,   { r: drtC.r, g: drtC.g, b: drtC.b, duration: 1.0 }, 0);
      tl.to(dirLight.color,  { r: lgtC.r, g: lgtC.g, b: lgtC.b, duration: 1.0 }, 0);
    };
    (window as any).__splashTransition = triggerTransition;

    // ── 动画主循环 ────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId = 0;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t  = clock.getElapsedTime();
      controls.update();
      environment.rotation.y -= 0.012;

      particles.forEach(p => {
        if (p.mesh.visible) {
          p.mesh.position.addScaledVector(p.vel, dt);
          p.mesh.rotation.x += 0.2; p.mesh.rotation.y += 0.2;
          p.mesh.scale.multiplyScalar(0.9);
          if (p.mesh.scale.x < 0.05) p.mesh.visible = false;
        }
      });

      if (dog.visible) {
        const w = t * 10;
        dogBody.position.y = 1.2 + Math.abs(Math.sin(w)) * 0.1;
        dogHeadGroup.rotation.x = Math.sin(w) * 0.05;
        dogHeadGroup.rotation.y = Math.sin(w * 0.5) * 0.05;
        dogTail.rotation.z = Math.sin(t * 15) * 0.4;
        dogLegs[0].rotation.x =  Math.sin(w) * 0.5;
        dogLegs[3].rotation.x =  Math.sin(w) * 0.5;
        dogLegs[1].rotation.x =  Math.sin(w + Math.PI) * 0.5;
        dogLegs[2].rotation.x =  Math.sin(w + Math.PI) * 0.5;
      }
      if (cat.visible) {
        const w = t * 8;
        catBody.position.y = 1.1 + Math.abs(Math.sin(w)) * 0.04;
        catBody.rotation.z = Math.sin(w * 0.5) * 0.03;
        catHeadGroup.rotation.z = Math.sin(w * 0.5) * 0.05;
        t1.rotation.z = Math.sin(t * 3) * 0.3;
        t2.rotation.z = Math.sin(t * 3 - 0.5) * 0.4;
        t3.rotation.z = Math.sin(t * 3 - 1.0) * 0.5;
        catLegs[0].rotation.x =  Math.sin(w) * 0.6;
        catLegs[3].rotation.x =  Math.sin(w) * 0.6;
        catLegs[1].rotation.x =  Math.sin(w + Math.PI) * 0.6;
        catLegs[2].rotation.x =  Math.sin(w + Math.PI) * 0.6;
      }
      if (rock.visible) {
        mainRock.rotation.x -= dt * 2.5;
        mainRock.position.y = 1.0 + Math.abs(Math.sin(mainRock.rotation.x * 2.5)) * 0.15;
      }
      if (butterfly.visible) {
        thorax.position.y = 2.5 + Math.sin(t * 3) * 0.4;
        thorax.rotation.z = Math.sin(t * 2) * 0.1;
        const flap = Math.sin(t * 30) * 0.8 + 0.2;
        wingGroupL.rotation.z =  flap;
        wingGroupR.rotation.z = -flap;
      }
      if (human.visible) {
        const w = t * 7;
        hTorso.position.y = 1.6 + Math.abs(Math.sin(w)) * 0.06;
        hTorso.rotation.y = Math.sin(w) * 0.1;
        hHeadGroup.rotation.y = -Math.sin(w) * 0.1;
        hArms[0].rotation.x = Math.sin(w) * 0.5;
        hArms[0].children[0].rotation.x = -0.2 + Math.sin(w) * 0.2;
        hArms[1].rotation.x = Math.sin(w + Math.PI) * 0.5;
        hArms[1].children[0].rotation.x = -0.2 - Math.sin(w) * 0.2;
        hLegs[0].rotation.x = Math.sin(w + Math.PI) * 0.6;
        hLegs[0].children[0].rotation.x = Math.max(0, Math.sin(w + Math.PI - 1.5)) * 0.5;
        hLegs[1].rotation.x = Math.sin(w) * 0.6;
        hLegs[1].children[0].rotation.x = Math.max(0, Math.sin(w - 1.5)) * 0.5;
      }

      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 390;
      const h = container.clientHeight || 700;
      const asp = w / h;
      camera.left = -viewSize * asp; camera.right = viewSize * asp;
      camera.top = viewSize; camera.bottom = -viewSize;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(() => onResize());
    ro.observe(container);

    sceneRef.current = {
      dispose: () => {
        cancelAnimationFrame(rafId);
        controls.dispose();
        renderer.dispose();
        window.removeEventListener('resize', onResize);
        ro.disconnect();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
        delete (window as any).__splashTransition;
      },
    };

    return () => sceneRef.current?.dispose();
  }, []);

  const theme = STAGE_THEMES[currentStage];

  return (
    <div
      onClick={(e) => {
        // 点击屏幕任意非按钮区域即可切换服务器
        const target = e.target as HTMLElement;
        if (target && target.closest('button')) return;
        handleTransform();
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        overflow: 'hidden',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Three.js 挂载点 */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* 右上角进入桌面快捷按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleEnter();
        }}
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 30,
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.2s ease',
          pointerEvents: 'auto',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.55)';
          e.currentTarget.style.transform = 'scale(1.04)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="直接进入系统桌面"
      >
        <span>进入桌面</span>
        <span style={{ fontSize: '10px' }}>➔</span>
      </button>

      {/* 顶部选服与交互提示 */}
      <div style={{
        position: 'absolute', top: 16, left: 0, right: 0,
        textAlign: 'center', pointerEvents: 'none', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 12px',
          borderRadius: '12px',
          backgroundColor: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.18)',
          fontSize: 10,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '0.1em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          <span>地球 ONLINE · 物种服务器</span>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.08em', textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}>
          拖拽旋转视角 · 滚轮缩放细节
        </span>
      </div>

      {/* 底部 UI：服务器信息与点击切服提示（触发生命与进入桌面按钮已彻底移除） */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingBottom: 36, gap: 10, zIndex: 10, pointerEvents: 'none',
      }}>
        {/* 服务器大名称 */}
        <div style={{
          fontSize: 30, fontWeight: 900, color: '#fff',
          textShadow: '0 2px 14px rgba(0,0,0,0.45)',
          letterSpacing: '0.12em',
          fontFamily: "'PingFang SC', 'Noto Sans SC', system-ui, sans-serif",
        }}>
          {theme.name}
        </div>

        {/* 副标题 */}
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
          textShadow: '0 1px 6px rgba(0,0,0,0.6)',
          backgroundColor: 'rgba(0,0,0,0.2)',
          padding: '2px 10px',
          borderRadius: '10px',
          backdropFilter: 'blur(4px)',
        }}>
          {theme.subtitle}
        </div>

        {/* 5 个服务器进度指示器 */}
        <div style={{ display: 'flex', gap: 7, marginTop: 4 }}>
          {STAGE_THEMES.map((item, i) => (
            <div
              key={i}
              title={item.name}
              style={{
                width: i === currentStage ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === currentStage ? '#fff' : 'rgba(255,255,255,0.35)',
                boxShadow: i === currentStage ? '0 0 10px #fff' : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
