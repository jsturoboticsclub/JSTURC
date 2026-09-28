export interface HardwareComponentSpec {
  name: string;
  spec: string;
}

export interface HardwareShowcaseItem {
  id: string;
  title: string;
  category: string;
  badge?: string;
  imageUrl: string;
  summary: string;
  howItWorks: string;
  components: HardwareComponentSpec[];
  docUrl?: string;
  embedUrl?: string;
  specsQuick?: { label: string; value: string }[];
}

export const DEFAULT_HARDWARE_SHOWCASE: HardwareShowcaseItem[] = [
  {
    id: 'hw_autonomous_rover',
    title: 'Aegis-1 Autonomous Ground Rover',
    category: 'Autonomous SLAM & Terrestrial Navigation',
    badge: 'FLAGSHIP DEPLOYMENT',
    imageUrl: '/Assets/hero-robot.jpg',
    summary: 'Heavy-duty terrestrial exploration rover engineered for GPS-denied autonomous SLAM, real-time 3D terrain mapping, and competitive rover challenges.',
    howItWorks: 'Fuses 360° LiDAR spatial point clouds with wheel encoder odometry and 9-DOF IMU data through an Extended Kalman Filter (EKF). Nav2 costmap layers dynamically generate collision-free Bezier path trajectories with sub-50ms latency.',
    components: [
      { name: 'Core Compute', spec: 'NVIDIA Jetson Orin Nano (40 TOPS AI Compute)' },
      { name: 'Primary LiDAR', spec: 'RPLiDAR S2 360° (30m Range, 32kHz Sample Rate)' },
      { name: 'Stereo Vision', spec: 'Intel RealSense D435i Active IR Depth Camera' },
      { name: 'Drive Train', spec: '4x 24V Planetary Geared Brushless BLDC with Encoders' },
      { name: 'Chassis & Power', spec: '6061-T6 CNC Aluminum Frame, 6S 22.2V 10Ah LiPo' }
    ],
    docUrl: 'https://docs.ros.org/en/humble/Tutorials/Advanced/Simulators/Gazebo/Setting-Up-A-Robot-Simulation-Gazebo.html',
    embedUrl: 'https://www.youtube.com/embed/29ECwRoe4zo',
    specsQuick: [
      { label: 'Compute', value: 'Jetson Orin' },
      { label: 'Top Speed', value: '3.8 m/s' },
      { label: 'Payload', value: '18 kg' },
      { label: 'Runtime', value: '4.5 Hours' }
    ]
  },
  {
    id: 'hw_uav_drone',
    title: 'Valkyrie-X Quadrotor LiDAR Surveyor',
    category: 'Autonomous Aerial Robotics & Photogrammetry',
    badge: 'AERIAL RESEARCH',
    imageUrl: '/Assets/uav-drone.jpg',
    summary: 'High-end carbon-fiber aerial surveying drone equipped with 16-channel 3D LiDAR and 4K optical gimbal for aerial mapping and search & rescue operations.',
    howItWorks: 'Runs PX4 Autopilot on a vibration-isolated flight computer bridged to an onboard companion SBC via MAVLink. Utilizes FAST-LIO2 algorithm for real-time aerial LiDAR odometry and point cloud registration in dense canopy.',
    components: [
      { name: 'Flight Controller', spec: 'Holybro Pixhawk 6X (Triple Redundant IMU & Barometer)' },
      { name: 'Airborne LiDAR', spec: 'Velodyne Puck VLP-16 3D Spatial Sensor' },
      { name: 'Optical Payload', spec: '4K 60FPS Stabilized 3-Axis Brushless Gimbal Camera' },
      { name: 'Propulsion', spec: 'T-Motor Antigravity 4006 Motors with 15x5 Carbon Props' },
      { name: 'Telemetry', spec: '915MHz RFD900x Long Range + 5.8GHz Digital HD Video Link' }
    ],
    docUrl: 'https://docs.px4.io/main/en/',
    embedUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    specsQuick: [
      { label: 'Flight Time', value: '32 Mins' },
      { label: 'Sensors', value: '16-Ch LiDAR' },
      { label: 'Range', value: '7.5 km' },
      { label: 'Frame', value: 'Toray T700' }
    ]
  },
  {
    id: 'hw_manipulator_arm',
    title: 'Synapse-6 Precision Robotic Manipulator',
    category: 'Industrial Kinematics & Manipulation',
    badge: 'LAB BENCH AUTOMATION',
    imageUrl: '/Assets/robotic-arm.jpg',
    summary: '6-Degrees-of-Freedom industrial-grade robotic manipulator arm designed for sub-millimeter electronic board inspection, PCB assembly, and AI vision sorting.',
    howItWorks: 'Leverages MoveIt 2 for inverse kinematics calculations and collision-aware trajectory optimization. An eye-in-hand depth camera detects target microcomponents and calculates 6D pose estimation using OpenCV and YOLOv8.',
    components: [
      { name: 'Actuation', spec: '6x Harmonic Drive Planetary Strain-Wave Actuators' },
      { name: 'Positional Feedback', spec: '19-bit Absolute Magnetic Optical Dual Encoders' },
      { name: 'End Effector', spec: 'Pneumatic Micro-Gripper with Pressure Sensitive Pads' },
      { name: 'Eye-In-Hand Vision', spec: 'Miniaturized Global Shutter Depth Sensor' },
      { name: 'Interface', spec: 'EtherCAT & CANopen Industrial Bus @ 1kHz Update Rate' }
    ],
    docUrl: 'https://moveit.picknik.ai/main/index.html',
    embedUrl: 'https://www.youtube.com/embed/fH4VwTgfyrQ',
    specsQuick: [
      { label: 'Degrees of Freedom', value: '6-Axis' },
      { label: 'Repeatability', value: '±0.03 mm' },
      { label: 'Reach', value: '720 mm' },
      { label: 'Payload', value: '3.5 kg' }
    ]
  }
];
