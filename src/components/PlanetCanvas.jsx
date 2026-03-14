import { useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Ring } from '@react-three/drei';

function Planet() {
  const groupRef = useRef();
  const ringRef = useRef();

  // Drag state
  const drag = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    velX: 0,   // momentum from drag
    velY: 0,
    rotX: 0,   // accumulated rotation X (tilt)
    rotY: 0,   // accumulated rotation Y (spin)
  });

  const { gl } = useThree();

  const onPointerDown = useCallback((e) => {
    e.stopPropagation();
    drag.current.active = true;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
    drag.current.velX = 0;
    drag.current.velY = 0;
    gl.domElement.style.cursor = 'grabbing';
  }, [gl]);

  const onPointerMove = useCallback((e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    const dy = e.clientY - drag.current.lastY;
    drag.current.velX = dy * 0.005;  // tilt (X axis)
    drag.current.velY = dx * 0.005;  // spin (Y axis)
    drag.current.rotX += drag.current.velX;
    drag.current.rotY += drag.current.velY;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current.active = false;
    gl.domElement.style.cursor = 'grab';
  }, [gl]);

  const onPointerLeave = useCallback(() => {
    drag.current.active = false;
    gl.domElement.style.cursor = '';
  }, [gl]);

  useFrame(({ clock }, delta) => {
    const d = drag.current;
    const mesh = groupRef.current;
    const ring = ringRef.current;
    if (!mesh) return;

    if (d.active) {
      // While dragging: apply drag rotation directly
      mesh.rotation.x = d.rotX;
      mesh.rotation.y = d.rotY;
    } else {
      // Decay momentum
      d.velX *= 0.92;
      d.velY *= 0.92;

      // Apply momentum
      d.rotX += d.velX;
      d.rotY += d.velY;

      // Auto-rotate: blend auto-spin into rotY
      const autoSpeed = 0.15;
      d.rotY += autoSpeed * delta;

      mesh.rotation.x = d.rotX;
      mesh.rotation.y = d.rotY;
    }

    // Ring always tilts with planet but has its own slow roll
    if (ring) ring.rotation.z += 0.08 * delta;
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      <Sphere args={[1.4, 64, 64]}>
        <MeshDistortMaterial
          color="#0a1628"
          emissive="#1a3a6b"
          emissiveIntensity={0.4}
          distort={0.25}
          speed={1.5}
          roughness={0.6}
          metalness={0.8}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[1.55, 32, 32]}>
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.04} />
      </Sphere>

      {/* Ring — attached to group so it rotates with drag, plus its own roll */}
      <Ring ref={ringRef} args={[2.0, 2.8, 64]} rotation={[Math.PI / 3, 0, 0]}>
        <meshBasicMaterial color="#a855f7" transparent opacity={0.35} side={2} />
      </Ring>
    </group>
  );
}

export default function PlanetCanvas() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, cursor: 'grab' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#3b82f6" />
        <pointLight position={[-5, -3, -5]} intensity={0.5} color="#a855f7" />
        <Planet />
      </Canvas>
    </div>
  );
}
