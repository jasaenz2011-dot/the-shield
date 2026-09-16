import { Canvas } from '@react-three/fiber'
import { Center, Float, Text3D } from '@react-three/drei'
import { useAppStore } from '../../app/store/appStore'

// Real extruded 3D geometry with lighting, floating gently. dpr is capped and
// antialias left to the (cheap) default so this stays free on integrated GPUs.
export function NameText3D({ name }: { name: string }) {
  const colors = useAppStore((s) => s.config.colors)
  const display = name.trim().toUpperCase() || 'PLAYER 1'
  // Keep long names on screen: shrink with length.
  const size = Math.min(1.15, 7.5 / Math.max(display.length, 4))

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, powerPreference: 'low-power' }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-4, -2, 2]} intensity={0.6} color={colors.accent} />
      <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.35}>
        <Center>
          <Text3D
            font="fonts/helvetiker_bold.typeface.json"
            size={size}
            height={0.32}
            curveSegments={8}
            bevelEnabled
            bevelThickness={0.04}
            bevelSize={0.025}
            bevelSegments={3}
          >
            {display}
            <meshStandardMaterial color={colors.primary} metalness={0.4} roughness={0.22} />
          </Text3D>
        </Center>
      </Float>
    </Canvas>
  )
}
