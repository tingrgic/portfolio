import * as THREE from "three";
import gsap from "gsap";
import { capturePage } from "./capturePage";
import { warpPage } from "./warpPage";
import { loadEnvironment } from "./EnvironmentAssets";
import { asset } from "../asset";

// A slow renderer must drop frames rather than stretch a two-second turn.
gsap.ticker.lagSmoothing(0);

const W = 3.15,
  H = 5.1,
  HINGE = 0.34,
  PAPER = 0.245;
// Independently authored atlas grip anchors (thumb/index contact in each cell).
const grip = {
  right: [[.28,.12],[.28,.12],[.26,.12],[.17,.12],[.15,.12],[.15,.12],[.15,.12],[.17,.12],[.19,.12],[.26,.12],[.26,.12],[.26,.12]],
  left: [[.76,.12],[.76,.12],[.77,.12],[.80,.12],[.80,.12],[.80,.12],[.80,.12],[.80,.12],[.79,.12],[.76,.12],[.76,.12],[.76,.12]],
};
type InkPair = [THREE.Texture | null, THREE.Texture | null];
type Options = {
  host: HTMLElement;
  content: HTMLElement;
  tabs: HTMLElement;
  onFailure: () => void;
};

function roundedRectangle(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}
function solid(
  x: number,
  width: number,
  height: number,
  depth: number,
  radius: number,
) {
  return new THREE.ExtrudeGeometry(
    roundedRectangle(x, -height / 2, width, height, radius),
    {
      depth,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.008,
      bevelSegments: 2,
      curveSegments: 7,
    },
  );
}
function makeNoise() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!,
    data = ctx.createImageData(128, 128);
  let seed = 19;
  for (let i = 0; i < data.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const n = 100 + (seed % 110);
    data.data[i] = data.data[i + 1] = data.data[i + 2] = n;
    data.data[i + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(9, 14);
  return texture;
}

/** The renderer owns geometry only. React remains the source of live content. */
export class NotebookScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  private book = new THREE.Group();
  private tabMeshes: THREE.Mesh[] = [];
  private environment: THREE.Group | null = null;
  private calibration: {dispose: () => void} | null = null;
  private waitingForInk = false;
  private visibility = () => { if (document.hidden) this.timeline?.pause(); else { if (!this.waitingForInk) this.timeline?.resume(); this.render(); } };
  private left = new THREE.Group();
  private leftStock = new THREE.Group();
  private right = new THREE.Group();
  private rightPivot = new THREE.Group();
  private closedSide: "front" | "back" | null = null;
  private coverFraming = 0;
  private pageFront: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshStandardMaterial
  >;
  private pageBack: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  private sheet = new THREE.Group();
  private ink: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>[] =
    [];
  private hand = new THREE.Group();
  private handMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private handTextures: Record<string, THREE.Texture[]> = {
    right: [],
    left: [],
  };
  private assets: THREE.Texture[] = [];
  private snapshots: THREE.Texture[] = [];
  private cache = new Map<string, InkPair>();
  private paperCanvases: HTMLCanvasElement[] = [];
  private paperMaterials: THREE.MeshStandardMaterial[] = [];
  private ready: Promise<void>;
  private handReady: Partial<Record<'right' | 'left', Promise<void>>> = {};
  private loadTexture!: (url: string) => Promise<THREE.Texture>;
  private timeline: gsap.core.Timeline | null = null;
  private resolveAnimation: (() => void) | null = null;
  private disposed = false;
  private operation = 0;
  private skipRequested = false;
  private opening = false;
  private leaning = 0;
  private mobile = false;
  private width = 1;
  private height = 1;
  private canvasHeight = 1;
  private offsetY = 0;
  private logicalWidth = [300, 300];
  private textureWarps = [new THREE.Matrix3(), new THREE.Matrix3()];
  private readingCamera = new THREE.PerspectiveCamera();
  private observer: ResizeObserver;
  private cover: THREE.Mesh;
  private contextLost: (event: Event) => void;
  private renderCount = 0;
  private turnAngle = 0;
  private lastRender = 0;

  constructor(private options: Options) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(1);
    this.book.name = "NotebookRoot";
    this.book.position.z = -.10; // The cover rests on the authored desk, rather than floating above it.
    document.addEventListener("visibilitychange", this.visibility);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x30241c, 1);
    this.renderer.domElement.className = "world-canvas";
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    options.host.prepend(this.renderer.domElement);
    this.contextLost = (event) => {
      event.preventDefault();
      options.onFailure();
    };
    this.renderer.domElement.addEventListener(
      "webglcontextlost",
      this.contextLost,
    );
    this.scene.add(new THREE.HemisphereLight(0xffedcf, 0x3c281b, 1.05));
    const light = new THREE.DirectionalLight(0xffdfb2, 3.4);
    light.position.set(-4, 4, 6);
    light.castShadow = true;
    light.shadow.mapSize.set(innerWidth < 700 ? 512 : 2048, innerWidth < 700 ? 512 : 2048);
    light.shadow.camera.left = -9;
    light.shadow.camera.right = 9;
    light.shadow.camera.top = 9;
    light.shadow.camera.bottom = -9;
    light.shadow.normalBias = 0.008;
    light.shadow.bias = -0.0002;
    light.shadow.radius = 3;
    this.scene.add(light);
    const fill = new THREE.DirectionalLight(0xe6edff, .65);
    fill.position.set(5, -1, 7); this.scene.add(fill);
    this.scene.add(this.book);
    this.book.add(this.rightPivot, this.left, this.leftStock, this.sheet, this.hand);
    this.rightPivot.name = "BackCoverPivot";
    this.rightPivot.position.z = HINGE;
    this.right.position.z = -HINGE;
    this.rightPivot.add(this.right);
    this.leftStock.name = "LeftPaperBlock";
    this.left.name = "FrontCoverPivot";
    this.leftStock.position.z = HINGE;
    this.left.position.z = HINGE;
    const noise = makeNoise();
    this.assets.push(noise);
    const leather = new THREE.MeshStandardMaterial({
      color: 0x161714,
      roughness: 0.78,
      bumpMap: noise,
      bumpScale: 0.006,
    });
    const edges = new THREE.MeshStandardMaterial({
      color: 0xd9d0bb,
      roughness: 1,
    });
    const stock = new THREE.MeshStandardMaterial({
      color: 0xf4efdf,
      roughness: 0.96,
    });
    const back = new THREE.Mesh(
      solid(-0.045, W + 0.15, H + 0.17, 0.06, 0.14),
      leather,
    );
    back.position.z = -0.01;
    back.castShadow = back.receiveShadow = true;
    this.right.add(back);
    this.cover = new THREE.Mesh(
      solid(-W - 0.105, W + 0.15, H + 0.17, 0.06, 0.14),
      leather,
    );
    this.cover.position.z = -HINGE - 0.01;
    this.cover.castShadow = this.cover.receiveShadow = true;
    for (const mesh of [back, this.cover]) {
      const vertices = mesh.geometry.attributes.position;
      for (let i=0; i<vertices.count; i++) {
        const x=vertices.getX(i), y=vertices.getY(i);
        vertices.setZ(i, vertices.getZ(i) + .009*Math.sin(x*3.2)*Math.cos(y*2.1));
      }
      mesh.geometry.computeVertexNormals();
    }
    this.left.add(this.cover);
    // Rounded leather welts give the cover an actual rolled edge in grazing light.
    for (const [mesh, x] of [[this.cover, -W-.105], [back, -.045]] as const) {
      const outline = roundedRectangle(x, -H/2-.085, W+.15, H+.17, .14).getPoints(24);
      const path = new THREE.CatmullRomCurve3(outline.map(p => new THREE.Vector3(p.x,p.y,0)), true);
      for (const z of [-.003,.061]) {
        const welt = new THREE.Mesh(new THREE.TubeGeometry(path, 180, .012, 5, true), leather);
        welt.position.z=z; welt.castShadow=true; mesh.add(welt);
      }
    }
    for (const side of [-1, 1]) {
      const group = side === -1 ? this.leftStock : this.right;
      const block = new THREE.Mesh(
        solid(side === -1 ? -W : -0.005, W + 0.005, H, 0.13, 0.1),
        edges,
      );
      block.position.z = 0.065 - (side === -1 ? HINGE : 0);
      block.castShadow = block.receiveShadow = true;
      group.add(block);
      // Thin perimeter laminations create genuine stacked edges, not a photo.
      for (let index = 0; index < 9; index++) {
        const layer = new THREE.Mesh(
          new THREE.ShapeGeometry(
            roundedRectangle(
              side === -1 ? -W : -0.005,
              -H / 2,
              W + 0.005,
              H,
              0.1,
            ),
            8,
          ),
          new THREE.MeshStandardMaterial({
            color: index % 2 ? 0xe7dfcc : 0xc7bfae,
            roughness: 1,
            side: THREE.DoubleSide,
          }),
        );
        layer.position.z = 0.071 + index * 0.016 - (side === -1 ? HINGE : 0);
        layer.position.x = Math.sin(index * 2.3) * .009;
        layer.position.y = Math.cos(index * 1.7) * .008;
        group.add(layer);
      }
      const material = stock.clone();
      const paperCanvas = document.createElement("canvas");
      paperCanvas.width = 768;
      paperCanvas.height = 1244;
      const pc = paperCanvas.getContext("2d")!;
      pc.fillStyle = "#fff3df";
      pc.fillRect(0, 0, 768, 1244);
      let random = 31;
      for (let i = 0; i < 80000; i++) {
        random = (random * 16807) % 2147483647;
        const x = random % 768;
        random = (random * 16807) % 2147483647;
        const y = random % 1244;
        pc.fillStyle = `rgba(90,75,45,${0.015 + (random % 15) / 1000})`;
        pc.fillRect(x, y, 1, 1);
      }
      const crease = pc.createLinearGradient(
        side === 1 ? 0 : 768,
        0,
        side === 1 ? 105 : 663,
        0,
      );
      crease.addColorStop(0, "rgba(72,53,31,.23)");
      crease.addColorStop(0.2, "rgba(126,102,60,.07)");
      crease.addColorStop(0.6, "rgba(255,255,240,.13)");
      crease.addColorStop(1, "rgba(255,255,240,0)");
      pc.fillStyle = crease;
      pc.fillRect(0, 0, 768, 1244);
      const edge = pc.createLinearGradient(0, 0, 0, 1244);
      edge.addColorStop(0, "rgba(120,85,36,.06)");
      edge.addColorStop(0.035, "transparent");
      edge.addColorStop(0.965, "transparent");
      edge.addColorStop(1, "rgba(120,85,36,.08)");
      pc.fillStyle = edge;
      pc.fillRect(0, 0, 768, 1244);
      this.paperCanvases.push(paperCanvas);
      const paperTexture = new THREE.CanvasTexture(paperCanvas);
      paperTexture.colorSpace = THREE.SRGBColorSpace;
      this.assets.push(paperTexture);
      material.map = paperTexture;
      material.color.set(0xffffff);
      material.bumpMap = noise;
      material.bumpScale = 0.018;
      this.paperMaterials.push(material);
      const page = new THREE.Mesh(this.paperGeometry(side), material);
      page.position.z = PAPER - (side === -1 ? HINGE : 0);
      page.receiveShadow = true;
      group.add(page);
      const inkGeometry = new THREE.PlaneGeometry(W - 0.13, H - 0.14, 36, 12);
      const inkVertices = inkGeometry.attributes.position;
      for (let i = 0; i < inkVertices.count; i++) {
        const x = Math.abs((side * W) / 2 + inkVertices.getX(i));
        inkVertices.setZ(
          i,
          -0.036 * Math.exp(-x / 0.19) + 0.014 * Math.sin((Math.PI * x) / W),
        );
      }
      inkGeometry.computeVertexNormals();
      const printed = new THREE.Mesh(
        inkGeometry,
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.96,
          transparent: false,
          depthWrite: true,
        }),
      );
      printed.position.set(
        (side * W) / 2,
        0,
        PAPER + 0.016 - (side === -1 ? HINGE : 0),
      );
      printed.visible = false;
      printed.receiveShadow = true;
      group.add(printed);
      this.ink.push(printed);
    }
    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, H + 0.14, 16),
      leather,
    );
    spine.position.set(0, 0, 0.035);
    spine.castShadow = true;
    this.book.add(spine);
    const ribbon = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 0.88),
      new THREE.MeshStandardMaterial({
        color: 0x252d26,
        roughness: 1,
        side: THREE.DoubleSide,
      }),
    );
    ribbon.position.set(-0.11, -H / 2 - 0.33, -0.015);
    ribbon.rotation.z = -0.12;
    ribbon.castShadow = true;
    this.book.add(ribbon);
    const elastic = new THREE.Mesh(
      new THREE.BoxGeometry(0.062, H + 0.2, 0.025),
      new THREE.MeshStandardMaterial({ color: 0x10160f, roughness: 1 }),
    );
    elastic.position.set(-W + 0.3, 0, -HINGE - 0.032);
    this.left.add(elastic);
    [0xa5af8d, 0xd4ae76, 0xbb8066].forEach((color, i) => {
      const tab = new THREE.Mesh(solid(0, .49, .43, .025, .035), new THREE.MeshStandardMaterial({color, roughness: .95, bumpMap: noise, bumpScale: .002}));
      tab.name = ["TabHello", "TabWork", "TabConnect"][i];
      tab.position.set(W - .065, H / 2 - .45 - i * .48, .14 + i * .007);
      tab.rotation.z = [.012, -.02, .025][i];
      tab.castShadow = tab.receiveShadow = true;
      this.right.add(tab); this.tabMeshes.push(tab);
    });
    const geometry = new THREE.PlaneGeometry(W - 0.06, H - 0.06, 48, 8);
    geometry.translate(W / 2, 0, 0);
    this.pageFront = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0xf6f0df,
        roughness: 0.94,
        side: THREE.FrontSide,
      }),
    );
    this.pageBack = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0xf6f0df,
        roughness: 0.94,
        side: THREE.BackSide,
      }),
    );
    this.pageFront.castShadow = true;
    this.pageFront.receiveShadow = true;
    this.pageBack.castShadow = true;
    this.sheet.add(this.pageFront, this.pageBack);
    // Keep the flat turning sheet above the highest curved printed surface.
    this.sheet.position.z = PAPER + 0.045;
    this.sheet.visible = false;
    this.handMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        alphaTest: 0.015,
        side: THREE.DoubleSide,
      }),
    );
    // One continuous authored hand/cuff/forearm silhouette, with no separate sleeve join.
    const armGeometry = new THREE.PlaneGeometry(1, 1, 1, 24);
    const armPositions = armGeometry.attributes.position;
    for (let i=0; i<armPositions.count; i++) {
      const y=armPositions.getY(i);
      if (y<0) armPositions.setY(i,y*3.2);
    }
    this.handMesh.geometry.dispose();
    this.handMesh.geometry = armGeometry;
    this.handMesh.renderOrder = 51;
    this.handMesh.castShadow = true;
    this.hand.add(this.handMesh);
    this.hand.visible = false;
    const loader = new THREE.TextureLoader();
    const load = async (url: string) => {
      const t = await loader.loadAsync(url);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
      if (this.disposed) t.dispose(); else this.assets.push(t);
      return t;
    };
    this.loadTexture = load;
    this.ready = Promise.all([
      load(asset("images/optimized/leather.webp")).then(t => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(.48, .48);
        leather.map = t; leather.bumpMap = t; leather.bumpScale = .028;
        leather.color.set(0x8b8e8b); leather.needsUpdate = true;
      }),
      loadEnvironment().then(({root, textures}) => {
        if (this.disposed) { root.traverse(o => { if(o instanceof THREE.Mesh) {o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());} }); textures.forEach(t=>t.dispose()); return; }
        this.environment = root; this.scene.add(root); this.assets.push(...textures); this.applyQuality();
      }),
      load(asset("images/optimized/paper.webp")).then(texture => {
        this.paperCanvases.forEach(canvas => {
          const ctx = canvas.getContext('2d')!;
          ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .82;
          ctx.drawImage(texture.image as CanvasImageSource, 0, 0, canvas.width, canvas.height); ctx.restore();
        });
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(2, 3);
        this.paperMaterials.forEach(material => {material.bumpMap = texture; material.bumpScale = .026; material.needsUpdate = true;});
        this.assets.filter(t => t instanceof THREE.CanvasTexture).forEach(t => t.needsUpdate = true);
      }),
      document.fonts.ready,
    ]).then(() => {
      if (!this.disposed) this.render();
    });
    this.resize();
    this.observer = new ResizeObserver(() => {
      if (
        !this.disposed &&
        (options.host.clientWidth !== this.width ||
          options.host.clientHeight !== this.height)
      ) {
        this.finish();
        this.resize();
      }
    });
    this.observer.observe(options.host);
    options.host.dataset.renderer = "webgl";
    if (import.meta.env.DEV) void import('./VisualCalibration').then(({createCalibration}) => {
      if (!this.disposed) this.calibration = createCalibration(options.host, this.scene, this.camera, this.book, this.renderer, () => this.render(), time => {this.timeline?.pause(); this.timeline?.time(time);});
    });
  }

  private paperGeometry(side: number) {
    const g = new THREE.PlaneGeometry(W - 0.055, H - 0.03, 48, 24);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + (W + 0.055) / 2;
      const y = pos.getY(i),
        radius = 0.105,
        dy = Math.max(0, Math.abs(y) - (H / 2 - radius));
      const rounded = Math.min(
        x,
        W - radius + Math.sqrt(Math.max(0, radius * radius - dy * dy)),
      );
      pos.setX(i, side * rounded);
      pos.setZ(
        i,
        -0.036 * Math.exp(-x / 0.19) + 0.014 * Math.sin((Math.PI * x) / W),
      );
      if (side === -1) g.attributes.uv.setX(i, 1 - g.attributes.uv.getX(i));
    }
    // Reversing X reverses triangle winding; reverse indices to retain +Z normals.
    if (side === -1) {
      const idx = g.index!;
      for (let i = 0; i < idx.count; i += 3) {
        const b = idx.getX(i + 1);
        idx.setX(i + 1, idx.getX(i + 2));
        idx.setX(i + 2, b);
      }
    }
    g.computeVertexNormals();
    return g;
  }

  private applyQuality() {
    const pixels = this.width * this.canvasHeight;
    const tier = this.mobile ? 'low' : pixels > 3000000 ? 'medium' : 'high';
    const ratio = Math.min(devicePixelRatio, this.mobile ? 1.25 : 1.5, Math.sqrt(2800000 / Math.max(pixels, 1)));
    this.renderer.setPixelRatio(Math.max(.75, ratio));
    this.options.host.dataset.quality = tier;
    this.environment?.traverse(o => {
      if (/^(Lamp|Pencil|CeramicSpeckle|ClipWire|ForegroundKnee)/.test(o.name)) o.visible = !this.mobile;
    });
  }
  resize() {
    this.cache.forEach((pair) => pair.forEach((t) => t?.dispose()));
    this.cache.clear();
    this.options.host.dataset.cachedPages = '[]';
    this.width = this.options.host.clientWidth;
    this.height = this.options.host.clientHeight;
    this.mobile = innerWidth < 700;
    this.canvasHeight =
      this.options.host.closest<HTMLElement>(".desk")!.clientHeight;
    this.offsetY = this.options.host.getBoundingClientRect().top;
    this.applyQuality();
    this.renderer.setSize(this.width, this.canvasHeight, false);
    Object.assign(this.renderer.domElement.style, {
      top: `${-this.offsetY}px`,
      height: `${this.canvasHeight}px`,
    });
    this.camera.aspect = this.width / this.canvasHeight;
    this.camera.updateProjectionMatrix();
    this.book.rotation.z = this.mobile ? 0 : .035;
    const coverFraming = this.coverFraming;
    this.coverFraming = 0;
    this.setCamera(0);
    this.readingCamera.copy(this.camera);
    this.book.updateMatrixWorld(true);
    this.logicalWidth = [
      [-W + 0.065, -0.065],
      [0.065, W - 0.065],
    ].map(([left, right]) => {
      const a = this.projected(left, H / 2 - 0.07),
        b = this.projected(right, H / 2 - 0.07);
      return Math.round(Math.hypot(b.x - a.x, b.y - a.y));
    });
    this.coverFraming = coverFraming;
    this.setCamera(this.leaning);
    this.layout();
    this.render();
  }
  private setCamera(lean: number, openingPan = 0) {
    const aspect = this.width / this.canvasHeight;
    const worldHeight = Math.max(
      ((this.mobile ? 5.75 : 5.25) * this.canvasHeight) / this.height,
      (this.mobile ? 4.12 : innerWidth < 1000 ? 8.2 : 9.3) / aspect,
    );
    const distance =
      (worldHeight / (2 * Math.tan(THREE.MathUtils.degToRad(17)))) *
      (1 + lean * 0.12);
    const pitch = THREE.MathUtils.degToRad((this.mobile ? 9 : 28) + lean * 6);
    const targetX = this.mobile
      ? 1.8 + Math.min(0, this.coverFraming) * 3.45
      : lean * 1.3 + openingPan + this.coverFraming * 1.5;
    const targetY = this.mobile ? 0 : -.26 * (1 - lean);
    this.camera.position.set(
      targetX + Math.sin(lean * Math.PI) * .10 - (this.mobile ? 0 : .35 * (1 - lean)),
      targetY - distance * Math.sin(pitch),
      distance * Math.cos(pitch),
    );
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(targetX, targetY, 0.1);
    this.scene.getObjectByName("CalibrationCameraTarget")?.position.set(targetX, targetY, .1);
    this.options.host.dataset.cameraTarget = JSON.stringify([targetX, targetY, .1]);
    this.options.host.dataset.cameraPosition = JSON.stringify(this.camera.position.toArray());
    this.options.host.dataset.rootScale = JSON.stringify(this.book.scale.toArray());
    this.options.host.dataset.cameraLens = JSON.stringify({fov:this.camera.fov,zoom:this.camera.zoom});
    this.camera.updateMatrixWorld();
  }
  private projected(
    x: number,
    y: number,
    z = PAPER + 0.022,
    camera = this.camera,
  ) {
    const p = new THREE.Vector3(x, y, z);
    this.book.localToWorld(p);
    p.project(camera);
    return {
      x: ((p.x + 1) * this.width) / 2,
      y: ((1 - p.y) * this.canvasHeight) / 2 - this.offsetY,
    };
  }
  private projectElement(element: HTMLElement, left: number, right: number) {
    const top = H / 2 - 0.07,
      bottom = -H / 2 + 0.07;
    const p = [
      this.projected(left, top),
      this.projected(right, top),
      this.projected(right, bottom),
      this.projected(left, bottom),
    ];
    const width = this.logicalWidth[left < 0 ? 0 : 1];
    const height = Math.round((width * (H - 0.14)) / (W - 0.13));
    // Fit a parallelogram to all four corners. Dropping the denominator of
    // a homography is not an affine approximation: its translation-dependent
    // terms shear desktop ink off the left edge of the paper.
    const affine = (quad: { x: number; y: number }[]) => {
      const [tl, tr, br, bl] = quad;
      const a = (tr.x - tl.x + br.x - bl.x) / 2;
      const b = (bl.x - tl.x + br.x - tr.x) / 2;
      const d = (tr.y - tl.y + br.y - bl.y) / 2;
      const e = (bl.y - tl.y + br.y - tr.y) / 2;
      const x = (tl.x + tr.x + br.x + bl.x) / 4 - (a + b) / 2;
      const y = (tl.y + tr.y + br.y + bl.y) / 4 - (d + e) / 2;
      return { a, b, d, e, x, y };
    };
    const fitted = affine(p);
    Object.assign(element.style, {
      width: `${width}px`,
      height: `${height}px`,
      transformOrigin: "0 0",
      transform: `matrix(${fitted.a / width},${fitted.d / width},${fitted.b / height},${fitted.e / height},${fitted.x},${fitted.y})`,
    });
    // Use the settled camera for texture coordinates even during arrival.
    const q = [
      this.projected(left, top, undefined, this.readingCamera),
      this.projected(right, top, undefined, this.readingCamera),
      this.projected(right, bottom, undefined, this.readingCamera),
      this.projected(left, bottom, undefined, this.readingCamera),
    ];
    const dx1r = q[1].x - q[2].x,
      dx2r = q[3].x - q[2].x,
      dx3r = q[0].x - q[1].x + q[2].x - q[3].x;
    const dy1r = q[1].y - q[2].y,
      dy2r = q[3].y - q[2].y,
      dy3r = q[0].y - q[1].y + q[2].y - q[3].y;
    const detr = dx1r * dy2r - dx2r * dy1r;
    const gr = (dx3r * dy2r - dx2r * dy3r) / detr,
      hr = (dx1r * dy3r - dx3r * dy1r) / detr;
    const ar = q[1].x - q[0].x + gr * q[1].x,
      br = q[3].x - q[0].x + hr * q[3].x;
    const dr = q[1].y - q[0].y + gr * q[1].y,
      er = q[3].y - q[0].y + hr * q[3].y;
    const settled = affine(q);
    this.textureWarps[left < 0 ? 0 : 1] = new THREE.Matrix3()
      .set(ar, br, q[0].x, dr, er, q[0].y, gr, hr, 1)
      .invert()
      .multiply(
        new THREE.Matrix3().set(
          settled.a, settled.b, settled.x,
          settled.d, settled.e, settled.y,
          0, 0, 1,
        ),
      );
  }
  layout() {
    const { content, tabs } = this.options;
    this.book.updateMatrixWorld(true);
    const pages = content.querySelectorAll<HTMLElement>(
      ".spread > .paper-page",
    );
    if (this.mobile) {
      pages.forEach((p) => {
        p.style.transform = "";
        p.style.width = "";
        p.style.height = "";
      });
      this.projectElement(content, 0.065, W - 0.065);
    } else {
      content.style.transform = "";
      content.style.width = "100%";
      content.style.height = "100%";
      pages.forEach((p, i) =>
        this.projectElement(
          p,
          i === 0 ? -W + 0.065 : 0.065,
          i === 0 ? -0.065 : W - 0.065,
        ),
      );
    }
    Object.assign(tabs.style, {left: '0px', top: '0px', right: 'auto', width: '100%', height: '100%'});
    [...tabs.querySelectorAll<HTMLElement>('button')].forEach((button, i) => {
      // Project the actual centre of the rotated 3D tab. Testing only the DOM
      // box missed this relationship and allowed the UI to drift off the mesh.
      const centre = this.tabMeshes[i].localToWorld(new THREE.Vector3(.245, 0, .025));
      centre.project(this.camera);
      const point = {
        x: ((centre.x + 1) * this.width) / 2,
        y: ((1 - centre.y) * this.canvasHeight) / 2 - this.offsetY,
      };
      const size = this.mobile ? 48 : 60;
      // Keep the generous touch target inside the viewport, but position its
      // visible icon at the projected mesh centre. Coupling the artwork to the
      // clamped hit-box made narrow browser viewports pull labels off the tab.
      const left = THREE.MathUtils.clamp(point.x - size / 2, 2, this.width - size - 2);
      const top = point.y - size / 2;
      button.style.left = `${left}px`;
      button.style.top = `${top}px`;
      button.style.height = `${size}px`;
      button.style.setProperty('--tab-anchor-x', `${point.x - left}px`);
      button.style.setProperty('--tab-anchor-y', `${point.y - top}px`);
      button.dataset.tabAnchorX = point.x.toFixed(2);
      button.dataset.tabAnchorY = point.y.toFixed(2);
    });
    const bounds = [
      this.projected(-W - 0.105, H / 2 + 0.085, 0),
      this.projected(W + 0.105, H / 2 + 0.085, 0),
      this.projected(W + 0.105, -H / 2 - 0.085, 0),
      this.projected(-W - 0.105, -H / 2 - 0.085, 0),
    ];
    this.options.host.dataset.bookBounds = JSON.stringify({
      left: Math.min(...bounds.map((p) => p.x)),
      right: Math.max(...bounds.map((p) => p.x)),
      top: Math.min(...bounds.map((p) => p.y)) + this.offsetY,
      bottom: Math.max(...bounds.map((p) => p.y)) + this.offsetY,
    });
    this.options.host.dataset.paperRatio = String(H / W);
    if (this.closedSide) {
      const x = this.closedSide === "front" ? 0 : -W;
      const a = this.projected(x, H/2, .68), b = this.projected(x+W, -H/2, .68);
      this.options.host.style.setProperty('--cover-x', `${Math.min(a.x,b.x)}px`);
      this.options.host.style.setProperty('--cover-y', `${Math.min(a.y,b.y)}px`);
      this.options.host.style.setProperty('--cover-width', `${Math.abs(b.x-a.x)}px`);
      this.options.host.style.setProperty('--cover-height', `${Math.abs(b.y-a.y)}px`);
    }
  }
  private render(force = true) {
    if (this.disposed || document.hidden) return;
    const now = performance.now();
    if (!force && now - this.lastRender < 1000 / 30) return;
    this.options.host.dataset.fps = (1000 / Math.max(1, now - this.lastRender)).toFixed(1);
    this.lastRender = now;
    this.renderer.render(this.scene, this.camera);
    this.options.host.dataset.renderCount = String(++this.renderCount);
    this.options.host.dataset.coverAngle = this.left.rotation.y.toFixed(4);
    this.options.host.dataset.backCoverAngle = this.rightPivot.rotation.y.toFixed(4);
    this.options.host.dataset.pageAngle = this.turnAngle.toFixed(4);
    this.options.host.dataset.hand = this.hand.visible
      ? this.options.host.dataset.hand
      : "none";
    // Actual cover vertices above the stationary right block must clear its top.
    let clearance = 10;
    this.cover.updateWorldMatrix(true, false);
    for (let ix = 0; ix <= 12; ix++)
      for (let iy = 0; iy <= 4; iy++)
        for (const z of [0, 0.06]) {
          const v = new THREE.Vector3(
            -W - 0.105 + ((W + 0.15) * ix) / 12,
            -H / 2 + (H * iy) / 4,
            z,
          );
          this.cover.localToWorld(v);
          this.book.worldToLocal(v);
          if (v.x > 0.06 && v.x < W && Math.abs(v.y) < H / 2)
            clearance = Math.min(clearance, v.z - (PAPER + 0.014));
        }
    this.options.host.dataset.coverClearance = clearance.toFixed(4);
  }
  private async capture(content = this.options.content): Promise<InkPair> {
    const captureOperation = this.operation;
    const captureMobile = this.mobile;
    const captureWarps = this.textureWarps.map(matrix => matrix.clone());
    const key = `${content.dataset.pageKey}/${this.mobile}/${this.logicalWidth.join(",")}`;
    const cached = this.cache.get(key);
    if (
      cached &&
      content.scrollTop === 0 &&
      ![...content.querySelectorAll<HTMLElement>(".paper-page")].some(
        (p) => p.scrollTop > 0,
      )
    )
      return cached;
    this.options.host.dataset.captureCount = String(Number(this.options.host.dataset.captureCount || 0) + 1);
    await Promise.all([
      document.fonts.ready,
      ...[...content.querySelectorAll("img")].map((i) => i.decode()),
    ]);
    if (this.disposed || captureOperation !== this.operation) return [null, null];
    const elements = captureMobile
      ? [content]
      : Array.from(
          content.querySelectorAll<HTMLElement>(".spread > .paper-page"),
        );
    const textures = await Promise.all(
      elements.map(async (element, index) => {
        const started = performance.now();
        const canvas = await capturePage(element);
        const rasterized = performance.now();
        await this.ready; // Paper material may still be loading during initial rasterization.
        if (this.disposed || captureOperation !== this.operation) return null;
        // Bake cream below HTML so the moving sheet is opaque and depth-tested.
        const result = document.createElement("canvas");
        result.width = canvas.width;
        result.height = canvas.height;
        const ctx = result.getContext("2d")!;
        ctx.drawImage(
          this.paperCanvases[captureMobile ? 1 : index],
          0,
          0,
          result.width,
          result.height,
        );
        ctx.drawImage(
          warpPage(canvas, captureWarps[captureMobile ? 1 : index]),
          0,
          0,
        );
        const texture = new THREE.CanvasTexture(result);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        this.renderer.initTexture(texture);
        this.options.host.dataset.captureTiming = JSON.stringify({rasterMs:Math.round(rasterized-started),uploadAndWarpMs:Math.round(performance.now()-rasterized)});
        return texture;
      }),
    );
    if (this.disposed || captureOperation !== this.operation) { textures.forEach(t => t?.dispose()); return [null, null]; }
    const pair: InkPair = captureMobile
      ? [null, textures[0]]
      : [textures[0], textures[1]];
    cached?.forEach((texture) => texture?.dispose());
    this.cache.set(key, pair);
    this.options.host.dataset.cachedPages = JSON.stringify([...this.cache.keys()]);
    return pair;
  }
  async warmPage(content: HTMLElement) {
    if (this.disposed || this.options.host.dataset.phase !== 'reading') return;
    const pages = content.querySelectorAll<HTMLElement>('.spread > .paper-page');
    if (this.mobile) {
      content.style.width = `${this.logicalWidth[1]}px`;
      content.style.height = `${Math.round(this.logicalWidth[1]*(H-.14)/(W-.13))}px`;
    } else {
      content.style.width = `${this.width}px`;
      content.style.height = `${this.height}px`;
      pages.forEach((page,i)=>{page.style.width=`${this.logicalWidth[i]}px`;page.style.height=`${Math.round(this.logicalWidth[i]*(H-.14)/(W-.13))}px`;});
    }
    await this.capture(content);
  }
  private setInk(pair: InkPair) {
    this.ink.forEach((mesh, i) => {
      mesh.material.map = pair[i];
      mesh.material.needsUpdate = true;
      mesh.visible = !!pair[i];
    });
  }
  private loadHands(side: 'right' | 'left') {
    const existing = this.handReady[side];
    if (existing) return existing;
    const direction = side === 'right' ? 'forward' : 'backward';
    const pending = Promise.all(
      Array.from({length: 12}, (_, i) =>
        this.loadTexture(asset(`images/hands-clay-full/${direction}-${i + 1}.webp`))
          .then(texture => { this.handTextures[side][i] = texture; }),
      ),
    ).then(() => {});
    this.handReady[side] = pending;
    // Awaiting animation paths still receive the rejection; this secondary
    // handler only prevents an abandoned prefetch from becoming unhandled.
    void pending.catch(() => {});
    return pending;
  }
  private showHTML() {
    this.options.content.style.opacity = "1";
    this.options.host.dataset.phase = "reading";
    this.ink.forEach((mesh) => {
      mesh.visible = false;
      mesh.material.map = null;
    });
    this.sheet.visible = false;
    this.hand.visible = false;
    this.pageFront.material.map = null;
    this.pageBack.material.map = null;
    this.snapshots.forEach((t) => t.dispose());
    this.snapshots = [];
    this.render();
  }
  private animate(duration: number, update: (t: number) => void) {
    return new Promise<void>((resolve) => {
      const clock = { t: 0 };
      this.resolveAnimation = resolve;
      this.timeline = gsap.timeline({
        onComplete: () => {
          this.resolveAnimation = null;
          this.timeline = null;
          resolve();
        },
      });
      this.timeline.to(clock, {
        t: duration,
        duration,
        ease: "none",
        onUpdate: () => update(clock.t),
      });
    });
  }
  async initialize(animate: boolean) {
    const operation = ++this.operation;
    this.opening = animate;
    this.options.host.dataset.phase = "loading";
    this.options.content.style.opacity = "0";
    this.left.rotation.y = this.leftStock.rotation.y = animate ? Math.PI : 0;
    this.setTabsForCover(animate ? 1 : 0);
    this.leaning = animate ? 1 : 0;
    this.setCamera(0);
    this.book.updateMatrixWorld(true);
    this.logicalWidth = [
      [-W + 0.065, -0.065],
      [0.065, W - 0.065],
    ].map(([left, right]) => {
      const a = this.projected(left, H / 2 - 0.07),
        b = this.projected(right, H / 2 - 0.07);
      return Math.round(Math.hypot(b.x - a.x, b.y - a.y));
    });
    this.setCamera(this.leaning);
    this.layout();
    this.render();
    const prepared = animate && !this.skipRequested
      ? Promise.all([this.capture(), this.loadHands('right')]).then(([pair])=>pair)
      : null;
    // Capture and asset transfer overlap. Static/reduced-motion views need no snapshot.
    if (prepared) void prepared.catch(()=>{});
    await this.ready;
    if (this.disposed || operation !== this.operation) return;
    if (!animate || this.skipRequested) {
      this.left.rotation.y = this.leftStock.rotation.y = 0;
      this.leaning = 0;
      this.setCamera(0);
      this.layout();
      this.opening = false;
      this.showHTML();
      return;
    }
    let inkReady = false;
    const inkPrepared = prepared!.then(pair => {
      if (this.disposed || operation !== this.operation || this.skipRequested) return;
      this.setInk(pair); inkReady = true;
    });
    // A paused calibration scene must be fully authored before manual seeking.
    if (import.meta.env.DEV && new URLSearchParams(location.search).has('timeline')) await inkPrepared;
    this.options.host.dataset.phase = "opening";
    await new Promise<void>((resolve, reject) => {
      const clock = {t: 0};
      this.resolveAnimation = resolve;
      const timeline = gsap.timeline({paused: import.meta.env.DEV && new URLSearchParams(location.search).has('timeline'), onComplete: () => { this.resolveAnimation = null; this.timeline = null; resolve(); }});
      this.timeline = timeline;
      // Lean while the snapshot finishes. Never reveal paper or a missing hand.
      timeline.call(()=>{if (!inkReady && !this.skipRequested) {this.waitingForInk=true;timeline.pause();}},[],1.95);
      void inkPrepared.then(()=>{
        this.waitingForInk=false;
        if (this.timeline === timeline && !this.disposed && operation === this.operation && !this.skipRequested && timeline.time() >= 1.95 && !document.hidden) timeline.resume();
      },error=>{this.waitingForInk=false;timeline.kill();this.timeline=null;reject(error);});
      const labels: [string, number][] = [['idle',0],['leanStart',.6],['leanMid',1.3],['leanEnd',2],['handEnter',2],['handContact',2.55],['coverLift',2.65],['coverOpen',3.95],['pagesSettle',4.12],['handRelease',4.2],['cameraSettle',4.55],['interactive',4.8]];
      labels.forEach(([label,time]) => timeline.addLabel(label,time));
      timeline.to(clock, {t: 4.8, duration: 4.8, ease:'none', onUpdate: () => {
        const t = clock.t;
        this.options.host.dataset.timelineTime = t.toFixed(3);
        this.options.host.dataset.timelineLabel = [...labels].reverse().find(([,time])=>t>=time)?.[0] || 'idle';
        this.leaning = 1 - gsap.parseEase('power2.inOut')(THREE.MathUtils.clamp((t-.6)/1.4,0,1));
        const progress = gsap.parseEase('power2.inOut')(THREE.MathUtils.clamp((t-2.65)/1.3,0,1));
        this.left.rotation.y = Math.PI * (1-progress);
        this.setTabsForCover(1-progress);
        this.setCamera(this.leaning, 1.3 * (1-progress) * (1-this.leaning));
        const stockProgress = gsap.parseEase('power2.inOut')(THREE.MathUtils.clamp((t-2.78)/1.34,0,1));
        this.leftStock.rotation.y = Math.PI * (1-stockProgress);
        this.left.updateMatrixWorld(true);
        const point = this.left.localToWorld(new THREE.Vector3(-W,-H*.23,-HINGE-.06));
        this.book.worldToLocal(point);
        if (t >= 2 && t < 4.65) this.poseHand('right',t-2,point,2.65);
        else this.hand.visible=false;
        this.layout(); this.render(gsap.globalTimeline.paused() || !!this.timeline?.paused());
      }}, 0);
    });
    if (this.disposed) return;
    this.opening = false;
    this.left.rotation.y = this.leftStock.rotation.y = 0;
    this.setTabsForCover(0);
    this.leaning = 0;
    this.setCamera(0);
    this.layout();
    this.showHTML();
  }
  finish() {
    this.waitingForInk = false;
    this.skipRequested = true;
    if (this.timeline) {
      this.timeline.progress(1);
      this.timeline?.kill();
      this.resolveAnimation?.();
      this.resolveAnimation = null;
      this.timeline = null;
    }
    if (this.opening) {
      this.left.rotation.y = this.leftStock.rotation.y = 0;
      this.setTabsForCover(0);
      this.leaning = 0;
      this.setCamera(0);
      this.hand.visible = false;
      this.layout();
      this.showHTML();
    }
  }
  cancel() {
    this.operation++;
    this.finish();
    this.coverPose(this.closedSide ? 1 : 0, this.closedSide || "front");
    if (this.closedSide) this.showClosed();
    else this.showHTML();
    this.layout();
  }

  private coverPose(amount: number, side: "front" | "back") {
    this.left.rotation.y = this.leftStock.rotation.y = side === "front" ? Math.PI * amount : 0;
    this.rightPivot.rotation.y = side === "back" ? -Math.PI * amount : 0;
    this.coverFraming = (side === "front" ? 1 : -1) * amount;
    this.setTabsForCover(amount);
    this.leaning = 0;
    this.setCamera(0);
    this.layout();
  }

  private setTabsForCover(amount: number) {
    // The reference's closed notebook has no exposed bookmarks. Once the
    // physical cover has passed over them they are sandwiched inside the book;
    // restore the meshes and their DOM symbols only after the cover clears
    // their inner edge. Keeping both layers on one physical state prevents the
    // symbols from appearing to cut through the leather during the opening.
    const tabsVisible = amount < .88;
    this.tabMeshes.forEach(tab => { tab.visible = tabsVisible; });
    this.options.host.dataset.physicalTabs = tabsVisible ? "visible" : "tucked";
  }

  private showClosed() {
    this.options.content.style.opacity = "0";
    this.options.host.dataset.phase = "closed";
    this.options.host.dataset.closedSide = this.closedSide || "front";
    this.hand.visible = this.sheet.visible = false;
    this.ink.forEach(mesh => { mesh.visible = false; mesh.material.map = null; });
    this.render();
  }

  /** Turn the existing rigid covers around their real spine pivots. */
  async setClosed(side: "front" | "back" | null, animate = true) {
    this.finish();
    const operation = ++this.operation;
    const movingSide = side || this.closedSide || "front";
    const closing = side !== null;
    this.closedSide = side;
    this.options.host.dataset.phase = "preparing";
    await this.ready;
    if (this.disposed || operation !== this.operation) return;
    if (animate) {
      await this.loadHands((movingSide === 'front') === closing ? 'left' : 'right');
      const pair = await this.capture();
      if (this.disposed || operation !== this.operation) return;
      this.setInk(pair);
      this.options.content.style.opacity = "0";
      this.options.host.dataset.phase = closing ? "closing" : "reopening";
      await this.animate(1.8, time => {
        const progress = gsap.parseEase("power2.inOut")(THREE.MathUtils.clamp((time - .25) / 1.2, 0, 1));
        this.coverPose(closing ? progress : 1 - progress, movingSide);
        const pivot = movingSide === "front" ? this.left : this.right;
        pivot.updateWorldMatrix(true, false);
        const point = pivot.localToWorld(new THREE.Vector3(movingSide === "front" ? -W : W, -H*.23, movingSide === "front" ? -HINGE-.06 : .06));
        this.book.worldToLocal(point);
        this.poseHand((movingSide === "front") === closing ? "left" : "right",time,point,1.8);
        this.render(gsap.globalTimeline.paused() || !!this.timeline?.paused());
      });
    }
    if (this.disposed || operation !== this.operation) return;
    this.coverPose(closing ? 1 : 0, movingSide);
    if (closing) this.showClosed();
    else { delete this.options.host.dataset.closedSide; this.showHTML(); }
  }

  private poseHand(
    side: "right" | "left",
    time: number,
    point: THREE.Vector3,
    duration: number,
  ) {
    const t = time;
    // All twelve authored finger poses are traversed; transforms stay continuous.
    const progress = Math.max(0, Math.min(1, t / duration));
    const phase = Math.min(11, Math.floor(progress * 12));
    this.handMesh.material.map = this.handTextures[side][phase];
    this.handMesh.material.needsUpdate = true;
    const size = 2.4, height = 3.2;
    const [ax, ay] = grip[side][phase];
    this.handMesh.scale.set(size, height, 1);
    const enter = Math.max(0, 1 - t / 0.4),
      exit = Math.max(0, (t - (duration - 0.35)) / 0.35);
    this.hand.position.set(
      point.x - (ax - 0.5) * size + (side === "right" ? 1 : -1) * enter * 0.6,
      point.y - (0.5 - ay) * height - enter * 2 - exit * 2,
      Math.max(0.34, point.z + 0.12),
    );
    const opacity = Math.max(0, Math.min(1, t / 0.15, 1 - exit));
    this.handMesh.material.opacity = opacity;
    this.hand.visible = opacity > 0;
    this.options.host.dataset.hand = side;
    this.options.host.dataset.handPose = String(phase + 1);
  }
  async turn(backward: boolean, commit: () => void) {
    this.finish();
    const operation = ++this.operation;
    this.options.host.dataset.phase = "preparing";
    await Promise.all([this.ready, this.loadHands(backward ? 'left' : 'right')]);
    if (this.disposed || operation !== this.operation) return;
    const before = await this.capture();
    if (this.disposed || operation !== this.operation) return;
    this.setInk(before);
    this.options.content.style.opacity = "0";
    this.render();
    commit();
    this.layout();
    const after = await this.capture();
    if (this.disposed || operation !== this.operation) return;
    const front = backward ? after[1] : before[1];
    const back = backward ? before[0] : after[0];
    const xScale = (W - 0.06) / (W - 0.13),
      yScale = (H - 0.06) / (H - 0.14);
    if (front) {
      const face = front.clone();
      face.repeat.set(xScale, yScale);
      face.offset.set((1 - xScale) / 2, (1 - yScale) / 2);
      face.needsUpdate = true;
      this.snapshots.push(face);
      this.pageFront.material.map = face;
    } else this.pageFront.material.map = null;
    this.pageFront.material.color.set(front ? 0xffffff : 0xf1ecde);
    this.pageFront.material.needsUpdate = true;
    if (back) {
      const reverse = back.clone();
      reverse.repeat.set(-xScale, yScale);
      reverse.offset.set((1 + xScale) / 2, (1 - yScale) / 2);
      reverse.needsUpdate = true;
      this.snapshots.push(reverse);
      this.pageBack.material.map = reverse;
    } else this.pageBack.material.map = null;
    this.pageBack.material.color.set(back ? 0xffffff : 0xf1ecde);
    this.pageBack.material.needsUpdate = true;
    this.setInk(backward ? [after[0], before[1]] : [before[0], after[1]]);
    this.sheet.visible = true;
    this.options.host.dataset.turnTime = "0";
    this.options.host.dataset.phase = "turning";
    this.options.host.dataset.direction = backward ? "backward" : "forward";
    await this.animate(1.95, (time) => {
      const t = time;
      this.options.host.dataset.turnTime = String(t);
      const p = gsap.parseEase("power1.inOut")(
        THREE.MathUtils.clamp((t - 0.36) / 1.12, 0, 1),
      );
      const angle = backward ? Math.PI * (1 - p) : Math.PI * p;
      this.turnAngle = -angle;
      // Integrate a changing tangent along the sheet. Arc length stays fixed,
      // unlike scaling a rigid plane to fake a curl. Tangents stay in [0, PI],
      // so the stock never bends down through either underlying page block.
      const points: THREE.Vector3[] = [];
      let x = 0.03 * Math.cos(angle),
        z = 0;
      for (let j = 0; j <= 48; j++) {
        points.push(new THREE.Vector3(x, 0, z));
        const tangent = THREE.MathUtils.clamp(
          angle + Math.sin(p * Math.PI) * Math.PI * ((j + 0.5) / 48 - 0.5),
          0,
          Math.PI,
        );
        x += (Math.cos(tangent) * (W - 0.06)) / 48;
        z += (Math.sin(tangent) * (W - 0.06)) / 48;
      }
      const positions = this.pageFront.geometry.attributes.position,
        uv = this.pageFront.geometry.attributes.uv;
      for (let i = 0; i < positions.count; i++) {
        const point = points[Math.round(uv.getX(i) * 48)];
        positions.setX(i, point.x);
        positions.setZ(i, point.z);
      }
      positions.needsUpdate = true;
      this.pageFront.geometry.computeVertexNormals();
      this.sheet.updateMatrixWorld(true);
      const last = points[48];
      const corner = this.sheet.localToWorld(
        new THREE.Vector3(last.x, -H * 0.23, last.z),
      );
      this.book.worldToLocal(corner);
      this.options.host.dataset.paperClearance = String(
        Math.min(...points.map((point) => point.z)) +
          this.sheet.position.z -
          (PAPER + 0.014),
      );
      // Test the actual rendered ink surfaces, not just the lower paper block.
      const highestInk = Math.max(
        ...this.ink.map((mesh, index) => {
          const vertices = mesh.geometry.attributes.position;
          let highest = -Infinity;
          for (let i = 0; i < vertices.count; i++)
            highest = Math.max(highest, vertices.getZ(i));
          return highest + mesh.position.z + (index === 0 ? HINGE : 0);
        }),
      );
      this.options.host.dataset.inkClearance = String(
        Math.min(...points.map((point) => point.z)) +
          this.sheet.position.z -
          highestInk,
      );
      this.poseHand(backward ? "left" : "right", t, corner, 1.95);
      this.render(gsap.globalTimeline.paused() || !!this.timeline?.paused());
    });
    if (this.disposed || operation !== this.operation) return;
    this.options.content
      .querySelectorAll<HTMLElement>(".paper-page")
      .forEach((p) => {
        p.scrollTop = 0;
      });
    this.options.content.scrollTop = 0;
    this.layout();
    this.showHTML();
  }
  dispose() {
    this.disposed = true;
    document.removeEventListener("visibilitychange", this.visibility);
    this.calibration?.dispose();
    this.operation++;
    this.timeline?.kill();
    this.resolveAnimation?.();
    this.observer.disconnect();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    this.cache.forEach((pair) => pair.forEach((t) => t?.dispose()));
    this.cache.clear();
    [...this.assets, ...this.snapshots].forEach((t) => t.dispose());
    this.renderer.domElement.removeEventListener(
      "webglcontextlost",
      this.contextLost,
    );
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
