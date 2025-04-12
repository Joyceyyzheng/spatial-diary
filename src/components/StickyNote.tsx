import { useRef, useMemo } from "react";
import { Group } from "three";
import { useGLTF, Billboard, useTexture } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../store";
import { useSpring, animated } from "@react-spring/three";

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
  const selectedNoteId = useStore((state) => state.selectedNoteId);

  const clonedScene = useMemo(() => {
    const scene = gltf.scene.clone();

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // 克隆原始材质
        const originalMaterial = child.material.clone();

        // 只修改发光相关的属性
        originalMaterial.emissive = new THREE.Color(0xff5e00);
        originalMaterial.emissiveIntensity = selectedNoteId === id ? 3 : 0;
        originalMaterial.needsUpdate = true;

        child.material = originalMaterial;
      }
    });

    return scene;
  }, [gltf.scene, selectedNoteId, id]);
  const groupRef = useRef<Group>(null);
  const texture = useTexture(url);

  const setSelectedNoteId = useStore((state) => state.setSelectedNoteId);

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

  // 在点击笔记时
  const handleClick = () => {
    setSelectedNoteId(id); // id 是笔记的唯一标识符
    console.log("set selected note id", id);
  };

  return (
    <>
      <Billboard position={position} onClick={handleClick}>
        <group
          ref={groupRef}
          position={position}
          onClick={onSelect}
          rotation={[1.5, 0, 0]}
        >
          <primitive
            object={clonedScene}
            scale={selectedNoteId === id ? [0.1, 0.1, 0.1] : [0.06, 0.06, 0.06]}
            receiveShadow
            castShadow
          />
          <pointLight position={[0, 0, 0.5]} intensity={3.0} color="yellow" />
          {isSelected && <meshStandardMaterial color="blue" />}

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
          {/* {isSelected && (
            <pointLight
              position={[0, 0, 0]}
              intensity={1.0}
              color="yellow"
              distance={2}
            />
          )} */}
          {/* <pointLight position={[0, 0, 0.5]} intensity={3.0} color="yellow" /> */}
          {/* 添加连接线 */}
          {/* */}

          {/*---*/}
        </group>
      </Billboard>
    </>
  );
}
