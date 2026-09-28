import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Eye, RotateCcw, Play, Pause, Cpu, Layers, Sparkles, BookOpen, Wrench, Activity, ChevronRight, Zap, Loader2 } from 'lucide-react';

export type ModelType = 'rover' | 'arm' | 'arduino' | 'android' | 'drone';

export interface ModelMetadata {
  id: ModelType;
  name: string;
  category: string;
  badge: string;
  summary: string;
  educationalNotes: string;
  specs: {
    dof: string;
    compute: string;
    sensors: string;
    power: string;
    protocol: string;
  };
  learningTopics: string[];
}

export const ROBOTICS_MODELS: Record<ModelType, ModelMetadata> = {
  rover: {
    id: 'rover',
    name: 'Autonomous Ground Rover',
    category: 'Unmanned Ground Vehicles (UGV)',
    badge: 'ROS2 NAV2 STACK',
    summary: 'All-terrain 4-wheel drive research rover engineered for outdoor autonomous SLAM and obstacle traversal.',
    educationalNotes: 'Students learn differential drive kinematics, wheel odometry fusion via Extended Kalman Filtering (EKF), LiDAR 2D/3D point-cloud mapping, and local path planning with Nav2 costmaps.',
    specs: {
      dof: '4-Wheel Independent Drive',
      compute: 'Raspberry Pi 5 + STM32 F405',
      sensors: 'RPLiDAR A2 (360°), BNO055 9-DOF IMU, Wheel Encoders',
      power: '4S 14.8V 5200mAh LiPo',
      protocol: 'Micro-ROS over CAN Bus 2.0B'
    },
    learningTopics: ['LiDAR SLAM & Gmapping', 'Odometry EKF Fusion', 'Obstacle Costmaps', 'Motor PWM & H-Bridge Control']
  },
  arm: {
    id: 'arm',
    name: '6-Axis Articulated Arm',
    category: 'Manipulators & Industrial Automation',
    badge: 'REAL 3D GLB MODEL',
    summary: 'Precision multi-joint industrial robotic manipulator equipped with a two-finger pneumatic gripper.',
    educationalNotes: 'Students master forward and inverse kinematics using Denavit-Hartenberg (D-H) parameter matrices, trajectory interpolation with MoveIt 2, and closed-loop PID servo position tuning.',
    specs: {
      dof: '6 Revolute Degrees of Freedom',
      compute: 'ESP32-S3 Dual-Core @ 240MHz',
      sensors: 'Magnetic Absolute Encoders (14-bit AS5600)',
      power: '24V 15A Regulated DC Bus',
      protocol: 'Modbus RTU / RS-485'
    },
    learningTopics: ['Denavit-Hartenberg Matrices', 'Inverse Kinematics (IK Fast)', 'End-Effector Trajectories', 'Closed-Loop PID Servos']
  },
  arduino: {
    id: 'arduino',
    name: 'Embedded Microcontroller Board',
    category: 'Hardware Prototyping & Compute',
    badge: 'HARDWARE ROOT',
    summary: 'High-performance embedded control board with ATmega core, GPIO headers, and power regulation.',
    educationalNotes: 'The cornerstone of robotics electronics. Students learn hardware interrupt service routines (ISR), timer-counter registers, SPI/I2C digital communications, and ADC sensor sampling.',
    specs: {
      dof: '14 Digital I/O + 6 Analog In',
      compute: 'ATmega328P 8-bit AVR @ 16MHz',
      sensors: 'Onboard Hardware Timer & ADC',
      power: '7-12V Input (5V / 3.3V Logic Rails)',
      protocol: 'UART, I2C, SPI Bus'
    },
    learningTopics: ['Timer Registers & Fast PWM', 'Hardware Interrupts (ISRs)', 'Analog-to-Digital Conversion', 'PCB Schematic & Layout']
  },
  android: {
    id: 'android',
    name: 'Bipedal Humanoid Android',
    category: 'Biomimetic Walking Robotics',
    badge: 'REAL 3D GLB MODEL',
    summary: 'Articulated bipedal humanoid robot designed for research in dynamic gait balance and human-robot interaction.',
    educationalNotes: 'Explores Zero-Moment Point (ZMP) stability, inverted pendulum walking models, stereoscopic computer vision for spatial awareness, and coordinated multi-actuator gait generation.',
    specs: {
      dof: '18 Active Joint Servos',
      compute: 'NVIDIA Jetson Orin Nano + Teensy 4.1',
      sensors: 'Stereo Depth Cam, 6-Axis Foot Force Sensors, IMU',
      power: '6S 22.2V Li-Ion High Discharge',
      protocol: 'EtherCAT / ROS2 FastDDS'
    },
    learningTopics: ['ZMP Dynamic Balance', 'Linear Inverted Pendulum', 'Depth Camera Spatial Perception', 'Multi-Limb Gait Cycles']
  },
  drone: {
    id: 'drone',
    name: 'Autonomous Aerial Quadcopter',
    category: 'Unmanned Aerial Systems (UAS)',
    badge: 'AERODYNAMICS & UAV',
    summary: 'Carbon-fiber X-frame aerial drone with brushless propulsion and autonomous waypoint navigation.',
    educationalNotes: 'Focuses on 6-DOF rigid body quadrotor dynamics, quaternion orientation math, attitude PID cascaded control loops, optical flow GPS-denied hovering, and fail-safe return-to-launch (RTL).',
    specs: {
      dof: '6-DOF (Roll, Pitch, Yaw, Z Thrust)',
      compute: 'Pixhawk 6C Autopilot + ESP32 Cam',
      sensors: 'Barometer, Magnetometer, Optical Flow, GPS RTK',
      power: '4S 1500mAh 100C LiPo',
      protocol: 'MAVLink 2.0 / CRSF Telemetry'
    },
    learningTopics: ['Cascaded PID Attitude Loops', 'Quaternion Rotation Math', 'Optical Flow Hovering', 'Brushless ESC DShot Protocols']
  }
};

interface RoboticsCanvas3DProps {
  className?: string;
}

export const RoboticsCanvas3D: React.FC<RoboticsCanvas3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeModel, setActiveModel] = useState<ModelType>('arm');
  const [isWireframe, setIsWireframe] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isLoadingModel, setIsLoadingModel] = useState(false);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const activeMeshGroupRef = useRef<THREE.Group | null>(null);
  const dynamicPartsRef = useRef<{ [key: string]: any }>({});
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const animationMixerRef = useRef<THREE.AnimationMixer | null>(null);
  
  // Interaction state
  const targetRotationRef = useRef({ x: 0.2, y: 0.4 });
  const currentRotationRef = useRef({ x: 0.2, y: 0.4 });
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  // Re-build active 3D model
  const rebuildModel = (modelType: ModelType, scene: THREE.Scene) => {
    if (activeMeshGroupRef.current) {
      scene.remove(activeMeshGroupRef.current);
      activeMeshGroupRef.current.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
      });
      activeMeshGroupRef.current = null;
    }
    dynamicPartsRef.current = {};
    materialsRef.current = [];

    const group = new THREE.Group();
    activeMeshGroupRef.current = group;

    // Materials Palette
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.85,
      wireframe: isWireframe,
    });
    const indigoMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      roughness: 0.25,
      metalness: 0.85,
      wireframe: isWireframe,
    });
    const violetMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      roughness: 0.3,
      metalness: 0.75,
      wireframe: isWireframe,
    });
    const amberMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.6,
      emissive: 0x78350f,
      wireframe: isWireframe,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.1,
      metalness: 0.95,
      wireframe: isWireframe,
    });
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      roughness: 0.8,
      metalness: 0.1,
      wireframe: isWireframe,
    });
    const circuitMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.4,
      metalness: 0.5,
      wireframe: isWireframe,
    });

    materialsRef.current.push(carbonMat, indigoMat, violetMat, amberMat, chromeMat, rubberMat, circuitMat);

    // Build Model by type
    if (modelType === 'rover') {
      // --- AUTONOMOUS MOBILE ROVER ---
      // 1. Chassis Body
      const chassisGeo = new THREE.BoxGeometry(2.6, 0.7, 1.8);
      const chassis = new THREE.Mesh(chassisGeo, carbonMat);
      chassis.position.y = 1.0;
      chassis.castShadow = true;
      group.add(chassis);

      // Top Deck
      const deckGeo = new THREE.BoxGeometry(2.2, 0.15, 1.4);
      const deck = new THREE.Mesh(deckGeo, indigoMat);
      deck.position.y = 1.42;
      group.add(deck);

      // 4 Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 24);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheelPositions = [
        [-1.1, 0.55, 1.1],
        [1.1, 0.55, 1.1],
        [-1.1, 0.55, -1.1],
        [1.1, 0.55, -1.1],
      ];
      wheelPositions.forEach((pos) => {
        const wheel = new THREE.Mesh(wheelGeo, rubberMat);
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.castShadow = true;
        group.add(wheel);

        // Wheel Rim Hub
        const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.38, 16);
        rimGeo.rotateZ(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeo, amberMat);
        rim.position.set(pos[0], pos[1], pos[2]);
        group.add(rim);
      });

      // Rotating LiDAR Tower on top
      const lidarPillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 16);
      const lidarPillar = new THREE.Mesh(lidarPillarGeo, chromeMat);
      lidarPillar.position.set(0, 1.7, 0);
      group.add(lidarPillar);

      const lidarHeadGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
      const lidarHead = new THREE.Mesh(lidarHeadGeo, amberMat);
      lidarHead.position.set(0, 2.0, 0);
      group.add(lidarHead);
      dynamicPartsRef.current.lidar = lidarHead;

      // Stereo Camera Mast
      const mastGeo = new THREE.BoxGeometry(0.15, 0.8, 0.15);
      const mast = new THREE.Mesh(mastGeo, carbonMat);
      mast.position.set(0.8, 1.8, 0);
      group.add(mast);

      const eyeBarGeo = new THREE.BoxGeometry(0.12, 0.16, 0.7);
      const eyeBar = new THREE.Mesh(eyeBarGeo, indigoMat);
      eyeBar.position.set(0.85, 2.15, 0);
      group.add(eyeBar);

      // Stereo Eyes
      const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const leftEye = new THREE.Mesh(eyeGeo, amberMat);
      leftEye.position.set(0.92, 2.15, 0.22);
      const rightEye = new THREE.Mesh(eyeGeo, amberMat);
      rightEye.position.set(0.92, 2.15, -0.22);
      group.add(leftEye, rightEye);

    } else if (modelType === 'arm') {
      // --- 6-AXIS ARTICULATED ROBOTIC ARM (REAL GLB WITH PROCEDURAL FALLBACK) ---
      setIsLoadingModel(true);
      const loader = new GLTFLoader();
      loader.load(
        '/models/robotic_arm.glb',
        (gltf) => {
          setIsLoadingModel(false);
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 3.6 / (maxDim || 1);
          model.scale.set(scale, scale, scale);
          model.position.x = -center.x * scale;
          model.position.y = -box.min.y * scale;
          model.position.z = -center.z * scale;
          model.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (isWireframe && child.material) {
                if (Array.isArray(child.material)) child.material.forEach((m: any) => { m.wireframe = true; });
                else child.material.wireframe = true;
              }
            }
          });
          group.add(model);
        },
        undefined,
        (err) => {
          console.warn('Fallback to procedural arm:', err);
          setIsLoadingModel(false);
          // Procedural Arm Fallback
          const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.4, 32);
          const base = new THREE.Mesh(baseGeo, carbonMat);
          base.position.y = 0.2;
          group.add(base);
          const turretGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.6, 24);
          const turret = new THREE.Mesh(turretGeo, indigoMat);
          turret.position.y = 0.7;
          group.add(turret);
        }
      );

    } else if (modelType === 'arduino') {
      // --- ARDUINO / EMBEDDED BOARD ---
      // PCB Board
      const pcbGeo = new THREE.BoxGeometry(3.0, 0.1, 2.2);
      const pcb = new THREE.Mesh(pcbGeo, circuitMat);
      pcb.position.y = 1.0;
      group.add(pcb);

      // ATmega Chip
      const chipGeo = new THREE.BoxGeometry(1.6, 0.18, 0.6);
      const chip = new THREE.Mesh(chipGeo, carbonMat);
      chip.position.set(0.2, 1.12, 0);
      group.add(chip);

      // Crystal Oscillator
      const crystalGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 16);
      crystalGeo.rotateZ(Math.PI / 2);
      const crystal = new THREE.Mesh(crystalGeo, chromeMat);
      crystal.position.set(-0.7, 1.12, 0);
      group.add(crystal);

      // USB Type-B Port
      const usbGeo = new THREE.BoxGeometry(0.7, 0.5, 0.6);
      const usb = new THREE.Mesh(usbGeo, chromeMat);
      usb.position.set(-1.25, 1.3, -0.6);
      group.add(usb);

      // DC Barrel Jack
      const dcGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.7, 16);
      dcGeo.rotateX(Math.PI / 2);
      const dc = new THREE.Mesh(dcGeo, carbonMat);
      dc.position.set(-1.25, 1.25, 0.6);
      group.add(dc);

      // Dual Row Female GPIO Headers
      const headerGeo = new THREE.BoxGeometry(2.2, 0.3, 0.22);
      const topHeader = new THREE.Mesh(headerGeo, carbonMat);
      topHeader.position.set(0.2, 1.2, -0.95);
      const btmHeader = new THREE.Mesh(headerGeo, carbonMat);
      btmHeader.position.set(0.2, 1.2, 0.95);
      group.add(topHeader, btmHeader);

      // Blinking Status LEDs
      const ledGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const ledPwr = new THREE.Mesh(ledGeo, amberMat);
      ledPwr.position.set(0.8, 1.15, -0.5);
      const ledTx = new THREE.Mesh(ledGeo, indigoMat);
      ledTx.position.set(0.8, 1.15, -0.2);
      group.add(ledPwr, ledTx);

    } else if (modelType === 'android') {
      // --- BIPEDAL ANDROID (REAL GLB MODEL WITH ANIMATIONS) ---
      setIsLoadingModel(true);
      const loader = new GLTFLoader();
      loader.load(
        '/models/android_robot.glb',
        (gltf) => {
          setIsLoadingModel(false);
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 3.2 / (maxDim || 1);
          model.scale.set(scale, scale, scale);
          model.position.x = -center.x * scale;
          model.position.y = -box.min.y * scale;
          model.position.z = -center.z * scale;

          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            animationMixerRef.current = mixer;
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
          }

          model.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (isWireframe && child.material) {
                if (Array.isArray(child.material)) child.material.forEach((m: any) => { m.wireframe = true; });
                else child.material.wireframe = true;
              }
            }
          });
          group.add(model);
        },
        undefined,
        (err) => {
          console.warn('Fallback to procedural android:', err);
          setIsLoadingModel(false);
          const torsoGeo = new THREE.BoxGeometry(1.2, 1.4, 0.8);
          const torso = new THREE.Mesh(torsoGeo, carbonMat);
          torso.position.y = 2.2;
          group.add(torso);
        }
      );

    } else if (modelType === 'drone') {
      // --- AERIAL DRONE / QUADCOPTER ---
      // Central Hub
      const bodyGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.3, 8);
      const body = new THREE.Mesh(bodyGeo, carbonMat);
      body.position.y = 1.6;
      group.add(body);

      // Top Dome
      const domeGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const dome = new THREE.Mesh(domeGeo, indigoMat);
      dome.position.set(0, 1.8, 0);
      group.add(dome);

      // 4 Carbon Arms (X-Shape)
      const armLength = 1.8;
      const armGeo = new THREE.CylinderGeometry(0.08, 0.08, armLength, 12);
      armGeo.rotateZ(Math.PI / 2);

      const arm1 = new THREE.Mesh(armGeo, chromeMat);
      arm1.rotation.y = Math.PI / 4;
      arm1.position.y = 1.6;
      const arm2 = new THREE.Mesh(armGeo, chromeMat);
      arm2.rotation.y = -Math.PI / 4;
      arm2.position.y = 1.6;
      group.add(arm1, arm2);

      // 4 Rotors & Spinning Propellers
      const rotorPositions = [
        [1.25, 1.7, 1.25],
        [-1.25, 1.7, 1.25],
        [1.25, 1.7, -1.25],
        [-1.25, 1.7, -1.25],
      ];
      const propGroup = new THREE.Group();
      group.add(propGroup);
      dynamicPartsRef.current.props = propGroup;

      rotorPositions.forEach((pos, idx) => {
        // Motor Pod
        const motorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.25, 16);
        const motor = new THREE.Mesh(motorGeo, amberMat);
        motor.position.set(pos[0], pos[1], pos[2]);
        group.add(motor);

        // Dual-Blade Propeller
        const propBladeGeo = new THREE.BoxGeometry(1.1, 0.03, 0.12);
        const prop = new THREE.Mesh(propBladeGeo, indigoMat);
        prop.position.set(pos[0], pos[1] + 0.15, pos[2]);
        prop.name = `prop_${idx}`;
        propGroup.add(prop);
      });
    }

    scene.add(group);
  };

  useEffect(() => {
    // Check WebGL
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch (e) {
      setHasWebGL(false);
      return;
    }

    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 6.8);
    camera.lookAt(0, 1.5, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x818cf8, 2.5);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0x6366f1, 3.0, 12);
    accentLight.position.set(-3, 3, 2);
    scene.add(accentLight);

    const amberRimLight = new THREE.DirectionalLight(0xf59e0b, 1.8);
    amberRimLight.position.set(0, -2, -4);
    scene.add(amberRimLight);

    // 4. Ground Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x6366f1, 0x312e81);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 5. Initial Model Build
    rebuildModel(activeModel, scene);

    // 6. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (animationMixerRef.current) {
        animationMixerRef.current.update(delta);
      }

      // Smooth Rotation Damping
      if (isAutoRotating && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.006;
      }
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (activeMeshGroupRef.current) {
        activeMeshGroupRef.current.rotation.x = currentRotationRef.current.x;
        activeMeshGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Model Specific Sub-Part Motion
      if (dynamicPartsRef.current.lidar) {
        dynamicPartsRef.current.lidar.rotation.y += 0.08; // High speed LiDAR scan
      }
      if (dynamicPartsRef.current.props) {
        dynamicPartsRef.current.props.children.forEach((prop: any, idx: number) => {
          prop.rotation.y += (idx % 2 === 0 ? 0.35 : -0.35); // Counter-rotating rotors
        });
      }
      if (dynamicPartsRef.current.j2 && dynamicPartsRef.current.j3) {
        dynamicPartsRef.current.j2.rotation.z = Math.sin(elapsedTime * 1.5) * 0.15 - 0.2;
        dynamicPartsRef.current.j3.rotation.z = Math.cos(elapsedTime * 1.5) * 0.25 + 0.3;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Event Handlers
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevPointerRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - prevPointerRef.current.x;
      const deltaY = clientY - prevPointerRef.current.y;

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x = Math.max(-0.6, Math.min(0.8, targetRotationRef.current.x + deltaY * 0.008));

      prevPointerRef.current = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onPointerDown);
    domElement.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    domElement.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onPointerDown);
      domElement.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElement.removeEventListener('touchstart', onPointerDown);
      domElement.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Wireframe Mode
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      mat.wireframe = isWireframe;
    });
    if (activeMeshGroupRef.current) {
      activeMeshGroupRef.current.traverse((child: any) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m: any) => { m.wireframe = isWireframe; });
          else child.material.wireframe = isWireframe;
        }
      });
    }
  }, [isWireframe]);

  // Model Switching
  const handleSelectModel = (type: ModelType) => {
    setActiveModel(type);
    if (sceneRef.current) {
      rebuildModel(type, sceneRef.current);
    }
  };

  const handleResetCamera = () => {
    targetRotationRef.current = { x: 0.2, y: 0.4 };
  };

  const currentMeta = ROBOTICS_MODELS[activeModel];

  // Fallback for devices without WebGL
  if (!hasWebGL) {
    return (
      <div className={`p-8 rounded-3xl bg-white dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 text-center space-y-4 ${className}`}>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
          <Cpu className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
          WebGL Accelerator Offline
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          3D hardware acceleration is unavailable. The laboratory models and interactive telemetry remain fully accessible via the specifications table below.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl bg-white dark:bg-[#070B14] border border-slate-200 dark:border-slate-800/90 shadow-sm dark:shadow-2xl overflow-hidden transition-colors ${className}`}>
      {/* 1. MODEL SELECTOR TABS HEADER */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0D1424] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Hardware Specimen:
          </span>
        </div>

        {/* 5 Model Pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {(['rover', 'arm', 'arduino', 'android', 'drone'] as ModelType[]).map((type) => {
            const meta = ROBOTICS_MODELS[type];
            const isSelected = activeModel === type;
            return (
              <button
                key={type}
                onClick={() => handleSelectModel(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-indigo-300'
                }`}
              >
                <span>{type === 'rover' ? '🚙' : type === 'arm' ? '🦾' : type === 'arduino' ? '🔌' : type === 'android' ? '🤖' : '🚁'}</span>
                <span>{meta.name.split(' ')[0]}</span>
                {(type === 'arm' || type === 'android') && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black tracking-wider ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                  }`}>
                    REAL 3D
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SPLIT VIEW: 3D INTERACTIVE CANVAS + EDUCATIONAL TELEMETRY PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left: 3D Interactive Canvas (7 cols) */}
        <div className="lg:col-span-7 relative flex items-center justify-center bg-slate-100/60 dark:bg-black/30 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/80 min-h-[380px] lg:min-h-[480px]">
          <div ref={mountRef} className="w-full h-full min-h-[380px] lg:min-h-[480px] cursor-grab active:cursor-grabbing" />

          {/* Real 3D GLB Model Streaming HUD */}
          {isLoadingModel && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-20">
              <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/50 text-indigo-300 font-mono text-xs flex items-center gap-2.5 shadow-2xl">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>STREAMING REAL 3D GLB ASSET...</span>
              </div>
            </div>
          )}

          {/* Quick HUD Overlays inside Canvas */}
          <div className="absolute top-4 left-4 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs">
              {currentMeta.badge}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 pointer-events-none">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
              🖱️ Drag to rotate 3D view
            </span>
          </div>

          {/* Controls Bar */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-md">
            <button
              onClick={() => setIsWireframe(!isWireframe)}
              className={`p-2 rounded-xl text-xs font-mono transition-colors ${
                isWireframe
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Toggle Wireframe CAD Mode"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`p-2 rounded-xl text-xs font-mono transition-colors ${
                isAutoRotating
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={isAutoRotating ? 'Pause Orbit' : 'Resume Orbit'}
            >
              {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleResetCamera}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Reset View Orientation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Educational Description & Telemetry Space (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between space-y-6 bg-white dark:bg-[#070B14]">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  {currentMeta.category}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                {currentMeta.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-normal">
                {currentMeta.summary}
              </p>
            </div>

            {/* Educational Learning Space */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>What Students Learn by Building This:</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {currentMeta.educationalNotes}
              </p>
            </div>

            {/* Technical Specifications Matrix */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                <span>Engineering Telemetry & Specs</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Degrees of Freedom</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentMeta.specs.dof}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Compute Architecture</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentMeta.specs.compute}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Sensor Payloads</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentMeta.specs.sensors}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Power Supply Rail</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{currentMeta.specs.power}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Learning Topics Chips */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
              Academics & Skills Practiced:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentMeta.learningTopics.map((topic, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  ✓ {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
