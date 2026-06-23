import { useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// ---- Scroll progress (0 to 1) — passive listener + smooth lerp ----
function useScrollProgress() {
  const target = useRef(0); // asli scroll position
  const ref = useRef(0); // smooth (lerp) value

  useEffect(() => {
    let maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const recompute = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    const onScroll = () => {
      target.current = Math.min(1, window.scrollY / maxScroll);
    };

    recompute();
    onScroll();
    // passive = scroll ko block nahi karta (tez scroll)
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recompute);
    };
  }, []);

  // har frame smooth interpolate (responsive lekin laggy nahi)
  useFrame(() => {
    ref.current += (target.current - ref.current) * 0.12;
  });

  return ref;
}

// ---- Crescent Moon (do spheres se banaya — Islamic theme) ----
function CrescentMoon({ scroll }: { scroll: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // gentle float + scroll-driven rotation & drift
    group.current.rotation.z = Math.sin(t * 0.3) * 0.1 + scroll.current * 0.8;
    group.current.position.y = 2.4 + Math.sin(t * 0.5) * 0.2 - scroll.current * 6;
    group.current.position.x = 3.2 + scroll.current * 2;
  });

  return (
    <group ref={group} position={[3.2, 2.4, -2]}>
      {/* glowing crescent = bright sphere minus shadow sphere */}
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh position={[0.55, 0.15, 0.4]}>
        <sphereGeometry args={[0.92, 48, 48]} />
        <meshBasicMaterial color="#07061d" />
      </mesh>
      {/* soft halo */}
      <mesh>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

// ---- Floating Knowledge Orbs (books/atoms) jo scroll par travel karte hain ----
function KnowledgeOrbs({ scroll }: { scroll: React.MutableRefObject<number> }) {
  const orbs = useMemo(
    () => [
      { pos: [-3.5, 1, -1], color: "#a855f7", size: 0.5, speed: 0.7 },
      { pos: [3, -1.5, -1], color: "#ec4899", size: 0.4, speed: 1.1 },
      { pos: [-2.5, -2, 0], color: "#38bdf8", size: 0.35, speed: 0.9 },
      { pos: [2, 2.2, -2], color: "#34d399", size: 0.45, speed: 0.6 },
      { pos: [-4, -0.5, -2], color: "#f59e0b", size: 0.3, speed: 1.3 },
      { pos: [0.5, -2.5, -1], color: "#818cf8", size: 0.38, speed: 0.8 },
    ],
    []
  );

  return (
    <>
      {orbs.map((o, i) => (
        <Float key={i} speed={o.speed * 2} rotationIntensity={1.5} floatIntensity={2}>
          <Orb scroll={scroll} {...o} index={i} />
        </Float>
      ))}
    </>
  );
}

function Orb({
  pos,
  color,
  size,
  index,
  scroll,
}: {
  pos: number[];
  color: string;
  size: number;
  index: number;
  scroll: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    // scroll par orbs upar travel karte hain + thoda spread hota hai
    const dir = index % 2 === 0 ? 1 : -1;
    ref.current.position.y = pos[1] - scroll.current * 4 * (1 + index * 0.1);
    ref.current.position.x = pos[0] + scroll.current * dir * 1.5;
  });
  return (
    <mesh ref={ref} position={pos as [number, number, number]}>
      <icosahedronGeometry args={[size, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.6}
        flatShading
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// ---- A big slowly-rotating wireframe "knowledge globe" ----
function WireGlobe({ scroll }: { scroll: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.08 + scroll.current * 2;
    ref.current.rotation.x = scroll.current * 0.5;
    ref.current.position.y = -3 - scroll.current * 5;
  });
  return (
    <mesh ref={ref} position={[-2.5, -3, -4]}>
      <icosahedronGeometry args={[2.4, 2]} />
      <meshBasicMaterial color="#7c3aed" wireframe transparent opacity={0.18} />
    </mesh>
  );
}

// ---- Camera jo scroll ke saath halki si parallax/zoom karti hai ----
function CameraRig({ scroll }: { scroll: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  useFrame((state) => {
    // mouse parallax + scroll zoom
    const px = state.pointer.x * 0.4;
    const py = state.pointer.y * 0.3;
    camera.position.x += (px - camera.position.x) * 0.04;
    camera.position.y += (-py - camera.position.y) * 0.04;
    camera.position.z = 6 - scroll.current * 1.2;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function SceneContents() {
  const scroll = useScrollProgress();
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#c084fc" />
      <pointLight position={[-5, -3, 2]} intensity={0.8} color="#f472b6" />
      <pointLight position={[0, 3, 4]} intensity={0.6} color="#fbbf24" />

      <Stars radius={50} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={40} scale={12} size={3} speed={0.4} color="#fbbf24" opacity={0.6} />

      <CrescentMoon scroll={scroll} />
      <KnowledgeOrbs scroll={scroll} />
      <WireGlobe scroll={scroll} />
      <CameraRig scroll={scroll} />
    </>
  );
}

// ---- Fixed full-screen 3D canvas (background ke peeche) ----
export default function Scene3D() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <SceneContents />
        </Suspense>
      </Canvas>
    </div>
  );
}
