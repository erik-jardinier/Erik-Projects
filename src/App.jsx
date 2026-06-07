import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Stable reusable vectors — allocated once, not per frame
const _targetPos = new THREE.Vector3();
const _targetScale = new THREE.Vector3();
const _camTarget = new THREE.Vector3(0, 0, 0);

function CameraRig({ mode, orbitRef }) {
  const { camera } = useThree();
  const camHome = useRef(new THREE.Vector3(0, 0, 10));
  const animating = useRef(false);

  // Track when mode changes to trigger a one-shot lerp back home
  const prevMode = useRef(mode);
  if (prevMode.current !== mode) {
    if (mode === "overview") animating.current = true;
    prevMode.current = mode;
  }

  useFrame(() => {
    if (mode === "project") {
      // Animate camera forward; lookAt is fine here since OrbitControls is disabled
      camera.position.lerp(_targetPos.set(0, 0, 8), 0.06);
      camera.lookAt(0, 0, 0);
    } else if (animating.current) {
      // Lerp back to home, then hand control back to OrbitControls
      camera.position.lerp(camHome.current, 0.06);
      camera.lookAt(0, 0, 0);
      if (camera.position.distanceTo(camHome.current) < 0.05) {
        camera.position.copy(camHome.current);
        // Sync OrbitControls target so it doesn't snap
        if (orbitRef.current) orbitRef.current.target.set(0, 0, 0);
        animating.current = false;
      }
    }
    // In overview (not animating): do nothing — OrbitControls owns the camera
  });

  return null;
}

function Card({ project, activeId, setActiveId, setMode }) {
  const ref = useRef();
  const texture = useTexture(project.textureUrl);

  const isActive = activeId === project.id;
  const basePos = useRef(new THREE.Vector3(project.baseX, project.baseY, project.baseZ));

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;

    if (!isActive) {
      // Float in overview — write directly, no Vector3 alloc
      ref.current.position.x = project.baseX + Math.cos(t * project.speed) * 0.2;
      ref.current.position.y = project.baseY + Math.sin(t * project.speed) * 0.2;
      ref.current.position.z = project.baseZ;

      // Slowly drift rotation only in overview
      ref.current.rotation.y += 0.002;
    } else {
      // Flip card to show back face, move to center
      const targetRot = Math.PI;
      ref.current.rotation.y += (targetRot - ref.current.rotation.y) * 0.08;
      ref.current.position.lerp(_targetPos.set(0, 0, 5), 0.08);
    }

    // Reset rotation when deactivated
    if (!isActive) {
      if (Math.abs(ref.current.rotation.y - 0) > 0.01) {
        ref.current.rotation.y += (0 - ref.current.rotation.y) * 0.08;
      }
    }

    // Scale
    const targetScale = isActive ? 3 : 1;
    ref.current.scale.lerp(_targetScale.set(targetScale, targetScale, 1), 0.1);
  });

  return (
    <mesh
      ref={ref}
      position={[project.baseX, project.baseY, project.baseZ]}
      onClick={(e) => {
        e.stopPropagation();
        setActiveId(project.id);
        setMode("project");
      }}
    >
      <planeGeometry args={[1.5, 1.9]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

const CATEGORY_COLORS = {
  "WebGL / Interaction": "#7B61FF",
  "Motion Design": "#FF6B6B",
  "Brand Identity": "#FFB347",
  "UI/UX": "#4ECDC4",
};

export default function App() {
  const [activeId, setActiveId] = useState(null);
  const [mode, setMode] = useState("overview");
  const [closing, setClosing] = useState(false);
  const orbitRef = useRef();

  const projects = useMemo(() => {
    const categories = Object.keys(CATEGORY_COLORS);
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      title: `Project ${i + 1}`,
      category: categories[i % categories.length],
      year: 2023 + (i % 3),
      description:
        "A deep exploration of spatial interfaces and dynamic composition. Built with custom shaders and real-time data streams.",
      baseX: (Math.random() - 0.5) * 16,
      baseY: (Math.random() - 0.5) * 9,
      baseZ: (Math.random() - 0.5) * 12,
      speed: 0.4 + Math.random() * 0.6,
      textureUrl: `https://picsum.photos/900/900?random=${i}`,
    }));
  }, []);

  const activeProject = projects.find((p) => p.id === activeId);

  const closeProject = () => {
    setClosing(true);
    setTimeout(() => {
      setMode("overview");
      setActiveId(null);
      setClosing(false);
    }, 400);
  };

  const accentColor = activeProject
    ? CATEGORY_COLORS[activeProject.category] ?? "#7B61FF"
    : "#7B61FF";

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#060608", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: Helvetica Neue, Helvetica, Arial, sans-serif; }

        .project-overlay {
          position: absolute;
          inset: 0;
          background: #060608;
          color: #e8e4dc;
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.4s ease forwards;
          overflow-y: auto;
        }

        .project-overlay.closing {
          animation: fadeOut 0.35s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(12px); }
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 40px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .wordmark {
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.4);
          font-weight: 400;
        }

        .close-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(232,228,220,0.7);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 8px 20px;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #e8e4dc;
          border-color: rgba(255,255,255,0.2);
        }

        .project-hero {
          padding: 48px 40px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .category-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 100px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 500;
          width: fit-content;
        }

        .category-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .project-title {
          font-size: clamp(40px, 7vw, 72px);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.03em;
          color: #e8e4dc;
        }

        .project-meta {
          display: flex;
          gap: 24px;
          align-items: center;
          margin-top: 4px;
        }

        .meta-item {
          font-size: 11px;
          color: rgba(232,228,220,0.35);
          letter-spacing: 0.08em;
          font-weight: 400;
        }

        .meta-divider {
          width: 1px;
          height: 12px;
          background: rgba(255,255,255,0.12);
        }

        .project-desc {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(232,228,220,0.55);
          max-width: 560px;
          margin-top: 8px;
        }

        .image-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 300px 200px;
          gap: 3px;
          margin: 0 40px 40px;
          border-radius: 16px;
          overflow: hidden;
        }

        .image-cell {
          background: #111114;
          position: relative;
          overflow: hidden;
        }

        .image-cell:first-child {
          grid-row: 1 / 2;
        }

        .image-cell img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.85;
          transition: opacity 0.3s ease, transform 0.4s ease;
        }

        .image-cell:hover img {
          opacity: 1;
          transform: scale(1.02);
        }

        .accent-line {
          height: 1px;
          margin: 0 40px;
          opacity: 0.15;
        }

        .overview-hint {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          pointer-events: none;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        .canvas-wrapper {
          width: 100%;
          height: 100%;
          cursor: grab;
        }

        .canvas-wrapper:active {
          cursor: grabbing;
        }
      `}</style>

      {/* 3D canvas — always mounted so camera can animate back */}
      <div
        className="canvas-wrapper"
        style={{
          position: "absolute",
          inset: 0,
          opacity: mode === "overview" ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: mode === "overview" ? "auto" : "none",
        }}
      >
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }} style={{ background: "#060608" }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-8, -4, 4]} intensity={0.4} color="#7B61FF" />

          <OrbitControls
            ref={orbitRef}
            enableZoom
            enablePan
            enableRotate
            enabled={mode === "overview"}
            zoomSpeed={0.8}
            panSpeed={0.8}
            rotateSpeed={0.5}
            dampingFactor={0.08}
            enableDamping
            minDistance={2}
            maxDistance={30}
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.PAN,
            }}
          />

          <CameraRig mode={mode} orbitRef={orbitRef} />

          {projects.map((p) => (
            <Card
              key={p.id}
              project={p}
              activeId={activeId}
              setActiveId={setActiveId}
              setMode={setMode}
            />
          ))}
        </Canvas>
      </div>

      {mode === "overview" && (
        <div className="overview-hint">Click any card to explore</div>
      )}

      {/* Project detail overlay */}
      {(mode === "project" || closing) && activeProject && (
        <div className={`project-overlay${closing ? " closing" : ""}`}>
          <div className="topbar">
            <span className="wordmark">Portfolio</span>
            <button className="close-btn" onClick={closeProject}>
              ✕ Close
            </button>
          </div>

          <div className="project-hero">
            <div
              className="category-pill"
              style={{
                background: accentColor + "18",
                border: `1px solid ${accentColor}40`,
                color: accentColor,
              }}
            >
              <div className="category-dot" style={{ background: accentColor }} />
              {activeProject.category}
            </div>

            <h1 className="project-title">{activeProject.title}</h1>

            <div className="project-meta">
              <span className="meta-item">{activeProject.year}</span>
              <div className="meta-divider" />
              <span className="meta-item">Case Study</span>
              <div className="meta-divider" />
              <span className="meta-item">#{String(activeProject.id + 1).padStart(2, "0")}</span>
            </div>

            <p className="project-desc">{activeProject.description}</p>
          </div>

          <div
            className="accent-line"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
          />

          <div className="image-grid" style={{ marginTop: 32 }}>
            {[0, 1, 2, 3].map((n) => (
              <div className="image-cell" key={n}>
                <img
                  src={`https://picsum.photos/900/600?random=${activeProject.id * 10 + n}`}
                  alt=""
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}