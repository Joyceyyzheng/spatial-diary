import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useGLTF, OrbitControls } from "@react-three/drei";
import "./EarthView.css";

interface Scene {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  createdAt: number;
}

interface EarthViewProps {
  scenes: Scene[];
  onSceneSelect: (sceneId: string) => void;
  onSceneDelete: (sceneId: string) => void;
}

const EarthView: React.FC<EarthViewProps> = ({
  scenes,
  onSceneSelect,
  onSceneDelete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<{ [key: string]: THREE.Mesh }>({});
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);

  // 初始化Three.js场景
  useEffect(() => {
    if (!containerRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000000);

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 5;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    // 添加轨道控制
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.05;
    // controls.rotateSpeed = 0.5;

    // 创建地球
    const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
    const earthMaterial = new THREE.MeshBasicMaterial({
      color: 0x2233ff,
      wireframe: true,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthRef.current = earth;
    scene.add(earth);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      //  controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      cameraRef.current.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // 处理点击事件
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current)
        return;

      // 计算鼠标位置
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x =
        ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 -
        1;
      mouseRef.current.y =
        -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 +
        1;

      // 射线检测
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(
        Object.values(markersRef.current)
      );

      if (intersects.length > 0) {
        const marker = intersects[0].object as THREE.Mesh;
        const sceneId = marker.userData.sceneId;

        // 设置选中的标记和场景
        setSelectedMarker(sceneId);
        const scene = scenes.find((s) => s.id === sceneId) || null;
        setSelectedScene(scene);

        // 计算弹出框位置
        const vector = new THREE.Vector3();
        vector.setFromMatrixPosition(marker.matrixWorld);
        vector.project(cameraRef.current);

        const x = (vector.x * 0.5 + 0.5) * containerRef.current.clientWidth;
        const y = (-vector.y * 0.5 + 0.5) * containerRef.current.clientHeight;

        setPopupPosition({ x, y });
      } else {
        setSelectedMarker(null);
        setSelectedScene(null);
        setPopupPosition(null);
      }
    };
    containerRef.current.addEventListener("click", handleClick);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener("click", handleClick);
        if (rendererRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      renderer.dispose();
    };
  }, []);

  // 更新场景标记
  useEffect(() => {
    if (!sceneRef.current || !earthRef.current) return;

    // 清除现有标记
    Object.values(markersRef.current).forEach((marker) => {
      sceneRef.current?.remove(marker);
    });
    markersRef.current = {};

    // 添加新标记
    scenes.forEach((scene) => {
      // 如果没有经纬度，随机生成一个
      const latitude = scene.latitude ?? Math.random() * 180 - 90;
      const longitude = scene.longitude ?? Math.random() * 360 - 180;

      // 将经纬度转换为3D坐标
      const phi = (90 - latitude) * (Math.PI / 180);
      const theta = (longitude + 180) * (Math.PI / 180);

      const x = -(2.1 * Math.sin(phi) * Math.cos(theta));
      const y = 2.1 * Math.cos(phi);
      const z = 2.1 * Math.sin(phi) * Math.sin(theta);

      // 创建标记
      const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);

      marker.position.set(x, y, z);
      marker.userData = { sceneId: scene.id };

      sceneRef.current?.add(marker);
      markersRef.current[scene.id] = marker;
    });
  }, [scenes]);

  // 处理场景选择
  const handleSceneOpen = () => {
    if (selectedScene) {
      onSceneSelect(selectedScene.id);
      setSelectedMarker(null);
      setSelectedScene(null);
      setPopupPosition(null);
    }
  };

  // 处理场景删除
  const handleSceneDelete = () => {
    if (selectedScene) {
      onSceneDelete(selectedScene.id);
      setSelectedMarker(null);
      setSelectedScene(null);
      setPopupPosition(null);
    }
  };

  return (
    <div className="earth-view-container" ref={containerRef}>
      {selectedScene && popupPosition && (
        <div
          className="scene-popup"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
          }}
        >
          <h3>{selectedScene.name || "未命名场景"}</h3>
          <p>创建时间: {new Date(selectedScene.createdAt).toLocaleString()}</p>
          <div className="popup-buttons">
            <button onClick={handleSceneOpen}>打开</button>
            <button onClick={handleSceneDelete} className="delete-button">
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarthView;
