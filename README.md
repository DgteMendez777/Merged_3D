# Merged_3D

## Descripción del Proyecto

Este proyecto es un sistema de reconstrucción 3D basado en visión por computadora e inteligencia artificial que combina múltiples modelos de estimación de profundidad para generar una nube de puntos robusta y consistente.

El sistema permite al usuario:

* Subir una imagen
* Seleccionar un objeto mediante clic
* Segmentarlo automáticamente (SAM)
* Estimar profundidad con múltiples modelos de IA
* Comparar resultados entre modelos
* Generar una nube de puntos fusionada
* Visualizar el resultado en 3D
* Exportar a formato PLY para Blender

---

## Arquitectura

* Frontend: Next.js + Tailwind + React Three Fiber
* Backend: FastAPI + PyTorch + Open3D
* IA: MiDaS, Depth Anything, Metric3D, AdaBins, Depth Pro
* Comunicación: REST API

---

## Pipeline

Imagen → Segmentación (SAM) → Modelos de profundidad (A/B) → ICP → Convergencia → Nube 3D → Visualización → Exportación

---

## Estructura del proyecto

Monorepo con frontend, backend, notebooks y documentación.

---

## Objetivo final

Construir un sistema experimental de fusión de profundidad basado en consenso entre modelos de IA.
