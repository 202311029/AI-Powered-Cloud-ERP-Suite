'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui';

export default function TenantSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else router.push('/dashboard');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-bg text-text font-mono">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col h-[600px] animate-fade-in relative z-10 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0 bg-surface">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 hex-clip bg-accent text-black font-sans font-black flex items-center justify-center text-sm">A</div>
             <div>
               <div className="font-sans font-bold text-sm">Workspace Setup</div>
               <div className="text-[10px] text-text-muted">Step {step} of {totalSteps}</div>
             </div>
           </div>
           <div className="w-32">
             <ProgressBar value={(step / totalSteps) * 100} height={4} />
           </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {step === 1 && (
            <div className="animate-fade-in">
               <h3 className="text-xl font-bold font-sans text-white mb-2">Organization Details</h3>
               <p className="text-xs text-text-muted mb-6">Let's set up your primary tenant workspace.</p>

               <div className="flex flex-col gap-5">
                 <div>
                   <label className="block text-[10px] text-text-muted tracking-widest uppercase mb-1.5 font-bold">Workspace Name</label>
                   <input type="text" className="w-full bg-bg border border-border p-3 rounded-lg text-sm outline-none focus:border-accent" defaultValue="Acme Corp" />
                 </div>
                 <div>
                   <label className="block text-[10px] text-text-muted tracking-widest uppercase mb-1.5 font-bold">Tenant Slug (URL)</label>
                   <div className="flex bg-bg border border-border rounded-lg overflow-hidden focus-within:border-accent">
                     <span className="p-3 text-sm text-text-muted bg-surface-2 border-r border-border">amdox.app/</span>
                     <input type="text" className="flex-1 bg-transparent p-3 text-sm outline-none text-accent" defaultValue="acme-corp" />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] text-text-muted tracking-widest uppercase mb-1.5 font-bold">Industry</label>
                     <select className="w-full bg-bg border border-border p-3 rounded-lg text-sm outline-none focus:border-accent">
                       <option>Technology / SaaS</option>
                       <option>Manufacturing</option>
                       <option>Retail</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-[10px] text-text-muted tracking-widest uppercase mb-1.5 font-bold">Base Currency</label>
                     <select className="w-full bg-bg border border-border p-3 rounded-lg text-sm outline-none focus:border-accent">
                       <option>USD ($)</option>
                       <option>EUR (€)</option>
                       <option>GBP (£)</option>
                     </select>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
               <h3 className="text-xl font-bold font-sans text-white mb-2">Module Selection</h3>
               <p className="text-xs text-text-muted mb-6">Provision the core ERP modules you need. You can change this later.</p>
               
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'fin', name: 'Finance & GL', desc: 'Core accounting, AP/AR, assets', icon: '📒', req: true },
                    { id: 'hr', name: 'HR & Payroll', desc: 'Employee data, tax engine', icon: '👥', req: false },
                    { id: 'sc', name: 'Supply Chain', desc: 'POs, inventory, vendors', icon: '🔗', req: false },
                    { id: 'pm', name: 'Project Mgmt', desc: 'Gantt, budgets, allocation', icon: '📐', req: false },
                    { id: 'ai', name: 'AI Forecasting', desc: 'Demand & anomaly detection', icon: '🧠', req: false },
                    { id: 'bi', name: 'BI Analytics', desc: 'Executive dash & reports', icon: '📊', req: false },
                  ].map(m => (
                    <label key={m.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${m.req ? 'border-accent bg-accent/5' : 'border-border bg-bg hover:border-accent/50'}`}>
                      <input type="checkbox" className="mt-1 accent-accent" defaultChecked={m.req || m.id === 'ai' || m.id === 'sc'} disabled={m.req} />
                      <div>
                        <div className="text-sm font-bold flex items-center gap-2">{m.icon} {m.name} {m.req && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-text-muted">Required</span>}</div>
                        <div className="text-xs text-text-muted mt-1 leading-snug">{m.desc}</div>
                      </div>
                    </label>
                  ))}
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
               <h3 className="text-xl font-bold font-sans text-white mb-2">Security & Access</h3>
               <p className="text-xs text-text-muted mb-6">Configure identity provider and authentication policies.</p>

               <div className="flex flex-col gap-6">
                 <div>
                   <label className="block text-[10px] text-text-muted tracking-widest uppercase mb-3 font-bold">Identity Provider</label>
                   <div className="flex gap-4">
                     <label className="flex-1 border border-accent bg-accent/10 p-4 rounded-lg flex flex-col items-center gap-2 cursor-pointer">
                       <input type="radio" name="idp" className="hidden" defaultChecked />
                       <div className="text-2xl text-blue-500 font-sans font-black">M</div>
                       <div className="text-sm font-bold">Azure AD</div>
                     </label>
                     <label className="flex-1 border border-border bg-bg hover:border-accent/50 p-4 rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-colors">
                       <input type="radio" name="idp" className="hidden" />
                       <div className="text-2xl text-orange-500 font-sans font-black">O</div>
                       <div className="text-sm font-bold">Okta</div>
                     </label>
                     <label className="flex-1 border border-border bg-bg hover:border-accent/50 p-4 rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-colors">
                       <input type="radio" name="idp" className="hidden" />
                       <div className="text-2xl text-white font-sans font-black">A</div>
                       <div className="text-sm font-bold">Amdox Native</div>
                     </label>
                   </div>
                 </div>

                 <div className="bg-bg border border-border p-5 rounded-lg flex items-center justify-between">
                   <div>
                     <div className="text-sm font-bold mb-1">Enforce Global MFA</div>
                     <div className="text-xs text-text-muted max-w-sm">Require Two-Factor Authentication for all tenant users unconditionally.</div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" className="sr-only peer" defaultChecked />
                     <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent border border-border"></div>
                   </label>
                 </div>
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in flex flex-col items-center justify-center h-full text-center">
               <div className="w-16 h-16 bg-accent/20 text-accent text-3xl flex items-center justify-center rounded-2xl mb-4 border border-accent/40 shadow-[0_0_30px_var(--accent-glow)]">✓</div>
               <h3 className="text-2xl font-black font-sans text-white mb-2">Ready to Launch</h3>
               <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
                 Your enterprise workspace <strong className="text-accent font-mono select-all">acme-corp</strong> is fully configured and ready for initialization.
               </p>

               <div className="bg-bg border border-border p-4 rounded-lg text-left w-full max-w-sm flex flex-col gap-2 mb-6">
                 <div className="flex justify-between text-xs"><span className="text-text-muted">Modules</span><span className="font-bold">4 selected</span></div>
                 <div className="flex justify-between text-xs"><span className="text-text-muted">Auth</span><span className="font-bold">Azure AD + MFA</span></div>
                 <div className="flex justify-between text-xs"><span className="text-text-muted">Data Region</span><span className="font-bold">US-East (Virginia)</span></div>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between bg-surface-2 flex-shrink-0">
          <button 
            type="button" 
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            className="text-xs text-text-muted hover:text-white transition-colors"
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            ← Back
          </button>
          
          <button 
            type="button" 
            onClick={handleNext}
            className="bg-accent text-black font-sans font-bold text-sm px-8 py-2.5 rounded-lg hover:shadow-[0_0_16px_var(--accent-glow)] transition-all"
          >
            {step === totalSteps ? 'Launch Workspace' : 'Continue'}
          </button>
        </div>

      </div>
    </div>
  );
}
