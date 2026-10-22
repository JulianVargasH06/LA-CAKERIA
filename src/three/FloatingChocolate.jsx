import { useMemo } from 'react'
import * as THREE from 'three'
import { createChocolateCurlGeometry, createChocolateShardGeometries } from './cakeGeometry'
import { useFloat } from './useFloat'

let shards
let curl
let material

function getAssets() {
  if (!shards) {
    shards = createChocolateShardGeometries()
    curl = createChocolateCurlGeometry()
    material = new THREE.MeshPhysicalMaterial({
      color: '#2b0f07',
      roughness: 0.32,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
      side: THREE.DoubleSide,
    })
  }
  return { shards, curl, material }
}

/** Chocolate shard or curl suspended in the air (variant: 0-3 shards, 'curl'). */
export default function FloatingChocolate({ variant = 0, rotation = [0, 0, 0], ...float }) {
  const ref = useFloat(float)
  const { geometry, mat } = useMemo(() => {
    const a = getAssets()
    return {
      geometry: variant === 'curl' ? a.curl : a.shards[variant % a.shards.length],
      mat: a.material,
    }
  }, [variant])

  return (
    <group ref={ref} position={float.position} rotation={rotation}>
      <mesh geometry={geometry} material={mat} />
    </group>
  )
}
