import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";

// ─── PROJECT DATA ─────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: 1, index: "01",
    title: "BOARDING HOUSE",
    subtitle: "Residential & Commercial",
    category: "DESIGN & CONSTRUCTION III",
    location: "Berlin, Charlottenburg", country: "Germany", year: "2020 – 2021",
    accent: "#c8a97e",
    description: "A residential and commercial building on a corner lot at Kantstrasse 100 / Bleibtreustrasse 50a, covering 621m². Targeting students with good transport connections. Balconies integrated into the facade through continuous horizontal cornices, floor-to-ceiling windows, and a courtyard with flower beds.",
    tags: ["Residential", "Mixed-Use", "Corner Lot", "621m²"],
    professor: "Prof. Jan Kleihues", semester: "WiSe 2020/21",
    folder: "01_boarding_house", heroImg: "00",
    images: ["00","01","02","03","04"],
  },
  {
    id: 2, index: "02",
    title: "GUTENBERG MUSEUM",
    subtitle: "Spaces for Art",
    category: "TRU ARCHITEKTEN — INTERNSHIP",
    location: "Mainz", country: "Germany", year: "2022",
    accent: "#8fa8c8",
    description: "Competition entry for the new Gutenberg Museum in Mainz's Old Town. The design introduces the Gutenberg Plateau — a single-story level with a large outdoor staircase linking the historic Roman Emperor building with the new structure.",
    tags: ["Museum", "Competition", "Urban Design", "Historic Context"],
    client: "City of Mainz",
    team: "Sandra Töpfer, Karsten Ruf, Karolina Kotyrba, Lara Kienold, Erik Gärtner",
    folder: "02_gutenberg", heroImg: "00",
    images: ["00","01","02","04"],
  },
  {
    id: 3, index: "03",
    title: "INNOVATION FORUM",
    subtitle: "PCK Refinery Transformation",
    category: "INTERFLEX SEMINAR",
    location: "Schwedt / Oder", country: "Germany", year: "2023 – 2024",
    accent: "#9eb89e",
    description: "A versatile innovation site at the PCK refinery for research, development and renewable energy production. A continuous grid allows controlled yet flexible building structures arranged around a central forum courtyard.",
    tags: ["Innovation", "Renewable Energy", "Masterplan", "Adaptive Grid"],
    team: "Mathis Winkels, Vladislav Sirotin, Jannik Schlingemann, Erik Gärtner",
    folder: "03_innovation", heroImg: "07",
    images: ["07","08","00","01","02"],
  },
  {
    id: 4, index: "04",
    title: "CAMPUS DI ASTROFISICA",
    subtitle: "Margeritha Hack Campus",
    category: "MASTER I — TRIESTE",
    location: "Trieste, Cantieri San Marco", country: "Italy", year: "2024",
    accent: "#b89eb8",
    description: "An astrophysics campus on a former industrial site. The Gasometro from the 1950s is repurposed as a planetarium. A new exhibition tower features a projection sphere displaying animations.",
    tags: ["Campus", "Planetarium", "Adaptive Reuse", "Exhibition Tower"],
    exhibition: "Civico Museo Sartorio, Trieste 2024",
    folder: "04_campus", heroImg: "09",
    images: ["09","10","07","06","01","02"],
  },
  {
    id: 5, index: "05",
    title: "ARCHIVE",
    subtitle: "Album Cover Art",
    category: "NON-ARCH. — GRAPHIC DESIGN",
    location: "Berlin", country: "Germany", year: "2024",
    accent: "#d4a0a0",
    description: "Album cover for Kimany Thayano's 'Archive,' spanning songs from 2020–2024. Concept draws from Raf Simons' archive books and Redux publication. Minimalist layout referencing file-like cover design.",
    tags: ["Graphic Design", "Typography", "Music", "Minimalism"],
    client: "Kimany Thayano",
    folder: "05_album", heroImg: "00",
    images: ["00","01","02"],
  },
  {
    id: 6, index: "06",
    title: "ÉCHELLE_25",
    subtitle: "Industrial Lamp Design",
    category: "NON-ARCH. — PRODUCT DESIGN",
    location: "Berlin", country: "Germany", year: "2025",
    accent: "#c8c09e",
    description: "An industrial lamp where sockets are highlighted rather than concealed. Three light sources arranged asymmetrically. Conduit pipe rungs guide cables to a ceiling canopy.",
    tags: ["Product Design", "Lighting", "Industrial", "Asymmetry"],
    folder: "06_echelle", heroImg: "00",
    images: ["00","01","02","03","04"],
  },
  {
    id: 7, index: "07",
    title: "ANGST ADD-ONS",
    subtitle: "AirPods Max Accessories",
    category: "NON-ARCH. — PRODUCT DESIGN",
    location: "Berlin", country: "Germany", year: "2023",
    accent: "#a0b8c8",
    description: "Conceptual add-ons for Apple's AirPods Max. Typography draws from Aphex Twin's visual language. 'ANGST' is designed to carry a calming, rhythmic quality — turning fear into tranquility through music.",
    tags: ["Product Design", "Typography", "Concept", "Apple"],
    folder: "07_angst", heroImg: "00",
    images: ["00","01","02","03"],
  },
];

// ─── PARTICLES ────────────────────────────────────────────────────────────────

function Particles() {
  const ref = useRef();
  const count = 80;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, []);

  const speeds = useMemo(() =>
    Array.from({ length: count }, () => ({
      vx: (Math.random() - 0.5) * 0.004,
      vy: (Math.random() - 0.5) * 0.003,
      vz: (Math.random() - 0.5) * 0.004,
    })), []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] += speeds[i].vx;
      pos[i * 3 + 1] += speeds[i].vy;
      pos[i * 3 + 2] += speeds[i].vz;
      // wrap around
      if (pos[i * 3 + 0] > 20) pos[i * 3 + 0] = -20;
      if (pos[i * 3 + 0] < -20) pos[i * 3 + 0] = 20;
      if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10;
      if (pos[i * 3 + 1] < -10) pos[i * 3 + 1] = 10;
      if (pos[i * 3 + 2] > 20) pos[i * 3 + 2] = -20;
      if (pos[i * 3 + 2] < -20) pos[i * 3 + 2] = 20;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#ffffff"
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

function CardInner({ project, index, total, activeId, setActiveId }) {
  const ref = useRef();
  const isActive = activeId === project.id;
  const isAnyActive = activeId !== null;
  const hoveredRef = useRef(false);

  const heroPath = `/projects/${project.folder}/${project.heroImg}.jpg`;
  const texture = useTexture(heroPath);
  texture.colorSpace = THREE.SRGBColorSpace;

  const aspect = useMemo(() => {
    const w = texture.image?.width || 1;
    const h = texture.image?.height || 1;
    return Math.min(Math.max(w / h, 0.55), 1.8);
  }, [texture]);

  const CARD_W = 2.8;
  const CARD_H = CARD_W / aspect;

  const targetPos = useMemo(() => {
    const angle = (index / total) * Math.PI * 2;
    const radius = 5.5;
    return new THREE.Vector3(
      Math.sin(angle) * radius,
      (index % 3) * 0.9 - 0.9,
      Math.cos(angle) * radius
    );
  }, [index, total]);

  const scaleTarget = useRef(new THREE.Vector3(1, 1, 1));

  useFrame(() => {
    if (!ref.current) return;
    if (isActive) {
      ref.current.position.lerp(new THREE.Vector3(0, 0, 4), 0.07);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, 0, 0.07);
      scaleTarget.current.setScalar(1.1);
    } else if (isAnyActive) {
      ref.current.position.lerp(targetPos.clone().multiplyScalar(1.6), 0.06);
      scaleTarget.current.setScalar(0.8);
    } else {
      ref.current.position.lerp(targetPos, 0.05);
      ref.current.rotation.y += 0.003;
      scaleTarget.current.setScalar(hoveredRef.current ? 1.08 : 1.0);
    }
    ref.current.scale.lerp(scaleTarget.current, 0.1);
  });

  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        setActiveId(isActive ? null : project.id);
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
      {/* Image */}
      <mesh>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      {/* Accent top bar */}
      <mesh position={[0, CARD_H / 2 + 0.03, 0.001]}>
        <planeGeometry args={[CARD_W, 0.06]} />
        <meshBasicMaterial color={project.accent} />
      </mesh>
      {/* Glow border */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[CARD_W + 0.05, CARD_H + 0.05]} />
        <meshBasicMaterial color={project.accent} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function Card(props) {
  return (
    <Suspense fallback={null}>
      <CardInner {...props} />
    </Suspense>
  );
}

// ─── CAMERA RIG ───────────────────────────────────────────────────────────────

function CameraRig({ activeId }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 1.5, 13));

  useEffect(() => {
    target.current.set(...(activeId !== null ? [0, 0.3, 6.5] : [0, 1.5, 13]));
  }, [activeId]);

  useFrame(() => {
    camera.position.lerp(target.current, 0.045);
    if (activeId === null) camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── IMAGE GALLERY ────────────────────────────────────────────────────────────

function ImageGallery({ project }) {
  const [active, setActive] = useState(0);
  const imgs = project.images;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        width: "100%", aspectRatio: "3/2", overflow: "hidden",
        background: "#080808", marginBottom: 8, position: "relative",
      }}>
        <img
          src={`/projects/${project.folder}/${imgs[active]}.jpg`}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s" }}
        />
        <div style={{
          position: "absolute", bottom: 8, right: 10,
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          fontSize: 9, letterSpacing: "0.2em", color: "#444",
        }}>
          {String(active + 1).padStart(2, "0")} / {String(imgs.length).padStart(2, "0")}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
        {imgs.map((img, i) => (
          <div key={i} onClick={() => setActive(i)} style={{
            flexShrink: 0, width: 52, height: 40, overflow: "hidden",
            cursor: "pointer",
            border: `1px solid ${i === active ? project.accent : "transparent"}`,
            opacity: i === active ? 1 : 0.4, transition: "all 0.2s",
          }}>
            <img src={`/projects/${project.folder}/${img}.jpg`} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROJECT DETAIL PANEL ─────────────────────────────────────────────────────

function ProjectDetail({ project, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 420);
  };

  const meta = [
    ["CATEGORY", project.category],
    ["YEAR", project.year],
    ["LOCATION", project.location],
    ["COUNTRY", project.country],
    ...(project.professor ? [["PROFESSOR", project.professor]] : []),
    ...(project.client ? [["CLIENT", project.client]] : []),
    ...(project.semester ? [["SEMESTER", project.semester]] : []),
    ...(project.exhibition ? [["EXHIBITION", project.exhibition]] : []),
  ];

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "flex-end",
      pointerEvents: "none", zIndex: 100,
    }}>
      <div style={{
        width: "min(480px, 88vw)", height: "100vh",
        background: "rgba(4,4,4,0.97)",
        borderLeft: `1px solid ${project.accent}33`,
        padding: "56px 40px 40px",
        overflowY: "auto", pointerEvents: "all",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
        boxSizing: "border-box",
      }}>
        <button onClick={handleClose} style={{
          position: "absolute", top: 22, right: 22,
          background: "none", border: "none", color: "#444",
          fontSize: 18, cursor: "pointer",
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          padding: "8px 12px", transition: "color 0.2s",
        }}
          onMouseOver={e => e.target.style.color = "#fff"}
          onMouseOut={e => e.target.style.color = "#444"}
        >✕</button>

        <div style={{
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          fontSize: 10, letterSpacing: "0.3em", color: project.accent, marginBottom: 6,
        }}>{project.index} / 07</div>
        <div style={{
          height: 1, width: "55%", marginBottom: 26,
          background: `linear-gradient(90deg, ${project.accent}, transparent)`,
        }} />

        <h2 style={{
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          fontSize: 26, fontWeight: 700, color: "#fff",
          margin: "0 0 3px", letterSpacing: "0.06em", lineHeight: 1.15,
        }}>{project.title}</h2>
        <div style={{
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          fontSize: 11, color: "#555", letterSpacing: "0.18em",
          marginBottom: 26, textTransform: "uppercase",
        }}>{project.subtitle}</div>

        <ImageGallery project={project} />

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "16px 12px", marginBottom: 26,
          padding: "18px", border: "1px solid #111", background: "#060606",
        }}>
          {meta.map(([label, val]) => (
            <div key={label}>
              <div style={{
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                fontSize: 8, letterSpacing: "0.28em", color: "#333",
                marginBottom: 4, textTransform: "uppercase",
              }}>{label}</div>
              <div style={{
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                fontSize: 11, color: "#bbb", lineHeight: 1.5,
              }}>{val}</div>
            </div>
          ))}
        </div>

        <p style={{
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          fontSize: 13, lineHeight: 1.85, color: "#666", margin: "0 0 26px",
        }}>{project.description}</p>

        {project.team && (
          <div style={{ marginBottom: 26 }}>
            <div style={{
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
              fontSize: 8, letterSpacing: "0.28em", color: "#333",
              marginBottom: 6, textTransform: "uppercase",
            }}>TEAM</div>
            <div style={{
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
              fontSize: 11, color: "#555", lineHeight: 1.7,
            }}>{project.team}</div>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {project.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
              fontSize: 9, letterSpacing: "0.18em", color: project.accent,
              border: `1px solid ${project.accent}44`,
              padding: "4px 9px", textTransform: "uppercase",
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCENE ────────────────────────────────────────────────────────────────────

function Scene({ activeId, setActiveId }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <Particles />
      {PROJECTS.map((p, i) => (
        <Card key={p.id} project={p} index={i} total={PROJECTS.length}
          activeId={activeId} setActiveId={setActiveId} />
      ))}
      <CameraRig activeId={activeId} />
      <OrbitControls
        enabled={activeId === null}
        enableDamping dampingFactor={0.08}
        rotateSpeed={0.55} zoomSpeed={0.9} panSpeed={0.5}
        minDistance={5} maxDistance={22}
        minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.6}
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      />
    </>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeId, setActiveId] = useState(null);
  const activeProject = PROJECTS.find(p => p.id === activeId) || null;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#030303" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #030303; overflow: hidden; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px; }
      `}</style>

      {/* Name top left */}
      <div style={{
        position: "fixed", top: 28, left: 32, zIndex: 60,
      }}>
        <div style={{
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          fontSize: 8, letterSpacing: "0.32em", color: "#333",
          marginBottom: 5, textTransform: "uppercase",
        }}>Portfolio</div>
        <div style={{
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "0.12em",
        }}>ERIK GÄRTNER</div>
      </div>

      {/* Hint top right */}
      <div style={{
        position: "fixed", top: 28, right: activeProject ? 504 : 32,
        zIndex: 60, textAlign: "right",
        transition: "right 0.45s cubic-bezier(0.16,1,0.3,1)",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: 8, letterSpacing: "0.25em", color: "#222",
        textTransform: "uppercase",
      }}>
        {activeProject ? "CLICK ANYWHERE TO CLOSE" : "DRAG · SCROLL · CLICK"}
      </div>

      {/* Project index bottom left */}
      <div style={{
        position: "fixed", bottom: 28, left: 32, zIndex: 60,
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        {PROJECTS.map(p => (
          <button key={p.id} onClick={() => setActiveId(activeId === p.id ? null : p.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              textAlign: "left", padding: "2px 0", display: "flex",
              alignItems: "center", gap: 10,
            }}>
            <div style={{
              width: 16, height: 1,
              background: activeId === p.id ? p.accent : "#222",
              transition: "all 0.3s",
              ...(activeId === p.id ? { width: 24 } : {}),
            }} />
            <span style={{
              fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
              fontSize: 8, letterSpacing: "0.2em",
              color: activeId === p.id ? p.accent : "#2a2a2a",
              textTransform: "uppercase", transition: "color 0.3s",
            }}>{p.index} {p.title}</span>
          </button>
        ))}
      </div>

      {/* Contact bottom right */}
      <div style={{
        position: "fixed", bottom: 28, right: activeProject ? 504 : 32,
        zIndex: 60, textAlign: "right",
        transition: "right 0.45s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {["erikgaertner99@gmail.com", "+49 176 22150639"].map(c => (
          <div key={c} style={{
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: 8, letterSpacing: "0.12em", color: "#222", marginBottom: 3,
          }}>{c}</div>
        ))}
      </div>

      {/* Canvas — full screen */}
      <Canvas
        camera={{ position: [0, 1.5, 13], fov: 48 }}
        gl={{ antialias: true, alpha: false }}
        style={{ position: "absolute", inset: 0, background: "#030303" }}
        onPointerMissed={() => setActiveId(null)}
      >
        <Scene activeId={activeId} setActiveId={setActiveId} />
      </Canvas>

      {/* Detail panel */}
      {activeProject && (
        <ProjectDetail project={activeProject} onClose={() => setActiveId(null)} />
      )}
    </div>
  );
}
