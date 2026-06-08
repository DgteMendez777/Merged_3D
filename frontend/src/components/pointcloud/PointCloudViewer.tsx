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

        container.appendChild(renderer.domElement);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        const light = new THREE.AmbientLight(0xffffff, 2);
        scene.add(light);
        const loader = new PLYLoader();
        loader.load(pointCloudUrl, (geometry) => {
            geometry.computeBoundingSphere();
            const material = new THREE.PointsMaterial({size: 2, vertexColors: true});
            const points = new THREE.Points(geometry, material);
            scene.add(points);
            const center = geometry.boundingSphere?.center;

            if (center) {
                points.position.x = -center.x;
                points.position.y = -center.y;
                points.position.z = -center.z;
            }
        });

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }

        animate();
        
        return () => {
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