import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";

// ─── PROJECT DATA ────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: "01",
    title: "Boarding House",
    category: "Architecture",
    year: "2020–21",
    location: "Berlin",
    client: "Studio",
    team: "Prof. Jan Kleihues",
    description:
      "A residential boarding house project developed under Prof. Jan Kleihues in Berlin, exploring communal living typologies and urban integration.",
    folder: "01_boarding_house",
    images: ["00.jpg", "01.jpg", "02.jpg", "03.jpg"],
    accent: "#C8A882",
  },
  {
    id: "02",
    title: "Gutenberg Museum",
    category: "Architecture",
    year: "2022",
    location: "Mainz",
    client: "Competition",
    team: "",
    description:
      "Competition entry for the Gutenberg Museum in Mainz — a proposal exploring the relationship between print heritage and contemporary public space.",
    folder: "02_gutenberg",
    images: ["00.jpg", "01.jpg", "02.jpg", "03.jpg"],
    accent: "#8BA8C8",
  },
  {
    id: "03",
    title: "Innovation Forum",
    category: "Architecture",
    year: "2023–24",
    location: "Schwedt/Oder",
    client: "PCK Refinery",
    team: "",
    description:
      "A research and innovation forum for the PCK Refinery site in Schwedt/Oder, reimagining industrial infrastructure as a civic knowledge hub.",
    folder: "03_innovation",
    images: ["00.jpg", "01.jpg", "02.jpg", "03.jpg"],
    accent: "#A8C88B",
  },
  {
    id: "04",
    title: "Campus di Astrofisica",
    category: "Architecture",
    year: "2024",
    location: "Trieste",
    client: "Master Thesis",
    team: "",
    description:
      "Master thesis project — an astrophysics campus in Trieste that dissolves the boundary between scientific research and the surrounding landscape.",
    folder: "04_campus",
    images: ["00.jpg", "01.jpg", "02.jpg", "03.jpg"],
    accent: "#9B8BC8",
  },
  {
    id: "05",
    title: "Archive",
    category: "Graphic Design",
    year: "2024",
    location: "",
    client: "Kimany Thayano",
    team: "",
    description:
      "Album cover artwork for musician Kimany Thayano — a visual identity rooted in archival aesthetics and material memory.",
    folder: "05_album",
    images: ["00.jpg", "01.jpg"],
    accent: "#C88B8B",
  },
  {
    id: "06",
    title: "Échelle_25",
    category: "Product Design",
    year: "2025",
    location: "",
    client: "",
    team: "",
    description:
      "A lamp design exploring scale, light diffusion, and the dialogue between industrial materials and domestic warmth.",
    folder: "06_echelle",
    images: ["00.jpg", "01.jpg"],
    accent: "#C8C28B",
  },
  {
    id: "07",
    title: "ANGST Add-ons",
    category: "Product Design",
    year: "2023",
    location: "",
    client: "",
    team: "",
    description:
      "Concept accessories for AirPods Max — speculative product design exploring attachment, anxiety, and personal audio culture.",
    folder: "07_angst",
    images: ["00.jpg", "01.jpg", "02.jpg"],
    accent: "#8BC4C8",
  },
  {
    id: "08",
    title: "AI Image Gallery",
    category: "Digital",
    year: "2024",
    location: "",
    client: "",
    team: "",
    description:
      "A curated series of AI-generated images exploring speculative architectures and synthetic landscapes.",
    folder: "08_ai_gallery",
    images: ["00.jpg", "01.jpg", "02.jpg"],
    accent: "#B88BC8",
  },
  {
    id: "09",
    title: "Gucci Cruise 26 — GUCCICORE",
    category: "Fashion / Direction",
    year: "2025",
    location: "New York City",
    client: "Gucci",
    team: "",
    description:
      "The fashion show opened with a montage video that filled the screens of Times Square, exploring the idea of Gucci as an ethos, a lifestyle, an identity and an aesthetic universe. Set May 16th in NYC.",
    folder: "09_gucci_cruise",
    images: ["00.jpg", "01.jpg", "02.jpg", "03.jpg"],
    accent: "#C8A040",
  },
  {
    id: "10",
    title: "Gucci Memoria Exhibition",
    category: "Exhibition / Curation",
    year: "2026",
    location: "Chiostri di San Simpliciano, Milano",
    client: "Gucci / Demna",
    team: "Sub Global",
    description:
      "On display April 21–26, 2026. Curated by Demna, the exhibition featured tapestry artworks by Sub Global and the artist, tracing creative eras through woven material memory.",
    folder: "10_gucci_memoria",
    images: [
      "00.jpg", "01.jpg", "02.jpg", "03.jpg", "04.jpg",
      "05.jpg", "06.jpg", "07.jpg", "08.jpg", "09.jpg", "10.jpg",
    ],
    accent: "#C84040",
  },
];

// ─── TEXTURE LOADER (crash-safe) ─────────────────────────────────────────────

function useSafeTexture(url) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    if (!url) return;
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => setTexture(null)
    );
  }, [url]);
  return texture;
}

// ─── PARTICLES ───────────────────────────────────────────────────────────────

function Particles({ count = 80 }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.06} color="#ffffff" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

function Card({ project, position, isActive, onClick }) {
  const meshRef = useRef();
  const texture = useSafeTexture(`/projects/${project.folder}/${project.images[0]}`);
  const [hovered, setHovered] = useState(false);

  // Unique slow drift per card
  const drift = useMemo(() => ({
    speed: 0.15 + Math.random() * 0.2,
    xAmp: 0.08 + Math.random() * 0.12,
    yAmp: 0.06 + Math.random() * 0.1,
    phase: Math.random() * Math.PI * 2,
  }), []);

  // Card size: slightly portrait, larger for Gucci projects
  const isLarge = project.id === "09" || project.id === "10";
  const w = isLarge ? 2.8 : 2.2;
  const h = isLarge ? 1.9 : 1.5;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Target position: active cards come forward
    const targetZ = isActive ? position[2] + 3.5 : position[2];
    const targetX = position[0] + Math.sin(t * drift.speed + drift.phase) * drift.xAmp;
    const targetY = position[1] + Math.cos(t * drift.speed * 0.7 + drift.phase) * drift.yAmp;

    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.04;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.04;
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.06;

    // Very gentle tilt — no spinning
    const targetRX = hovered ? -0.04 : 0.0;
    const targetRY = hovered ? 0.04 : 0.0;
    meshRef.current.rotation.x += (targetRX - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (targetRY - meshRef.current.rotation.y) * 0.05;

    // Scale on hover
    const targetScale = isActive ? 1.12 : hovered ? 1.05 : 1.0;
    meshRef.current.scale.setScalar(
      meshRef.current.scale.x + (targetScale - meshRef.current.scale.x) * 0.08
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={texture}
        color={texture ? "#ffffff" : "#1a1a1a"}
        toneMapped={false}
      />
    </mesh>
  );
}

// ─── SCENE ────────────────────────────────────────────────────────────────────

function Scene({ activeId, setActiveId }) {
  // Spread cards across 3D space using golden angle
  const positions = useMemo(() => {
    return PROJECTS.map((_, i) => {
      const angle = i * 2.399; // golden angle
      const radius = 6 + (i % 3) * 2.5;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 6;
      const z = Math.sin(angle) * radius * 0.5 - 4;
      return [x, y, z];
    });
  }, []);

  return (
    <>
      <color attach="background" args={["#080808"]} />
      <fog attach="fog" args={["#080808", 18, 40]} />
      <Particles count={90} />
      {PROJECTS.map((project, i) => (
        <Card
          key={project.id}
          project={project}
          position={positions[i]}
          isActive={activeId === project.id}
          onClick={() => setActiveId(activeId === project.id ? null : project.id)}
        />
      ))}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        maxDistance={22}
        minDistance={4}
        autoRotate={!activeId}
        autoRotateSpeed={0.35}
        makeDefault
      />
    </>
  );
}

// ─── DETAIL PANEL ────────────────────────────────────────────────────────────

function DetailPanel({ project, onClose }) {
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    setImgIndex(0);
  }, [project?.id]);

  if (!project) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "32px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f0f0f",
          border: "1px solid rgba(255,255,255,0.08)",
          maxWidth: 900,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
              {project.id} — {project.category}
            </div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 300, margin: 0, letterSpacing: "-0.01em" }}>
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer", padding: "0 0 0 16px", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Main image */}
        <div style={{ position: "relative", background: "#050505", aspectRatio: "16/9", overflow: "hidden" }}>
          <img
            src={`/projects/${project.folder}/${project.images[imgIndex]}`}
            alt={project.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {/* Nav arrows */}
          {project.images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex((i) => (i - 1 + project.images.length) % project.images.length)}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
              >‹</button>
              <button
                onClick={() => setImgIndex((i) => (i + 1) % project.images.length)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
              >›</button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {project.images.length > 1 && (
          <div style={{ display: "flex", gap: 6, padding: "10px 28px", overflowX: "auto", background: "#0a0a0a" }}>
            {project.images.map((img, i) => (
              <img
                key={i}
                src={`/projects/${project.folder}/${img}`}
                alt=""
                onClick={() => setImgIndex(i)}
                style={{
                  width: 56, height: 40, objectFit: "cover", cursor: "pointer", flexShrink: 0,
                  border: i === imgIndex ? `1.5px solid ${project.accent}` : "1.5px solid transparent",
                  opacity: i === imgIndex ? 1 : 0.5,
                  transition: "opacity 0.2s",
                }}
              />
            ))}
          </div>
        )}

        {/* Meta + description */}
        <div style={{ padding: "20px 28px 28px", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24 }}>
          <div>
            {[
              ["Year", project.year],
              ["Location", project.location],
              ["Client", project.client],
              ["Team", project.team],
            ].filter(([, v]) => v).map(([label, val]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 300 }}>{val}</div>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <span style={{ background: project.accent + "22", color: project.accent, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 10px", border: `1px solid ${project.accent}44` }}>
                {project.category}
              </span>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.75, margin: 0, fontWeight: 300 }}>
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeId, setActiveId] = useState(null);
  const activeProject = PROJECTS.find((p) => p.id === activeId);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#080808", overflow: "hidden", position: "relative" }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 14], fov: 55 }}
        dpr={[1, 1.5]}
        style={{ position: "absolute", inset: 0 }}
        onClick={() => setActiveId(null)}
      >
        <Scene activeId={activeId} setActiveId={setActiveId} />
      </Canvas>

      {/* Name */}
      <div style={{
        position: "fixed", top: 28, left: 32,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: "#fff", fontSize: 13, fontWeight: 300, letterSpacing: "0.06em",
        pointerEvents: "none", userSelect: "none",
      }}>
        ERIK GÄRTNER
      </div>

      {/* Hint */}
      <div style={{
        position: "fixed", top: 28, right: 32,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: "0.1em",
        textTransform: "uppercase", pointerEvents: "none",
      }}>
        Click a card to explore
      </div>

      {/* Project list sidebar */}
      <div style={{
        position: "fixed", bottom: 36, left: 32,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        display: "flex", flexDirection: "column", gap: 7,
      }}>
        {PROJECTS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(activeId === p.id ? null : p.id)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              display: "flex", alignItems: "center", gap: 10, textAlign: "left",
            }}
          >
            <span style={{
              width: 18, fontSize: 9, color: activeId === p.id ? p.accent : "rgba(255,255,255,0.25)",
              fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase",
              transition: "color 0.2s",
            }}>{p.id}</span>
            <span style={{
              fontSize: 11, fontWeight: 300, letterSpacing: "0.08em",
              color: activeId === p.id ? "#fff" : "rgba(255,255,255,0.45)",
              textTransform: "uppercase", transition: "color 0.2s",
            }}>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Contact */}
      <div style={{
        position: "fixed", bottom: 36, right: 32,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.12em",
        textAlign: "right", lineHeight: 1.8,
      }}>
        <div>erik.gaertner@architecture.de</div>
      </div>

      {/* Detail overlay */}
      {activeProject && (
        <DetailPanel
          project={activeProject}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}
