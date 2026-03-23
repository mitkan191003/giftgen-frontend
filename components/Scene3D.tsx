"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import {
	Suspense,
	useEffect,
	useState,
	useMemo,
	useCallback,
} from "react";
import * as THREE from "three";
import { fetchAssetBinary, type BackendAuthContext } from "@/lib/backend";
import { useAppStore } from "@/lib/store";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function detectModelFormat(
	sourceUrl: string,
	explicitFormat?: string,
	contentType?: string,
	bytes?: ArrayBuffer
): string {
	if (explicitFormat) {
		return explicitFormat.toLowerCase();
	}

	const normalizedType = (contentType || "").toLowerCase();
	if (normalizedType.includes("model/gltf-binary") || normalizedType.includes("glb")) {
		return "glb";
	}
	if (normalizedType.includes("model/gltf+json") || normalizedType.includes("gltf")) {
		return "gltf";
	}
	if (normalizedType.includes("ply")) {
		return "ply";
	}
	if (normalizedType.includes("obj")) {
		return "obj";
	}

	if (bytes && bytes.byteLength >= 4) {
		const signature = new TextDecoder().decode(new Uint8Array(bytes, 0, 4));
		if (signature === "glTF") {
			return "glb";
		}
		if (signature.toLowerCase() === "ply\n") {
			return "ply";
		}
	}

	const extension = sourceUrl.split(".").pop()?.toLowerCase();
	return extension || "unknown";
}

function disposeMaterial(material: THREE.Material | THREE.Material[]): void {
	const disposeSingleMaterial = (value: THREE.Material) => {
		for (const slot of ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap"] as const) {
			const texture = (value as THREE.MeshStandardMaterial)[slot];
			texture?.dispose();
		}
		value.dispose();
	};

	if (Array.isArray(material)) {
		material.forEach(disposeSingleMaterial);
		return;
	}

	disposeSingleMaterial(material);
}

function disposeObject3D(object: THREE.Object3D | null): void {
	if (!object) {
		return;
	}

	object.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			child.geometry.dispose();
			disposeMaterial(child.material);
		}
	});
}

function normalizeMaterial(material: THREE.Material): THREE.Material {
	const clone = material.clone();
	clone.side = THREE.DoubleSide;

	if (clone instanceof THREE.MeshStandardMaterial) {
		clone.metalness = Math.min(clone.metalness, 0.25);
		clone.roughness = Math.max(clone.roughness, 0.6);
		clone.envMapIntensity = 1.2;
		clone.needsUpdate = true;
	}

	return clone;
}

interface ModelProps {
	url: string;
	format?: string; // Explicit format from API (glb, ply, obj)
	position: [number, number, number];
	rotation: [number, number, number];
	scale: [number, number, number];
	auth?: BackendAuthContext;
	isSelected: boolean;
	onSelect: () => void;
}

function Model({
	url,
	format: explicitFormat,
	position,
	rotation,
	scale,
	auth,
	isSelected,
	onSelect,
}: ModelProps) {
	const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
	const [sceneObject, setSceneObject] = useState<THREE.Object3D | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [modelScale, setModelScale] = useState<number>(1);
	const [hasVertexColors, setHasVertexColors] = useState(false);

	useEffect(() => () => geometry?.dispose(), [geometry]);
	useEffect(() => () => disposeObject3D(sceneObject), [sceneObject]);

	useEffect(() => {
		let cancelled = false;

		const loadModel = async () => {
			try {
				setError(null);
				setGeometry(null);
				setSceneObject(null);
				setHasVertexColors(false);

				const inlineResponse = url.startsWith("data:") || url.startsWith("blob:")
					? await fetch(url)
					: null;
				const remoteAsset = inlineResponse ? null : await fetchAssetBinary(url, auth);
				const bytes = inlineResponse
					? await inlineResponse.arrayBuffer()
					: remoteAsset!.bytes;
				const contentType =
					inlineResponse?.headers.get("content-type") ||
					remoteAsset?.contentType ||
					"";
				const format = detectModelFormat(url, explicitFormat, contentType, bytes);

				console.log(
					"Loading model format:",
					format,
					"from explicitFormat:",
					explicitFormat,
					"byteLength:",
					bytes.byteLength
				);

				if (format === "glb" || format === "gltf") {
					const gltfLoader = new GLTFLoader();
					const payload =
						format === "glb" ? bytes : new TextDecoder().decode(new Uint8Array(bytes));
					gltfLoader.parse(
						payload,
						"",
						(gltf) => {
							if (cancelled) return;

							const scene = gltf.scene.clone(true);
							let meshCount = 0;
							scene.traverse((child) => {
								if (child instanceof THREE.Mesh) {
									meshCount += 1;
									child.geometry = child.geometry.clone();
									if (Array.isArray(child.material)) {
										child.material = child.material.map(normalizeMaterial);
									} else {
										child.material = normalizeMaterial(child.material);
									}
								}
							});

							if (meshCount === 0) {
								setError("GLB has no geometry");
								return;
							}

							const bbox = new THREE.Box3().setFromObject(scene);
							const size = bbox.getSize(new THREE.Vector3());
							const center = bbox.getCenter(new THREE.Vector3());
							const maxDim = Math.max(size.x, size.y, size.z);
							setModelScale(maxDim > 0 ? 2 / maxDim : 1);
							scene.position.sub(center);

							console.log("GLB loaded successfully");
							setSceneObject(scene);
						},
						(error) => {
							console.error("GLB load error:", error);
							if (!cancelled) setError("Failed to load GLB");
						}
					);
				} else if (format === "obj") {
					const objLoader = new OBJLoader();
					try {
						const obj = objLoader.parse(new TextDecoder().decode(new Uint8Array(bytes)));
						if (cancelled) return;
						obj.traverse((child) => {
							if (child instanceof THREE.Mesh) {
								const geo = child.geometry.clone();
								geo.rotateX(-Math.PI / 2);
								geo.computeBoundingBox();
								geo.center();

								const bbox = geo.boundingBox!;
								const size = new THREE.Vector3();
								bbox.getSize(size);
								const maxDim = Math.max(size.x, size.y, size.z);
								setModelScale(maxDim > 0 ? 2 / maxDim : 1);

								setGeometry(geo);
							}
						});
					} catch (error) {
						console.error("OBJ load error:", error);
						if (!cancelled) {
							setError("Failed to load OBJ");
						}
					}
				} else if (format === "ply") {
					const plyLoader = new PLYLoader();
					try {
						const geo = plyLoader.parse(bytes);
						if (cancelled) {
							geo.dispose();
							return;
						}

						const posAttr = geo.getAttribute("position");
						if (!posAttr || posAttr.count === 0) {
							setError("PLY has no geometry");
							geo.dispose();
							return;
						}

						geo.rotateX(-Math.PI / 2);
						geo.computeVertexNormals();
						geo.computeBoundingBox();

						const colorAttr = geo.getAttribute("color");
						if (colorAttr) {
							console.log("PLY has vertex colors, count:", colorAttr.count);

							let maxColor = 0;
							for (let i = 0; i < colorAttr.count * 3; i++) {
								maxColor = Math.max(maxColor, colorAttr.array[i]);
							}

							const enhancedColors = new Float32Array(colorAttr.array.length);
							const normalize = maxColor > 1 ? 255 : 1;

							for (let i = 0; i < colorAttr.count; i++) {
								const r = colorAttr.array[i * 3] / normalize;
								const g = colorAttr.array[i * 3 + 1] / normalize;
								const b = colorAttr.array[i * 3 + 2] / normalize;

								const gamma = 0.5;
								const avg = (r + g + b) / 3;
								const satBoost = 1.4;
								let sr = avg + (r - avg) * satBoost;
								let sg = avg + (g - avg) * satBoost;
								let sb = avg + (b - avg) * satBoost;
								sr = Math.max(0, Math.min(1, sr));
								sg = Math.max(0, Math.min(1, sg));
								sb = Math.max(0, Math.min(1, sb));
								enhancedColors[i * 3] = Math.min(1, Math.pow(sr, gamma));
								enhancedColors[i * 3 + 1] = Math.min(1, Math.pow(sg, gamma));
								enhancedColors[i * 3 + 2] = Math.min(1, Math.pow(sb, gamma));
							}

							geo.setAttribute(
								"color",
								new THREE.BufferAttribute(enhancedColors, 3)
							);
							setHasVertexColors(true);
						} else {
							setHasVertexColors(false);
						}

						const bbox = geo.boundingBox!;
						const size = new THREE.Vector3();
						bbox.getSize(size);
						const maxDim = Math.max(size.x, size.y, size.z);

						setModelScale(maxDim > 0 ? 2 / maxDim : 1);

						geo.center();
						setGeometry(geo);
					} catch (error) {
						console.error("PLY load error:", error);
						if (!cancelled) {
							setError("Failed to load PLY");
						}
					}
				} else {
					console.log("Unknown format, trying GLB parser as fallback");
					const gltfLoader = new GLTFLoader();
					gltfLoader.parse(
						bytes,
						"",
						(gltf) => {
							if (cancelled) return;

							const scene = gltf.scene.clone(true);
							let meshCount = 0;
							scene.traverse((child) => {
								if (child instanceof THREE.Mesh) {
									meshCount += 1;
									child.geometry = child.geometry.clone();
									if (Array.isArray(child.material)) {
										child.material = child.material.map(normalizeMaterial);
									} else {
										child.material = normalizeMaterial(child.material);
									}
								}
							});

							if (meshCount === 0) {
								setError("No geometry found");
								return;
							}

							const bbox = new THREE.Box3().setFromObject(scene);
							const size = bbox.getSize(new THREE.Vector3());
							const center = bbox.getCenter(new THREE.Vector3());
							scene.position.sub(center);
							const maxDim = Math.max(size.x, size.y, size.z);
							setModelScale(maxDim > 0 ? 2 / maxDim : 1);
							setSceneObject(scene);
						},
						() => {
							if (!cancelled) setError("Unsupported format");
						}
					);
				}
			} catch (e) {
				console.error("Model load error:", e);
				if (!cancelled) setError("Failed to load model");
			}
		};

		loadModel();

		return () => {
			cancelled = true;
		};
	}, [auth, explicitFormat, url]);

	// Compute final scale
	const finalScale = useMemo<[number, number, number]>(
		() => [scale[0] * modelScale, scale[1] * modelScale, scale[2] * modelScale],
		[scale, modelScale]
	);

	if (error) {
		return (
			<mesh position={position} onClick={onSelect}>
				<boxGeometry args={[0.5, 0.5, 0.5]} />
				<meshStandardMaterial color="#ff4444" />
			</mesh>
		);
	}

	if (sceneObject) {
		return (
			<group
				position={position}
				rotation={rotation}
				scale={finalScale}
				onClick={(e) => {
					e.stopPropagation();
					onSelect();
				}}
			>
				<primitive object={sceneObject} />
			</group>
		);
	}

	if (!geometry) {
		return (
			<mesh position={position}>
				<boxGeometry args={[0.3, 0.3, 0.3]} />
				<meshStandardMaterial color="#4fc3f7" wireframe />
			</mesh>
		);
	}

	return (
		<mesh
			geometry={geometry}
			position={position}
			rotation={rotation}
			scale={finalScale}
			onClick={(e) => {
				e.stopPropagation();
				onSelect();
			}}
		>
			{hasVertexColors ? (
				<meshBasicMaterial
					vertexColors
					side={THREE.DoubleSide}
					opacity={isSelected ? 0.9 : 1}
					transparent={isSelected}
				/>
			) : (
				<meshStandardMaterial
					color={isSelected ? "#00ff88" : "#cccccc"}
					metalness={0.1}
					roughness={0.8}
					side={THREE.DoubleSide}
				/>
			)}
		</mesh>
	);
}

function GiftBox({
	position,
	scale = 1,
}: {
	position: [number, number, number];
	scale?: number;
}) {
	return (
		<group position={position}>
			<mesh>
				<boxGeometry args={[scale, scale * 0.8, scale]} />
				<meshStandardMaterial color="#e74c3c" metalness={0.2} roughness={0.8} />
			</mesh>
			<mesh position={[0, 0, 0]}>
				<boxGeometry args={[scale * 1.02, scale * 0.1, scale * 0.1]} />
				<meshStandardMaterial color="#f1c40f" metalness={0.5} roughness={0.3} />
			</mesh>
			<mesh position={[0, 0, 0]}>
				<boxGeometry args={[scale * 0.1, scale * 0.82, scale * 0.1]} />
				<meshStandardMaterial color="#f1c40f" metalness={0.5} roughness={0.3} />
			</mesh>
			<group position={[0, scale * 0.45, 0]}>
				<mesh rotation={[0, 0, Math.PI / 4]}>
					<torusGeometry args={[scale * 0.15, scale * 0.03, 8, 16]} />
					<meshStandardMaterial
						color="#f1c40f"
						metalness={0.5}
						roughness={0.3}
					/>
				</mesh>
				<mesh rotation={[0, 0, -Math.PI / 4]}>
					<torusGeometry args={[scale * 0.15, scale * 0.03, 8, 16]} />
					<meshStandardMaterial
						color="#f1c40f"
						metalness={0.5}
						roughness={0.3}
					/>
				</mesh>
			</group>
		</group>
	);
}

interface Scene3DProps {
	showGiftPreview?: boolean;
	viewOnly?: boolean;
	objects?: Array<{
		id: string;
		url: string;
		format?: string;
		position: [number, number, number];
		rotation: [number, number, number];
		scale: [number, number, number];
	}>;
}

export default function Scene3D({
	showGiftPreview = false,
	viewOnly = false,
	objects: propObjects,
}: Scene3DProps) {
	const { sceneObjects, selectedObjectId, setSelectedObjectId, user, session } =
		useAppStore();
	const displayObjects = propObjects || sceneObjects;
	const [canvasKey, setCanvasKey] = useState(0);

	// Force canvas recreation if context is lost
	const handleContextLost = useCallback((e: Event) => {
		e.preventDefault();
		console.warn("WebGL context lost, recreating canvas...");
		setTimeout(() => setCanvasKey((k) => k + 1), 100);
	}, []);

	return (
		<div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl overflow-hidden">
			<Canvas
				key={canvasKey}
				camera={{ position: [4, 3, 4], fov: 50, near: 0.1, far: 50 }}
				gl={{
					antialias: false, // Disable for performance
					powerPreference: "high-performance",
					preserveDrawingBuffer: false,
				}}
				onCreated={({ gl }) => {
					gl.domElement.addEventListener("webglcontextlost", handleContextLost);
				}}
			>
				<ambientLight intensity={1.1} />
				<hemisphereLight args={["#ffffff", "#0f172a", 1.25]} />
				<directionalLight position={[5, 10, 5]} intensity={1.6} />
				<directionalLight position={[-4, 6, -3]} intensity={0.8} />

				<Suspense fallback={null}>
					{showGiftPreview ? (
						<GiftBox position={[0, 0.4, 0]} scale={1.5} />
					) : (
						displayObjects.map((obj) => (
							<Model
								key={obj.id}
								url={obj.url}
								format={obj.format}
								position={obj.position}
								rotation={obj.rotation}
								scale={obj.scale}
								auth={{ user, session }}
								isSelected={selectedObjectId === obj.id}
								onSelect={() => !viewOnly && setSelectedObjectId(obj.id)}
							/>
						))
					)}
				</Suspense>

				<Grid
					cellSize={0.5}
					cellThickness={0.5}
					sectionSize={2}
					sectionThickness={1}
					fadeDistance={15}
					cellColor="#334155"
					sectionColor="#475569"
				/>

				<OrbitControls
					enableDamping
					dampingFactor={0.05}
					minDistance={1}
					maxDistance={10}
				/>
			</Canvas>
		</div>
	);
}
