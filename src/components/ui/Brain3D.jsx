import { Suspense, useEffect, useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center, Bounds } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import useMousePosition from "../../hooks/useMousePosition";

const MODEL_PATH = "/models/brain.glb";

const TILT_X_RANGE = 0.08;
const TILT_Z_RANGE = 0.06;
const TILT_DAMPING = 2.2;

const ROTATION_SPEED = 0.16;

const BASE_EMISSIVE = 0.22;
const HOVER_EMISSIVE = 0.34;
const EMISSIVE_DAMPING = 3;

const MAX_DPR = 1.5;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function BrainModel({ tiltRef, hoveredRef, modelScale }) {
  const { scene } = useGLTF(MODEL_PATH);

  /*
   * Clone the cached GLTF once per Brain3D instance.
   * This keeps multiple brains independent without repeatedly
   * cloning the scene during renders.
   */
  const cloned = useMemo(() => scene.clone(true), [scene]);

  /*
   * Create and configure materials exactly once.
   *
   * This replaces the original useMemo side-effect pattern with
   * a single memoized material setup that is retained for the
   * lifetime of this BrainModel instance.
   */
  const materials = useMemo(() => {
    const createdMaterials = [];

    cloned.traverse((child) => {
      if (!child.isMesh) return;

      const isLeft =
        /left/i.test(child.name) ||
        /left/i.test(child.material?.name || "");

      const material = new THREE.MeshStandardMaterial({
        color: isLeft
          ? new THREE.Color("#8B7FE8")
          : new THREE.Color("#5B4FCF"),
        emissive: new THREE.Color("#5B4FCF"),
        emissiveIntensity: BASE_EMISSIVE,
        roughness: 0.4,
        metalness: 0.05,
      });

      child.material = material;

      /*
       * The brain doesn't use shadows, so explicitly keep them disabled.
       */
      child.castShadow = false;
      child.receiveShadow = false;

      createdMaterials.push(material);
    });

    return createdMaterials;
  }, [cloned]);

  const groupRef = useRef(null);

  const currentEmissive = useRef(BASE_EMISSIVE);
  const currentTiltX = useRef(0);
  const currentTiltZ = useRef(0);

  useFrame((_, delta) => {
    const group = groupRef.current;

    if (!group) return;

    /*
     * Constant gentle rotation.
     */
    group.rotation.y += delta * ROTATION_SPEED;

    /*
     * Mouse-reactive tilt.
     */
    const rawX = clamp(tiltRef.current.x, -1, 1);
    const rawY = clamp(tiltRef.current.y, -1, 1);

    const targetTiltX = rawY * TILT_X_RANGE;
    const targetTiltZ = -rawX * TILT_Z_RANGE;

    const tiltLerp = Math.min(1, delta * TILT_DAMPING);

    currentTiltX.current = THREE.MathUtils.lerp(
      currentTiltX.current,
      targetTiltX,
      tiltLerp
    );

    currentTiltZ.current = THREE.MathUtils.lerp(
      currentTiltZ.current,
      targetTiltZ,
      tiltLerp
    );

    group.rotation.x = currentTiltX.current;
    group.rotation.z = currentTiltZ.current;

    /*
     * Smooth emissive transition.
     *
     * IMPORTANT:
     * We no longer traverse the entire GLTF scene every frame.
     * The materials were collected once above, so this is now a
     * simple array iteration.
     */
    const emissiveTarget = hoveredRef.current
      ? HOVER_EMISSIVE
      : BASE_EMISSIVE;

    const emissiveLerp = Math.min(
      1,
      delta * EMISSIVE_DAMPING
    );

    currentEmissive.current = THREE.MathUtils.lerp(
      currentEmissive.current,
      emissiveTarget,
      emissiveLerp
    );

    for (const material of materials) {
      material.emissiveIntensity = currentEmissive.current;
    }
  });

  return (
    <group ref={groupRef} scale={modelScale}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshBasicMaterial
        color="#B8AEF2"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

export default function Brain3D({
  size = 320,
  modelScale = 0.82,
  className = "",
}) {
  const wrapperRef = useRef(null);

  const tiltRef = useRef({
    x: 0,
    y: 0,
  });

  const hoveredRef = useRef(false);

  const [hovered, setHovered] = useState(false);

  /*
   * Render-loop gating.
   *
   * The Canvas below defaults to rendering 60fps forever, even when
   * this brain is scrolled far off screen or the tab isn't in front.
   * Two independent signals gate it instead:
   *
   *  - inView: is the canvas actually near the viewport right now.
   *  - tabVisible: is this browser tab in front at all.
   *
   * When either goes false, frameloop switches to "never" and R3F
   * simply stops calling useFrame — no teardown, no visual glitch,
   * it just resumes exactly where it left off when both go true
   * again.
   */

  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden
  );

  useEffect(() => {
    const node = wrapperRef.current;

    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {
        // Start rendering slightly before it enters view, so there's
        // no visible pop-in the moment it crosses the edge.
        rootMargin: "200px",
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => setTabVisible(!document.hidden);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
  }, []);

  const frameloop = inView && tabVisible ? "always" : "never";

  useMousePosition(
    wrapperRef,
    ({ normX, normY, active, contained }) => {
      const isInside = Boolean(active && contained);

      /*
       * Only apply pointer tilt while the pointer is actually
       * inside the brain container.
       */
      tiltRef.current = isInside
        ? {
            x: normX,
            y: normY,
          }
        : {
            x: 0,
            y: 0,
          };

      if (hoveredRef.current !== isInside) {
        hoveredRef.current = isInside;
        setHovered(isInside);
      }
    }
  );

  return (
    <motion.div
      ref={wrapperRef}
      className={`relative cursor-pointer ${className}`}
      style={{
        width: size,
        height: size,
      }}
      animate={{
        scale: hovered ? 1.14 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 0.7,
      }}
    >
      {/* Outer halo */}
      <div
        className={`pointer-events-none absolute inset-0 m-auto rounded-full bg-gradient-primary transition-opacity duration-700 ease-in-out ${
          hovered ? "opacity-20" : "opacity-10"
        }`}
        style={{
          width: size * 1.15,
          height: size * 1.15,
          filter: `blur(${size * 0.16}px)`,
        }}
        aria-hidden="true"
      />

      {/* Inner glow */}
      <div
        className={`pointer-events-none absolute inset-0 m-auto rounded-full bg-gradient-primary transition-opacity duration-700 ease-in-out ${
          hovered ? "opacity-45" : "opacity-20"
        }`}
        style={{
          width: size * 0.72,
          height: size * 0.72,
          filter: `blur(${size * 0.09}px)`,
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(circle at center, black 55%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 55%, transparent 78%)",
        }}
      >
        <Canvas
          camera={{ fov: 35 }}
          dpr={[1, MAX_DPR]}
          frameloop={frameloop}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
        >
          <ambientLight intensity={0.9} />

          <directionalLight
            position={[3, 4, 5]}
            intensity={1.4}
            color="#F1ECFB"
          />

          <directionalLight
            position={[-4, -2, -3]}
            intensity={0.5}
            color="#8B7FE8"
          />

          <pointLight
            position={[-3, -2, 2]}
            intensity={0.7}
            color="#F2A98F"
          />

          <Suspense fallback={<Loader />}>
            <Bounds
              fit
              clip
              margin={1.35}
            >
              <Center>
                <BrainModel
                  tiltRef={tiltRef}
                  hoveredRef={hoveredRef}
                  modelScale={modelScale}
                />
              </Center>
            </Bounds>
          </Suspense>
        </Canvas>
      </div>
    </motion.div>
  );
}