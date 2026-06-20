import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useState, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import projects from "../data/projects";

function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const ALL_IMAGES = [];
const maxImgs = Math.max(...projects.map(p => p.images.length));
for (let i = 0; i < maxImgs; i++) {
  for (let j = 0; j < projects.length; j++) {
    if (projects[j].images[i]) {
      ALL_IMAGES.push({ src: projects[j].images[i], projectIndex: j });
    }
  }
}

const PARTICLES = ALL_IMAGES.map((img, i) => ({
  ...img,
  x: (seededRandom(i * 3.1) - 0.5) * 32,
  y: (seededRandom(i * 7.3) - 0.5) * 20,
  z: (seededRandom(i * 2.7) - 0.5) * 5,
  scale: 0.88 + seededRandom(i * 6.1) * 0.12,
}));

function Card({ data, panX, panY, onCardClick }) {
  const meshRef = useRef();
  const texture = useTexture(data.src);
  const [hovered, setHovered] = useState(false);

  // Derive aspect ratio from loaded texture
  const aspect = texture.image
    ? texture.image.width / texture.image.height
    : 1;
  const cardW = aspect >= 1 ? 1.6 : 1.1;
  const cardH = aspect >= 1 ? 1.6 / aspect : 1.1 / aspect;

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, data.x + panX.current, 0.08);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, data.y + panY.current, 0.08);
    const s = hovered ? data.scale * 1.08 : data.scale;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, s, 0.1));
  });

  return (
    <mesh
      ref={meshRef}
      position={[data.x, data.y, data.z]}
      rotation={[0, 0, 0]}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      onClick={() => onCardClick(projects[data.projectIndex], data.src)}
    >
      <planeGeometry args={[cardW, cardH]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function Scene({ onCardClick }) {
  const { gl } = useThree();
  const panX = useRef(0), panY = useRef(0);
  const targetX = useRef(0), targetY = useRef(0);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;
    const getXY = (e) => {
      if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    };
    const down = (e) => {
      const p = getXY(e);
      isDragging.current = true;
      lastPos.current = p;
      startPos.current = p;
      vel.current = { x: 0, y: 0 };
      didDrag.current = false;
      document.body.style.cursor = "grabbing";
    };
    const move = (e) => {
      if (!isDragging.current) return;
      const p = getXY(e);
      const dx = (p.x - lastPos.current.x) / 100;
      const dy = -(p.y - lastPos.current.y) / 100;
      vel.current = { x: dx, y: dy };
      targetX.current += dx;
      targetY.current += dy;
      lastPos.current = p;
      if (Math.abs(p.x - startPos.current.x) > 5 || Math.abs(p.y - startPos.current.y) > 5)
        didDrag.current = true;
      if (e.touches) e.preventDefault();
    };
    const up = () => { isDragging.current = false; document.body.style.cursor = "default"; };
    canvas.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    canvas.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      canvas.removeEventListener("mousedown", down);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      canvas.removeEventListener("touchstart", down);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [gl]);

  useFrame(() => {
    if (!isDragging.current) {
      vel.current.x *= 0.9;
      vel.current.y *= 0.9;
      targetX.current += vel.current.x;
      targetY.current += vel.current.y;
    }
    panX.current = THREE.MathUtils.lerp(panX.current, targetX.current, 0.08);
    panY.current = THREE.MathUtils.lerp(panY.current, targetY.current, 0.08);
  });

  return (
    <>
      {PARTICLES.map((d, i) => (
        <Card key={i} data={d} panX={panX} panY={panY}
          onCardClick={(p, src) => { if (!didDrag.current) onCardClick(p, src); }} />
      ))}
    </>
  );
}

function Overlay({ project, startSrc, onClose }) {
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!project) return;
    const idx = project.images.indexOf(startSrc);
    setImgIndex(idx >= 0 ? idx : 0);
    const fn = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setImgIndex(i => Math.min(i + 1, project.images.length - 1));
      if (e.key === "ArrowLeft") setImgIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [project, startSrc, onClose]);

  if (!project) return null;
  const F = "Helvetica, Arial, sans-serif";

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:100,
      background:"rgba(0,0,0,0.97)",
      display:"flex", flexDirection:"column",
      animation:"fadeIn 0.25s ease", cursor:"pointer",
      fontFamily:F, overflow:"hidden",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        padding:"32px 40px 24px", cursor:"default",
        borderBottom:"1px solid rgba(255,255,255,0.08)",
      }}>
        <div>
          <div style={{ color:"white", fontSize:"1.4rem", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6 }}>
            {project.title}
          </div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.65rem", letterSpacing:"0.2em", textTransform:"uppercase" }}>
            {project.subtitle} &nbsp;&middot;&nbsp; {project.year} &nbsp;&middot;&nbsp; {project.location}
          </div>
        </div>
        <button onClick={onClose} style={{
          background:"none", border:"none", color:"rgba(255,255,255,0.3)",
          fontSize:"0.65rem", letterSpacing:"0.15em", textTransform:"uppercase",
          cursor:"pointer", fontFamily:F, marginTop:4,
        }}>ESC / CLOSE</button>
      </div>

      <div onClick={e => e.stopPropagation()} style={{
        display:"flex", flex:1, overflow:"hidden", cursor:"default",
      }}>
        <div style={{
          flex:"0 0 60%", display:"flex", alignItems:"center", justifyContent:"center",
          padding:"32px", position:"relative",
        }}>
          {project.video && imgIndex === 0 ? (
            <video src={project.video} controls autoPlay muted loop style={{
              maxWidth:"100%", maxHeight:"calc(100vh - 180px)", display:"block"
            }} />
          ) : (
            <img key={imgIndex} src={project.images[imgIndex]} alt={project.title} style={{
              maxWidth:"100%", maxHeight:"calc(100vh - 180px)",
              objectFit:"contain", animation:"scaleIn 0.2s ease",
            }} />
          )}
          {project.images.length > 1 && <>
            <button onClick={() => setImgIndex(i => Math.max(i-1,0))} style={{
              position:"absolute", left:16, top:"50%", transform:"translateY(-50%)",
              background:"none", border:"none", color:"rgba(255,255,255,0.4)",
              fontSize:"1.5rem", cursor:"pointer", opacity:imgIndex===0?0.1:1, fontFamily:F,
            }}>←</button>
            <button onClick={() => setImgIndex(i => Math.min(i+1,project.images.length-1))} style={{
              position:"absolute", right:16, top:"50%", transform:"translateY(-50%)",
              background:"none", border:"none", color:"rgba(255,255,255,0.4)",
              fontSize:"1.5rem", cursor:"pointer", opacity:imgIndex===project.images.length-1?0.1:1, fontFamily:F,
            }}>→</button>
            <div style={{ position:"absolute", bottom:32, left:0, right:0, display:"flex", justifyContent:"center", gap:6 }}>
              {project.images.map((_, i) => (
                <div key={i} onClick={() => setImgIndex(i)} style={{
                  width:i===imgIndex?20:5, height:5, borderRadius:3,
                  background:i===imgIndex?"white":"rgba(255,255,255,0.25)",
                  cursor:"pointer", transition:"all 0.3s ease",
                }} />
              ))}
            </div>
          </>}
        </div>

        <div style={{
          flex:"0 0 40%", padding:"32px 40px 32px 0",
          display:"flex", flexDirection:"column", justifyContent:"center", overflowY:"auto",
        }}>
          <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:24 }}>
            {String(imgIndex+1).padStart(2,"0")} / {String(project.images.length).padStart(2,"0")}
          </div>
          <p style={{ color:"rgba(255,255,255,0.75)", fontSize:"0.8rem", lineHeight:1.8, margin:"0 0 32px" }}>
            {project.description}
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {project.images.map((img, i) => (
              <img key={i} src={img} onClick={() => setImgIndex(i)} style={{
                width:52, height:68, objectFit:"cover", cursor:"pointer",
                opacity:i===imgIndex?1:0.35,
                outline:i===imgIndex?"1px solid rgba(255,255,255,0.6)":"none",
                transition:"opacity 0.2s",
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FloatingScene() {
  const [selected, setSelected] = useState(null);
  const [startSrc, setStartSrc] = useState(null);

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        body { margin:0; overflow:hidden; background:black; }
        * { font-family: Helvetica, Arial, sans-serif; box-sizing:border-box; }
        button { font-family: Helvetica, Arial, sans-serif; }
      `}</style>
      <div style={{
        position:"fixed", top:28, left:36, zIndex:10,
        color:"white", fontSize:"0.7rem", letterSpacing:"0.2em",
        textTransform:"uppercase", opacity:0.5,
      }}>Erik Gartner</div>
      <div style={{
        position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", zIndex:10,
        color:"rgba(255,255,255,0.25)", fontSize:"0.6rem", letterSpacing:"0.15em",
        textTransform:"uppercase", whiteSpace:"nowrap",
      }}>drag to explore · click to open</div>
      
      <div style={{
        position:"fixed", inset:0, zIndex:5, pointerEvents:"none",
        background:"radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.95) 100%)",
      }} />
      <Canvas camera={{ position:[0,0,9], fov:55 }}>
        <Suspense fallback={null}>
          <Scene onCardClick={(p, src) => { setSelected(p); setStartSrc(src); }} />
        </Suspense>
      </Canvas>
      {selected && <Overlay project={selected} startSrc={startSrc} onClose={() => setSelected(null)} />}
    </>
  );
}
