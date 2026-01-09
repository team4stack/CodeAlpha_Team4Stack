// import React, { useMemo } from 'react';
// import { useAuth } from '@/contexts/AuthContext';

// interface HeroMobileProps {
//   currentText: string;
//   texts: string[];
//   bulletPoints: string[];
//   projectsCount: number;
//   servicesCount: number;
//   coursesCount: number;
//   tilt: { rx: number; ry: number };
//   prefersReducedMotionState: boolean;
//   onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
//   onMouseLeave: () => void;
// }

// const HeroMobile: React.FC<HeroMobileProps> = ({
//   currentText,
//   texts,
//   bulletPoints,
//   projectsCount,
//   servicesCount,
//   coursesCount,
//   tilt,
//   prefersReducedMotionState,
//   onMouseMove,
//   onMouseLeave
// }) => {
//   const { user, loading } = useAuth();

//   // Structured Data for SEO
//   const heroStructuredData = {
//     "@context": "https://schema.org",
//     "@type": "Service",
//     "serviceType": "Web Development",
//     "provider": {
//       "@type": "Organization",
//       "name": "Team4Stack",
//       "url": "https://team4stack.com/"
//     },
//     "areaServed": {
//       "@type": "Country",
//       "name": "Pakistan"
//     },
//     "category": "Computer Services",
//     "description": "Professional web development, mobile app development, and digital solutions using modern MERN stack technology."
//   };

//   return (
//     <section id="home" className="relative overflow-hidden flex items-center justify-center min-h-[65vh] pb-3">
//       {/* Structured Data */}
//       <script type="application/ld+json">
//         {JSON.stringify(heroStructuredData)}
//       </script>

//       {/* Dark navy gradient base */}
//       <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1f] via-[#0b1226] to-[#060b18]"></div>
//       {/* Brand color washes */}
//       <div className="absolute -top-24 -left-24 w-[55vw] h-[55vw] rounded-full opacity-30 blur-3xl" aria-hidden="true" style={{
//         background: 'radial-gradient(circle at 30% 30%, rgba(56,189,248,0.45), rgba(56,189,248,0) 60%)'
//       }}></div>
//       <div className="absolute -bottom-28 -right-24 w-[60vw] h-[60vw] rounded-full opacity-25 blur-3xl" aria-hidden="true" style={{
//         background: 'radial-gradient(circle at 70% 70%, rgba(168,85,247,0.45), rgba(168,85,247,0) 60%)'
//       }}></div>
//       {/* Vignette */}
//       <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" style={{
//         background: 'radial-gradient(1200px 600px at 50% 120%, rgba(124,58,237,0.25), rgba(0,0,0,0) 70%)'
//       }}></div>

//       {/* Subtle floating shapes */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-16 left-10 w-24 h-24 rotate-12 bg-gradient-to-tr from-cyan-400/15 to-purple-500/15 rounded-xl backdrop-blur-[2px] shadow-[0_0_40px_rgba(56,189,248,0.15)] motion-safe:animate-pulse motion-reduce:animate-none" aria-hidden="true"></div>
//         <div className="absolute bottom-20 right-12 w-16 h-16 -rotate-6 bg-gradient-to-tr from-purple-500/15 to-cyan-400/15 rounded-[12px] backdrop-blur-[2px] shadow-[0_0_40px_rgba(168,85,247,0.15)] motion-safe:animate-pulse motion-reduce:animate-none" aria-hidden="true"></div>

//         {/* Neon light beams */}
//         <div className="pointer-events-none absolute -left-10 top-24 w-[130%] h-24 rotate-[12deg] blur-[2px] opacity-25" aria-hidden="true" style={{
//           background: 'linear-gradient(90deg, rgba(56,189,248,0) 0%, rgba(56,189,248,0.55) 40%, rgba(167,139,250,0.35) 70%, rgba(167,139,250,0) 100%)'
//         }}></div>
//         <div className="pointer-events-none absolute -right-10 bottom-24 w-[130%] h-20 -rotate-[8deg] blur-[2px] opacity-20" aria-hidden="true" style={{
//           background: 'linear-gradient(90deg, rgba(167,139,250,0) 0%, rgba(167,139,250,0.5) 35%, rgba(56,189,248,0.35) 65%, rgba(56,189,248,0) 100%)'
//         }}></div>

//         {/* CRAZY GRID BACKGROUND */}
//         <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
//           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[170vmax] h-[170vmax] rounded-[48px] opacity-35 motion-safe:animate-spin motion-reduce:animate-none" style={{
//             animationDuration: '100s',
//             backgroundImage: `repeating-linear-gradient(0deg, rgba(148,163,184,0.28) 0, rgba(148,163,184,0.28) 1px, transparent 1px, transparent 40px),
//                               repeating-linear-gradient(90deg, rgba(148,163,184,0.26) 0, rgba(148,163,184,0.26) 1px, transparent 1px, transparent 40px)`,
//             maskImage: 'radial-gradient(closest-side, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 85%)',
//             WebkitMaskImage: 'radial-gradient(closest-side, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 85%)'
//           }}></div>
//           <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-cyan-400/0 via-cyan-400/50 to-cyan-400/0"></div>
//           <div className="absolute left-0 right-0 top-[38%] h-[2px] bg-gradient-to-r from-purple-400/0 via-purple-400/40 to-purple-400/0"></div>
//         </div>
//       </div>

//       <div className="container-custom relative z-10 pt-16">
//         {/* Mobile Optimized Layout - Tight Spacing */}
//         <div className="flex flex-col gap-2 pt-2 pb-3">
//           {/* Left: Content */}
//           <div className="text-left space-y-4">
//             {/* Badge */}
//             <div className="inline-flex items-center px-3 py-1.5 rounded-full text-white text-xs font-semibold bg-white/10 border border-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
//               <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></span>
//               MERN Stack
//             </div>

//             {/* Main heading */}
//             <div className="min-h-[5rem] flex items-start">
//               <h1 className="leading-tight font-extrabold tracking-tight text-4xl sm:text-5xl">
//                 {useMemo(() => {
//                 const palettes = [
//                   'from-cyan-400 to-blue-500',
//                   'from-fuchsia-500 to-pink-500',
//                   'from-amber-400 to-orange-500',
//                   'from-emerald-400 to-teal-500'
//                 ];
//                 const parts: Array<{ t: string; sep: string }> = [];
//                 const tokens = String(currentText).split(' ');
//                 tokens.forEach((tok, i) => {
//                   const subtokens = tok.split('-');
//                   subtokens.forEach((st, j) => {
//                     parts.push({ t: st, sep: j < subtokens.length - 1 ? '-' : '' });
//                   });
//                   if (i < tokens.length - 1) parts.push({ t: '', sep: ' ' });
//                 });
//                 return (
//                   <>
//                     {parts.map((p, idx) => (
//                       <React.Fragment key={`w-${idx}`}>
//                         {p.t ? (
//                           <span
//                             className={`bg-clip-text text-transparent bg-gradient-to-r ${palettes[idx % palettes.length]} drop-shadow-[0_8px_24px_rgba(0,0,0,0.15)] motion-safe:animate-pulse`}
//                           >
//                             {p.t}
//                           </span>
//                         ) : null}
//                         {p.sep && <span className="text-white">{p.sep}</span>}
//                       </React.Fragment>
//                     ))}
//                     <span className="text-cyan-400 ml-1 align-baseline motion-safe:animate-pulse">|</span>
//                   </>
//                 );
//               }, [currentText])}
//               </h1>
//             </div>

//             {/* CTAs */}
//             <div className="pt-0">
//               <div className="flex items-center gap-2 flex-wrap">
//                 {!loading && (!user ? (
//                   <button
//                     onClick={() => {
//                       const el = document.querySelector('[aria-label="Sign In"]') as HTMLElement | null;
//                       if (el) (el as HTMLButtonElement).click();
//                     }}
//                     className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-[0_10px_30px_rgba(168,85,247,0.35)]"
//                     aria-label="Sign In"
//                   >
//                     Sign In
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
//                     className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white/95 shadow-[0_8px_24px_rgba(56,189,248,0.22)]"
//                     aria-label="Get started with our services"
//                   >
//                     Getting Started
//                   </button>
//                 ))}
//                 <button
//                   onClick={() => {
//                     const el = document.querySelector('[aria-label=\"Open StackStore (Coming soon)\"]') as HTMLElement | null;
//                     if (el) el.click();
//                     else window.location.hash = '#';
//                   }}
//                   className="text-xs px-4 py-2 rounded-full bg-white/6 backdrop-blur-md text-white/90 border border-white/15"
//                   aria-label="Open StackStore"
//                 >
//                   StackStore
//                 </button>
//               </div>
//             </div>

//             {/* Feature points - Minimal spacing */}
//             <div className="space-y-2 pt-1">
//               {bulletPoints.map((point, idx) => (
//                 <div key={idx} className="flex items-center gap-2">
//                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
//                   <span className="text-gray-300 text-xs sm:text-sm">{point}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Right: Animated Card - Mobile Optimized Design */}
//           <div className="mt-1">
//             <div
//               className="mx-auto w-[92vw] max-w-[380px] min-h-[340px] relative"
//               onMouseMove={onMouseMove}
//               onMouseLeave={onMouseLeave}
//             >
//               {/* Ambient corner glows */}
//               <div className="pointer-events-none absolute -left-6 -top-6 w-20 h-20 rounded-full blur-2xl opacity-40" aria-hidden="true" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.35), rgba(0,0,0,0))' }}></div>
//               <div className="pointer-events-none absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-2xl opacity-35" aria-hidden="true" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.35), rgba(0,0,0,0))' }}></div>

//               {/* Orbiting orbs */}
//               <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
//                 <div className="absolute inset-0 origin-center motion-safe:animate-spin motion-reduce:animate-none" style={{ animationDuration: '40s' }}>
//                   <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]"></span>
//                   <span className="absolute -bottom-2 right-10 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]"></span>
//                 </div>
//                 <div className="absolute inset-0 origin-center motion-safe:animate-spin motion-reduce:animate-none" style={{ animationDuration: '55s', animationDirection: 'reverse' as any }}>
//                   <span className="absolute top-5 -left-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
//                 </div>
//               </div>

//               {/* Glow backdrop */}
//               <div className="absolute -inset-4 rounded-[20px] blur-xl opacity-70 pointer-events-none" aria-hidden="true" style={{
//                 background: 'radial-gradient(80% 60% at 50% 40%, rgba(124,58,237,0.35), rgba(0,0,0,0))'
//               }}></div>

//               {/* Stylish MERN Tilt Card */}
//               <div
//                 className="absolute inset-0 p-[2px] rounded-xl bg-gradient-to-r from-cyan-500/60 via-purple-500/60 to-cyan-500/60"
//                 style={{ transform: prefersReducedMotionState ? undefined : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: 'transform 200ms ease', transformStyle: 'preserve-3d' as any }}
//               >
//                 <div className="relative w-full h-full rounded-lg bg-[#0c1224]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_20px_80px_rgba(56,189,248,0.15),0_15px_50px_rgba(124,58,237,0.18)]">
//                   {/* grid overlay */}
//                   <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" style={{
//                     backgroundImage: `repeating-linear-gradient(0deg, rgba(148,163,184,0.22) 0, rgba(148,163,184,0.22) 1px, transparent 1px, transparent 18px),
//                                       repeating-linear-gradient(90deg, rgba(148,163,184,0.18) 0, rgba(148,163,184,0.18) 1px, transparent 1px, transparent 18px)`
//                   }}></div>

//                   {/* Perimeter rotating highlight */}
//                   <div className="pointer-events-none absolute -inset-[2px] rounded-lg border border-transparent" aria-hidden="true" style={{
//                     background: 'conic-gradient(from 0deg, rgba(56,189,248,0.0), rgba(56,189,248,0.35), rgba(167,139,250,0.35), rgba(56,189,248,0.0))',
//                     WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
//                     WebkitMaskComposite: 'xor',
//                     maskComposite: 'exclude',
//                     padding: '2px',
//                     animation: prefersReducedMotionState ? undefined : 'spin 12s linear infinite'
//                   }}></div>

//                   {/* Crazy wire overlays */}
//                   {!prefersReducedMotionState && (
//                     <svg className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
//                       <defs>
//                         <linearGradient id="wireGrad1Mobile" x1="0%" y1="0%" x2="100%" y2="100%">
//                           <stop offset="0%" stopColor="rgba(56,189,248,0.8)" />
//                           <stop offset="100%" stopColor="rgba(167,139,250,0.8)" />
//                         </linearGradient>
//                       </defs>
//                       <path d="M0,80 C30,60 70,40 100,20" fill="none" stroke="url(#wireGrad1Mobile)" strokeWidth="0.4" strokeDasharray="3 5">
//                         <animate attributeName="stroke-dashoffset" from="0" to="-200" dur="14s" repeatCount="indefinite" />
//                       </path>
//                       <path d="M0,95 C35,75 65,55 100,35" fill="none" stroke="url(#wireGrad1Mobile)" strokeWidth="0.3" strokeDasharray="2 4">
//                         <animate attributeName="stroke-dashoffset" from="0" to="-200" dur="18s" repeatCount="indefinite" />
//                       </path>
//                     </svg>
//                   )}

//                   {/* Top badges */}
//                   <div className="flex items-center gap-1.5 absolute top-2 left-2">
//                     <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
//                     <span className="w-2 h-2 rounded-full bg-purple-400"></span>
//                     <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
//                   </div>

//                   {/* Content: Mobile Optimized Layout */}
//                   <div className="absolute inset-0 p-3.5 flex flex-col gap-2.5 overflow-y-auto">
//                     {/* Stack Chips */}
//                     <div className="flex flex-wrap gap-1.5">
//                       {['MongoDB','Express','React','Node.js'].map((t, i) => (
//                         <span
//                           key={t}
//                           className={`text-[10px] px-2 py-1 rounded-full border border-white/25 bg-white/[0.08] text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_0_10px_rgba(124,58,237,0.12)] ${i % 2 === 0 ? 'motion-safe:animate-pulse' : ''}`}
//                         >
//                           {t}
//                         </span>
//                       ))}
//                     </div>
                    
//                     {/* Code Block - Compact */}
//                     <div className="relative rounded-md border border-white/10 bg-black/40 p-2.5 font-mono text-[0.7rem] text-white/90 shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
//                       <div className="text-white/70 leading-tight text-[0.65rem]"><span className="text-purple-300">const</span> stack <span className="text-purple-300">=</span> <span className="text-emerald-300">['MongoDB','Express','React','Node']</span></div>
//                       <div className="text-white/70 leading-tight text-[0.65rem] mt-0.5"><span className="text-cyan-300">launch</span>() <span className="text-purple-300">{`{`}</span> <span className="text-emerald-300">return</span> <span className="text-emerald-300">'production‑ready'</span> <span className="text-purple-300">{`}`}</span></div>
//                       <span className="absolute right-2 bottom-2 w-1.5 h-3 bg-cyan-400/90 motion-safe:animate-pulse"></span>
//                     </div>

//                     {/* StackStore - Compact Single Row */}
//                     <div className="rounded-md border border-white/10 bg-white/[0.06] p-2 flex items-center justify-between gap-2">
//                       <div className="flex items-center gap-1.5">
//                         <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gradient-to-r from-purple-500/80 to-cyan-500/80 text-white">StackStore</span>
//                         <span className="text-[9px] text-white/70">coming soon</span>
//                       </div>
//                       <div className="px-2 py-1 rounded-full border border-white/25 bg-white/10 text-white/90 text-[9px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
//                         Sale: <span className="font-semibold">{projectsCount}</span>
//                       </div>
//                     </div>

//                     {/* Integrations - Compact */}
//                     <div className="rounded-md border border-white/10 bg-white/[0.05] p-2 space-y-1.5">
//                       <div className="text-[10px] text-white/70 font-medium">Integrations</div>
//                       <div className="flex flex-wrap gap-1.5">
//                         {['Supabase','TypeScript','Vite','Tailwind'].map((t) => (
//                           <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full border border-white/25 bg-white/10 text-white/85 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">{t}</span>
//                         ))}
//                       </div>
//                       <div>
//                         <div className="text-[9px] text-white/60 mb-1">Next Drop ETA</div>
//                         <div className="relative h-1.5 rounded-full overflow-hidden bg-white/10 border border-white/10">
//                           <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/30 to-cyan-500/20"></div>
//                           {!prefersReducedMotionState && (
//                             <div className="absolute -top-0.5 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-x"></div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
                    
//                     {/* Stats - Bottom Row */}
//                     <div className="mt-auto grid grid-cols-3 gap-1.5 pt-1">
//                       <div className="rounded bg-white/[0.06] border border-white/10 p-2 text-center">
//                         <div className="text-sm font-bold text-white">{projectsCount}{projectsCount > 0 ? '+' : ''}</div>
//                         <div className="text-[8px] text-white/70 mt-0.5">Projects</div>
//                       </div>
//                       <div className="rounded bg-white/[0.06] border border-white/10 p-2 text-center">
//                         <div className="text-sm font-bold text-white">{servicesCount}{servicesCount > 0 ? '+' : ''}</div>
//                         <div className="text-[8px] text-white/70 mt-0.5">Services</div>
//                       </div>
//                       <div className="rounded bg-white/[0.06] border border-white/10 p-2 text-center">
//                         <div className="text-sm font-bold text-white">{coursesCount}</div>
//                         <div className="text-[8px] text-white/70 mt-0.5">Courses</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroMobile;

