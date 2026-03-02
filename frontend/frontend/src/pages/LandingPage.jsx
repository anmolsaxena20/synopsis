

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import contractHero from '../assets/contract-hero.png'

function Logo({ white = false }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill={white ? '#FFFFFF' : '#2563EB'} />
      <path d="M7 9h14M7 14h10M7 19h7" stroke={white ? '#0f172a' : 'white'} strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="19" r="3" fill="#60A5FA" />
    </svg>
  )
}

export default function LandingPage() {

  const navigate = useNavigate()
  const [scrolled,setScrolled] = useState(false)

  useEffect(()=>{
    const onScroll=()=>setScrolled(window.scrollY>10)
    window.addEventListener('scroll',onScroll)
    return()=>window.removeEventListener('scroll',onScroll)
  },[])

  const stats=[
    {value:'60s',label:'Average analysis time'},
    {value:'17+',label:'Clause types detected'},
    {value:'$299',label:'Flat monthly price'},
    {value:'100%',label:'Structured output'}
  ]

  const companyFeatures=[
    'Single shared workspace for the entire company',
    'All contracts stored and searchable in one place',
    'Team-wide contract history so anyone can view past analyses',
    'Role-based access control where Admins manage and Members view/upload',
    'Multi-member collaboration with unlimited teammate invites',
    'Contract library grows over time to build institutional knowledge',
    'Flat $299/month pricing with no per-analysis fees',
    'Reduces routine outside counsel spend ($300-$500/hour)',
    'Risk threshold visibility across vendor relationships',
    'Secure storage with encryption in transit and at rest',
    "Never trains on your company's contract data"
  ]

  const userFeatures=[
    'Upload any vendor PDF and get results in under 60 seconds',
    'Plain-English summaries with no legal background needed',
    'Instantly know if a contract is sign-ready or needs negotiation',
    'See exactly which clauses are risky and why',
    'Get specific negotiation language to send back to vendors',
    'Filter and sort clauses by risk level to prioritize quickly',
    'Copy redline recommendations to clipboard in one click',
    'Reopen past contract analyses without re-running AI',
    'Search contracts by vendor name or title instantly',
    'Works across SaaS agreements, services contracts, NDAs, and MSAs'
  ]

  const steps=[
    {step:'1',title:'Upload Contract',desc:'Upload any vendor PDF in a few seconds from your workspace.'},
    {step:'2',title:'AI Risk Analysis',desc:'ContractScan detects key clauses, scores risk, and summarizes findings.'},
    {step:'3',title:'Negotiate Faster',desc:'Use clear clause-by-clause recommendations with copy-ready language.'}
  ]

  return(

<div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50 to-indigo-100 text-gray-900">

{/* soft background lights */}
<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

<div className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-blue-400/20 blur-3xl rounded-full"/>
<div className="absolute top-1/2 -right-40 w-[650px] h-[650px] bg-indigo-400/20 blur-3xl rounded-full"/>

</div>


{/* NAVBAR */}
<header className={`sticky top-0 z-40 backdrop-blur-xl bg-white/60 border-b border-white/40 transition ${scrolled?'shadow-lg':''}`}>

<div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">

<div className="flex items-center gap-7">

<div onClick={()=>navigate('/')} className="flex items-center gap-2 cursor-pointer">
<Logo/>
<span className="font-bold text-[15px]">ContractScan</span>
<span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full border border-blue-200">AI</span>
</div>

<nav className="hidden md:flex gap-1">
<a href="#features" className="px-3 py-2 text-sm text-gray-600 hover:text-black">Features</a>
<a href="#pricing" className="px-3 py-2 text-sm text-gray-600 hover:text-black">Pricing</a>
<a href="#how-it-works" className="px-3 py-2 text-sm text-gray-600 hover:text-black">How it Works</a>
</nav>

</div>

<div className="flex items-center gap-2">

<button onClick={()=>navigate('/auth')} className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
Log In
</button>

<button
onClick={()=>navigate('/auth')}
className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md hover:shadow-lg transition">
Start Free Trial
</button>

</div>
</div>
</header>


{/* HERO */}
<section className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-14 items-center">

<div>

<div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded-full px-3 py-1.5 mb-6">
AI contract intelligence for procurement and legal
</div>

<h1 className="text-5xl font-extrabold leading-tight tracking-tight">
Know your contract risks{' '}
<span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
before you sign.
</span>
</h1>

<p className="mt-6 text-lg text-gray-600 max-w-xl">
ContractScan analyzes vendor agreements in under a minute, flags risky clauses,
and gives your team practical negotiation language.
</p>

<div className="mt-8 flex gap-3">

<button
onClick={()=>navigate('/auth')}
className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg">
Start Free Trial
</button>

<a href="#features" className="px-6 py-3 rounded-lg border border-gray-300 bg-white/80 hover:bg-white shadow-sm">
Explore Features
</a>

</div>

</div>


{/* HERO CARD */}

<div className="relative">

<img
src={contractHero}
alt=""
className="absolute -top-12 right-0 w-[520px] opacity-90 pointer-events-none select-none animate-float"
/>

<div className="relative bg-gradient-to-br from-white to-blue-50 backdrop-blur-xl rounded-2xl p-7 shadow-[0_30px_80px_rgba(0,0,0,0.12)] border border-white/40">

<div className="flex justify-between border-b pb-4 mb-5">

<div>
<p className="text-xs text-gray-400 uppercase">Sample Analysis</p>
<h3 className="font-bold">Vendor Agreement Summary</h3>
</div>

<span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-200 text-amber-700">
High Risk
</span>

</div>

<div className="space-y-3">

{[
'Auto-renewal with a long notice period',
'Unlimited vendor liability carve-out',
'One-sided termination language',
'Payment terms favor vendor'
].map(line=>(

<div key={line} className="flex gap-2 p-3 rounded-lg border bg-white/70 hover:bg-white transition shadow-sm">
<span className="w-2 h-2 bg-red-500 rounded-full mt-2"/>
<p className="text-sm">{line}</p>
</div>

))}

</div>

</div>
</div>

</section>


{/* STATS */}

<section className="border-y border-white/50 bg-gradient-to-b from-blue-50 to-indigo-50">

<div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">

{stats.map(s=>(

<div key={s.label}
className="relative bg-gradient-to-b from-white to-blue-50 backdrop-blur-xl rounded-xl p-6 border border-white shadow-md hover:shadow-xl transition hover:-translate-y-2">

<p className="text-4xl font-extrabold text-blue-600">
{s.value}
</p>

<p className="text-gray-500 text-sm mt-1">
{s.label}
</p>

</div>

))}

</div>

</section>


{/* HOW IT WORKS */}

<section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">

<h2 className="text-3xl font-extrabold mb-10">How it works</h2>

<div className="grid md:grid-cols-3 gap-6">

{steps.map(step=>(

<div key={step.title}
className="bg-gradient-to-b from-white to-blue-50 p-7 rounded-2xl border border-white shadow-md hover:shadow-2xl transition hover:-translate-y-2">

<div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center rounded-full mb-4 shadow-md">
{step.step}
</div>

<h3 className="font-bold">{step.title}</h3>

<p className="text-sm text-gray-600 mt-2">
{step.desc}
</p>

</div>

))}

</div>

</section>


{/* FEATURES */}

<section id="features" className="max-w-6xl mx-auto px-6 pb-20 grid lg:grid-cols-2 gap-8">

{[{title:'For Companies',list:companyFeatures},{title:'For Users',list:userFeatures}]
.map(block=>(

<div key={block.title}
className="relative overflow-hidden bg-gradient-to-br from-white to-indigo-50 p-7 rounded-2xl border border-white shadow-lg hover:shadow-2xl transition hover:-translate-y-2">

<h3 className="text-lg font-bold mb-5">{block.title}</h3>

<div className="space-y-3">

{block.list.map(item=>(

<div key={item} className="flex gap-2">
<span className="w-2 h-2 bg-blue-600 rounded-full mt-2"/>
<p className="text-sm text-gray-700">{item}</p>
</div>

))}

</div>

</div>

))}

</section>


{/* PRICING */}

<section id="pricing" className="max-w-6xl mx-auto px-6 pb-20">

<div className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50 p-10 rounded-3xl border border-white shadow-xl grid lg:grid-cols-2 gap-10">

<div>

<h2 className="text-3xl font-extrabold">Simple flat pricing</h2>

<p className="mt-4 text-gray-600">
No per-analysis charges. No hidden tiers.
</p>

<button
onClick={()=>navigate('/auth')}
className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md">
Start Free Trial
</button>

</div>

<div className="relative bg-white/80 p-8 rounded-2xl border border-white shadow-lg">

<div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"/>

<p className="text-sm text-gray-500">Workspace Plan</p>

<p className="text-5xl font-extrabold text-blue-600 mt-2">
$299<span className="text-base text-gray-500">/month</span>
</p>

</div>

</div>

</section>


{/* FOOTER */}

<footer className="bg-gradient-to-r from-gray-900 to-slate-900 text-gray-400 text-sm">

<div className="max-w-6xl mx-auto px-6 py-10 flex justify-between">
<p>(c) 2026 ContractScan AI</p>
<p>Know risk before you sign</p>
</div>

</footer>


<style>{`

html{scroll-behavior:smooth;}

@keyframes float{
0%,100%{transform:translateY(0);}
50%{transform:translateY(-12px);}
}

.animate-float{
animation:float 4s ease-in-out infinite;
}

`}</style>

</div>
  )
}