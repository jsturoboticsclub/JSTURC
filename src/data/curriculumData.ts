export interface SyllabusModule {
  title: string;
  topics: string[];
}

export interface TechSkillNode {
  id: string;
  title: string;
  track: 'embedded' | 'autonomous' | 'cad' | 'vision';
  trackLabel: string;
  level: 'Foundation' | 'Intermediate' | 'Advanced' | 'Expert';
  iconName: string;
  summary: string;
  prerequisites: string[]; // Node IDs
  skillsAcquired: string[];
  recommendedHardware?: string[];
  recommendedTutorials?: { title: string; url: string }[];
  activeProjects?: { name: string; slug: string }[];

  // Course Hub & Learning Center fields
  status?: 'active' | 'upcoming' | 'completed' | 'draft';
  isLaunched?: boolean;
  duration?: string;
  instructor?: string;
  syllabus?: string[];
  docUrl?: string;
  videoEmbedUrl?: string;
  enrollmentLink?: string;
}

export const CURRICULUM_DATA: TechSkillNode[] = [
  // Embedded Systems Track
  {
    id: 'emb-c',
    title: 'Embedded C & STM32 Microcontrollers',
    track: 'embedded',
    trackLabel: 'Embedded Systems',
    level: 'Foundation',
    status: 'active',
    isLaunched: true,
    duration: '4 Weeks',
    instructor: 'JSTU Embedded Systems Lead',
    iconName: 'Cpu',
    summary: 'Master low-level register manipulation, memory management, and peripheral interfacing on ARM Cortex-M architecture.',
    prerequisites: [],
    skillsAcquired: ['GPIO Registers', 'Interrupt Handling (NVIC)', 'Timers & PWM', 'UART/I2C/SPI Protocols'],
    recommendedHardware: ['STM32 Nucleo-F401RE', 'Logic Analyzer 24MHz', 'USB-to-TTL CP2102'],
    recommendedTutorials: [
      { title: 'Mastering STM32 Bare-Metal Programming', url: 'https://www.st.com/en/microcontrollers-microprocessors/stm32f4-series.html' },
      { title: 'Embedded Systems Architecture Guide', url: 'https://arm-university.github.io' }
    ],
    syllabus: [
      'Week 1: ARM Cortex-M Architecture & Memory Map',
      'Week 2: Bare-Metal GPIO & Clock Tree Configuration (RCC)',
      'Week 3: Nested Vector Interrupt Controller (NVIC) & Timers',
      'Week 4: Peripheral Bus Protocols: I2C, SPI, and Hardware UART'
    ],
    docUrl: 'https://www.st.com/resource/en/reference_manual/rm0383-stm32f411xc-and-stm32f411xe-advanced-armbased-32bit-mcus-stmicroelectronics.pdf',
    videoEmbedUrl: 'https://www.youtube.com/embed/29ECwRoe4zo',
    enrollmentLink: '#join',
    activeProjects: [
      { name: 'ARES-IV Autonomous Rover', slug: 'ares-iv' },
      { name: '6-DOF Robotic Manipulator Arm', slug: 'robotic-arm' }
    ]
  },
  {
    id: 'emb-rtos',
    title: 'FreeRTOS & Real-Time Multitasking',
    track: 'embedded',
    trackLabel: 'Embedded Systems',
    level: 'Intermediate',
    status: 'active',
    isLaunched: true,
    duration: '4 Weeks',
    instructor: 'Firmware & Telemetry Engineer',
    iconName: 'Layers',
    summary: 'Design deterministic, fault-tolerant real-time software systems using priority preemption, semaphores, and message queues.',
    prerequisites: ['emb-c'],
    skillsAcquired: ['Task Scheduling', 'Mutex & Deadlock Prevention', 'Queue Management', 'Real-Time ISR Handling'],
    recommendedHardware: ['ESP32 Dual-Core DevKit', 'FreeRTOS Kernel Trace Port'],
    recommendedTutorials: [
      { title: 'FreeRTOS Real-Time Kernel Manual', url: 'https://www.freertos.org/Documentation/RTOS_book.html' }
    ],
    syllabus: [
      'Week 1: Preemptive vs Cooperative Scheduling & Task Priorities',
      'Week 2: Inter-Task Communication with FreeRTOS Queues',
      'Week 3: Resource Protection: Binary Semaphores, Mutexes, and Priority Inversion',
      'Week 4: Software Timers, Event Groups, and Stream Buffers'
    ],
    docUrl: 'https://www.freertos.org/Documentation/RTOS_book.html',
    videoEmbedUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    enrollmentLink: '#join',
    activeProjects: [
      { name: 'ARES-IV Autonomous Rover', slug: 'ares-iv' }
    ]
  },
  {
    id: 'emb-can',
    title: 'CAN Bus & Industrial Vehicle Telemetry',
    track: 'embedded',
    trackLabel: 'Embedded Systems',
    level: 'Advanced',
    status: 'upcoming',
    isLaunched: true,
    duration: '3 Weeks',
    instructor: 'Robotics Powertrain Lead',
    iconName: 'Radio',
    summary: 'Implement high-reliability automotive bus communication between motor controllers, sensors, and main compute brains.',
    prerequisites: ['emb-rtos'],
    skillsAcquired: ['CAN 2.0B / CAN-FD Frames', 'Transceiver Wiring', 'Bit Timing Synchronization', 'dbc Parsing'],
    recommendedHardware: ['MCP2515 Transceiver', 'CANable USB-CAN Adapter'],
    recommendedTutorials: [
      { title: 'CAN Bus Physical Layer Engineering', url: 'https://www.kvaser.com/can-protocol-tutorial/' }
    ],
    syllabus: [
      'Module 1: Differential Signaling & CAN Bus Physical Layer Topology',
      'Module 2: Arbitration ID, Priority Encoding, and Frame Architecture',
      'Module 3: Transceiver Interfacing, Hardware Filters, and CAN-FD Extensions'
    ],
    docUrl: 'https://www.kvaser.com/can-protocol-tutorial/',
    videoEmbedUrl: '',
    enrollmentLink: '#join',
    activeProjects: [
      { name: 'Formula Student Telemetry Hub', slug: 'formula-telemetry' }
    ]
  },

  // Autonomous & ROS2 Track
  {
    id: 'ros-core',
    title: 'ROS2 Architecture, Nodes & Middleware',
    track: 'autonomous',
    trackLabel: 'Autonomous & ROS2',
    level: 'Foundation',
    status: 'active',
    isLaunched: true,
    duration: '5 Weeks',
    instructor: 'Autonomous Navigation Director',
    iconName: 'Network',
    summary: 'The universal language of modern robotics: distributed pub/sub communication, client services, action servers, and launch pipelines.',
    prerequisites: ['emb-c'],
    skillsAcquired: ['rclcpp / rclpy', 'DDS Discovery Middleware', 'Action Servers', 'Colcon Build Systems'],
    recommendedHardware: ['Raspberry Pi 5 8GB', 'Ubuntu 22.04 LTS / ROS2 Humble'],
    recommendedTutorials: [
      { title: 'Official ROS2 Documentation & Tutorials', url: 'https://docs.ros.org/en/humble/' }
    ],
    syllabus: [
      'Week 1: ROS2 Architecture, DDS Discovery, and Workspace Setup',
      'Week 2: Custom Messages, Publishers, and Real-Time Subscribers (rclpy/rclcpp)',
      'Week 3: Service Clients & Asynchronous Action Servers',
      'Week 4: Parameter Callbacks & Dynamic Launch Files in Python',
      'Week 5: Robot Simulation in Gazebo & URDF Kinematic Modeling'
    ],
    docUrl: 'https://docs.ros.org/en/humble/',
    videoEmbedUrl: 'https://www.youtube.com/embed/29ECwRoe4zo',
    enrollmentLink: '#join',
    activeProjects: [
      { name: 'ARES-IV Autonomous Rover', slug: 'ares-iv' }
    ]
  },
  {
    id: 'ros-slam',
    title: 'SLAM, 3D LiDAR & Autonomous Nav2',
    track: 'autonomous',
    trackLabel: 'Autonomous & ROS2',
    level: 'Intermediate',
    status: 'active',
    isLaunched: true,
    duration: '6 Weeks',
    instructor: 'JSTU AI & Robotics Faculty Advisor',
    iconName: 'Radio',
    summary: 'Simultaneous Localization and Mapping using particle filters, Cartographer, point cloud occupancy grids, and Nav2 costmaps.',
    prerequisites: ['ros-core'],
    skillsAcquired: ['Cartographer SLAM', 'TF2 Coordinate Transformations', 'LiDAR Data Filtering', 'Nav2 Path Planning'],
    recommendedHardware: ['RPLiDAR S2 / Velodyne Puck', 'Wheel Odometry Encoders'],
    recommendedTutorials: [
      { title: 'Nav2 Complete Navigation Stack Manual', url: 'https://navigation.ros.org/' }
    ],
    syllabus: [
      'Week 1: Spatial Transformations & TF2 Tree Coordinate Frames',
      'Week 2: 2D LiDAR Point Cloud Filtering & Cartographer SLAM',
      'Week 3: 3D Point Cloud Registration with FAST-LIO & Octomap',
      'Week 4: Nav2 Costmap 2D Configuration (Global & Local Inflation Layers)',
      'Week 5: Path Planners (Smac, NavFn) and Controller Regulated Pure Pursuit',
      'Week 6: Field Trials & Hardware-in-the-Loop GPS-denied Testing'
    ],
    docUrl: 'https://navigation.ros.org/',
    videoEmbedUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    enrollmentLink: '#join',
    activeProjects: [
      { name: 'ARES-IV Autonomous Rover', slug: 'ares-iv' },
      { name: 'Autonomous Warehouse Courier', slug: 'warehouse-courier' }
    ]
  },

  // Mechanical CAD Track
  {
    id: 'cad-parametric',
    title: 'Parametric CAD & Design for Manufacture (DFM)',
    track: 'cad',
    trackLabel: 'Mechanical CAD & DFM',
    level: 'Foundation',
    status: 'active',
    isLaunched: true,
    duration: '4 Weeks',
    instructor: 'Mechanical Fabrication Lead',
    iconName: 'Box',
    summary: 'Design robust robotic chassis, planetary gearboxes, and suspension systems optimized for 3D printing and CNC milling.',
    prerequisites: [],
    skillsAcquired: ['SolidWorks / Fusion 360', 'Tolerancing & Fits', 'FEA Stress Simulation', 'DFM Principles'],
    recommendedHardware: ['Bambu Lab X1 Carbon', 'Digital Vernier Caliper'],
    recommendedTutorials: [
      { title: 'Principles of Rapid Prototyping in Robotics', url: 'https://www.youtube.com' }
    ],
    syllabus: [
      'Week 1: Sketching Constraints, Parametric Modeling & Assemblies in SolidWorks',
      'Week 2: ISO Fits, Tolerances & Bearing Selection for High-Load Joints',
      'Week 3: Additive Manufacturing Slicing Optimization & Structural Infill',
      'Week 4: Finite Element Analysis (FEA) Stress Simulation & Weight Reduction'
    ],
    docUrl: 'https://help.solidworks.com/',
    videoEmbedUrl: 'https://www.youtube.com/embed/fH4VwTgfyrQ',
    enrollmentLink: '#join',
    activeProjects: [
      { name: '6-DOF Robotic Manipulator Arm', slug: 'robotic-arm' }
    ]
  },

  // Edge AI & Computer Vision Track
  {
    id: 'vision-yolo',
    title: 'Edge AI Vision & Real-Time Object Tracking',
    track: 'vision',
    trackLabel: 'Edge AI & Vision',
    level: 'Intermediate',
    status: 'active',
    isLaunched: true,
    duration: '5 Weeks',
    instructor: 'Computer Vision Research Fellow',
    iconName: 'Eye',
    summary: 'Deploy quantized neural networks (YOLOv8, MobileNet) on embedded accelerators for real-time target tracking and obstacle recognition.',
    prerequisites: ['ros-core'],
    skillsAcquired: ['TensorRT Acceleration', 'OpenCV Image Pipelines', 'Model Quantization (INT8)', 'Camera Calibration'],
    recommendedHardware: ['NVIDIA Jetson Orin Nano', 'Intel RealSense D435i Stereo Depth Camera'],
    recommendedTutorials: [
      { title: 'NVIDIA Jetson Deep Learning Workflows', url: 'https://developer.nvidia.com/embedded/jetson-orin-nano' }
    ],
    syllabus: [
      'Week 1: Camera Pinhole Model, Stereo Calibration & OpenCV Pipelines',
      'Week 2: Deep Learning Inference Engines on Linux (ONNX Runtime & TensorRT)',
      'Week 3: Training Custom Robotics Object Detectors with YOLOv8',
      'Week 4: Depth Fusion: Combining 2D Bounding Boxes with 3D Depth Point Clouds',
      'Week 5: Visual Servoing & Target Following on Mobile Robots'
    ],
    docUrl: 'https://developer.nvidia.com/embedded/jetson-orin-nano',
    videoEmbedUrl: 'https://www.youtube.com/embed/fH4VwTgfyrQ',
    enrollmentLink: '#join',
    activeProjects: [
      { name: 'ARES-IV Autonomous Rover', slug: 'ares-iv' },
      { name: 'Autonomous Warehouse Courier', slug: 'warehouse-courier' }
    ]
  }
];
