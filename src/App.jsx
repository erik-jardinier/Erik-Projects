import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

const PROJECTS = [
  {
    id: 1, index: "01",
    title: "Boarding House",
    category: "UI/UX",
    year: "2020-2021", type: "Design & Construction III", num: "#01",
    accent: "#c8a97e",
    description: "A residential and commercial building on a corner lot at Kantstrasse 100 / Bleibtreustrasse 50a, covering 621m². Targeting students with good transport connections. Balconies integrated into the facade through continuous horizontal cornices, floor-to-ceiling windows, and a courtyard with flower beds.",
    tags: ["Residential", "Mixed-Use", "Corner Lot", "621m²"],
    professor: "Prof. Jan Kleihues", semester: "WiSe 2020/21",
    folder: "01_boarding_house",
    images: ["00","01","02","03","04"],
  },
  {
    id: 2, index: "02",
    title: "Gutenberg Museum",
    category: "Architecture",
    year: "2022", type: "TRU Architekten — Internship", num: "#02",
    accent: "#8fa8c8",
    description: "Competition entry for the new Gutenberg Museum in Mainz's Old Town. The Gutenberg Plateau — a single-story level with a large outdoor staircase — links the historic Roman Emperor building with the new structure.",
    tags: ["Museum", "Competition", "Urban Design", "Historic Context"],
    client: "City of Mainz",
    team: "Sandra Töpfer, Karsten Ruf, Karolina Kotyrba, Lara Kienold, Erik Gärtner",
    folder: "02_gutenberg",
    images: ["00","01","02","04"],
  },
  {
    id: 3, index: "03",
    title: "Innovation Forum",
    category: "Urban Design",
    year: "2023-2024", type: "Interflex Seminar", num: "#03",
    accent: "#9eb89e",
    description: "A versatile innovation site at the PCK refinery for research, development and renewable energy. A continuous grid allows controlled yet flexible building structures arranged around a central forum courtyard.",
    tags: ["Innovation", "Renewable Energy", "Masterplan", "Adaptive Grid"],
    team: "Mathis Winkels, Vladislav Sirotin, Jannik Schlingemann, Erik Gärtner",
    folder: "03_innovation",
    images: ["07","08","00","01","02"],
  },
  {
    id: 4, index: "04",
    title: "Campus di Astrofisica",
    category: "Architecture",
    year: "2024", type: "Master I — Trieste", num: "#04",
    accent: "#b89eb8",
    description: "An astrophysics campus on a former industrial site. The Gasometro from the 1950s is repurposed as a planetarium. A new exhibition tower features a projection sphere displaying animations.",
    tags: ["Campus", "Planetarium", "Adaptive Reuse", "Exhibition Tower"],
    exhibition: "Civico Museo Sartorio, Trieste 2024",
    folder: "04_campus",
    images: ["09","10","07","06","01","02"],
  },
  {
    id: 5, index: "05",
    title: "Archive",
    category: "Graphic Design",
    year: "2024", type: "Album Cover Art", num: "#05",
    accent: "#d4a0a0",
    description: "Album cover for Kimany Thayano's 'Archive,' spanning songs from 2020–2024. Concept draws from Raf Simons' archive books and Redux publication. Minimalist layout referencing file-like cover design.",
    tags: ["Graphic Design", "Typography", "Music", "Minimalism"],
    client: "Kimany Thayano",
    folder: "05_album",
    images: ["00","01","02","03"],
  },
  {
    id: 6, index: "06",
    title: "Échelle_25",
    category: "Product Design",
    year: "2025", type: "Industrial Lamp Design", num: "#06",
    accent: "#c8c09e",
    description: "An industrial lamp where sockets are highlighted rather than concealed. Three light sources arranged asymmetrically. Conduit pipe rungs guide cables to a ceiling canopy.",
    tags: ["Product Design", "Lighting", "Industrial", "Asymmetry"],
    folder: "06_echelle",
    images: ["00","01","02"],
  },
  {
    id: 7, index: "07",
    title: "ANGST Add-Ons",
    category: "Product Design",
    year: "2023", type: "AirPods Max Accessories", num: "#07",
    accent: "#a0b8c8",
    description: "Conceptual add-ons for Apple's AirPods Max. Typography draws from Aphex Twin's visual language. 'ANGST' is designed to carry a calming, rhythmic quality — turning fear into tranquility through music.",
    tags: ["Product Design", "Typography", "Concept", "Apple"],
    folder: "07_angst",
    images: ["00","01","02","03","04","05"],
  },
  {
    id: 8, index: "08",
    title: "AI Image Gallery",
    category: "Digital Art",
    year: "2024", type: "AI-Generated Series", num: "#08",
    accent: "#b0a0d4",
    description: "An AI image gallery explaining the creative process from beginning to end. A series exploring the intersection of artificial intelligence, fashion, and organic form — from deer studies to sculptural body works.",
    tags: ["AI", "Digital Art", "Fashion", "Generative"],
    folder: "08_ai_gallery",
    images: ["00","01","02","03","04","05","06","07","08"],
  },
  {
    id: 9, index: "09",
    title: "GUCCI CRUISE 26",
    category: "Fashion",
    year: "2026", type: "GUCCICORE — Fashion Show", num: "#09",
    accent: "#c8a060",
    description: "The fashion show opened with a montage video that filled the screens of Times Square, exploring the idea of Gucci as an ethos, a lifestyle, an identity and an aesthetic universe. Set May 16th in New York City.",
    tags: ["Fashion", "Gucci", "NYC", "Times Square", "Show"],
    folder: "09_gucci_cruise",
    images: ["00","01","02","03"],
    video: "GC26-GUCCICORE.MP4",
  },
  {
    id: 10, index: "10",
    title: "GUCCI MEMORIA",
    category: "Exhibition",
    year: "2026", type: "Exhibition & Tapestry", num: "#10",
    accent: "#d4b896",
    description: "On display April 21–26, 2026 at Chiostri di San Simpliciano, Milano. Curated by Demna. Exhibition and tapestry artworks by Sub Global and Erik Gärtner.",
    tags: ["Exhibition", "Gucci", "Milano", "Tapestry", "Demna"],
    folder: "10_gucci_memoria",
    images: ["00","01","02","03","04","05","06","07","08","09","10"],
  },
];

// Build a flat list of all individual images as floating cards
// Each project contributes multiple cards scattered in 3D space
function buildCardList() {
  const cards = [];
  PROJECTS.forEach((proj) => {
    proj.images.forEach((imgIdx, i) => {
      cards.push({
        projectId: proj.id,
        project: proj,
        imgIdx,
        cardKey: `${proj.id}-${imgIdx}`,
      });
    });
  });
  return cards;
}

const ALL_CARDS = buildCardList();

// ─── PARTICLES ────────────────────────────────────────────────────────────────
function Particles() {
  const ref = useRef();
  const count = 80;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return arr;
  }, []);
  const speeds = useMemo(() => Array.from({ length: count }, () => ({
    vx: (Math.random() - 0.5) * 0.003,
    vy: (Math.random() - 0.5) * 0.002,
    vz: (Math.random() - 0.5) * 0.003,
  })), []);
  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += speeds[i].vx;
      pos[i * 3 + 1] += speeds[i].vy;
      pos[i * 3 + 2] += speeds[i].vz;
      if (pos[i * 3] > 30) pos[i * 3] = -30;
      if (pos[i * 3] < -30) pos[i * 3] = 30;
      if (pos[i * 3 + 1] > 15) pos[i * 3 + 1] = -15;
      if (pos[i * 3 + 1] < -15) pos[i * 3 + 1] = 15;
      if (pos[i * 3 + 2] > 30) pos[i * 3 + 2] = -30;
      if (pos[i * 3 + 2] < -30) pos[i * 3 + 2] = 30;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#ffffff" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// ─── SINGLE FLOATING IMAGE CARD ───────────────────────────────────────────────
function FloatingCard({ cardData, cardIndex, totalCards, activeProjectId, setActiveProject }) {
  const ref = useRef();
  const hoveredRef = useRef(false);
  const { project, imgIdx } = cardData;
  const isActiveProject = activeProjectId === project.id;
  const isAnyActive = activeProjectId !== null;
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      `/projects/${project.folder}/${imgIdx}.jpg`,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => {} // silently ignore errors
    );
  }, [project.folder, imgIdx]);

  // Random stable position spread across wide 3D space
  const basePos = useMemo(() => {
    const seed = cardIndex * 137.508;
    const r = () => (Math.sin(seed * (cardIndex + 1.3)) * 0.5 + 0.5);
    return new THREE.Vector3(
      (r() - 0.5) * 28,
      (Math.sin(seed * 0.7) * 0.5) * 10,
      (r() * 0.5 - 0.5) * 28
    );
  }, [cardIndex]);

  const baseRotY = useMemo(() => (cardIndex * 0.618) * Math.PI * 2, [cardIndex]);

  const aspect = useMemo(() => {
    if (!texture) return 1.0;
    const w = texture.image?.width || 1;
    const h = texture.image?.height || 1;
    return Math.min(Math.max(w / h, 0.5), 2.0);
  }, [texture]);

  // Random card size variation
  const cardW = useMemo(() => 1.8 + (cardIndex % 3) * 0.5, [cardIndex]);
  const cardH = cardW / aspect;

  // Slow drift
  const driftOffset = useMemo(() => cardIndex * 0.4, [cardIndex]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const drift = Math.sin(t * 0.3 + driftOffset) * 0.15;

    if (isActiveProject) {
      // Fan out the cards of the active project nicely
      const siblingIdx = project.images.indexOf(imgIdx);
      const total = project.images.length;
      const spread = (siblingIdx - (total - 1) / 2) * 3.5;
      const target = new THREE.Vector3(spread, 0, 2);
      ref.current.position.lerp(target, 0.06);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, 0, 0.06);
    } else if (isAnyActive) {
      const pushed = basePos.clone().multiplyScalar(1.5);
      pushed.y += drift;
      ref.current.position.lerp(pushed, 0.04);
    } else {
      const floatPos = basePos.clone();
      floatPos.y += drift;
      ref.current.position.lerp(floatPos, 0.04);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, baseRotY, 0.01);
    }

    const targetScale = isActiveProject ? 1.1 : hoveredRef.current ? 1.06 : 1.0;
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        setActiveProject(isActiveProject ? null : project);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        hoveredRef.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hoveredRef.current = false;
        document.body.style.cursor = "default";
      }}
    >
      {texture && (
      <mesh>
        <planeGeometry args={[cardW, cardH]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      )}
      {!texture && (
      <mesh>
        <planeGeometry args={[cardW, cardH]} />
        <meshBasicMaterial color="#111111" side={THREE.DoubleSide} />
      </mesh>
      )}
      {/* thin accent line top */}
      <mesh position={[0, cardH / 2 + 0.02, 0.001]}>
        <planeGeometry args={[cardW, 0.04]} />
        <meshBasicMaterial color={project.accent} transparent opacity={isActiveProject ? 1 : 0.6} />
      </mesh>
    </group>
  );
}

function FloatingCardSuspense(props) {
  return <FloatingCard {...props} />;
}

// ─── CAMERA RIG ───────────────────────────────────────────────────────────────
function CameraRig({ activeProject }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 16));
  useEffect(() => {
    target.current.set(...(activeProject ? [0, 0, 9] : [0, 0, 16]));
  }, [activeProject]);
  useFrame(() => {
    camera.position.lerp(target.current, 0.045);
    if (!activeProject) camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── SCENE ────────────────────────────────────────────────────────────────────
function Scene({ activeProject, setActiveProject }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <Particles />
      {ALL_CARDS.map((card, i) => (
        <FloatingCardSuspense
          key={card.cardKey}
          cardData={card}
          cardIndex={i}
          totalCards={ALL_CARDS.length}
          activeProjectId={activeProject?.id ?? null}
          setActiveProject={setActiveProject}
        />
      ))}
      <CameraRig activeProject={activeProject} />
      <OrbitControls
        enabled={!activeProject}
        enableDamping dampingFactor={0.08}
        rotateSpeed={0.5} zoomSpeed={0.8}
        minDistance={6} maxDistance={30}
        minPolarAngle={Math.PI / 5} maxPolarAngle={Math.PI / 1.5}
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      />
    </>
  );
}

// ─── DETAIL OVERLAY (full screen like reference) ──────────────────────────────
function ProjectDetail({ project, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 40); return () => clearTimeout(t); }, []);
  const handleClose = () => { setVisible(false); setTimeout(onClose, 400); };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(3,3,3,0.97)",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.4s ease",
      overflowY: "auto",
      fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "24px 40px", borderBottom: "1px solid #111",
        position: "sticky", top: 0, background: "rgba(3,3,3,0.97)", zIndex: 10,
      }}>
        <span style={{ fontSize: 10, letterSpacing: "0.3em", color: "#444", textTransform: "uppercase" }}>
          PORTFOLIO
        </span>
        <button onClick={handleClose} style={{
          background: "none", border: "1px solid #222", color: "#666",
          fontSize: 10, letterSpacing: "0.2em", cursor: "pointer", padding: "8px 18px",
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          textTransform: "uppercase", transition: "all 0.2s",
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.color = "#fff"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#666"; }}
        >✕ CLOSE</button>
      </div>

      <div style={{ padding: "48px 40px 80px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Category pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          border: `1px solid ${project.accent}66`, padding: "5px 14px",
          borderRadius: 20, marginBottom: 24,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: project.accent }} />
          <span style={{ fontSize: 11, letterSpacing: "0.15em", color: project.accent, textTransform: "uppercase" }}>
            {project.category}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 700,
          color: "#fff", margin: "0 0 20px", lineHeight: 1.05, letterSpacing: "-0.01em",
        }}>{project.title}</h1>

        {/* Meta row */}
        <div style={{ display: "flex", gap: 32, marginBottom: 40, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#444" }}>{project.year}</span>
          <div style={{ width: 1, height: 14, background: "#222" }} />
          <span style={{ fontSize: 12, color: "#444" }}>{project.type}</span>
          <div style={{ width: 1, height: 14, background: "#222" }} />
          <span style={{ fontSize: 12, color: "#444" }}>{project.num}</span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 15, lineHeight: 1.8, color: "#666",
          maxWidth: 520, marginBottom: 56,
        }}>{project.description}</p>

        {/* Image grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 3,
        }}>
          {project.images.map((imgIdx, i) => (
            <div key={i} style={{
              aspectRatio: i === 0 ? "2/1" : "3/2",
              gridColumn: i === 0 ? "1 / -1" : "auto",
              overflow: "hidden",
              background: "#0a0a0a",
              cursor: "pointer",
            }}
              onMouseOver={e => e.currentTarget.firstChild.style.transform = "scale(1.03)"}
              onMouseOut={e => e.currentTarget.firstChild.style.transform = "scale(1)"}
            >
              <img
                src={`/projects/${project.folder}/${imgIdx}.jpg`}
                alt=""
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  transition: "transform 0.5s ease", display: "block",
                }}
              />
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 40 }}>
          {project.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, letterSpacing: "0.18em", color: project.accent,
              border: `1px solid ${project.accent}44`,
              padding: "5px 12px", textTransform: "uppercase",
            }}>{tag}</span>
          ))}
        </div>

        {/* Team / extra info */}
        {project.team && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#333", marginBottom: 8, textTransform: "uppercase" }}>Team</div>
            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>{project.team}</div>
          </div>
        )}
        {project.professor && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#333", marginBottom: 8, textTransform: "uppercase" }}>Professor</div>
            <div style={{ fontSize: 12, color: "#555" }}>{project.professor} · {project.semester}</div>
          </div>
        )}
        {project.client && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#333", marginBottom: 8, textTransform: "uppercase" }}>Client</div>
            <div style={{ fontSize: 12, color: "#555" }}>{project.client}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeProject, setActiveProject] = useState(null);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#030303" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #030303; overflow: hidden; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; }
      `}</style>

      {/* Name — top left */}
      <div style={{ position: "fixed", top: 28, left: 32, zIndex: 60 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.32em", color: "#2a2a2a", marginBottom: 5, textTransform: "uppercase" }}>Portfolio</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "0.12em" }}>ERIK GÄRTNER</div>
      </div>

      {/* Hint — bottom center */}
      {!activeProject && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          zIndex: 60, fontSize: 8, letterSpacing: "0.3em", color: "#1e1e1e", textTransform: "uppercase",
        }}>
          CLICK ANY CARD TO EXPLORE
        </div>
      )}

      {/* Project index — bottom left */}
      <div style={{ position: "fixed", bottom: 28, left: 32, zIndex: 60 }}>
        {PROJECTS.map(p => (
          <button key={p.id}
            onClick={() => setActiveProject(activeProject?.id === p.id ? null : p)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "none", border: "none", cursor: "pointer",
              padding: "3px 0", textAlign: "left",
            }}>
            <div style={{
              height: 1,
              width: activeProject?.id === p.id ? 22 : 14,
              background: activeProject?.id === p.id ? p.accent : "#1e1e1e",
              transition: "all 0.3s",
            }} />
            <span style={{
              fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
              color: activeProject?.id === p.id ? p.accent : "#222",
              transition: "color 0.3s",
            }}>{p.index} {p.title}</span>
          </button>
        ))}
      </div>

      {/* Contact — bottom right */}
      <div style={{ position: "fixed", bottom: 28, right: 32, zIndex: 60, textAlign: "right" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.12em", color: "#1e1e1e", marginBottom: 3 }}>erikgaertner99@gmail.com</div>
        <div style={{ fontSize: 8, letterSpacing: "0.12em", color: "#1e1e1e" }}>+49 176 22150639</div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 16], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ position: "absolute", inset: 0, background: "#030303" }}
        onPointerMissed={() => setActiveProject(null)}
      >
        <Scene activeProject={activeProject} setActiveProject={setActiveProject} />
      </Canvas>

      {/* Full screen detail overlay */}
      {activeProject && (
        <ProjectDetail project={activeProject} onClose={() => setActiveProject(null)} />
      )}
    </div>
  );
}
