import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

/* ================================================================
   CAMERA CONTROLLER — Cinematic scroll-driven camera path
   ================================================================ */
function CameraController({ scrollProgress }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 5));

  useFrame(() => {
    const p = scrollProgress.current;
    let x, y, z;

    if (p < 0.1) {
      const t = p / 0.1;
      x = Math.sin(t * 0.5) * 0.3;
      y = t * 0.2;
      z = 5 - t * 0.3;
    } else if (p < 0.2) {
      const t = (p - 0.1) / 0.1;
      x = Math.sin(t * Math.PI * 0.3) * 1.2;
      y = 0.2 + t * 1.0;
      z = 4.7 + t * 3.5;
    } else if (p < 0.5) {
      const t = (p - 0.2) / 0.3;
      const angle = t * Math.PI * 0.6;
      x = Math.sin(angle) * 3.5;
      y = 1.2 + Math.sin(t * Math.PI) * 0.8;
      z = 8.2 + Math.cos(angle) * 2;
    } else if (p < 0.6) {
      const t = (p - 0.5) / 0.1;
      const ease = 1 - Math.pow(1 - t, 3);
      x = THREE.MathUtils.lerp(1.8, 0, ease);
      y = THREE.MathUtils.lerp(2.0, 0.3, ease);
      z = THREE.MathUtils.lerp(10, 4, ease);
    } else if (p < 0.7) {
      const t = (p - 0.6) / 0.1;
      x = Math.sin(t * 0.4) * 0.5;
      y = 0.3 + t * 2.5;
      z = 4 + t * 4;
    } else if (p < 0.9) {
      const t = (p - 0.7) / 0.2;
      const angle = t * Math.PI * 0.3 + Math.PI * 0.3;
      x = Math.sin(angle) * 3;
      y = 2.8 - t * 0.5;
      z = 8 + Math.cos(angle) * 1.5;
    } else {
      const t = (p - 0.9) / 0.1;
      const ease = t * t * (3 - 2 * t);
      x = THREE.MathUtils.lerp(2.5, 0, ease);
      y = THREE.MathUtils.lerp(2.3, 0.1, ease);
      z = THREE.MathUtils.lerp(9, 5, ease);
    }

    target.current.set(x, y, z);
    camera.position.lerp(target.current, 0.045);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ================================================================
   HEALTHCARE CORE — Decomposable AI brain + hospital network
   ================================================================ */
function HealthcareCore({ scrollProgress, isDark }) {
  const groupRef = useRef();
  const coreWireRef = useRef();
  const glowRef = useRef();
  const innerRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();
  const nodesRef = useRef();
  const linesRef = useRef();

  const nodePositions = useMemo(() =>
    [[1,1,1],[-1,1,1],[1,-1,1],[-1,-1,1],[1,1,-1],[-1,1,-1],[1,-1,-1],[-1,-1,-1]]
      .map(p => new THREE.Vector3(...p).normalize().multiplyScalar(1.2)),
  []);

  const nodeColors = useMemo(() => 
    isDark
      ? ['#00d4ff','#7c3aed','#ec4899','#3b82f6','#10b981','#f59e0b','#8b5cf6','#06b6d4']
      : ['#0891b2','#6d28d9','#db2777','#1d4ed8','#047857','#b45309','#5b21b6','#0e7490'],
    [isDark]
  );

  const pairs = useMemo(() => {
    const result = [];
    for (let i = 0; i < nodePositions.length; i++)
      for (let j = i + 1; j < nodePositions.length; j++)
        if (nodePositions[i].distanceTo(nodePositions[j]) < 2.8) result.push([i, j]);
    return result;
  }, [nodePositions]);

  const linePositions = useMemo(() => new Float32Array(pairs.length * 6), [pairs]);

  useFrame((state) => {
    const p = scrollProgress.current;
    const t = state.clock.elapsedTime;
    const mouse = state.mouse;

    let expand;
    if (p < 0.1) {
      expand = 0;
    } else if (p < 0.2) {
      const t2 = (p - 0.1) / 0.1;
      expand = t2 * t2 * 2.8;
    } else if (p < 0.8) {
      expand = 2.8;
    } else if (p < 0.9) {
      const t2 = (p - 0.8) / 0.1;
      expand = 2.8 * (1 - t2 * t2);
    } else {
      const t2 = (p - 0.9) / 0.1;
      expand = 2.8 * Math.pow(1 - t2, 3) * 0;
    }

    const mouseInfluence = Math.max(0, 1 - expand * 0.5);

    if (groupRef.current) {
      const ry = t * 0.08 + mouse.x * 0.25 * mouseInfluence;
      const rx = mouse.y * 0.12 * mouseInfluence;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ry, 0.04);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rx, 0.04);
    }

    if (coreWireRef.current) {
      const s = (1 + Math.sin(t * 1.8) * 0.04) * (1 + expand * 0.3);
      coreWireRef.current.scale.setScalar(s);
      coreWireRef.current.rotation.y = t * 0.2;
      coreWireRef.current.rotation.z = t * 0.05;
      coreWireRef.current.material.opacity = Math.max(0.08, (isDark ? 0.25 : 0.38) - expand * 0.06);
    }

    if (glowRef.current) {
      const reassemblyBoost = p > 0.9 ? ((p - 0.9) / 0.1) * 0.3 : 0;
      glowRef.current.material.opacity = (isDark ? 0.35 : 0.2) + Math.sin(t * 2.5) * 0.12 + reassemblyBoost;
      glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
    }
    if (innerRef.current) {
      const reassemblyBright = p > 0.9 ? 0.8 + ((p - 0.9) / 0.1) * 0.2 : 0.8;
      innerRef.current.scale.setScalar(reassemblyBright + Math.sin(t * 3) * 0.05);
    }

    if (ring1.current) {
      ring1.current.rotation.x = Math.PI / 3 + t * 0.12;
      ring1.current.rotation.z = t * 0.06;
      ring1.current.scale.setScalar(1 + expand * 0.7);
      ring1.current.position.y = expand * 0.35;
      ring1.current.material.opacity = Math.max(0.1, (isDark ? 0.5 : 0.45) - expand * 0.1);
    }
    if (ring2.current) {
      ring2.current.rotation.y = -Math.PI / 4 + t * 0.1;
      ring2.current.rotation.x = Math.PI / 5;
      ring2.current.scale.setScalar(1 + expand * 0.9);
      ring2.current.material.opacity = Math.max(0.1, (isDark ? 0.4 : 0.35) - expand * 0.08);
    }
    if (ring3.current) {
      ring3.current.rotation.x = -Math.PI / 3.5 + t * 0.15;
      ring3.current.rotation.z = -t * 0.07;
      ring3.current.scale.setScalar(1 + expand * 1.1);
      ring3.current.position.y = -expand * 0.35;
      ring3.current.material.opacity = Math.max(0.1, (isDark ? 0.35 : 0.3) - expand * 0.07);
    }

    if (nodesRef.current) {
      nodesRef.current.children.forEach((node, i) => {
        const base = nodePositions[i];
        const scale = 1 + expand;
        node.position.set(
          base.x * scale,
          base.y * scale + Math.sin(t * 1.5 + i * 0.8) * 0.08,
          base.z * scale
        );
        const nodeScale = 1 + Math.sin(t * 2 + i * 1.2) * 0.1;
        node.scale.setScalar(nodeScale);
      });
    }

    if (linesRef.current && nodesRef.current) {
      const nodes = nodesRef.current.children;
      pairs.forEach(([a, b], idx) => {
        if (nodes[a] && nodes[b]) {
          linePositions[idx * 6 + 0] = nodes[a].position.x;
          linePositions[idx * 6 + 1] = nodes[a].position.y;
          linePositions[idx * 6 + 2] = nodes[a].position.z;
          linePositions[idx * 6 + 3] = nodes[b].position.x;
          linePositions[idx * 6 + 4] = nodes[b].position.y;
          linePositions[idx * 6 + 5] = nodes[b].position.z;
        }
      });
      linesRef.current.geometry.attributes.position.needsUpdate = true;
      const connVis = expand > 0.5 ? Math.min(1, (expand - 0.5) / 1.0) * (isDark ? 0.22 : 0.38) : 0;
      linesRef.current.material.opacity = connVis;
    }
  });

  return (
    <group ref={groupRef}>
      {/* === WIREFRAME SHELL === */}
      <mesh ref={coreWireRef}>
        <icosahedronGeometry args={[0.8, 2]} />
        <meshStandardMaterial 
          color={isDark ? "#00d4ff" : "#0e7490"} 
          emissive={isDark ? "#00d4ff" : "#0e7490"} 
          emissiveIntensity={isDark ? 0.6 : 0.3} 
          wireframe 
          transparent 
          opacity={0.25} 
        />
      </mesh>

      {/* === INNER GLOW SPHERE === */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshBasicMaterial color={isDark ? "#00d4ff" : "#00bcd4"} transparent opacity={isDark ? 0.35 : 0.2} />
      </mesh>

      {/* === BRIGHT CORE === */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.15, 1]} />
        <meshBasicMaterial color={isDark ? "#ffffff" : "#e0f2fe"} transparent opacity={isDark ? 0.9 : 0.7} />
      </mesh>

      {/* === ORBITAL RING 1 — Purple === */}
      <mesh ref={ring1}>
        <torusGeometry args={[1.5, 0.02, 16, 100]} />
        <meshBasicMaterial color={isDark ? "#7c3aed" : "#6d28d9"} transparent opacity={0.5} />
      </mesh>

      {/* === ORBITAL RING 2 — Cyan === */}
      <mesh ref={ring2}>
        <torusGeometry args={[1.8, 0.015, 16, 100]} />
        <meshBasicMaterial color={isDark ? "#00d4ff" : "#0891b2"} transparent opacity={0.4} />
      </mesh>

      {/* === ORBITAL RING 3 — Pink === */}
      <mesh ref={ring3}>
        <torusGeometry args={[2.2, 0.012, 16, 100]} />
        <meshBasicMaterial color={isDark ? "#ec4899" : "#db2777"} transparent opacity={0.35} />
      </mesh>

      {/* === SATELLITE NODES === */}
      <group ref={nodesRef}>
        {nodePositions.map((pos, i) => (
          <group key={i} position={pos.toArray()}>
            <mesh>
              <octahedronGeometry args={[0.06, 0]} />
              <meshStandardMaterial 
                color={nodeColors[i]} 
                emissive={nodeColors[i]} 
                emissiveIntensity={isDark ? 2 : 0.8} 
                metalness={0.9} 
                roughness={0.1} 
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshBasicMaterial color={nodeColors[i]} transparent opacity={isDark ? 0.12 : 0.18} />
            </mesh>
          </group>
        ))}
      </group>

      {/* === NEURAL CONNECTIONS === */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={pairs.length * 2} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial 
          color={isDark ? "#00d4ff" : "#0e7490"} 
          transparent 
          opacity={0} 
          blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending} 
        />
      </lineSegments>
    </group>
  );
}

/* ================================================================
   FLOATING PARTICLES — Orbiting data stream cloud
   ================================================================ */
function FloatingParticles({ scrollProgress, count = 400, isDark }) {
  const ref = useRef();

  const { positions, colors, speeds, baseColors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    
    const palette = isDark
      ? [new THREE.Color('#00d4ff'), new THREE.Color('#7c3aed'), new THREE.Color('#ec4899'), new THREE.Color('#3b82f6')]
      : [new THREE.Color('#0891b2'), new THREE.Color('#6d28d9'), new THREE.Color('#db2777'), new THREE.Color('#1d4ed8')];
      
    const baseCols = [];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      baseCols.push(c.clone());
      spd[i] = 0.001 + Math.random() * 0.004;
    }
    return { positions: pos, colors: col, speeds: spd, baseColors: baseCols };
  }, [count, isDark]);

  const emergencyColor = useMemo(() => new THREE.Color(isDark ? '#ef4444' : '#b91c1c'), [isDark]);
  const commandColor = useMemo(() => new THREE.Color(isDark ? '#10b981' : '#047857'), [isDark]);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    if (!ref.current) return;
    const p = scrollProgress.current;
    const arr = ref.current.geometry.attributes.position.array;
    const colArr = ref.current.geometry.attributes.color.array;

    const isEmergency = p > 0.5 && p < 0.6;
    const isCommand = p > 0.6 && p < 0.7;
    const emergencyT = isEmergency ? Math.min(1, (p - 0.5) / 0.05) : 0;
    const commandT = isCommand ? Math.min(1, (p - 0.6) / 0.05) : 0;

    for (let i = 0; i < count; i++) {
      const x = arr[i * 3], z = arr[i * 3 + 2];
      const s = speeds[i];
      arr[i * 3] = x * Math.cos(s) - z * Math.sin(s);
      arr[i * 3 + 2] = x * Math.sin(s) + z * Math.cos(s);

      if (emergencyT > 0) {
        tempColor.copy(baseColors[i]).lerp(emergencyColor, emergencyT * 0.7);
        colArr[i * 3] = tempColor.r; colArr[i * 3 + 1] = tempColor.g; colArr[i * 3 + 2] = tempColor.b;
      } else if (commandT > 0) {
        tempColor.copy(baseColors[i]).lerp(commandColor, commandT * 0.5);
        colArr[i * 3] = tempColor.r; colArr[i * 3 + 1] = tempColor.g; colArr[i * 3 + 2] = tempColor.b;
      } else {
        colArr[i * 3] = baseColors[i].r; colArr[i * 3 + 1] = baseColors[i].g; colArr[i * 3 + 2] = baseColors[i].b;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={isDark ? 0.03 : 0.045} 
        vertexColors 
        transparent 
        opacity={isDark ? 0.7 : 0.85} 
        sizeAttenuation 
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending} 
        depthWrite={false} 
      />
    </points>
  );
}

/* ================================================================
   ENERGY RINGS — Large orbiting structures visible mid-scroll
   ================================================================ */
function EnergyRings({ scrollProgress, isDark }) {
  const r1 = useRef();
  const r2 = useRef();

  useFrame((state) => {
    const p = scrollProgress.current;
    const t = state.clock.elapsedTime;
    const visibility = p > 0.3 && p < 0.7
      ? Math.min(1, Math.min((p - 0.3) / 0.1, (0.7 - p) / 0.1))
      : 0;

    if (r1.current) {
      r1.current.rotation.x = t * 0.05;
      r1.current.rotation.y = t * 0.08;
      r1.current.material.opacity = visibility * (isDark ? 0.18 : 0.28);
      r1.current.scale.setScalar(3 + p * 2);
    }
    if (r2.current) {
      r2.current.rotation.x = Math.PI / 2 + t * 0.04;
      r2.current.rotation.z = t * 0.06;
      r2.current.material.opacity = visibility * (isDark ? 0.12 : 0.22);
      r2.current.scale.setScalar(4 + p * 2);
    }
  });

  return (
    <>
      <mesh ref={r1}>
        <torusGeometry args={[1, 0.008, 16, 120]} />
        <meshBasicMaterial color={isDark ? "#7c3aed" : "#6d28d9"} transparent opacity={0} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[1, 0.006, 16, 120]} />
        <meshBasicMaterial color={isDark ? "#00d4ff" : "#0891b2"} transparent opacity={0} />
      </mesh>
    </>
  );
}

/* ================================================================
   DYNAMIC LIGHTS — Phase-aware color shifting
   ================================================================ */
function DynamicLights({ scrollProgress, isDark }) {
  const light1 = useRef();
  const light2 = useRef();
  const light3 = useRef();

  const cyanRGB = useMemo(() => isDark ? { r: 0, g: 0.83, b: 1 } : { r: 0, g: 0.55, b: 0.7 }, [isDark]);
  const purpleRGB = useMemo(() => isDark ? { r: 124/255, g: 58/255, b: 237/255 } : { r: 109/255, g: 40/255, b: 217/255 }, [isDark]);
  const redRGB = useMemo(() => isDark ? { r: 1, g: 0.15, b: 0.15 } : { r: 0.8, g: 0.05, b: 0.05 }, [isDark]);
  const greenRGB = useMemo(() => isDark ? { r: 0.06, g: 0.72, b: 0.5 } : { r: 0.02, g: 0.45, b: 0.3 }, [isDark]);

  useFrame((state) => {
    const p = scrollProgress.current;
    const t = state.clock.elapsedTime;

    if (light1.current) {
      light1.current.position.set(Math.sin(t * 0.3) * 3, 2, Math.cos(t * 0.3) * 3);

      if (p > 0.5 && p < 0.6) {
        const emT = Math.min(1, (p - 0.5) / 0.05);
        light1.current.color.setRGB(
          THREE.MathUtils.lerp(cyanRGB.r, redRGB.r, emT),
          THREE.MathUtils.lerp(cyanRGB.g, redRGB.g, emT),
          THREE.MathUtils.lerp(cyanRGB.b, redRGB.b, emT)
        );
        light1.current.intensity = (isDark ? 2 : 2.5) + emT * 3;
      } else if (p > 0.6 && p < 0.7) {
        const cmT = Math.min(1, (p - 0.6) / 0.05);
        light1.current.color.setRGB(
          THREE.MathUtils.lerp(cyanRGB.r, greenRGB.r, cmT),
          THREE.MathUtils.lerp(cyanRGB.g, greenRGB.g, cmT),
          THREE.MathUtils.lerp(cyanRGB.b, greenRGB.b, cmT)
        );
        light1.current.intensity = isDark ? 2 : 2.5;
      } else if (p > 0.9) {
        const finT = Math.min(1, (p - 0.9) / 0.08);
        light1.current.color.setRGB(cyanRGB.r, cyanRGB.g, cyanRGB.b);
        light1.current.intensity = (isDark ? 2 : 2.5) + finT * 4;
      } else {
        light1.current.color.setRGB(cyanRGB.r, cyanRGB.g, cyanRGB.b);
        light1.current.intensity = isDark ? 2 : 2.5;
      }
    }

    if (light2.current) {
      light2.current.position.set(-Math.cos(t * 0.2) * 4, -1, Math.sin(t * 0.2) * 4);
      light2.current.color.setRGB(purpleRGB.r, purpleRGB.g, purpleRGB.b);
    }

    if (light3.current) {
      const emVis = p > 0.5 && p < 0.6 ? Math.min(1, (p - 0.5) / 0.03) * (1 - Math.max(0, (p - 0.57) / 0.03)) : 0;
      light3.current.intensity = emVis * (isDark ? 5 : 6);
      light3.current.position.set(Math.sin(t * 0.5) * 2, 0, Math.cos(t * 0.5) * 2);
    }
  });

  return (
    <>
      <pointLight ref={light1} intensity={isDark ? 2 : 2.5} color={isDark ? "#00d4ff" : "#0891b2"} distance={12} />
      <pointLight ref={light2} intensity={isDark ? 0.6 : 0.9} color={isDark ? "#7c3aed" : "#6d28d9"} distance={10} />
      <pointLight ref={light3} intensity={0} color={isDark ? "#ef4444" : "#b91c1c"} distance={8} />
    </>
  );
}

/* ================================================================
   MAIN HERO CANVAS — Exported component
   ================================================================ */
const HeroCanvas = ({ scrollProgress }) => {
  const { isDark } = useTheme();

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: isDark ? '#030014' : '#f8fafc', transition: 'background 0.5s ease' }}
      >
        <Suspense fallback={null}>
          {/* Fog for depth */}
          <fog attach="fog" args={[isDark ? '#030014' : '#f8fafc', 8, 28]} />

          {/* Base lighting */}
          <ambientLight intensity={isDark ? 0.08 : 0.3} />
          <directionalLight position={[-3, 5, 2]} intensity={isDark ? 0.12 : 0.5} color="#ffffff" />

          {/* Dynamic phase-aware lights */}
          <DynamicLights scrollProgress={scrollProgress} isDark={isDark} />

          {/* Center point glow */}
          <pointLight position={[0, 0, 0]} intensity={isDark ? 1.8 : 1.2} color={isDark ? "#00d4ff" : "#0891b2"} distance={6} />

          {/* Star field (Dark mode only) */}
          {isDark && <Stars radius={80} depth={120} count={3000} factor={3} saturation={0.3} fade speed={0.2} />}

          {/* Main decomposable + reassemblable object */}
          <HealthcareCore scrollProgress={scrollProgress} isDark={isDark} />

          {/* Orbiting particle cloud */}
          <FloatingParticles scrollProgress={scrollProgress} count={400} isDark={isDark} />

          {/* Large energy rings */}
          <EnergyRings scrollProgress={scrollProgress} isDark={isDark} />

          {/* Scroll-driven camera */}
          <CameraController scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroCanvas;
