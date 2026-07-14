"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  Circle, 
  LogOut, 
  ShieldCheck, 
  Check,
  Sparkles,
  Info,
  X,
  Zap,
  Cpu,
  ArrowRight
} from 'lucide-react';
import * as THREE from 'three';
import Link from 'next/link';

const initialMockParties = [
  {
    id: 'party-1',
    partyName: "João Silva",
    role: "Requerente (Pessoa Física)",
    documents: [
      { id: "doc-1", name: "RG ou CNH", status: "pending", reason: "Identificação obrigatória para validar a autenticidade do formulário por Pessoa Física." },
      { id: "doc-2", name: "Comprovante de Residência", status: "pending", reason: "Necessário para qualificação completa do requerente no sistema." },
      { id: "doc-3", name: "Comprovante de Renda", status: "uploaded", reason: "Exigido pela seção 4.2 do formulário principal para análise de viabilidade." }
    ]
  },
  {
    id: 'party-2',
    partyName: "TechCorp Imóveis S.A.",
    role: "Empresa Parceira (Pessoa Jurídica)",
    documents: [
      { id: "doc-4", name: "Matrícula do Imóvel Atualizada", status: "uploaded", reason: "Fundamental para comprovar a titularidade do imóvel no formulário." },
      { id: "doc-5", name: "Certidão Negativa de Débitos", status: "pending", reason: "Mitigação de risco trabalhista/tributário ao associar Pessoa Jurídica." },
      { id: "doc-6", name: "Cópia do Contrato Social", status: "pending", reason: "Necessário para validar se os signatários possuem poderes de representação da empresa no formulário." }
    ]
  }
];

function ToastContainer({ toasts, removeToast }: any) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast: any) => (
        <div key={toast.id} className="animate-slide-up bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]">
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" strokeWidth={1.5}/> : <Info className="w-5 h-5 text-indigo-400" strokeWidth={1.5}/>}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Inspired by Interstellar's Gargantua and Raymarching techniques.
const blackHoleVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const blackHoleFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  
  varying vec2 vUv;

  #define MAX_STEPS 80
  #define SURF_DIST .01
  #define MAX_DIST 20.

  // 2D Rotation
  mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
  }

  // Hash for noise
  float hash(float n) { return fract(sin(n) * 1e4); }
  float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

  // 3D Noise for Accretion Disk Plasma
  float noise(vec3 x) {
      const vec3 step = vec3(110, 241, 171);
      vec3 i = floor(x);
      vec3 f = fract(x);
      float n = dot(i, step);
      vec3 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                     mix(hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
                 mix(mix(hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                     mix(hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
  }

  // Fractal Brownian Motion
  float fbm(vec3 p) {
      float f = 0.0;
      float w = 0.5;
      for (int i = 0; i < 4; i++) { // Reduced iterations for performance
          f += w * noise(p);
          p *= 2.0;
          w *= 0.5;
      }
      return f;
  }

  // The Accretion Disk (Density function)
  float getDiskDensity(vec3 p) {
      float r = length(p.xz);
      float inner = 1.3; // Event horizon + photon ring buffer
      float outer = 5.5;
      
      if(r < inner || r > outer) return 0.0;
      
      // Flatten the disk
      float yDist = abs(p.y);
      float h = 0.15 * (r - inner)/(outer-inner); // Disk gets slightly thicker outwards
      
      if(yDist > h) return 0.0;
      
      // Swirling plasma effect
      vec3 q = p;
      float angle = atan(q.z, q.x);
      // Keplerian rotation (faster inside)
      angle += uTime * 2.5 / (r*r); 
      q.x = r * cos(angle);
      q.z = r * sin(angle);
      
      float n = fbm(q * 2.5);
      float density = smoothstep(0.0, h, h - yDist) * n;
      
      // Fade edges
      density *= smoothstep(inner, inner + 0.3, r);
      density *= smoothstep(outer, outer - 1.5, r);
      
      return density * 1.8;
  }
  
  // Starfield background
  vec3 getBackground(vec3 rd) {
      vec3 col = vec3(0.0);
      // Subtle space dust
      col += vec3(0.05, 0.02, 0.08) * fbm(rd * 5.0);
      
      // Stars
      float s = hash(rd.xy * 123.4);
      if(s > 0.995) col += vec3(1.0) * pow(hash(rd.yz*56.7), 8.0) * 2.0; // Random bright stars
      
      return col;
  }

  void main() {
      // Normalize coordinates
      vec2 uv = (vUv - 0.5) * 2.0;
      uv.x *= uResolution.x / uResolution.y;

      // Camera setup
      vec3 ro = vec3(0.0, 1.2, -7.0); // Camera position
      vec3 rd = normalize(vec3(uv, 1.5)); // Ray direction
      
      // Rotate camera slightly over time for cinematic feel
      ro.xz *= rot(uTime * 0.03);
      rd.xz *= rot(uTime * 0.03);
      // Look slightly down
      ro.yz *= rot(0.15);
      rd.yz *= rot(0.15);

      vec3 col = vec3(0.0);
      
      // Raymarching Variables
      vec3 p = ro;
      float dt = 0.08; // slightly larger steps
      float mass = 0.5; // Black hole mass
      
      vec3 diskCol = vec3(0.0);
      float transmit = 1.0;
      
      // Main Raymarch Loop (Simulating Curved Spacetime)
      for(int i = 0; i < MAX_STEPS; i++) {
          float r2 = dot(p, p);
          
          // 1. Gravity / Lensing Effect
          // Acceleration vector directed towards origin (0,0,0)
          // a = -GM/r^2
          vec3 grav = -normalize(p) * mass / r2;
          
          // Bend the ray
          rd = normalize(rd + grav * dt);
          
          // Move forward
          p += rd * dt;
          
          // 2. Check Event Horizon
          if(r2 < 0.8) { // Schwarzschild radius
             transmit = 0.0;
             break; // Ray captured
          }
          
          // 3. Volumetric Accretion Disk Rendering
          float d = getDiskDensity(p);
          if(d > 0.0) {
              // Temperature coloring (Hotter/Blue-White inside, Cooler/Orange outside)
              float rad = length(p.xz);
              vec3 tempColor = mix(
                  vec3(0.9, 0.7, 0.4), // Outer (orange/yellow)
                  vec3(0.7, 0.8, 1.0), // Inner (white/blue)
                  smoothstep(5.5, 1.3, rad)
              );
              
              // Doppler Beaming (Matter moving towards us is brighter)
              // Calculate velocity vector (tangent to circle)
              vec3 v = normalize(vec3(-p.z, 0.0, p.x));
              float doppler = 1.0 + dot(rd, v) * 0.7; // Shift brightness based on view angle
              
              vec3 c = tempColor * d * doppler;
              
              // Accumulate color and decrease transmission (opacity)
              diskCol += c * transmit * 0.15;
              transmit *= (1.0 - d * 0.1);
              
              if(transmit < 0.01) break; // Early exit if opaque
          }
          
          // Variable step size - move faster when far from black hole
          dt = 0.05 + r2 * 0.015;
      }
      
      // If ray escaped, render the lensed background
      if(transmit > 0.0) {
          vec3 bg = getBackground(rd);
          col += bg * transmit;
      }
      
      // Add Accretion Disk
      col += diskCol;
      
      // Bloom / Glow pass
      col = pow(col, vec3(0.85)); // Gamma correction for pop

      gl_FragColor = vec4(col, 1.0);
  }
`;

function CosmicBackground({ currentView }: any) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const planetGroupRef = useRef<THREE.Group | null>(null);
  const blackHoleGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number>(null);
  const materialRef = useRef<any>(null);
  const planetMatRef = useRef<any>(null);
  const auraMatRef = useRef<any>(null);
  const cloudMatRef = useRef<any>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x09090b, 0.01); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // cap pixel ratio for performance on BH
    mountRef.current.appendChild(renderer.domElement);

    planetGroupRef.current = new THREE.Group();
    blackHoleGroupRef.current = new THREE.Group();
    scene.add(planetGroupRef.current);
    scene.add(blackHoleGroupRef.current);

    // -- 1. Setup Gargantua (Black Hole) --
    const geometry = new THREE.PlaneGeometry(35, 25); // Large plane filling screen
    const bhMaterial = new THREE.ShaderMaterial({
      vertexShader: blackHoleVertexShader,
      fragmentShader: blackHoleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      transparent: true,
      depthWrite: false
    });
    materialRef.current = bhMaterial;
    const blackHoleMesh = new THREE.Mesh(geometry, bhMaterial);
    blackHoleMesh.position.z = -5;
    blackHoleGroupRef.current.add(blackHoleMesh);

    // Lighting for Planets
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    
    // Main directional light acting as a sun
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(10, 5, 5);
    scene.add(sunLight);
    
    const rimLight = new THREE.PointLight(0x8b5cf6, 1.5, 50); // Violet rim light
    rimLight.position.set(-10, 5, -5);
    scene.add(rimLight);

    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update Black Hole Shader Time
      if(materialRef.current && currentView === 'landing') {
         materialRef.current.uniforms.uTime.value = elapsedTime;
      }

      // Rotate High-Def Planets
      if (planetGroupRef.current && planetGroupRef.current.children.length > 0) {
        planetGroupRef.current.rotation.y = elapsedTime * 0.05; // Slow, majestic rotation
        
        // Find clouds if they exist and rotate slightly faster
        planetGroupRef.current.children.forEach(child => {
            if(child.userData.isClouds) {
                child.rotation.y = elapsedTime * 0.02; // relative to parent
                child.rotation.z = elapsedTime * 0.01;
            }
        });

        // Pulse effect for analyzing state
        if (planetGroupRef.current.userData.isPulsing) {
          const scale = 1 + Math.sin(elapsedTime * 3) * 0.03;
          planetGroupRef.current.scale.set(scale, scale, scale);
          if(auraMatRef.current) {
              auraMatRef.current.opacity = 0.3 + Math.sin(elapsedTime * 3) * 0.15;
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if(materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!planetGroupRef.current || !blackHoleGroupRef.current) return;
    const group = planetGroupRef.current;
    const bhGroup = blackHoleGroupRef.current;

    // Clean up previous planets
    while(group.children.length > 0){ 
        const obj = group.children[0] as any;
        if(obj.geometry) obj.geometry.dispose();
        if(obj.material) {
           if(Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
           else obj.material.dispose();
        }
        group.remove(obj); 
    }
    
    group.scale.set(0.01, 0.01, 0.01);
    group.userData.isPulsing = false;
    
    // Toggle Black Hole visibility
    // Render only when on landing page for performance
    bhGroup.visible = (currentView === 'landing');

    let planetMesh;

    // High Definition Planets for other views
    if(currentView !== 'landing') {
        const sphereGeo = new THREE.SphereGeometry(3.5, 64, 64); // HD sphere
        
        switch (currentView) {
          case 'login':
            // Barren / Rocky Secure Planet
            planetMatRef.current = new THREE.MeshStandardMaterial({ 
                color: 0x18181b, // Zinc 900
                emissive: 0x7f1d1d, // Deep red low glow
                emissiveIntensity: 0.1,
                roughness: 0.9,
                metalness: 0.2,
                wireframe: true, // keeps it techy
                wireframeLinewidth: 2
            });
            planetMesh = new THREE.Mesh(sphereGeo, planetMatRef.current);
            group.add(planetMesh);
            group.position.set(-6, -2, -8);
            break;
    
          case 'upload':
            // Ice / Crystal Data Planet
            planetMatRef.current = new THREE.MeshStandardMaterial({ 
                color: 0x082f49, // Sky 900
                emissive: 0x0284c7, // Sky 600 glow
                emissiveIntensity: 0.2,
                roughness: 0.1,
                metalness: 0.8,
                transparent: true,
                opacity: 0.9
            });
            planetMesh = new THREE.Mesh(sphereGeo, planetMatRef.current);
            
            // Abstract data ring
            const ringGeo = new THREE.TorusGeometry( 4.5, 0.05, 16, 100 );
            const ringMat = new THREE.MeshBasicMaterial( { color: 0x38bdf8, transparent: true, opacity: 0.5 } );
            const ring = new THREE.Mesh( ringGeo, ringMat );
            ring.rotation.x = Math.PI / 2.2;
            group.add(ring);

            group.add(planetMesh);
            group.position.set(0, 0, -5);
            break;
    
          case 'analyzing':
            // Pulsing AI Brain / Nebula Planet
            planetMatRef.current = new THREE.MeshStandardMaterial({ 
                color: 0x2e1065, // Violet 950
                emissive: 0x8b5cf6, // Violet 500 energy
                emissiveIntensity: 0.6,
                roughness: 0.3,
                metalness: 0.7,
            });
            planetMesh = new THREE.Mesh(sphereGeo, planetMatRef.current);
            
            // Outer atmosphere/aura
            auraMatRef.current = new THREE.MeshBasicMaterial({ 
                color: 0xc4b5fd, 
                transparent: true, 
                opacity: 0.3, 
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide
            });
            const aura = new THREE.Mesh(new THREE.SphereGeometry(3.8, 64, 64), auraMatRef.current);
            
            group.add(planetMesh);
            group.add(aura);
            group.position.set(0, 3, -6);
            group.userData.isPulsing = true;
            break;
    
          case 'checklist':
            // Pristine Earth-like Emerald Planet
            planetMatRef.current = new THREE.MeshStandardMaterial({ 
                color: 0x064e3b, // Emerald 900
                emissive: 0x10b981, // Emerald 500
                emissiveIntensity: 0.1,
                roughness: 0.7,
                metalness: 0.1
            });
            planetMesh = new THREE.Mesh(sphereGeo, planetMatRef.current);

            // Cloud layer
            cloudMatRef.current = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.2,
                roughness: 1,
                blending: THREE.AdditiveBlending
            });
            // Using a slightly larger sphere and wireframe to simulate wispy clouds/atmosphere
            const clouds = new THREE.Mesh(new THREE.SphereGeometry(3.55, 32, 32), cloudMatRef.current);
            clouds.userData.isClouds = true;

            group.add(planetMesh);
            group.add(clouds);
            group.position.set(5, -2, -8);
            break;
        }

        // Animate in the planets (pop and scale)
        let scale = 0;
        const animateIn = setInterval(() => {
          scale += 0.05;
          if (scale >= 1) {
            group.scale.set(1, 1, 1);
            clearInterval(animateIn);
          } else {
            // Elastic ease out
            const easeScale = scale < 0.5 ? 4 * scale * scale * scale : 1 - Math.pow(-2 * scale + 2, 3) / 2;
            group.scale.set(easeScale, easeScale, easeScale);
          }
        }, 16);
    }

  }, [currentView]);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState<any>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [partiesData, setPartiesData] = useState(initialMockParties);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  
  const [toasts, setToasts] = useState<any[]>([]);
  const addToast = (message: string, type = 'default') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleLogin = (email: string) => {
    setUser({ email, name: email.split('@')[0] });
    setCurrentView('upload');
    addToast('Autenticação realizada com sucesso', 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    setPartiesData(initialMockParties);
  };

  const handleUploadStart = async (file: File) => {
    setFormId(`job-${Math.floor(Math.random() * 10000)}`);
    setOriginalFile(file);
    setCurrentView('analyzing');
    addToast('Lendo PDF com Groq...', 'default');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/forms/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Erro na análise');
      }

      const data = await res.json();
      setPartiesData(data.parties);
      setCurrentView('checklist');
      addToast('Extração de dados concluída', 'success');
    } catch (error: any) {
      console.error(error);
      addToast(`Erro: ${error.message}`, 'error');
      setCurrentView('upload');
    }
  };

  const handleAnalysisComplete = () => {
    // Não é mais usado diretamente (o fluxo agora é async no handleUploadStart)
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-indigo-500/30 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .bg-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.0) 100%);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite linear;
        }
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}} />

      {/* THREE.JS Cosmic Background Layer */}
      <CosmicBackground currentView={currentView} />

      {/* Glassmorphism Header */}
      {user && currentView !== 'login' && currentView !== 'landing' && (
        <header className="bg-zinc-950/40 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center sticky top-0 z-20 transition-all">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xl tracking-tight cursor-pointer" onClick={() => setCurrentView('landing')}>
            <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
            Forms<span className="text-zinc-100 font-light">AI</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
            <span className="hidden sm:inline-block">User: <span className="text-zinc-100">{user.name}</span></span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-md transition-colors hover:text-rose-400"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-[100vw]">
        {currentView === 'landing' && <LandingView onGetStarted={() => setCurrentView('login')} />}
        {currentView === 'login' && <LoginView onLogin={handleLogin} />}
        {currentView === 'upload' && <UploadZone onUpload={handleUploadStart} />}
        {currentView === 'analyzing' && <AnalyzingView onComplete={handleAnalysisComplete} />}
        {currentView === 'checklist' && (
          <ChecklistPanel 
            parties={partiesData} 
            setParties={setPartiesData} 
            formId={formId}
            addToast={addToast}
            originalFile={originalFile}
            onOpenClientPortal={() => setCurrentView('clientPortal')}
          />
        )}
        {currentView === 'clientPortal' && (
          <ClientPortalView 
            parties={partiesData} 
            setParties={setPartiesData}
            addToast={addToast}
            onBack={() => setCurrentView('checklist')}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function LoginView({ onLogin }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin(email || 'executive@company.com');
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 z-10 animate-slide-up">
      <div className="w-full max-w-md bg-zinc-900/30 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
        
        <div className="p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800/50 border border-white/5 mb-6 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-indigo-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Forms AI</h1>
            <p className="text-zinc-500 text-sm mt-2 font-light">Autenticação Segura</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-white/5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-zinc-200 placeholder:text-zinc-600 font-light"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-white/5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-zinc-200 placeholder:text-zinc-600 font-light"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Acessar Sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function LandingView({ onGetStarted }: any) {
  return (
    <div className="flex-1 flex flex-col items-center p-6 z-10 animate-slide-up overflow-y-auto">
      
      <nav className="w-full max-w-6xl mx-auto flex items-center justify-between py-6 mb-10 md:mb-16">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-2xl tracking-tight">
          <ShieldCheck className="w-8 h-8" strokeWidth={1.5} />
          Forms<span className="text-zinc-100 font-light">AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-sm font-medium text-zinc-400 hover:text-white px-3 py-2 transition-colors"
          >
            Acesso Funcionário
          </Link>
          <button 
            onClick={onGetStarted}
            className="text-sm font-medium text-zinc-300 hover:text-white px-5 py-2.5 rounded-full hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            Entrar na Conta
          </button>
        </div>
      </nav>

      <div className="w-full max-w-4xl mx-auto text-center mb-20 mt-4 relative">
        {/* Glow behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-8 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <Sparkles className="w-3.5 h-3.5" />
          Llama-3 70B & Groq Integration
        </div>
        
        <h1 className="text-5xl md:text-7xl font-semibold text-zinc-100 tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
          Acelere a sua <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-400 bg-[length:200%_auto] animate-[shimmer_4s_linear_infinite]">
            Due Diligence.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light drop-shadow-lg">
          Faça o upload de formulários. Nossa IA interpreta o contexto, identifica as partes e estrutura uma matriz de validação de forma totalmente autônoma.
        </p>

        <button 
          onClick={onGetStarted}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-100 hover:bg-white text-zinc-950 text-base font-semibold rounded-full transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105"
        >
          Começar Gratuitamente
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-20 mt-auto">
        <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 p-8 rounded-3xl transition-all hover:bg-zinc-900/50 hover:border-white/20 group">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform group-hover:bg-violet-500/20 group-hover:border-violet-500/30">
            <Cpu className="w-6 h-6 text-zinc-300 group-hover:text-violet-400 transition-colors" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-medium text-zinc-100 mb-3">Explainable AI (XAI)</h3>
          <p className="text-sm text-zinc-400 leading-relaxed font-light">
            Não é uma caixa preta. A plataforma revela a você exatamente o raciocínio jurídico que a IA utilizou para exigir cada documento.
          </p>
        </div>

        <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 p-8 rounded-3xl transition-all hover:bg-zinc-900/50 hover:border-white/20 group relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-500"></div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 relative z-10">
            <Zap className="w-6 h-6 text-zinc-300 group-hover:text-indigo-400 transition-colors" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-medium text-zinc-100 mb-3 relative z-10">Velocidade Groq</h3>
          <p className="text-sm text-zinc-400 leading-relaxed font-light relative z-10">
            Extração via OCR e processamento de LLMs milhares de vezes mais rápido que o padrão, rodando nas poderosas LPUs do Groq.
          </p>
        </div>

        <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 p-8 rounded-3xl transition-all hover:bg-zinc-900/50 hover:border-white/20 group">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30">
            <ShieldCheck className="w-6 h-6 text-zinc-300 group-hover:text-emerald-400 transition-colors" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-medium text-zinc-100 mb-3">Matrizes Dinâmicas</h3>
          <p className="text-sm text-zinc-400 leading-relaxed font-light">
            Chega de processos engessados. Se o formulário muda, a interface se adapta gerando novas regras de validação na hora.
          </p>
        </div>
      </div>
    </div>
  );
}

function UploadZone({ onUpload }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full z-10 animate-slide-up">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-zinc-100 mb-4 tracking-tight drop-shadow-md">Nova Análise Contratual</h2>
        <p className="text-zinc-400 max-w-lg mx-auto leading-relaxed font-light drop-shadow">
          Arraste documentos complexos. Nossa IA extrairá as partes e estruturará uma matriz de Due Diligence em segundos.
        </p>
      </div>

      <div 
        className={`w-full max-w-2xl border border-dashed rounded-3xl p-14 text-center transition-all duration-300 flex flex-col items-center justify-center bg-zinc-900/30 backdrop-blur-xl relative overflow-hidden
          ${isDragging ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]' : 'border-white/20 hover:border-white/30 hover:bg-white/[0.04]'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`absolute inset-0 bg-indigo-500/20 blur-[100px] transition-opacity duration-500 pointer-events-none ${isDragging ? 'opacity-100' : 'opacity-0'}`}></div>

        <UploadCloud className={`w-16 h-16 mb-6 transition-colors duration-300 relative z-10 ${isDragging ? 'text-indigo-400' : 'text-zinc-500'}`} strokeWidth={1} />
        
        {!file ? (
          <div className="relative z-10">
            <h3 className="text-lg font-medium text-zinc-200 mb-2">Arraste seu PDF aqui</h3>
            <p className="text-zinc-500 text-sm mb-8 font-light">Formatos suportados: PDF, DOCX (Max 50MB)</p>
            <label className="cursor-pointer bg-zinc-800/80 border border-white/10 text-zinc-200 hover:bg-zinc-700 hover:text-white px-6 py-3 rounded-full font-medium shadow-sm transition-all text-sm flex items-center gap-2 mx-auto w-fit">
              <FileText className="w-4 h-4" />
              Procurar Arquivo
              <input type="file" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            </label>
          </div>
        ) : (
          <div className="flex flex-col items-center relative z-10 w-full">
            <div className="flex items-center gap-4 bg-zinc-950/60 p-4 rounded-2xl mb-8 text-left w-full max-w-md border border-white/10 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <FileText className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-zinc-200 truncate">{file.name}</p>
                <p className="text-xs text-zinc-500 mt-1 font-light">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setFile(null)}
                className="px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/10 rounded-full transition-all border border-transparent"
              >
                Cancelar
              </button>
              <button 
                onClick={() => onUpload(file)}
                className="px-6 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Processar com Gemini
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyzingView({ onComplete }: any) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { text: 'Lendo Arquivo e Extraindo Texto (pdf-parse)', time: 1000 },
    { text: 'Processando LLM (Gemini 1.5 Flash)', time: 2000 },
    { text: 'Estruturando Due Diligence em JSON', time: 3000 },
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (currentStep < steps.length) {
      timeout = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].time);
    } else {
      timeout = setTimeout(onComplete, 800);
    }
    return () => clearTimeout(timeout);
  }, [currentStep, onComplete, steps]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 animate-slide-up">
      <div className="w-full max-w-lg bg-zinc-900/30 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div className="mb-10 flex flex-col items-center">
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl animate-pulse"></div>
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin relative z-10" strokeWidth={1} />
          </div>
          <h2 className="text-xl font-medium text-zinc-100 tracking-tight">Agente IA Trabalhando</h2>
          <p className="text-sm text-zinc-500 mt-2 font-light">Analisando contexto jurídico profundo</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isPast = index < currentStep;
            
            return (
              <div 
                key={index} 
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500
                  ${isPast ? 'bg-zinc-950/40 border-white/5 opacity-60' : 
                    isActive ? 'bg-zinc-800/60 border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.1)] relative overflow-hidden' : 
                    'bg-zinc-950/20 border-white/5 opacity-30'}
                `}
              >
                {isActive && <div className="absolute inset-0 bg-shimmer opacity-20 pointer-events-none"></div>}
                
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 relative z-10
                  ${isPast ? 'bg-emerald-500/20 text-emerald-400' : 
                    isActive ? 'bg-violet-500/20 text-violet-400' : 
                    'bg-zinc-800 text-zinc-600'}
                `}>
                  {isPast ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-2 h-2 fill-current" />}
                </div>
                <span className={`text-sm font-medium relative z-10 transition-colors ${isActive ? 'text-violet-100' : 'text-zinc-400'}`}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChecklistPanel({ parties, setParties, formId, addToast, originalFile, onOpenClientPortal }: any) {
  const totalDocs = parties.reduce((acc: number, party: any) => acc + party.documents.length, 0);
  const uploadedDocs = parties.reduce((acc: number, party: any) => acc + party.documents.filter((d: any) => d.status === 'uploaded').length, 0);
  const progressPercent = totalDocs === 0 ? 0 : Math.round((uploadedDocs / totalDocs) * 100);

  const handleDownloadOriginal = () => {
    if (!originalFile) return;
    const url = URL.createObjectURL(originalFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFillForm = () => {
    if (progressPercent < 100) {
      addToast('Anexe todos os documentos antes de preencher o formulário.', 'error');
      return;
    }
    addToast('Preenchendo formulário automaticamente com IA...', 'default');
    setTimeout(() => {
      addToast('Formulário preenchido e gerado com sucesso!', 'success');
    }, 2500);
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full z-10 animate-slide-up pb-24">
      {/* Top Action Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3 bg-zinc-900/50 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-lg">
        <button onClick={handleDownloadOriginal} disabled={!originalFile} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-xl transition-colors">
          <UploadCloud className="w-4 h-4 rotate-180" />
          Baixar Original
        </button>
        <button onClick={onOpenClientPortal} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-sm font-medium rounded-xl transition-all">
          <Info className="w-4 h-4" />
          Portal do Cliente
        </button>
        <div className="flex-1"></div>
        <button onClick={handleFillForm} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Sparkles className="w-4 h-4" />
          Preencher Formulário
        </button>
      </div>

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-zinc-900/30 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1.5 bg-zinc-950/50 border border-white/10 rounded-lg text-xs font-mono text-zinc-400">ID: {formId}</span>
            <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <Check className="w-3 h-3 mr-1.5"/> Checklist Gerada
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-zinc-100 tracking-tight drop-shadow-sm">Matriz de Documentos</h1>
          <p className="text-zinc-400 mt-2 max-w-xl font-light">A IA generativa estruturou os requisitos abaixo baseada no contexto do formulário submetido.</p>
        </div>
        
        <div className="bg-zinc-950/50 p-5 rounded-2xl border border-white/10 min-w-[260px] shadow-inner">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium text-zinc-400">Progresso Geral</span>
            <span className="font-semibold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {parties.map((party: any) => (
          <PartyCard 
            key={party.id} 
            party={party} 
            setParties={setParties}
            addToast={addToast}
          />
        ))}
      </div>
    </div>
  );
}

function PartyCard({ party, setParties, addToast }: any) {
  const handleToggleStatus = (docId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'uploaded' ? 'pending' : 'uploaded';
    // Optimistic UI Update (Mocking a PATCH request)
    setParties((prev: any) => prev.map((p: any) => p.id === party.id ? {
      ...p, documents: p.documents.map((d: any) => d.id === docId ? { ...d, status: 'updating' } : d)
    } : p));

    setTimeout(() => {
      setParties((prev: any) => prev.map((p: any) => p.id === party.id ? {
        ...p, documents: p.documents.map((d: any) => d.id === docId ? { ...d, status: newStatus } : d)
      } : p));
      addToast(newStatus === 'uploaded' ? 'Documento anexado com sucesso.' : 'Documento removido da matriz.');
    }, 800);
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden transition-all hover:border-white/10 shadow-lg">
      <div className="bg-zinc-950/40 px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/90 mb-1.5 block">
            {party.role}
          </span>
          <h3 className="text-xl font-medium text-zinc-100">{party.partyName}</h3>
        </div>
      </div>
      
      <div className="p-3">
        {party.documents.map((doc: any, index: number) => (
          <DocumentItem 
            key={doc.id} 
            doc={doc} 
            isLast={index === party.documents.length - 1}
            onToggle={() => handleToggleStatus(doc.id, doc.status)}
          />
        ))}
      </div>
    </div>
  );
}

function DocumentItem({ doc, isLast, onToggle }: any) {
  const isUploaded = doc.status === 'uploaded';
  const isUpdating = doc.status === 'updating';
  const [showXAI, setShowXAI] = useState(false);

  return (
    <div className={`flex flex-col p-4 rounded-2xl transition-all duration-300 ${!isLast ? 'mb-2' : ''} ${isUploaded ? 'bg-emerald-500/[0.03]' : 'hover:bg-white/[0.03]'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggle}
            disabled={isUpdating}
            className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-md transition-all duration-300
              ${isUpdating ? 'opacity-50 cursor-wait' : ''}
              ${isUploaded ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border border-zinc-700 bg-zinc-950 text-transparent hover:border-indigo-400/60'}
            `}
          >
            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" /> : isUploaded ? <Check className="w-4 h-4" strokeWidth={2.5} /> : null}
          </button>
          
          <div className="flex items-center gap-3">
            <span className={`text-[15px] font-medium transition-colors ${isUploaded ? 'text-zinc-300' : 'text-zinc-200'}`}>
              {doc.name}
            </span>
            <button 
              onClick={() => setShowXAI(!showXAI)}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${showXAI ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:text-indigo-400 hover:bg-white/5'}`}
              title="Por que a IA pediu isso?"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline-block">Raciocínio IA</span>
            </button>
          </div>
        </div>

        <div>
          {!isUploaded && !isUpdating && (
            <label className="cursor-pointer flex items-center gap-2 text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 hover:text-white border border-white/10 px-4 py-2 rounded-xl transition-all shadow-sm">
              <UploadCloud className="w-4 h-4" />
              Anexar
              <input type="file" className="hidden" onChange={onToggle} /> 
            </label>
          )}
          {isUploaded && !isUpdating && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
              Validado
            </span>
          )}
        </div>
      </div>
      
      {/* Expandable Explainable AI (XAI) Panel */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showXAI ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
        <div className="ml-10 flex gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-shimmer opacity-10 pointer-events-none"></div>
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 relative z-10" strokeWidth={1.5} />
          <p className="text-sm text-indigo-200/80 leading-relaxed font-light relative z-10">
            <strong className="font-medium text-indigo-300 mr-2">Contexto Analisado:</strong> 
            {doc.reason}
          </p>
        </div>
      </div>
    </div>
  );
}

function ClientPortalView({ parties, setParties, addToast, onBack }: any) {
  return (
    <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full z-10 animate-slide-up pb-24">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 mb-8 transition-colors text-sm font-medium">
        <ArrowRight className="w-4 h-4 rotate-180" /> Voltar para a Matriz
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold text-zinc-100 tracking-tight">Portal de Envio de Documentos</h1>
        <p className="text-zinc-400 mt-2 font-light">Por favor, anexe os documentos solicitados abaixo para darmos andamento ao seu processo.</p>
      </div>

      <div className="grid gap-6">
        {parties.map((party: any) => (
          <div key={party.id} className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-lg">
            <div className="bg-zinc-950/40 px-6 py-4 border-b border-white/5">
              <h3 className="text-lg font-medium text-zinc-100">{party.partyName}</h3>
            </div>
            <div className="p-4 space-y-3">
              {party.documents.map((doc: any) => {
                const isUploaded = doc.status === 'uploaded';
                const isUpdating = doc.status === 'updating';
                
                const handleToggle = () => {
                  setParties((prev: any) => prev.map((p: any) => p.id === party.id ? { ...p, documents: p.documents.map((d: any) => d.id === doc.id ? { ...d, status: 'updating' } : d) } : p));
                  setTimeout(() => {
                    setParties((prev: any) => prev.map((p: any) => p.id === party.id ? { ...p, documents: p.documents.map((d: any) => d.id === doc.id ? { ...d, status: isUploaded ? 'pending' : 'uploaded' } : d) } : p));
                    addToast(isUploaded ? 'Documento removido.' : 'Documento enviado com sucesso!', isUploaded ? 'default' : 'success');
                  }, 800);
                };

                return (
                  <div key={doc.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${isUploaded ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-950/50 border-white/5'}`}>
                    <div>
                      <p className={`font-medium ${isUploaded ? 'text-zinc-300' : 'text-zinc-200'}`}>{doc.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{isUploaded ? 'Documento recebido' : 'Pendente de envio'}</p>
                    </div>
                    {isUpdating ? (
                      <div className="w-[100px] flex justify-end">
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                      </div>
                    ) : isUploaded ? (
                      <button onClick={handleToggle} className="shrink-0 text-xs font-medium text-emerald-400 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500/10 rounded-xl w-full sm:w-auto">
                        <Check className="w-4 h-4" /> Enviado
                      </button>
                    ) : (
                      <label className="shrink-0 cursor-pointer text-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-sm w-full sm:w-auto block">
                        Anexar Arquivo
                        <input type="file" className="hidden" onChange={handleToggle} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
