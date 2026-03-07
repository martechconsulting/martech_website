import { useState, useEffect, useRef } from "react";

/* ─── TOKENS ─────────────────────────────────────────────── */
const C = {
  navy:"#0B1928", slate:"#152538", blue:"#1A6ED6", blueLt:"#3E8FEF",
  teal:"#0C7A6A", tealLt:"#13A896", amber:"#CA7D1E",
  cream:"#F4F1EB", off:"#F8F7F3", white:"#FFFFFF",
  ink:"#181D27", mid:"#4A5568", muted:"#7A8799", rule:"#DFE4EE",
};
const FF = { head:"'Fraunces', Georgia, serif", body:"'DM Sans', system-ui, sans-serif" };

/* ─── UTILS ──────────────────────────────────────────────── */
function useReveal(threshold=0.12){
  const ref=useRef(null); const [v,setV]=useState(false);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.disconnect();}},{threshold});
    o.observe(el); return ()=>o.disconnect();
  },[]);
  return [ref,v];
}
function Rev({children,delay=0,style={}}){
  const [ref,v]=useReveal();
  return <div ref={ref} style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(28px)",transition:`opacity .65s ease ${delay}ms,transform .65s ease ${delay}ms`,...style}}>{children}</div>;
}
function useHover(){
  const [h,setH]=useState(false);
  return [h,{onMouseEnter:()=>setH(true),onMouseLeave:()=>setH(false)}];
}

/* ─── SHARED ATOMS ───────────────────────────────────────── */
function Eyebrow({children,color=C.blueLt}){
  return <div style={{fontFamily:FF.body,fontSize:".68rem",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color,display:"flex",alignItems:"center",gap:".55rem",marginBottom:".6rem"}}>
    <span style={{width:"1.4rem",height:"2px",background:color,flexShrink:0}}/>
    {children}
  </div>;
}
function SectionTitle({children,style={}}){
  return <h2 style={{fontFamily:FF.head,fontWeight:300,fontSize:"clamp(1.85rem,3.5vw,2.8rem)",lineHeight:1.1,letterSpacing:"-.02em",...style}}>{children}</h2>;
}
function Btn({children,variant="primary",href="#contact",onClick,style:s={}}){
  const [h,ev]=useHover();
  const base={display:"inline-flex",alignItems:"center",gap:".4rem",fontFamily:FF.body,fontWeight:600,fontSize:".875rem",lineHeight:1,padding:".9rem 1.75rem",borderRadius:"3px",cursor:"pointer",textDecoration:"none",transition:"all .18s",whiteSpace:"nowrap",border:"none",...s};
  const v={
    primary:{background:h?C.blueLt:C.blue,color:"#fff"},
    ghost:{background:h?"rgba(255,255,255,.07)":"transparent",color:"#fff",border:"1.5px solid "+(h?"rgba(255,255,255,.65)":"rgba(255,255,255,.28)")},
    outline:{background:h?C.blue:"transparent",color:h?"#fff":C.blue,border:`1.5px solid ${C.blue}`},
    navy:{background:h?C.slate:C.navy,color:"#fff"},
  };
  const El=onClick?"button":"a";
  return <El href={onClick?undefined:href} onClick={onClick} {...ev} style={{...base,...v[variant]}}>{children}<Arrow h={h}/></El>;
}
function Arrow({h}){
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:h?"translateX(3px)":"translateX(0)",transition:"transform .18s"}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
}
function Check({color=C.tealLt}){
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:"2px"}}><path d="M20 6L9 17l-5-5"/></svg>;
}

/* ─── NAV ─────────────────────────────────────────────────── */
function Nav({page,setPage,scrolled}){
  const links=[["home","Home"],["packages","Packages"],["how-it-works","How It Works"],["about","About"],["faq","FAQ"]];
  return (
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:scrolled?"rgba(11,25,40,.98)":"rgba(11,25,40,.93)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(255,255,255,.06)",transition:"background .25s"}}>
      <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)",height:62,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={()=>setPage("home")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:FF.head,fontSize:"1.1rem",fontWeight:400,color:"#fff"}}>
          Martech <em style={{fontStyle:"italic",color:C.blueLt,fontWeight:300}}>Consulting</em>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:"clamp(.75rem,2vw,1.75rem)"}}>
          {links.slice(1).map(([id,label])=>(
            <NavLink key={id} active={page===id} onClick={()=>setPage(id)}>{label}</NavLink>
          ))}
          <Btn onClick={()=>setPage("contact")} style={{padding:".6rem 1.2rem",fontSize:".8rem"}}>Book a free call</Btn>
        </div>
      </div>
    </nav>
  );
}
function NavLink({children,active,onClick}){
  const [h,ev]=useHover();
  return <button onClick={onClick} {...ev} style={{background:"none",border:"none",cursor:"pointer",fontFamily:FF.body,fontSize:".82rem",fontWeight:500,color:active?"#fff":(h?"rgba(255,255,255,.85)":"rgba(255,255,255,.45)"),transition:"color .15s",borderBottom:active?"1px solid "+C.blueLt:"1px solid transparent",paddingBottom:"2px"}}>{children}</button>;
}

/* ══════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════ */
function Home({setPage}){
  const clients=[
    {name:"FEDLogic",tag:"Employee Benefits Tech"},
    {name:"RemovalPro",tag:"Environmental Services"},
    {name:"Rye Consulting",tag:"EdTech Consulting"},
    {name:"Bayside Financial",tag:"Wealth Management"},
    {name:"Building Ohana",tag:"Nonprofit / Housing"},
    {name:"Starfish Aquatics",tag:"Aquatic Education"},
  ];
  const problems=[
    {icon:"📭",title:"Leads go cold",desc:"No follow-up system means prospects move on while you're delivering for someone else."},
    {icon:"📧",title:"Email hits spam",desc:"Poor deliverability silently kills your open rates — and most businesses never know it's happening."},
    {icon:"💸",title:"Ads burn budget",desc:"Without proper targeting and a real funnel, you're paying for impressions that don't convert."},
    {icon:"🔁",title:"Hours lost to repetition",desc:"Tasks a $30/month automation could handle permanently are eating your most valuable hours."},
  ];
  return (
    <>
      {/* HERO */}
      <section style={{minHeight:"100vh",background:C.navy,position:"relative",display:"flex",alignItems:"center",paddingTop:62,overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.027) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.027) 1px,transparent 1px)",backgroundSize:"72px 72px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 65% 55% at 75% 35%,rgba(26,110,214,.13) 0%,transparent 65%),radial-gradient(ellipse 40% 50% at 15% 75%,rgba(12,122,106,.09) 0%,transparent 60%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"clamp(3rem,8vw,6rem) clamp(1.25rem,4vw,2.5rem)",position:"relative",zIndex:2,width:"100%"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4rem",alignItems:"center"}}>
            <div>
              <div style={{opacity:0,animation:"fadeUp .7s .1s ease forwards",marginBottom:"1.5rem"}}>
                <Eyebrow>Marketing Automation · CRM · Small Business Growth</Eyebrow>
              </div>
              <h1 style={{fontFamily:FF.head,fontWeight:300,lineHeight:1.06,fontSize:"clamp(2.8rem,5.5vw,4.7rem)",color:"#fff",letterSpacing:"-.025em",marginBottom:"1.5rem",opacity:0,animation:"fadeUp .7s .2s ease forwards"}}>
                Stop losing leads<br/>to <em style={{fontStyle:"italic",color:C.blueLt}}>silence.</em>
              </h1>
              <p style={{fontFamily:FF.body,fontSize:"1.075rem",color:"rgba(255,255,255,.5)",lineHeight:1.72,maxWidth:440,marginBottom:"2.5rem",opacity:0,animation:"fadeUp .7s .3s ease forwards"}}>
                We build CRM systems, automation sequences, and ad campaigns that follow up, convert, and grow your business — while you focus on your clients.
              </p>
              <div style={{display:"flex",gap:".875rem",flexWrap:"wrap",marginBottom:"3rem",opacity:0,animation:"fadeUp .7s .38s ease forwards"}}>
                <Btn onClick={()=>setPage("contact")} style={{padding:"1rem 2rem",fontSize:".925rem"}}>Book a free call</Btn>
                <Btn variant="ghost" onClick={()=>setPage("packages")} style={{padding:"1rem 2rem",fontSize:".925rem"}}>See packages</Btn>
              </div>
              <div style={{display:"flex",gap:"2.5rem",flexWrap:"wrap",opacity:0,animation:"fadeUp .7s .46s ease forwards"}}>
                {[["300%","Growth through COVID pivot"],["17+","Years of combined experience"],["48hr","Avg. automation setup"]].map(([n,l])=>(
                  <div key={n}>
                    <div style={{fontFamily:FF.head,fontWeight:300,fontSize:"1.85rem",color:"#fff",lineHeight:1,marginBottom:".25rem"}}>{n}</div>
                    <div style={{fontFamily:FF.body,fontSize:".68rem",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(255,255,255,.3)"}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Problem cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".875rem"}}>
              {problems.map((p,i)=>(
                <div key={p.title} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:8,padding:"1.35rem",opacity:0,animation:`fadeUp .6s ${.28+i*.09}s ease forwards`}}>
                  <div style={{fontSize:"1.25rem",marginBottom:".6rem"}}>{p.icon}</div>
                  <div style={{fontFamily:FF.head,fontSize:".96rem",fontWeight:500,color:"#fff",marginBottom:".4rem"}}>{p.title}</div>
                  <div style={{fontFamily:FF.body,fontSize:".78rem",color:"rgba(255,255,255,.37)",lineHeight:1.6}}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CLIENTS */}
      <section style={{background:C.slate,padding:"2.75rem 0",borderTop:"1px solid rgba(255,255,255,.05)"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)"}}>
          <div style={{fontFamily:FF.body,fontSize:".68rem",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(255,255,255,.22)",textAlign:"center",marginBottom:"1.75rem"}}>Clients we've worked with</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"1rem",justifyContent:"center"}}>
            {clients.map(c=>(
              <div key={c.name} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.07)",borderRadius:6,padding:".65rem 1.25rem",textAlign:"center"}}>
                <div style={{fontFamily:FF.head,fontSize:".9rem",fontWeight:500,color:"rgba(255,255,255,.7)",lineHeight:1,marginBottom:".25rem"}}>{c.name}</div>
                <div style={{fontFamily:FF.body,fontSize:".65rem",color:"rgba(255,255,255,.3)",letterSpacing:".05em"}}>{c.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{background:C.off,padding:"clamp(3.5rem,7vw,6rem) 0"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)"}}>
          <Rev style={{maxWidth:560,marginBottom:"3.5rem"}}>
            <Eyebrow color={C.blue}>The real problem</Eyebrow>
            <SectionTitle style={{color:C.ink,marginTop:".6rem"}}>You're not failing at marketing.<br/><em style={{fontStyle:"italic",color:C.blue}}>Your tools are failing you.</em></SectionTitle>
            <p style={{fontFamily:FF.body,fontSize:"1rem",color:C.mid,lineHeight:1.75,marginTop:"1rem"}}>Most small businesses run on disconnected tools that don't talk to each other. Every gap in that stack costs leads, time, and revenue.</p>
          </Rev>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1px",background:C.rule,border:`1px solid ${C.rule}`,borderRadius:10,overflow:"hidden"}}>
            {[
              {n:"01",t:"Nobody's following up",b:"A lead contacts you. You respond when you can. They go cold. An automated follow-up sequence would have closed that deal — but it doesn't exist yet."},
              {n:"02",t:"Your email doesn't land",b:"You write emails that hit spam instead of inboxes. Domain reputation, DNS records, list hygiene — most businesses don't know this is killing their open rates."},
              {n:"03",t:"Ads spend, don't earn",b:"Facebook ads are powerful and easy to waste money on. Without targeting, creative testing, and a funnel behind the click, you're paying for impressions that disappear."},
            ].map((item,i)=>(
              <Rev key={item.n} delay={i*100}>
                <div style={{background:"#fff",padding:"2.25rem 1.875rem",height:"100%"}}>
                  <div style={{fontFamily:FF.head,fontSize:"3.2rem",fontWeight:300,fontStyle:"italic",color:C.rule,lineHeight:1,marginBottom:"1rem"}}>{item.n}</div>
                  <div style={{fontFamily:FF.head,fontSize:"1.15rem",fontWeight:500,color:C.ink,marginBottom:".7rem"}}>{item.t}</div>
                  <div style={{fontFamily:FF.body,fontSize:".875rem",color:C.mid,lineHeight:1.72}}>{item.b}</div>
                </div>
              </Rev>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGE PREVIEW */}
      <section style={{background:C.navy,padding:"clamp(4rem,8vw,7rem) 0",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 70% at 50% 0%,rgba(26,110,214,.09) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)",position:"relative",zIndex:2}}>
          <Rev style={{textAlign:"center",maxWidth:560,margin:"0 auto 3.75rem"}}>
            <Eyebrow>Services &amp; Pricing</Eyebrow>
            <SectionTitle style={{color:"#fff",marginTop:".6rem"}}>Four packages.<br/><em style={{fontStyle:"italic",color:C.blueLt}}>Transparent pricing.</em></SectionTitle>
            <p style={{fontFamily:FF.body,fontSize:"1rem",color:"rgba(255,255,255,.45)",lineHeight:1.7,marginTop:"1.1rem"}}>No discovery calls to learn what things cost. Pick the package that matches your problem.</p>
          </Rev>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"1.1rem",marginBottom:"2.5rem"}}>
            {PACKAGES.map((p,i)=><Rev key={p.name} delay={i*80}><PkgCard pkg={p}/></Rev>)}
          </div>
          <div style={{textAlign:"center"}}>
            <Btn variant="ghost" onClick={()=>setPage("packages")} style={{padding:".9rem 2rem"}}>Compare all packages in detail</Btn>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <CTABand setPage={setPage}/>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   PACKAGES DATA
══════════════════════════════════════════════════════════ */
const PACKAGES=[
  {
    id:"starter",
    owner:"Keith Phillips · Automation Lead",ownerColor:C.tealLt,
    name:"Starter Automation Setup",
    tagline:"Your first CRM and follow-up sequence — built and live in days, not months.",
    price:"$1,500",period:"– $2,500 flat",
    items:["Keap CRM setup and full configuration","Lead capture form connected to your CRM","Automated follow-up email sequence (3–5 emails)","Contact segmentation, tagging, and pipeline stages","30-day post-launch support window"],
    featured:false,
    detail:{
      who:"Best for businesses taking their first step into automation. If you're currently following up manually — or not at all — this is the right starting point.",
      deliverables:[
        {t:"CRM Setup",b:"Your Keap account configured from scratch: pipelines, contact fields, tags, and user access. Ready to capture and organize every lead from day one."},
        {t:"Lead Capture Form",b:"A branded form connected directly to your CRM. Every submission creates a contact, assigns tags, and triggers the follow-up sequence automatically."},
        {t:"Follow-Up Sequence",b:"3–5 emails written and loaded — timed to go out over the first 7–14 days after a lead comes in. Personalized, on-brand, and tested before launch."},
        {t:"Segmentation & Tagging",b:"A clear tagging system so you always know who's a lead, who's a client, who's cold, and who needs attention."},
        {t:"30-Day Support",b:"One month of support post-launch. Questions answered, tweaks made, and edge cases handled as you start using the system in real conditions."},
      ],
      timeline:"48–72 hours from scope approval to live system.",
      ideal:["Service businesses without an existing CRM","Consultants and freelancers losing leads to manual follow-up","Small teams that need automation but don't have a technical person on staff"],
    }
  },
  {
    id:"ads",
    owner:"Keith Phillips · Ads Lead",ownerColor:C.tealLt,
    name:"Facebook Ads Management",
    tagline:"Done-for-you paid social — strategy, creative, targeting, and monthly reporting.",
    price:"$750",period:"– $1,200 / month",
    items:["Campaign strategy and full audience buildout","Ad creative development and copywriting","A/B testing and ongoing performance optimization","Monthly performance report with commentary","Ad spend not included — your budget, our management"],
    featured:false,
    detail:{
      who:"Best for businesses ready to invest in paid traffic and need someone who actually knows what they're doing. Keith has run Facebook campaigns across industries for over 17 years.",
      deliverables:[
        {t:"Campaign Strategy",b:"Before a dollar is spent, we map the funnel: who we're targeting, what they see, and what happens after the click. Strategy first, spend second."},
        {t:"Creative Development",b:"Ad copy and creative direction for each campaign. We test multiple angles to find what converts, not just what looks good."},
        {t:"Audience Buildout",b:"Custom audiences, lookalikes, interest targeting, and retargeting — built around your actual customer base, not guesswork."},
        {t:"Ongoing Optimization",b:"Weekly monitoring of performance metrics. Budgets shifted to what's working, underperformers paused, new tests launched continuously."},
        {t:"Monthly Report",b:"Plain-language report every month: what we ran, what worked, what we're changing, and why. No jargon, just clarity."},
      ],
      timeline:"Campaign live within 5–7 business days of onboarding.",
      ideal:["Businesses with a clear offer and a landing page","Service businesses wanting local lead generation","E-commerce or info-product businesses scaling paid traffic"],
    }
  },
  {
    id:"email",
    owner:"Keith Phillips · Deliverability Specialist",ownerColor:C.tealLt,
    name:"Email Deliverability Audit",
    tagline:"Find out why your email isn't landing — and fix it before your next campaign.",
    price:"$800",period:"– $1,500 flat",
    items:["Full domain reputation and authentication review","SPF, DKIM, and DMARC record check and fix","List hygiene assessment and suppression guidance","Inbox placement testing across major email clients","Written report with a prioritized, actionable fix list"],
    featured:false,
    detail:{
      who:"Best for businesses with an existing email list who suspect their messages aren't reaching inboxes — or who have seen open rates decline with no clear explanation.",
      deliverables:[
        {t:"Domain Reputation Audit",b:"We check your sending domain's reputation across major email security databases. If you've been flagged or blocklisted, we'll find it and map a path to recovery."},
        {t:"Authentication Review",b:"SPF, DKIM, and DMARC records checked against current best practices. Misconfigured records are one of the most common — and fixable — deliverability problems."},
        {t:"List Hygiene Assessment",b:"Review of your current list for invalid addresses, spam traps, and high-bounce contacts. A cleaner list means better reputation and better reach."},
        {t:"Inbox Placement Testing",b:"We send test messages and check where they land across Gmail, Outlook, Yahoo, and other major clients — inbox, promotions, or spam."},
        {t:"Prioritized Fix Report",b:"A written document with every issue found, ranked by impact, with specific actions to fix each one. You'll know exactly what to do and in what order."},
      ],
      timeline:"Report delivered within 5–7 business days of receiving account access.",
      ideal:["Businesses with open rates below 15%","Anyone who has sent campaigns and seen low engagement","Companies switching email platforms or recovering from a deliverability issue"],
    }
  },
  {
    id:"growth",
    owner:"Jonathan + Keith · Full Team",ownerColor:C.amber,
    name:"Growth Stack Build",
    tagline:"Strategy-led, fully implemented — CRM, automation, ads, and the complete marketing infrastructure your business needs to grow.",
    price:"$3,500",period:"– $6,000 flat",
    items:["Strategy and discovery session with Jonathan","Full CRM setup and workflow automation (Keith)","Facebook Ads campaign setup + first 30 days (Keith)","Email deliverability audit and fix included","Lead capture, nurture sequence, and pipeline build","60-day post-launch support window"],
    featured:true,badge:"Most Comprehensive",
    detail:{
      who:"Best for businesses ready to build a real marketing foundation — not just one piece of it. Jonathan leads the strategy, Keith executes the technology. You get both.",
      deliverables:[
        {t:"Discovery & Strategy Session",b:"Jonathan leads a structured session to map your current marketing state, identify gaps, and build a prioritized action plan before any system is built. Strategy drives the build."},
        {t:"Complete CRM & Automation",b:"Full Keap implementation: pipelines, tagging, lead capture, multi-step nurture sequences, and workflow automation across your entire lead-to-client journey."},
        {t:"Facebook Ads Setup + Month 1",b:"Keith builds and launches your ad campaigns, including creative, targeting, and initial A/B testing. The first 30 days of management are included."},
        {t:"Email Deliverability Audit",b:"Full deliverability audit included at no additional charge. Your stack is built on a foundation where email actually reaches inboxes."},
        {t:"Lead Capture & Nurture",b:"Every entry point covered — contact forms, ad lead gen, landing pages — all connected to automated nurture sequences personalized by lead source and behavior."},
        {t:"60-Day Support",b:"Two months of post-launch support. Both Jonathan and Keith available as you run your new system and hit real-world edge cases that need attention."},
      ],
      timeline:"Full build typically completed in 10–14 business days.",
      ideal:["Businesses starting from scratch with no existing marketing stack","Companies that have tried pieces separately and want everything integrated","Growth-stage businesses that need strategy and execution in one engagement"],
    }
  }
];

/* ─── Package Card (mini) ────────────────────────────────── */
function PkgCard({pkg:p,onClick}){
  const [h,ev]=useHover();
  return (
    <div {...ev} onClick={onClick} style={{background:p.featured?"rgba(26,110,214,.1)":"rgba(255,255,255,.04)",border:`1px solid ${p.featured?C.blue:(h?"rgba(62,143,239,.38)":"rgba(255,255,255,.07)")}`,borderRadius:9,padding:"2rem",position:"relative",transition:"border-color .2s,background .2s",display:"flex",flexDirection:"column",cursor:onClick?"pointer":"default"}}>
      {p.badge&&<div style={{position:"absolute",top:-1,right:"1.5rem",background:C.blue,color:"#fff",fontFamily:FF.body,fontSize:".6rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",padding:".27rem .7rem",borderRadius:"0 0 5px 5px"}}>{p.badge}</div>}
      <div style={{fontFamily:FF.body,fontSize:".66rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:p.ownerColor,marginBottom:".8rem"}}>{p.owner}</div>
      <div style={{fontFamily:FF.head,fontSize:"1.4rem",fontWeight:400,color:"#fff",lineHeight:1.2,marginBottom:".45rem"}}>{p.name}</div>
      <div style={{fontFamily:FF.body,fontSize:".82rem",color:"rgba(255,255,255,.4)",lineHeight:1.6,marginBottom:"1.3rem",flex:1}}>{p.tagline}</div>
      <div style={{display:"flex",alignItems:"baseline",gap:".3rem",marginBottom:"1.3rem",paddingBottom:"1.2rem",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <span style={{fontFamily:FF.head,fontWeight:300,fontSize:"1.9rem",color:"#fff"}}>{p.price}</span>
        <span style={{fontFamily:FF.body,fontSize:".76rem",color:"rgba(255,255,255,.3)"}}>{p.period}</span>
      </div>
      <ul style={{listStyle:"none",margin:"0 0 1.5rem",padding:0}}>
        {p.items.map(item=>(
          <li key={item} style={{display:"flex",alignItems:"flex-start",gap:".55rem",fontFamily:FF.body,fontSize:".83rem",color:"rgba(255,255,255,.58)",marginBottom:".55rem",lineHeight:1.45}}>
            <Check/>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PACKAGES PAGE
══════════════════════════════════════════════════════════ */
function PackagesPage({setPage}){
  const [selected,setSelected]=useState(null);
  if(selected) return <PackageDetail pkg={selected} onBack={()=>setSelected(null)} setPage={setPage}/>;
  return (
    <div style={{background:C.navy,minHeight:"100vh",paddingTop:62}}>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 60% 50% at 50% 0%,rgba(26,110,214,.1) 0%,transparent 60%)"}}/>
      <div style={{maxWidth:1120,margin:"0 auto",padding:"clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,2.5rem)",position:"relative",zIndex:2}}>
        <Rev>
          <Eyebrow>Services &amp; Pricing</Eyebrow>
          <SectionTitle style={{color:"#fff",marginTop:".6rem",marginBottom:"1rem"}}>Four packages.<br/><em style={{fontStyle:"italic",color:C.blueLt}}>Transparent pricing.</em></SectionTitle>
          <p style={{fontFamily:FF.body,fontSize:"1.025rem",color:"rgba(255,255,255,.45)",lineHeight:1.72,maxWidth:560,marginBottom:"3.5rem"}}>Every price is published upfront. Pick the package that matches your problem and click to see exactly what's included, who does the work, and how long it takes.</p>
        </Rev>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"1.1rem",marginBottom:"3rem"}}>
          {PACKAGES.map((p,i)=>(
            <Rev key={p.name} delay={i*80}>
              <PkgCard pkg={p} onClick={()=>setSelected(p)}/>
              <button onClick={()=>setSelected(p)} style={{marginTop:".75rem",display:"block",width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:4,padding:".8rem",fontFamily:FF.body,fontWeight:600,fontSize:".84rem",color:"rgba(255,255,255,.65)",cursor:"pointer",transition:"all .18s"}}
                onMouseEnter={e=>{e.target.style.background=C.blue;e.target.style.color="#fff"}}
                onMouseLeave={e=>{e.target.style.background="rgba(255,255,255,.06)";e.target.style.color="rgba(255,255,255,.65)"}}>
                See full details →
              </button>
            </Rev>
          ))}
        </div>
        <Rev>
          <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,padding:"2rem",textAlign:"center"}}>
            <div style={{fontFamily:FF.head,fontSize:"1.3rem",fontWeight:400,color:"#fff",marginBottom:".6rem"}}>Not sure which is right for you?</div>
            <p style={{fontFamily:FF.body,fontSize:".9rem",color:"rgba(255,255,255,.45)",lineHeight:1.7,maxWidth:520,margin:"0 auto 1.5rem"}}>Book a free 30-minute call. We'll ask about your business, look at where you're losing leads, and tell you honestly which package — if any — makes sense.</p>
            <Btn onClick={()=>setPage("contact")}>Book a free call</Btn>
          </div>
        </Rev>
      </div>
    </div>
  );
}

function PackageDetail({pkg:p,onBack,setPage}){
  return (
    <div style={{background:C.navy,minHeight:"100vh",paddingTop:62}}>
      <div style={{maxWidth:860,margin:"0 auto",padding:"clamp(2.5rem,5vw,4.5rem) clamp(1.25rem,4vw,2.5rem)"}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",fontFamily:FF.body,fontSize:".82rem",color:"rgba(255,255,255,.4)",display:"flex",alignItems:"center",gap:".4rem",marginBottom:"2.5rem",padding:0,transition:"color .15s"}}
          onMouseEnter={e=>e.target.style.color="rgba(255,255,255,.8)"}
          onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.4)"}>
          ← Back to packages
        </button>
        <Rev>
          <div style={{fontFamily:FF.body,fontSize:".66rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:p.ownerColor,marginBottom:".8rem"}}>{p.owner}</div>
          <h1 style={{fontFamily:FF.head,fontWeight:300,fontSize:"clamp(2rem,4vw,3rem)",color:"#fff",letterSpacing:"-.02em",lineHeight:1.1,marginBottom:".6rem"}}>{p.name}</h1>
          <p style={{fontFamily:FF.body,fontSize:"1.05rem",color:"rgba(255,255,255,.45)",lineHeight:1.7,maxWidth:580,marginBottom:"2rem"}}>{p.tagline}</p>
          <div style={{display:"flex",alignItems:"baseline",gap:".4rem",marginBottom:"2.5rem"}}>
            <span style={{fontFamily:FF.head,fontWeight:300,fontSize:"2.5rem",color:"#fff"}}>{p.price}</span>
            <span style={{fontFamily:FF.body,fontSize:".85rem",color:"rgba(255,255,255,.35)"}}>{p.period}</span>
          </div>
        </Rev>

        {/* Who it's for */}
        <Rev>
          <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"1.75rem",marginBottom:"2rem"}}>
            <div style={{fontFamily:FF.body,fontSize:".68rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:C.tealLt,marginBottom:".8rem"}}>Who this is for</div>
            <p style={{fontFamily:FF.body,fontSize:".925rem",color:"rgba(255,255,255,.6)",lineHeight:1.75,margin:"0 0 1rem"}}>{p.detail.who}</p>
            <ul style={{listStyle:"none",margin:0,padding:0}}>
              {p.detail.ideal.map(i=>(
                <li key={i} style={{display:"flex",alignItems:"flex-start",gap:".55rem",fontFamily:FF.body,fontSize:".875rem",color:"rgba(255,255,255,.55)",marginBottom:".5rem",lineHeight:1.5}}>
                  <Check/>{i}
                </li>
              ))}
            </ul>
          </div>
        </Rev>

        {/* Deliverables */}
        <Rev>
          <div style={{fontFamily:FF.body,fontSize:".68rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(255,255,255,.3)",marginBottom:"1.25rem"}}>What's included</div>
          <div style={{display:"flex",flexDirection:"column",gap:".875rem",marginBottom:"2.5rem"}}>
            {p.detail.deliverables.map((d,i)=>(
              <div key={d.t} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:7,padding:"1.25rem 1.5rem",display:"flex",gap:"1.25rem",alignItems:"flex-start"}}>
                <div style={{fontFamily:FF.head,fontWeight:300,fontStyle:"italic",fontSize:"1.5rem",color:"rgba(255,255,255,.12)",lineHeight:1,flexShrink:0,width:"1.75rem",textAlign:"center"}}>{i+1}</div>
                <div>
                  <div style={{fontFamily:FF.head,fontSize:"1rem",fontWeight:500,color:"rgba(255,255,255,.85)",marginBottom:".4rem"}}>{d.t}</div>
                  <div style={{fontFamily:FF.body,fontSize:".875rem",color:"rgba(255,255,255,.45)",lineHeight:1.72}}>{d.b}</div>
                </div>
              </div>
            ))}
          </div>
        </Rev>

        {/* Timeline + CTA */}
        <Rev>
          <div style={{background:`rgba(26,110,214,${p.featured?.12:.07})`,border:`1px solid ${p.featured?C.blue:"rgba(255,255,255,.08)"}`,borderRadius:8,padding:"1.75rem",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1.5rem"}}>
            <div>
              <div style={{fontFamily:FF.body,fontSize:".68rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(255,255,255,.3)",marginBottom:".4rem"}}>Timeline</div>
              <div style={{fontFamily:FF.head,fontSize:"1.1rem",fontWeight:400,color:"#fff"}}>{p.detail.timeline}</div>
            </div>
            <div style={{display:"flex",gap:"1rem",flexWrap:"wrap"}}>
              <Btn onClick={()=>setPage("contact")}>Get started</Btn>
              <Btn variant="ghost" onClick={onBack} style={{padding:".9rem 1.5rem"}}>← All packages</Btn>
            </div>
          </div>
        </Rev>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HOW IT WORKS PAGE
══════════════════════════════════════════════════════════ */
function HowItWorksPage({setPage}){
  const steps=[
    {n:"1",t:"Book a free discovery call",sub:"30 minutes. No pitch.",b:"We start every engagement the same way: a 30-minute call where we ask about your business, your current marketing setup, and where you're losing leads. No sales pitch, no pressure. You'll get a straight answer about whether we can actually help and — if we can — what it would cost. If we're not the right fit, we'll tell you that too.",aside:"The call is the lowest-risk step you can take. Most clients say they got more value from the discovery call alone than from months of previous marketing conversations."},
    {n:"2",t:"Receive a scoped proposal with a flat price",sub:"No surprises.",b:"Within 24–48 hours of your call, you'll receive a written proposal with a clear scope, a flat price, and a timeline. Everything in writing before any work starts. We don't do vague retainers or billable hours. You know what you're getting, when you'll get it, and exactly what it costs.",aside:"Flat pricing is a deliberate choice. When you know the cost upfront, you can make a clear decision — and we can focus on delivering, not tracking hours."},
    {n:"3",t:"We build — you stay in the loop",sub:"Typically 48 hours to 2 weeks.",b:"Once you approve the proposal, Keith or Jonathan (or both, depending on the package) get to work. We'll check in at key milestones and flag any decisions you need to make. You won't be left wondering what's happening — but you also won't be buried in project updates you didn't ask for.",aside:"We're direct communicators. You'll hear from us when something needs your input. Silence means the build is progressing on schedule."},
    {n:"4",t:"Live walkthrough and launch",sub:"Nothing goes live until you've seen it.",b:"Before anything launches, we walk you through exactly what we built: how each piece works, what happens when a lead comes in, and what you'll see in your dashboard. You test it yourself, we fix anything that needs fixing, and then it goes live.",aside:"We've learned the hard way that skipping walkthroughs creates problems downstream. This step is non-negotiable regardless of package size."},
    {n:"5",t:"Post-launch support",sub:"30–60 days depending on package.",b:"Your support window starts the day you go live. During this period, questions are answered quickly, tweaks are made, and edge cases get handled as they come up. Most systems need minor adjustments in the first few weeks of real-world use — we build this in intentionally.",aside:"After your support window, we offer optional monthly retainers for businesses that want continued hands-on management. We'll discuss whether that makes sense on your call."},
  ];
  return (
    <div style={{background:C.cream,minHeight:"100vh",paddingTop:62}}>
      <div style={{background:C.navy,padding:"clamp(3rem,6vw,5rem) 0 clamp(2rem,4vw,3.5rem)"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)"}}>
          <Rev>
            <Eyebrow>How it works</Eyebrow>
            <SectionTitle style={{color:"#fff",marginTop:".6rem",marginBottom:"1rem"}}>From first call to <em style={{fontStyle:"italic",color:C.blueLt}}>live system.</em></SectionTitle>
            <p style={{fontFamily:FF.body,fontSize:"1.025rem",color:"rgba(255,255,255,.45)",lineHeight:1.72,maxWidth:540}}>Five steps. Clear expectations at every stage. Nothing goes live until you've seen it and approved it.</p>
          </Rev>
        </div>
      </div>

      <div style={{maxWidth:1120,margin:"0 auto",padding:"clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,2.5rem)"}}>
        {steps.map((s,i)=>(
          <Rev key={s.n} delay={i*60}>
            <div style={{display:"grid",gridTemplateColumns:"3.5rem 1fr 1fr",gap:"2rem",marginBottom:"2.5rem",paddingBottom:"2.5rem",borderBottom:i<steps.length-1?`1px solid ${C.rule}`:"none",alignItems:"start"}}>
              <div style={{width:"3.5rem",height:"3.5rem",borderRadius:"50%",background:C.navy,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF.head,fontWeight:300,fontStyle:"italic",fontSize:"1.35rem",flexShrink:0}}>{s.n}</div>
              <div>
                <div style={{fontFamily:FF.body,fontSize:".68rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:C.blue,marginBottom:".4rem"}}>{s.sub}</div>
                <h3 style={{fontFamily:FF.head,fontSize:"1.3rem",fontWeight:500,color:C.ink,lineHeight:1.2,marginBottom:".75rem"}}>{s.t}</h3>
                <p style={{fontFamily:FF.body,fontSize:".9rem",color:C.mid,lineHeight:1.78}}>{s.b}</p>
              </div>
              <div style={{background:"#fff",border:`1px solid ${C.rule}`,borderRadius:7,padding:"1.25rem 1.5rem"}}>
                <div style={{fontFamily:FF.body,fontSize:".68rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:C.muted,marginBottom:".6rem"}}>Worth knowing</div>
                <p style={{fontFamily:FF.body,fontSize:".85rem",color:C.mid,lineHeight:1.72,margin:0,fontStyle:"italic"}}>{s.aside}</p>
              </div>
            </div>
          </Rev>
        ))}

        <Rev>
          <div style={{background:C.navy,borderRadius:10,padding:"2.5rem",display:"grid",gridTemplateColumns:"1fr auto",gap:"2rem",alignItems:"center"}}>
            <div>
              <SectionTitle style={{color:"#fff",fontSize:"1.6rem",marginBottom:".65rem"}}>Ready to start?</SectionTitle>
              <p style={{fontFamily:FF.body,fontSize:".9rem",color:"rgba(255,255,255,.45)",lineHeight:1.7,margin:0}}>Step one is a free 30-minute call. No commitment required.</p>
            </div>
            <Btn onClick={()=>setPage("contact")} style={{whiteSpace:"nowrap"}}>Book a free call</Btn>
          </div>
        </Rev>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ABOUT PAGE
══════════════════════════════════════════════════════════ */
function AboutPage({setPage}){
  const clients=[
    {name:"FEDLogic",tag:"Employee Benefits Technology",desc:"Federal and state benefits navigation platform serving 520+ employers and 5M+ employees nationwide. We built their lead capture and CRM automation to support a rapidly scaling sales team."},
    {name:"RemovalPro",tag:"Environmental Services",desc:"Oil tank removal and environmental services company serving MA, southern NH, and Cape Cod. We built the marketing stack that turned their inbound leads from cold contact to scheduled job — automatically."},
    {name:"Rye Consulting",tag:"Education Market Consulting",desc:"Women-owned consulting firm helping EdTech companies navigate the PreK–HigherEd market since 2013. We built automation and outreach sequences for their business development pipeline."},
    {name:"Bayside Financial",tag:"Wealth Management",desc:"Independent financial advisory firm serving retirees and pre-retirees with $500K+ in assets. We built their client acquisition funnel and automated nurture sequences for long sales cycles."},
    {name:"Building Ohana",tag:"Nonprofit / Inclusive Housing",desc:"501(c)3 nonprofit building intentional inclusive communities for adults with intellectual and developmental disabilities. We supported their donor outreach and community engagement automation."},
    {name:"Starfish Aquatics",tag:"Aquatic Education",desc:"National swim instruction curriculum provider and local swim school with presence across the US. We built enrollment automation and follow-up sequences for their swim lesson programs."},
  ];
  return (
    <div style={{minHeight:"100vh",paddingTop:62}}>
      {/* Header */}
      <div style={{background:C.navy,padding:"clamp(3rem,6vw,5rem) 0"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)"}}>
          <Rev>
            <Eyebrow>About us</Eyebrow>
            <SectionTitle style={{color:"#fff",marginTop:".6rem",marginBottom:"1rem"}}>Built for small business.<br/><em style={{fontStyle:"italic",color:C.blueLt}}>By people who've been there.</em></SectionTitle>
            <p style={{fontFamily:FF.body,fontSize:"1.025rem",color:"rgba(255,255,255,.45)",lineHeight:1.72,maxWidth:580}}>Martech Consulting grew out of a simple observation: small businesses are drowning in marketing tools they don't know how to use — and losing customers to silence while they figure it out.</p>
          </Rev>
        </div>
      </div>

      {/* Founder Bios */}
      <div style={{background:"#fff",padding:"clamp(3.5rem,7vw,6rem) 0"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)"}}>
          <Rev style={{marginBottom:"3rem"}}>
            <Eyebrow color={C.blue}>The team</Eyebrow>
            <SectionTitle style={{color:C.ink,marginTop:".6rem"}}>Two specialists.<br/><em style={{fontStyle:"italic",color:C.blue}}>One integrated practice.</em></SectionTitle>
            <p style={{fontFamily:FF.body,fontSize:"1rem",color:C.mid,lineHeight:1.75,maxWidth:560,marginTop:"1rem"}}>Jonathan handles strategy and platform. Keith handles execution and delivery. Most of our clients work with both of us — which is the point.</p>
          </Rev>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem"}}>
            <Rev>
              <FounderCard
                name="Jonathan Noury-Elliard"
                role="Strategy & Platform"
                accentColor={C.blue}
                credential="MBA, Community Economic Development · SNHU"
                bio="Jonathan has been building marketing systems and community platforms since 2017, when he founded NH Rocks LLC — a statewide digital platform connecting local businesses with residents across New Hampshire. He achieved profitability within the first two years, including through the COVID pandemic, by pivoting quickly to marketing services and growing 300% through that period. That pivot became Martech Consulting. He holds an MBA in Community Economic Development from Southern New Hampshire University and brings a systems-thinking lens to every client engagement — asking not just what works, but why, and how to make it repeatable. He is also the Founder and CEO of Sereno, Inc., a nonprofit focused on community economic development and sustainable tourism infrastructure."
                skills={["Marketing Strategy","Airtable Architecture","Bubble Development","API Integration","Softr & No-Code Platforms","Community Economic Development","Tourism & Destination Marketing","Data Analytics"]}
                facts={[
                  ["2017","Founded NH Rocks LLC, first statewide digital local economy platform"],
                  ["300%","Revenue growth achieved during COVID pivot to marketing services"],
                  ["3.981","Graduating GPA from SNHU MBA in Community Economic Development"],
                  ["2023","Founded Sereno, Inc. nonprofit focused on eTourism and CED"],
                ]}
              />
            </Rev>
            <Rev delay={120}>
              <FounderCard
                name="Keith Phillips"
                role="Automation, Ads & Deliverability"
                accentColor={C.teal}
                credential="Keap Certified Partner · SNHU Graduate · COO, Classic Photographers"
                bio="Keith brings 17+ years of marketing and business development experience rooted in the wedding and events industry — one of the highest-stakes, relationship-driven sales environments that exists. Starting in a formal wear shop in high school, he worked his way through photography, video, invitations, photo booths, and DJs before becoming COO of Classic Photographers, a national wedding photography company recognized in the Knot Best of Weddings Hall of Fame. He's a Keap Certified Partner, a Facebook Ads specialist he describes simply as a 'Facebook Ad Ninja,' and one of the sharper email deliverability experts in the region. He currently runs a client waitlist — which is the most honest proof of demand we know. Keith is also a professional ski instructor and a father of six."
                skills={["Keap CRM & Automation","Facebook & Instagram Ads","Email Deliverability","Business Development","Event & Wedding Marketing","Customer Service Systems","Lead Nurture Sequences","A/B Testing"]}
                facts={[
                  ["17+","Years in business development and digital marketing"],
                  ["Keap","Certified Partner — official certification in CRM automation"],
                  ["Hall of Fame","Knot Best of Weddings Hall of Fame via Classic Photographers"],
                  ["Waitlist","Currently operating with a client waitlist — proof of sustained demand"],
                ]}
              />
            </Rev>
          </div>
        </div>
      </div>

      {/* Clients */}
      <div style={{background:C.off,padding:"clamp(3.5rem,7vw,6rem) 0"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)"}}>
          <Rev style={{marginBottom:"3rem"}}>
            <Eyebrow color={C.blue}>Client work</Eyebrow>
            <SectionTitle style={{color:C.ink,marginTop:".6rem"}}>Businesses we've <em style={{fontStyle:"italic",color:C.blue}}>built for.</em></SectionTitle>
            <p style={{fontFamily:FF.body,fontSize:"1rem",color:C.mid,lineHeight:1.75,maxWidth:540,marginTop:"1rem"}}>We work across industries. What they have in common: leads going cold, systems that don't connect, and growth that's ready to happen.</p>
          </Rev>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1.1rem"}}>
            {clients.map((c,i)=>(
              <Rev key={c.name} delay={i*70}>
                <div style={{background:"#fff",border:`1px solid ${C.rule}`,borderRadius:8,padding:"1.5rem 1.75rem",height:"100%"}}>
                  <div style={{fontFamily:FF.head,fontSize:"1.05rem",fontWeight:500,color:C.ink,marginBottom:".25rem"}}>{c.name}</div>
                  <div style={{fontFamily:FF.body,fontSize:".65rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:C.blue,marginBottom:".875rem"}}>{c.tag}</div>
                  <div style={{fontFamily:FF.body,fontSize:".855rem",color:C.mid,lineHeight:1.72}}>{c.desc}</div>
                </div>
              </Rev>
            ))}
          </div>
        </div>
      </div>

      <CTABand setPage={setPage}/>
    </div>
  );
}

function FounderCard({name,role,accentColor,credential,bio,skills,facts}){
  return (
    <div style={{borderRadius:10,overflow:"hidden",border:`1px solid ${C.rule}`,height:"100%",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:C.navy,padding:"2rem 2rem 1.5rem",borderLeft:`4px solid ${accentColor}`}}>
        <div style={{fontFamily:FF.head,fontSize:"1.3rem",fontWeight:500,color:"#fff",marginBottom:".2rem"}}>{name}</div>
        <div style={{fontFamily:FF.body,fontSize:".68rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:accentColor,marginBottom:".6rem"}}>{role}</div>
        <div style={{fontFamily:FF.body,fontSize:".75rem",color:"rgba(255,255,255,.35)"}}>{credential}</div>
      </div>
      {/* Body */}
      <div style={{padding:"1.75rem 2rem",flex:1,background:"#fff"}}>
        <p style={{fontFamily:FF.body,fontSize:".875rem",color:C.mid,lineHeight:1.8,marginBottom:"1.75rem"}}>{bio}</p>
        {/* Facts grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".75rem",marginBottom:"1.5rem"}}>
          {facts.map(([n,l])=>(
            <div key={n} style={{background:C.off,borderRadius:6,padding:"1rem"}}>
              <div style={{fontFamily:FF.head,fontWeight:300,fontStyle:"italic",fontSize:"1.5rem",color:C.navy,lineHeight:1,marginBottom:".3rem"}}>{n}</div>
              <div style={{fontFamily:FF.body,fontSize:".72rem",color:C.muted,lineHeight:1.45}}>{l}</div>
            </div>
          ))}
        </div>
        {/* Skills */}
        <div style={{fontFamily:FF.body,fontSize:".65rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:C.muted,marginBottom:".6rem"}}>Specialties</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:".4rem"}}>
          {skills.map(s=><span key={s} style={{fontFamily:FF.body,fontSize:".73rem",fontWeight:500,padding:".28rem .65rem",borderRadius:100,background:C.off,border:`1px solid ${C.rule}`,color:C.mid}}>{s}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FAQ PAGE
══════════════════════════════════════════════════════════ */
function FAQPage({setPage}){
  const faqs=[
    {q:"Do I need an existing CRM or marketing tools?",a:"No. We can start from scratch or work with what you already have. If you're currently running everything out of your inbox, that's fine — that's where most of our clients start. We'll help you figure out what tools make sense during the discovery call before recommending anything."},
    {q:"How long does setup actually take?",a:"Starter Automation setups typically go live within 48–72 hours of scope approval. Facebook Ads campaigns are live within 5–7 business days of onboarding. Full Growth Stack builds take 10–14 business days. We'll give you a firm timeline in writing before you commit to anything."},
    {q:"What if I'm not technical at all?",a:"You don't need to be. We build, we test, and we walk you through everything we've created before handing it over. The systems we build are designed to run without you touching them. That's the whole point. If something breaks or needs an update, that's what support windows are for."},
    {q:"Is there ongoing support after the project ends?",a:"Every package includes a post-launch support window — 30 days for starter packages and the deliverability audit, 60 days for the Growth Stack. After that, we offer optional monthly retainers for businesses that want continued hands-on management. We'll talk about whether that makes sense on your discovery call."},
    {q:"What does the free discovery call actually involve?",a:"30 minutes — phone or Zoom. We ask about your business, your current marketing setup, and where you're losing leads. You get a clear answer about whether we can help and what it would cost before you leave the call. No pitch, no pressure, no follow-up email sequence trying to win you over. If we can help, we'll say so. If we can't, we'll tell you that too."},
    {q:"Do you work with businesses outside New Hampshire?",a:"Yes. We're based in Dover, NH, but we work with businesses across the US. Everything we do is remote-friendly — most client communication happens over email, Zoom, and Loom. Geography doesn't matter for the work we do. About half of our current clients are outside New England."},
    {q:"What's the difference between the Starter package and the Growth Stack?",a:"The Starter Automation Setup gives you a CRM and a follow-up sequence — the essential foundation. The Growth Stack adds Facebook Ads, a deliverability audit, a strategy session with Jonathan, and a more complete lead-to-client system built across every channel. If budget allows, the Growth Stack is the more powerful starting point. If you want to start smaller and expand, the Starter is the right first step."},
    {q:"What if the project scope changes after we start?",a:"We talk about it before we build it. If something you need turns out to be outside the agreed scope, we flag it, tell you what it would add, and get your approval before moving forward. No surprise invoices."},
    {q:"How do I pay?",a:"We accept bank transfer and major credit cards. Payment is typically 50% at project kickoff and 50% at delivery, though we're flexible on terms for larger engagements. Everything is outlined in the proposal before you commit."},
    {q:"Can Keith manage my ads on platforms other than Facebook?",a:"Facebook and Instagram Ads are Keith's primary focus. He has deep experience with Meta's ad platform specifically. For Google Ads, we can make recommendations and help with strategy, but our direct management specialty is Meta. If you need a Google Ads specialist, we'll tell you honestly and point you toward the right resource."},
  ];
  const [open,setOpen]=useState(null);
  return (
    <div style={{minHeight:"100vh",paddingTop:62}}>
      <div style={{background:C.navy,padding:"clamp(3rem,6vw,5rem) 0"}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)"}}>
          <Rev>
            <Eyebrow>Common questions</Eyebrow>
            <SectionTitle style={{color:"#fff",marginTop:".6rem",marginBottom:"1rem"}}>Before you <em style={{fontStyle:"italic",color:C.blueLt}}>reach out.</em></SectionTitle>
            <p style={{fontFamily:FF.body,fontSize:"1.025rem",color:"rgba(255,255,255,.45)",lineHeight:1.72,maxWidth:520}}>Everything we get asked before someone books a call — answered directly, without hedging.</p>
          </Rev>
        </div>
      </div>
      <div style={{background:C.off,padding:"clamp(3rem,6vw,5rem) 0"}}>
        <div style={{maxWidth:800,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)"}}>
          <div style={{display:"flex",flexDirection:"column",gap:".6rem",marginBottom:"3rem"}}>
            {faqs.map((f,i)=>(
              <Rev key={f.q} delay={i*40}>
                <FAQItem faq={f} open={open===i} onToggle={()=>setOpen(open===i?null:i)}/>
              </Rev>
            ))}
          </div>
          <Rev>
            <div style={{background:C.navy,borderRadius:10,padding:"2rem",textAlign:"center"}}>
              <div style={{fontFamily:FF.head,fontSize:"1.3rem",fontWeight:400,color:"#fff",marginBottom:".5rem"}}>Still have a question?</div>
              <p style={{fontFamily:FF.body,fontSize:".875rem",color:"rgba(255,255,255,.45)",lineHeight:1.7,marginBottom:"1.5rem"}}>Book a free call. We'll answer whatever's holding you back from making a decision.</p>
              <Btn onClick={()=>setPage("contact")}>Book a free call</Btn>
            </div>
          </Rev>
        </div>
      </div>
    </div>
  );
}
function FAQItem({faq,open,onToggle}){
  const [h,ev]=useHover();
  return (
    <div {...ev} style={{background:"#fff",border:`1px solid ${open?C.blue:C.rule}`,borderRadius:8,overflow:"hidden",transition:"border-color .2s",cursor:"pointer"}} onClick={onToggle}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.25rem 1.75rem",gap:"1rem"}}>
        <div style={{fontFamily:FF.head,fontSize:"1rem",fontWeight:500,color:C.ink,lineHeight:1.35}}>{faq.q}</div>
        <div style={{width:20,height:20,borderRadius:"50%",background:open?C.blue:C.rule,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .2s"}}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={open?"#fff":C.mid} strokeWidth="2.5" strokeLinecap="round"><path d={open?"M18 15l-6-6-6 6":"M6 9l6 6 6-6"}/></svg>
        </div>
      </div>
      {open&&<div style={{padding:"0 1.75rem 1.25rem",fontFamily:FF.body,fontSize:".875rem",color:C.mid,lineHeight:1.78}}>{faq.a}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CONTACT PAGE
══════════════════════════════════════════════════════════ */
function ContactPage(){
  return (
    <div style={{background:C.navy,minHeight:"100vh",paddingTop:62,display:"flex",alignItems:"center"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 55% 70% at 25% 50%,rgba(26,110,214,.14) 0%,transparent 60%),radial-gradient(ellipse 40% 55% at 80% 50%,rgba(12,122,106,.09) 0%,transparent 60%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:720,margin:"0 auto",padding:"clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,2.5rem)",position:"relative",zIndex:2,width:"100%"}}>
        <Rev>
          <Eyebrow>Get in touch</Eyebrow>
          <SectionTitle style={{color:"#fff",marginTop:".6rem",marginBottom:"1.25rem"}}>
            Ready to stop losing leads<br/>to <em style={{fontStyle:"italic",color:C.blueLt}}>silence?</em>
          </SectionTitle>
          <p style={{fontFamily:FF.body,fontSize:"1.05rem",color:"rgba(255,255,255,.48)",lineHeight:1.72,marginBottom:"2.5rem"}}>
            Book a free 30-minute discovery call. We'll look at where your marketing is breaking down and tell you honestly what would fix it — with a price before you leave the call.
          </p>
        </Rev>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.1rem",marginBottom:"2rem"}}>
          {[
            {icon:"📞",t:"Book a call",d:"30-minute discovery. No commitment required.",label:"Schedule on Calendly",href:"mailto:hello@martechconsulting.io?subject=Free Discovery Call"},
            {icon:"✉️",t:"Send an email",d:"Prefer to write first? We respond within 24 hours.",label:"hello@martechconsulting.io",href:"mailto:hello@martechconsulting.io"},
          ].map(c=>(
            <Rev key={c.t}>
              <a href={c.href} style={{display:"block",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,padding:"1.75rem",textDecoration:"none",transition:"border-color .2s,background .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(62,143,239,.4)";e.currentTarget.style.background="rgba(255,255,255,.07)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.08)";e.currentTarget.style.background="rgba(255,255,255,.05)"}}>
                <div style={{fontSize:"1.5rem",marginBottom:".75rem"}}>{c.icon}</div>
                <div style={{fontFamily:FF.head,fontSize:"1.1rem",fontWeight:500,color:"#fff",marginBottom:".4rem"}}>{c.t}</div>
                <div style={{fontFamily:FF.body,fontSize:".82rem",color:"rgba(255,255,255,.4)",lineHeight:1.6,marginBottom:"1rem"}}>{c.d}</div>
                <div style={{fontFamily:FF.body,fontSize:".82rem",fontWeight:600,color:C.blueLt}}>{c.label} →</div>
              </a>
            </Rev>
          ))}
        </div>
        <Rev>
          <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"1.25rem 1.5rem"}}>
            <p style={{fontFamily:FF.body,fontSize:".82rem",color:"rgba(255,255,255,.28)",margin:0,textAlign:"center"}}>No commitment. No hard sell. Just a straight conversation about what would actually help. Based in Dover, NH — working with businesses across the US.</p>
          </div>
        </Rev>
      </div>
    </div>
  );
}

/* ─── SHARED: CTA Band ───────────────────────────────────── */
function CTABand({setPage}){
  return (
    <section style={{background:C.navy,padding:"clamp(4rem,8vw,7rem) 0",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 55% 80% at 25% 50%,rgba(26,110,214,.14) 0%,transparent 60%),radial-gradient(ellipse 40% 60% at 80% 50%,rgba(12,122,106,.09) 0%,transparent 60%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)",position:"relative",zIndex:2,textAlign:"center"}}>
        <Rev>
          <SectionTitle style={{color:"#fff",marginBottom:"1.1rem",fontSize:"clamp(2rem,4.5vw,3.2rem)"}}>
            Ready to stop losing leads<br/>to <em style={{fontStyle:"italic",color:C.blueLt}}>silence?</em>
          </SectionTitle>
          <p style={{fontFamily:FF.body,fontSize:"1.05rem",color:"rgba(255,255,255,.48)",lineHeight:1.7,marginBottom:"2.5rem"}}>Book a free 30-minute call. We'll tell you honestly what would fix your marketing — with a price before you leave the call.</p>
          <div style={{display:"flex",gap:".875rem",justifyContent:"center",flexWrap:"wrap",marginBottom:"1.25rem"}}>
            <Btn onClick={()=>setPage("contact")} style={{padding:"1.05rem 2.1rem",fontSize:".95rem"}}>Book a free call</Btn>
            <Btn variant="ghost" onClick={()=>setPage("packages")} style={{padding:"1.05rem 2.1rem",fontSize:".95rem"}}>See packages</Btn>
          </div>
          <p style={{fontFamily:FF.body,fontSize:".78rem",color:"rgba(255,255,255,.22)"}}>No commitment. No hard sell. Just a straight conversation.</p>
        </Rev>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────── */
function Footer({setPage}){
  const links=[["packages","Packages"],["how-it-works","How It Works"],["about","About"],["faq","FAQ"],["contact","Contact"]];
  return (
    <footer style={{background:C.slate,padding:"2.5rem 0",borderTop:"1px solid rgba(255,255,255,.05)"}}>
      <div style={{maxWidth:1120,margin:"0 auto",padding:"0 clamp(1.25rem,4vw,2.5rem)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem"}}>
        <button onClick={()=>setPage("home")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:FF.head,fontSize:"1rem",color:"rgba(255,255,255,.6)"}}>
          Martech <em style={{fontStyle:"italic",color:C.blueLt}}>Consulting</em>
        </button>
        <div style={{display:"flex",gap:"1.5rem",flexWrap:"wrap"}}>
          {links.map(([id,label])=>(
            <button key={id} onClick={()=>setPage(id)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:FF.body,fontSize:".8rem",color:"rgba(255,255,255,.32)",transition:"color .15s"}}
              onMouseEnter={e=>e.target.style.color="rgba(255,255,255,.65)"}
              onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.32)"}>{label}</button>
          ))}
        </div>
        <div style={{fontFamily:FF.body,fontSize:".72rem",color:"rgba(255,255,255,.2)"}}>© 2026 Martech Consulting · Dover, NH</div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════════════════ */
export default function App(){
  const [page,setPage]=useState("home");
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>50);
    window.addEventListener("scroll",h,{passive:true});
    return ()=>window.removeEventListener("scroll",h);
  },[]);
  useEffect(()=>{ window.scrollTo({top:0,behavior:"smooth"}); },[page]);

  const pages={
    home:<Home setPage={setPage}/>,
    packages:<PackagesPage setPage={setPage}/>,
    "how-it-works":<HowItWorksPage setPage={setPage}/>,
    about:<AboutPage setPage={setPage}/>,
    faq:<FAQPage setPage={setPage}/>,
    contact:<ContactPage/>,
  };

  return <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      html{scroll-behavior:smooth;}
      body{-webkit-font-smoothing:antialiased;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
    `}</style>
    <Nav page={page} setPage={setPage} scrolled={scrolled}/>
    <main>{pages[page]||pages.home}</main>
    <CTABand setPage={setPage}/>
    <Footer setPage={setPage}/>
  </>;
}
