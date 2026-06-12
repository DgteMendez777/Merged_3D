"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

interface Props {
  pointCloudUrls: string[];
}

export default function PointCloudViewer({ pointCloudUrls }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || pointCloudUrls.length === 0) return;

    container.replaceChildren();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1e1e2e");

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      20000
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 10;
    controls.maxDistance = 10000;

    const group = new THREE.Group();
    scene.add(group);

    const grid = new THREE.GridHelper(3000, 60);
    grid.position.y = -300;
    scene.add(grid);

    const axes = new THREE.AxesHelper(500);
    scene.add(axes);

    const loader = new PLYLoader();

    const loadPromises = pointCloudUrls.map((url, index) => {
      return new Promise<THREE.Points>((resolve, reject) => {
        const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");

        loader.load(
          cleanUrl,
          (geometry) => {
            geometry.computeBoundingBox();
            geometry.computeVertexNormals();

            const material = new THREE.PointsMaterial({
              size: 2,
              vertexColors: true,
              transparent: true,
              opacity: index === 1 ? 0.65 : 1,
              sizeAttenuation: false,
            });

            const pointsMesh = new THREE.Points(geometry, material);
            resolve(pointsMesh);
          },
          undefined,
          (error) => reject(error)
        );
      });
    });

    Promise.all(loadPromises)
      .then((meshes) => {
        meshes.forEach((mesh) => group.add(mesh));

        const box = new THREE.Box3().setFromObject(group);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();

        box.getCenter(center);
        box.getSize(size);

        group.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim > 0 ? maxDim * 2.2 : 800;

        camera.position.set(0, 0, distance);
        camera.near = 0.1;
        camera.far = distance * 20;
        camera.updateProjectionMatrix();

        controls.target.set(0, 0, 0);
        controls.update();
      })
      .catch((error) => {
        console.error("Error cargando nubes PLY:", error);
      });

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      controls.dispose();
      renderer.dispose();

      scene.traverse((object) => {
        if (object instanceof THREE.Points) {
          object.geometry.dispose();

          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });

      container.replaceChildren();
    };
  }, [pointCloudUrls]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-2xl overflow-hidden"
    />
  );
}