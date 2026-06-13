import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";

// ─── PROJECT DATA ─────────────────────────────────────────────────────────────
// Images exactly as extracted from PDF, counts verified

const PROJECTS = [
  {
    id: "01",
    title: "Boarding House",
    category: "Architecture",
    year: "2020–21",
    location: "Berlin, Charlottenburg",
    client: "Design & Construction III",
    team: "Prof. Jan Kleihues",
    description: "A residential and commercial building on a corner lot at Kantstrasse 100 / Bleibtreustrasse 50a, covering 621m². Targeting students with temporary and long-term apartments, the design integrates balconies through continuous horizontal cornices and floor-to-ceiling windows.",
    folder: "01_boarding_house",
    images: ["00.jpg","01.jpg","02.jpg","03.jpg","04.jpg","05.jpg","06.jpg","07.jpg","08.jpg"],
    accent: "#C8A882",
  },
  {
    id: "02",
    title: "Gutenberg Museum",
    category: "Architecture",
    year: "2022",
    location: "Mainz",
    client: "City of Mainz",
    team: "Sandra Töpfer, Karsten Ruf, Karolina Kotyrba, Lara Kienold, Erik Gärtner",
    description: "Competition entry for the Gutenberg Museum in Mainz's Old Town. A new public space — the Gutenberg Plateau — connects the historic building to the new museum with a generous outdoor staircase, forming the stage of a new museum district.",
    folder: "02_gutenberg",
    images: ["00.jpg","01.jpg","02.jpg","03.jpg","04.jpg","05.jpg"],
    accent: "#8BA8C8",
  },
  {
    id: "03",
    title: "Innovation Forum",
    category: "Architecture",
    year: "2023–24",
    location: "Schwedt/Oder",
    client: "PCK Refinery — Interflex Seminar",
    team: "Mathis Winkels, Vladislav Sirotin, Jannik Schlingemann, Erik Gärtner",
    description: "A versatile innovation site for the PCK refinery's transformation toward renewable energy. A continuous grid structures flexible building clusters — primary brackets, secondary courtyards, colonnades, and a forum courtyard as the new civic center.",
    folder: "03_innovation",
    images: ["00.jpg","01.jpg","02.jpg","03.jpg","04.jpg","05.jpg","06.jpg","07.jpg","08.jpg","09.jpg","10.jpg","11.jpg","12.jpg"],
    accent: "#A8C88B",
  },
  {
    id: "04",
    title: "Margherita Hack Campus",
    category: "Architecture",
    year: "2024",
    location: "Trieste — Cantieri San Marco",
    client: "Master Thesis",
    team: "",
    description: "An astrophysics campus at the Gasometro di Broletto, Trieste. The 1950s gasometer footprint is retained as a planetarium; a new exhibition tower contains a projection sphere. The campus includes co-working spaces, lecture halls, cafeteria, and underground parking.",
    folder: "04_campus",
    images: ["00.jpg","01.jpg","02.jpg","03.jpg","04.jpg","05.jpg","06.jpg","07.jpg","08.jpg","09.jpg","10.jpg","11.jpg","12.jpg","13.jpg","14.jpg","15.jpg","16.jpg","17.jpg"],
    accent: "#9B8BC8",
  },
  {
    id: "05",
    title: "Archive",
    category: "Graphic Design",
    year: "2024",
    location: "Berlin",
    client: "Kimany Thayano",
    team: "",
    description: "Album cover for the 2024 release 'Archive' by Kimany Thayano. Referencing Raf Simons' Redux books and punk archive culture, the minimalist layout connects the album's 2020–2024 musical spectrum to the visual language of fashion archiving.",
    folder: "05_archive",
    images: ["00.jpg","01.jpg","02.jpg","03.jpg"],
    accent: "#C88B8B",
  },
  {
    id: "06",
    title: "Échelle_25",
    category: "Product Design",
    year: "2025",
    location: "Berlin",
    client: "",
    team: "",
    description: "An industrial lamp design with a lampshade and raised disc creating a space for the sockets — exposed rather than concealed as essential design elements. Three asymmetrically arranged light sources. Conduit pipe rungs guide cables to the ceiling canopy.",
    folder: "06_echelle",
    images: ["00.jpg","01.jpg","02.jpg"],
    accent: "#C8C28B",
  },
  {
    id: "07",
    title: "AI Image Gallery",
    category: "Digital / AI",
    year: "2024",
    location: "Berlin",
    client: "",
    team: "",
    description: "A curated series of AI-generated images tracing a creative process from concept to execution — from mutant fauna and depth-mapped performances to liquid architectural surfaces. Process documentation from beginning to end.",
    folder: "07_ai_gallery",
    images: ["00.jpg","01.jpg","02.jpg","03.jpg","04.jpg","05.jpg","06.jpg","07.jpg","08.jpg"],
    accent: "#B88BC8",
  },
  {
    id: "08",
    title: "ANGST Add-ons",
    category: "Product Design",
    year: "2023",
    location: "Berlin",
    client: "",
    team: "",
    description: "Concept accessories for Apple AirPods Max. The add-on typology explores expansion of the minimalist headphone form. Typography inspired by Aphex Twin's IDM logo — the word ANGST (fear) rendered as a tranquility device against anxiety.",
    folder: "08_angst",
    images: ["00.jpg","01.jpg","02.jpg","03.jpg","04.jpg"],
    accent: "#8BC4C8",
  },
  {
    id: "09",
    title: "Gucci Cruise 26 — GUCCICORE",
    category: "Fashion / Direction",
    year: "2025",
    location: "New York City — Times Square",
    client: "Gucci",
    team: "",
    description: "The fashion show opened with a montage video filling the screens of Times Square, exploring Gucci as an ethos, a lifestyle, an identity and an aesthetic universe. Set May 16th in NYC.",
    folder: "09_gucci_cruise",
    images: ["00.jpg","01.jpg","02.jpg","03.jpg"],
    accent: "#C8A040",
  },
  {
    id: "10",
    title: "Gucci Memoria",
    category: "Exhibition / Curation",
    year: "2026",
    location: "Chiostri di San Simpliciano, Milano",
    client: "Gucci / Demna",
    team: "Sub Global, Erik Gärtner",
    description: "On display April 21–26, 2026. Curated by Demna, the exhibition featured tapestry artworks tracing Gucci's creative eras — from Tom Ford through Alessandro Michele to the Demna era — through woven material memory.",
    folder: "10_gucci_memoria",
    images: ["00.jpg","01.jpg","02.jpg","03.jpg","04.jpg","05.jpg","06.jpg","07.jpg","08.jpg","09.jpg","10.jpg"],
    accent: "#C84040",
  },
];

// ─── SAFE TEXTURE HOOK ────────────────────────────────────────────────────────

function useSafeTexture(url) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
      if (!cancelled) {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      }
    }, undefined, () => {});
    return () => { cancelled = true; };
  }, [url]);
  return texture;
}

// ─── PARTICLES ────────────────────────────────────────────────────────────────

function Particles() {
  const ref = useRef();
  const geo = useMemo(() => {
    const pos = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.018; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.055} color="#ffffff" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

function Card({ project, position, isActive, onClick }) {
  const ref = useRef();
  const texture = useSafeTexture(`/projects/${project.folder}/${project.images[0]}`);
  const [hovered, setHovered] = useState(false);

  // Each card has its own unique drift personality, fixed on mount
  const drift = useMemo(() => ({
    speed:  0.12 + Math.random() * 0.18,
    xAmp:   0.07 + Math.random() * 0.10,
    yAmp:   0.05 + Math.random() * 0.08,
    phase:  Math.random() * Math.PI * 2,
    phase2: Math.random() * Math.PI * 2,
  }), []);

  // Card proportions: use actual cover image ratio where we know it
  // Cover images are portrait ~A4. Non-arch projects vary.
  const w = 2.2, h = 1.55;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();

    // Gentle sine drift — NO rotation accumulation
    const tx = position[0] + Math.sin(t * drift.speed + drift.phase)  * drift.xAmp;
    const ty = position[1] + Math.cos(t * drift.speed * 0.8 + drift.phase2) * drift.yAmp;
    const tz = isActive ? position[2] + 3.8 : position[2];

    ref.current.position.x += (tx - ref.current.position.x) * 0.035;
    ref.current.position.y += (ty - ref.current.position.y) * 0.035;
    ref.current.position.z += (tz - ref.current.position.z) * 0.07;

    // Rotation: always return to zero, tiny tilt on hover only
    ref.current.rotation.x += (0 - ref.current.rotation.x) * 0.08;
    ref.current.rotation.y += (0 - ref.current.rotation.y) * 0.08;

    // Scale
    const ts = isActive ? 1.1 : hovered ? 1.04 : 1.0;
    const cs = ref.current.scale.x;
    ref.current.scale.setScalar(cs + (ts - cs) * 0.1);
  });

  return (
    <mesh
      ref={ref}
      position={[...position]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerEnter={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = "default"; }}
    >
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={texture}
        color={texture ? "#ffffff" : "#111111"}
        toneMapped={false}
      />
      {/* Accent border when active */}
      {isActive && (
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(w + 0.06, h + 0.06)]} />
          <lineBasicMaterial color={project.accent} transparent opacity={0.7} />
        </lineSegments>
      )}
    </mesh>
  );
}

// ─── SCENE ────────────────────────────────────────────────────────────────────

function Scene({ activeId, setActiveId }) {
  // Fixed positions: spread across 3D space, no overlap
  const positions = useMemo(() => {
    const pts = [];
    for (let i = 0; i < PROJECTS.length; i++) {
      const angle = i * 2.399; // golden angle
      const ring = Math.floor(i / 5);
      const radius = 5.5 + ring * 3.0 + (i % 3) * 0.8;
      pts.push([
        Math.cos(angle) * radius,
        (Math.sin(i * 1.3) * 4.5),
        Math.sin(angle) * radius * 0.55 - 3,
      ]);
    }
    return pts;
  }, []);

  return (
    <>
      <color attach="background" args={["#080808"]} />
      <fog attach="fog" args={["#080808", 20, 45]} />
      <Particles />
      {PROJECTS.map((p, i) => (
        <Card
          key={p.id}
          project={p}
          position={positions[i]}
          isActive={activeId === p.id}
          onClick={() => setActiveId(activeId === p.id ? null : p.id)}
        />
      ))}
      <OrbitControls
        enableZoom
        enablePan={false}
        maxDistance={24}
        minDistance={4}
        autoRotate={!activeId}
        autoRotateSpeed={0.3}
        makeDefault
      />
    </>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────

function DetailPanel({ project, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  useEffect(() => setImgIdx(0), [project?.id]);
  if (!project) return null;

  const prev = () => setImgIdx(i => (i - 1 + project.images.length) % project.images.length);
  const next = () => setImgIdx(i => (i + 1) % project.images.length);

  const F = "Helvetica Neue, Helvetica, Arial, sans-serif";

  return (
    <div
      onClick={onClose}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:"#0d0d0d", border:"1px solid rgba(255,255,255,0.07)", maxWidth:920, width:"100%", maxHeight:"92vh", overflowY:"auto", fontFamily:F }}
      >
        {/* Header */}
        <div style={{ padding:"22px 26px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:5 }}>
              {project.id} — {project.category}
            </div>
            <h2 style={{ color:"#fff", fontSize:20, fontWeight:300, margin:0, letterSpacing:"-0.01em" }}>{project.title}</h2>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.35)", fontSize:24, cursor:"pointer", padding:"0 0 0 16px", lineHeight:1, marginTop:-2 }}>×</button>
        </div>

        {/* Main image */}
        <div style={{ position:"relative", background:"#050505", overflow:"hidden" }}>
          <img
            src={`/projects/${project.folder}/${project.images[imgIdx]}`}
            alt={project.title}
            style={{ width:"100%", display:"block", maxHeight:520, objectFit:"contain", background:"#050505" }}
          />
          {project.images.length > 1 && (
            <>
              <button onClick={prev} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.65)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", width:34, height:34, borderRadius:"50%", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
              <button onClick={next} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.65)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", width:34, height:34, borderRadius:"50%", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
              <div style={{ position:"absolute", bottom:8, right:12, color:"rgba(255,255,255,0.35)", fontSize:10, letterSpacing:"0.1em" }}>
                {imgIdx + 1} / {project.images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {project.images.length > 1 && (
          <div style={{ display:"flex", gap:5, padding:"8px 26px", overflowX:"auto", background:"#090909" }}>
            {project.images.map((img, i) => (
              <img key={i} src={`/projects/${project.folder}/${img}`} alt="" onClick={() => setImgIdx(i)}
                style={{ width:54, height:38, objectFit:"cover", cursor:"pointer", flexShrink:0, border:`1.5px solid ${i === imgIdx ? project.accent : "transparent"}`, opacity:i === imgIdx ? 1 : 0.45, transition:"opacity 0.2s" }} />
            ))}
          </div>
        )}

        {/* Meta + description */}
        <div style={{ padding:"18px 26px 26px", display:"grid", gridTemplateColumns:"180px 1fr", gap:24 }}>
          <div>
            {[["Year",project.year],["Location",project.location],["Client",project.client],["Team",project.team]].filter(([,v])=>v).map(([label,val])=>(
              <div key={label} style={{ marginBottom:13 }}>
                <div style={{ color:"rgba(255,255,255,0.28)", fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:3 }}>{label}</div>
                <div style={{ color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:300, lineHeight:1.5 }}>{val}</div>
              </div>
            ))}
            <span style={{ background:project.accent+"1a", color:project.accent, fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", padding:"3px 9px", border:`1px solid ${project.accent}33` }}>
              {project.category}
            </span>
          </div>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:13, lineHeight:1.8, margin:0, fontWeight:300 }}>
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
  const active = PROJECTS.find(p => p.id === activeId);

  return (
    <div style={{ width:"100vw", height:"100vh", background:"#080808", overflow:"hidden", position:"relative" }}>
      <Canvas camera={{ position:[0,0,14], fov:55 }} dpr={[1,1.5]} style={{ position:"absolute", inset:0 }} onClick={() => setActiveId(null)}>
        <Scene activeId={activeId} setActiveId={setActiveId} />
      </Canvas>

      {/* Name */}
      <div style={{ position:"fixed", top:26, left:30, fontFamily:"Helvetica Neue, Helvetica, Arial, sans-serif", color:"#fff", fontSize:12, fontWeight:300, letterSpacing:"0.08em", pointerEvents:"none" }}>
        ERIK GÄRTNER
      </div>

      {/* Hint */}
      <div style={{ position:"fixed", top:26, right:30, fontFamily:"Helvetica Neue, Helvetica, Arial, sans-serif", color:"rgba(255,255,255,0.25)", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", pointerEvents:"none" }}>
        Drag to explore · Click a card
      </div>

      {/* Project list */}
      <div style={{ position:"fixed", bottom:30, left:30, fontFamily:"Helvetica Neue, Helvetica, Arial, sans-serif", display:"flex", flexDirection:"column", gap:6 }}>
        {PROJECTS.map(p => (
          <button key={p.id} onClick={() => setActiveId(activeId === p.id ? null : p.id)}
            style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
            <span style={{ width:16, fontSize:9, color: activeId === p.id ? p.accent : "rgba(255,255,255,0.22)", fontWeight:500, letterSpacing:"0.05em", transition:"color 0.2s" }}>{p.id}</span>
            <span style={{ fontSize:10, fontWeight:300, letterSpacing:"0.09em", color: activeId === p.id ? "#fff" : "rgba(255,255,255,0.4)", textTransform:"uppercase", transition:"color 0.2s" }}>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Contact */}
      <div style={{ position:"fixed", bottom:30, right:30, fontFamily:"Helvetica Neue, Helvetica, Arial, sans-serif", color:"rgba(255,255,255,0.25)", fontSize:10, letterSpacing:"0.1em", textAlign:"right", lineHeight:1.9 }}>
        <div>erikgaertner99@gmail.com</div>
        <div>017622150639</div>
      </div>

      {active && <DetailPanel project={active} onClose={() => setActiveId(null)} />}
    </div>
  );
}
