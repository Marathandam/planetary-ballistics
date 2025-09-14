import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Enhanced planet data with realistic properties
const planetData = {
  earth: {
    name: "Earth",
    radius: 6371,
    gravity: 9.81,
    color: 0x6B93D6,
    atmosphere: 1.225,
    surfaceColor: 0x4A5D23,
    cloudColor: 0xFFFFFF,
    atmosphereColor: 0x87CEEB,
    hasAtmosphere: true,
    description: "The Blue Planet - our home world"
  },
  moon: {
    name: "Moon",
    radius: 1737,
    gravity: 1.62,
    color: 0xC0C0C0,
    atmosphere: 0,
    surfaceColor: 0x969696,
    cloudColor: null,
    atmosphereColor: null,
    hasAtmosphere: false,
    description: "Earth's natural satellite - airless and cratered"
  },
  mars: {
    name: "Mars",
    radius: 3389,
    gravity: 3.71,
    color: 0xCD5C5C,
    atmosphere: 0.020,
    surfaceColor: 0x8B4513,
    cloudColor: 0xDEB887,
    atmosphereColor: 0xFFA07A,
    hasAtmosphere: true,
    description: "The Red Planet - rusty and mysterious"
  },
  jupiter: {
    name: "Jupiter",
    radius: 69911,
    gravity: 24.79,
    color: 0xFFA500,
    atmosphere: 0.16,
    surfaceColor: 0xDAA520,
    cloudColor: 0xF4A460,
    atmosphereColor: 0xFFD700,
    hasAtmosphere: true,
    description: "The Gas Giant - massive and stormy"
  },
};

const dragCoefficient = 0.47;
const projectileArea = Math.PI * 1 * 1;

interface TelemetryData {
  velocity: number;
  altitude: number;
  distance: number;
  time: number;
}

export default function PlanetarySimulation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const worldRef = useRef<CANNON.World>();
  const projectileBodyRef = useRef<CANNON.Body>();
  const projectileMeshRef = useRef<THREE.Mesh>();
  const animationIdRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  
  const [planet, setPlanet] = useState<keyof typeof planetData>("earth");
  const [velocity, setVelocity] = useState([75]);
  const [angle, setAngle] = useState([45]);
  const [isLaunched, setIsLaunched] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    velocity: 0,
    altitude: 0,
    distance: 0,
    time: 0
  });

  // Create realistic planet surface
  const createPlanetSurface = useCallback((planetKey: keyof typeof planetData) => {
    const planet = planetData[planetKey];
    const scene = sceneRef.current!;
    
    // Clear existing objects
    const objectsToRemove = scene.children.filter(child => 
      child.userData.type === 'planet' || child.userData.type === 'atmosphere'
    );
    objectsToRemove.forEach(obj => scene.remove(obj));

    // Create surface geometry - make it look curved like a planet
    const surfaceGeometry = new THREE.SphereGeometry(1000, 64, 64);
    const surfaceMaterial = new THREE.MeshLambertMaterial({
      color: planet.surfaceColor,
      transparent: true,
      opacity: 0.9,
    });
    
    // Add texture-like patterns
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Create realistic surface patterns
    if (planetKey === 'earth') {
      // Earth-like continents and oceans
      ctx.fillStyle = '#4A5D23';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#6B93D6';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 100 + 50, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (planetKey === 'mars') {
      // Mars-like rocky terrain
      ctx.fillStyle = '#CD5C5C';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#8B4513';
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 30 + 10, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (planetKey === 'moon') {
      // Moon-like craters
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#969696';
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 20 + 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (planetKey === 'jupiter') {
      // Jupiter-like bands
      ctx.fillStyle = '#FFA500';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 512; i += 30) {
        ctx.fillStyle = i % 60 === 0 ? '#DAA520' : '#F4A460';
        ctx.fillRect(0, i, 512, 15);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    surfaceMaterial.map = texture;
    
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.position.y = -950;
    surface.userData.type = 'planet';
    scene.add(surface);

    // Add atmosphere if the planet has one
    if (planet.hasAtmosphere) {
      const atmosphereGeometry = new THREE.SphereGeometry(1200, 32, 32);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: planet.atmosphereColor,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
      });
      
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      atmosphere.position.y = -950;
      atmosphere.userData.type = 'atmosphere';
      scene.add(atmosphere);
    }

    // Update world gravity
    if (worldRef.current) {
      worldRef.current.gravity.set(0, -planet.gravity, 0);
    }
  }, []);

  // Create stunning starfield
  const createStarfield = useCallback(() => {
    const scene = sceneRef.current!;
    
    // Remove existing starfield
    const existingStars = scene.children.filter(child => child.userData.type === 'stars');
    existingStars.forEach(stars => scene.remove(stars));

    // Create multiple layers of stars
    for (let layer = 0; layer < 3; layer++) {
      const starGeometry = new THREE.BufferGeometry();
      const starVertices = [];
      const starColors = [];
      
      const starCount = layer === 0 ? 15000 : layer === 1 ? 8000 : 3000;
      const distance = layer === 0 ? 4000 : layer === 1 ? 6000 : 8000;
      
      for (let i = 0; i < starCount; i++) {
        // Random positions in a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = distance + Math.random() * 1000;
        
        starVertices.push(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
        
        // Random star colors - blues, whites, yellows, reds
        const colorChoice = Math.random();
        if (colorChoice < 0.7) {
          starColors.push(1, 1, 1); // White
        } else if (colorChoice < 0.85) {
          starColors.push(0.8, 0.9, 1); // Blue
        } else if (colorChoice < 0.95) {
          starColors.push(1, 1, 0.8); // Yellow
        } else {
          starColors.push(1, 0.8, 0.8); // Red
        }
      }
      
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
      
      const starMaterial = new THREE.PointsMaterial({
        size: layer === 0 ? 1.5 : layer === 1 ? 2 : 3,
        vertexColors: true,
        transparent: true,
        opacity: layer === 0 ? 0.8 : layer === 1 ? 0.6 : 0.4,
      });
      
      const stars = new THREE.Points(starGeometry, starMaterial);
      stars.userData.type = 'stars';
      scene.add(stars);
    }
  }, []);

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000011, 100, 10000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      50000
    );
    camera.position.set(0, 100, 300);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFFCC, 1.5);
    sunLight.position.set(500, 800, 300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 100;
    sunLight.shadow.camera.far = 2000;
    sunLight.shadow.camera.left = -1000;
    sunLight.shadow.camera.right = 1000;
    sunLight.shadow.camera.top = 1000;
    sunLight.shadow.camera.bottom = -1000;
    scene.add(sunLight);

    // Add rim lighting for atmosphere effect
    const rimLight = new THREE.DirectionalLight(0x87CEEB, 0.5);
    rimLight.position.set(-500, 200, -300);
    scene.add(rimLight);

    // Physics world setup
    const world = new CANNON.World();
    world.gravity.set(0, -planetData[planet].gravity, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    worldRef.current = world;

    // Ground physics
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    // Create projectile
    const projectileGeometry = new THREE.SphereGeometry(2, 16, 16);
    const projectileMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFD700,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });
    
    const projectileMesh = new THREE.Mesh(projectileGeometry, projectileMaterial);
    projectileMesh.castShadow = true;
    projectileMesh.receiveShadow = true;
    scene.add(projectileMesh);
    projectileMeshRef.current = projectileMesh;

    // Projectile physics
    const projectileShape = new CANNON.Sphere(2);
    const projectileBody = new CANNON.Body({ mass: 5 });
    projectileBody.addShape(projectileShape);
    projectileBody.position.set(0, 5, 0);
    world.addBody(projectileBody);
    projectileBodyRef.current = projectileBody;

    // Create planet surface and starfield
    createPlanetSurface(planet);
    createStarfield();

    // Mouse controls for camera
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = () => { isDragging = true; };
    const onMouseUp = () => { isDragging = false; };
    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) {
        previousMousePosition = { x: event.clientX, y: event.clientY };
        return;
      }

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      camera.position.x += deltaMove.x * 0.5;
      camera.position.y -= deltaMove.y * 0.5;
      camera.lookAt(0, 0, 0);

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onWheel = (event: WheelEvent) => {
      const zoomSpeed = 0.1;
      const direction = event.deltaY > 0 ? 1 : -1;
      
      camera.position.multiplyScalar(1 + direction * zoomSpeed);
      const distance = camera.position.length();
      
      // Limit zoom
      if (distance < 50) camera.position.multiplyScalar(50 / distance);
      if (distance > 2000) camera.position.multiplyScalar(2000 / distance);
    };

    // Event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel);

    // Handle window resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [planet, createPlanetSurface, createStarfield]);

  // Animation loop
  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !worldRef.current) return;

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const world = worldRef.current;

    // Physics step
    world.step(1/60);

    // Apply atmospheric drag
    if (projectileBodyRef.current && isLaunched) {
      const planetInfo = planetData[planet];
      const rho = planetInfo.atmosphere;
      const velocity = projectileBodyRef.current.velocity;
      const speed = velocity.length();
      
      if (rho > 0 && speed > 0) {
        const dragMagnitude = 0.5 * dragCoefficient * rho * projectileArea * speed * speed;
        const dragDirection = velocity.unit().scale(-1);
        const dragForce = dragDirection.scale(dragMagnitude);
        projectileBodyRef.current.applyForce(dragForce, projectileBodyRef.current.position);
      }

      // Update telemetry
      const currentTime = (Date.now() - startTimeRef.current) / 1000;
      setTelemetry({
        velocity: speed,
        altitude: Math.max(0, projectileBodyRef.current.position.y),
        distance: projectileBodyRef.current.position.x,
        time: currentTime
      });

      // Reset if projectile hits ground
      if (projectileBodyRef.current.position.y < 0) {
        setIsLaunched(false);
      }
    }

    // Sync physics with graphics
    if (projectileMeshRef.current && projectileBodyRef.current) {
      projectileMeshRef.current.position.copy(projectileBodyRef.current.position as any);
      projectileMeshRef.current.quaternion.copy(projectileBodyRef.current.quaternion as any);
    }

    // Animate stars
    scene.children.forEach(child => {
      if (child.userData.type === 'stars') {
        child.rotation.y += 0.0001;
      }
    });

    renderer.render(scene, camera);
    animationIdRef.current = requestAnimationFrame(animate);
  }, [planet, isLaunched]);

  // Launch projectile
  const launchProjectile = useCallback(() => {
    if (!projectileBodyRef.current) return;

    const angleRad = (angle[0] * Math.PI) / 180;
    const velocityMagnitude = velocity[0];

    // Reset position
    projectileBodyRef.current.position.set(0, 5, 0);
    
    // Set velocity
    projectileBodyRef.current.velocity.set(
      velocityMagnitude * Math.cos(angleRad),
      velocityMagnitude * Math.sin(angleRad),
      0
    );

    setIsLaunched(true);
    startTimeRef.current = Date.now();
  }, [velocity, angle]);

  // Reset projectile
  const resetProjectile = useCallback(() => {
    if (!projectileBodyRef.current) return;
    
    projectileBodyRef.current.position.set(0, 5, 0);
    projectileBodyRef.current.velocity.set(0, 0, 0);
    setIsLaunched(false);
    setTelemetry({ velocity: 0, altitude: 5, distance: 0, time: 0 });
  }, []);

  // Initialize scene on mount
  useEffect(() => {
    const cleanup = initScene();
    animate();
    
    return cleanup;
  }, [initScene, animate]);

  // Update planet when selection changes
  useEffect(() => {
    if (sceneRef.current) {
      createPlanetSurface(planet);
      resetProjectile();
    }
  }, [planet, createPlanetSurface, resetProjectile]);

  const selectedPlanet = planetData[planet];

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-space-void">
      <div ref={mountRef} className="absolute inset-0" />
      
      {/* Mission Control Panel */}
      <Card className="absolute bottom-6 left-6 right-6 bg-card/80 backdrop-blur-md border-border/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          {/* Planet Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Target Planet
            </label>
            <Select value={planet} onValueChange={(value: keyof typeof planetData) => setPlanet(value)}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(planetData).map(([key, data]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `#${data.color.toString(16)}` }}
                      />
                      {data.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedPlanet.description}
            </p>
          </div>

          {/* Velocity Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stellar-blue">
              Launch Velocity: {velocity[0]} m/s
            </label>
            <Slider
              value={velocity}
              onValueChange={setVelocity}
              max={200}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Angle Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-aurora-green">
              Launch Angle: {angle[0]}°
            </label>
            <Slider
              value={angle}
              onValueChange={setAngle}
              max={90}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Launch Controls */}
          <div className="flex gap-2">
            <Button 
              onClick={launchProjectile}
              disabled={isLaunched}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground animate-stellar-pulse"
            >
              🚀 Launch
            </Button>
            <Button 
              onClick={resetProjectile}
              variant="secondary"
              className="bg-secondary/70 hover:bg-secondary"
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Telemetry HUD */}
      <Card className="absolute top-6 left-6 bg-card/70 backdrop-blur-md border-border/50 p-4 space-y-2">
        <h3 className="text-sm font-bold text-stellar-blue uppercase tracking-wider">
          Mission Telemetry
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Velocity</div>
            <div className="text-lg font-mono text-cosmic-cyan">
              {telemetry.velocity.toFixed(1)} m/s
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Altitude</div>
            <div className="text-lg font-mono text-aurora-green">
              {telemetry.altitude.toFixed(1)} m
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Distance</div>
            <div className="text-lg font-mono text-plasma-orange">
              {telemetry.distance.toFixed(1)} m
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Flight Time</div>
            <div className="text-lg font-mono text-nebula-pink">
              {telemetry.time.toFixed(1)} s
            </div>
          </div>
        </div>
        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">Surface Gravity</div>
          <div className="text-sm font-mono text-foreground">
            {selectedPlanet.gravity} m/s²
          </div>
        </div>
      </Card>

      {/* Planet Info Card */}
      <Card className="absolute top-6 right-6 bg-card/70 backdrop-blur-md border-border/50 p-4 max-w-xs">
        <h3 className="text-sm font-bold text-stellar-blue uppercase tracking-wider mb-2">
          {selectedPlanet.name}
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Radius:</span>
            <span className="font-mono">{selectedPlanet.radius.toLocaleString()} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gravity:</span>
            <span className="font-mono">{selectedPlanet.gravity} m/s²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Atmosphere:</span>
            <span className="font-mono">
              {selectedPlanet.hasAtmosphere ? 
                `${selectedPlanet.atmosphere} kg/m³` : 
                'None'
              }
            </span>
          </div>
        </div>
      </Card>

      {/* Controls Hint */}
      <div className="absolute bottom-6 right-6 text-xs text-muted-foreground bg-card/50 backdrop-blur-sm rounded p-3 max-w-xs">
        <div className="space-y-1">
          <div>🖱️ <strong>Mouse:</strong> Click & drag to orbit</div>
          <div>🔄 <strong>Scroll:</strong> Zoom in/out</div>
          <div>🌍 <strong>Physics:</strong> Real planetary gravity & atmosphere</div>
        </div>
      </div>
    </div>
  );
}