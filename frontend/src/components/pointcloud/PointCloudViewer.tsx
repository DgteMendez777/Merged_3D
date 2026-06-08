"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

interface Props {
    pointCloudUrl: string;
}

export default function PointCloudViewer({pointCloudUrl}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current)
            return;

        const container = containerRef.current;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#0b1023");
        const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 10000);
        camera.position.set(0, 0, 500);
        const renderer = new THREE.WebGLRenderer({antialias: true});
        
        renderer.setSize(
            container.clientWidth,
            container.clientHeight
        );
        renderer.setPixelRatio(
            window.devicePixelRatio
        );

        container.appendChild(renderer.domElement);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enableZoom = true;
        controls.zoomSpeed = 1.2;
        controls.enablePan = true;
        controls.panSpeed = 1.0;
        controls.rotateSpeed = 1.0;
        controls.screenSpacePanning = true;
        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        scene.add(ambientLight);
        const loader = new PLYLoader();
        loader.load(pointCloudUrl,
            (geometry) => {
                geometry.computeBoundingBox();
                geometry.computeBoundingSphere();
                const sphere = geometry.boundingSphere;

                if (!sphere)
                    return;

                const radius = sphere.radius;
                const center = sphere.center;
                const material = new THREE.PointsMaterial({
                        size: Math.max(
                            radius * 0.002,
                            1
                        ),
                        vertexColors: true,
                    });

                const pointCloud = new THREE.Points(geometry, material);
                
                pointCloud.position.set(
                    -center.x,
                    -center.y,
                    -center.z
                );

                scene.add(pointCloud);
                camera.position.set(0, 0, radius * 2);
                camera.lookAt(0, 0, 0);
                controls.target.set(0, 0, 0);
                controls.minDistance = radius * 0.1;
                controls.maxDistance = radius * 10;
                controls.update();
            }
        );

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!containerRef.current)
                return;

            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(
                containerRef.current.clientWidth,
                containerRef.current.clientHeight
            );
        };

        window.addEventListener("resize", handleResize
        );
        
        return () => {
            window.removeEventListener("resize", handleResize);
            renderer.dispose();

            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        };
    }, [pointCloudUrl]);

    return (
        <div ref={containerRef} className="w-full h-[700px] rounded-2xl overflow-hidden"/>
    );
}