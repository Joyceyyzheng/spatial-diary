import { useRef, useMemo } from "react";
import { Group } from "three";
import { useGLTF, Billboard, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface StickyNoteProps {
  id: string;
  url: string;
  position: [number, number, number];
  content?: string;
  imageUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
  nextNotePosition?: [number, number, number]; //for the shining line
}

export default function StickyNote({
  id,
  url,
  position,
  content,
  imageUrl,
  isSelected,
  onSelect,
  nextNotePosition,
}: StickyNoteProps) {
  const gltf = useGLTF(url);
  const clonedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  const groupRef = useRef<Group>(null);
  const texture = useTexture(url);

  //calc the connecting dots for shining line
  const linePoints = useMemo(() => {
    if (!nextNotePosition) return null;

    const start = new THREE.Vector3(0, 0, 0); // 从当前便签位置开始
    // 终点是下一个便签的位置（在世界坐标系中）减去当前便签的位置
    // 这样我们得到的是从当前便签到下一个便签的相对向量
    const end = new THREE.Vector3(
      nextNotePosition[0] - (groupRef.current?.position.x || 0),
      nextNotePosition[1] - (groupRef.current?.position.y || 0),
      nextNotePosition[2] - (groupRef.current?.position.z || 0)
    );

    // 创建一条稍微弯曲的线（通过添加中间点）
    const midPoint = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);
    // 添加一点高度使线条弯曲
    midPoint.y += 0.3;

    return [start, midPoint, end];
  }, [nextNotePosition, groupRef.current?.position]);

  return (
    <>
      <Billboard position={position} onClick={onSelect}>
        <group
          ref={groupRef}
          position={position}
          onClick={onSelect}
          rotation={[1.5, 0, 0]}
        >
          <primitive
            object={clonedScene}
            scale={[0.06, 0.06, 0.06]}
            receiveShadow
            castShadow
          />
          {/* {content && (
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.2}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {content}
          </Text>
        )} */}
          {/* {imageUrl && (
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={new TextureLoader().load(imageUrl)} />
          </mesh>
        )} */}
          <pointLight position={[0, 0, 0.5]} intensity={3.0} color="yellow" />
          {isSelected && <meshStandardMaterial color="blue" />}

          {/* 添加连接线 */}
          {linePoints && (
            <group>
              {/* 发光线 */}
              <mesh>
                <tubeGeometry
                  args={[
                    new THREE.CatmullRomCurve3(linePoints),
                    20, // 分段数
                    0.02, // 管道半径
                    8, // 管道截面分段数
                    false, // 是否闭合
                  ]}
                />
                <meshStandardMaterial
                  color="#4fc3f7"
                  emissive="#4fc3f7"
                  emissiveIntensity={2}
                  toneMapped={false}
                />
              </mesh>
              {/* 外部发光效果 */}
              <mesh>
                <tubeGeometry
                  args={[
                    new THREE.CatmullRomCurve3(linePoints),
                    20,
                    0.04, // 稍大的半径形成外发光
                    8,
                    false,
                  ]}
                />
                <meshBasicMaterial
                  color="#4fc3f7"
                  transparent={true}
                  opacity={0.3}
                />
              </mesh>
            </group>
          )}
          {/*---*/}
        </group>
      </Billboard>
    </>
  );
}
