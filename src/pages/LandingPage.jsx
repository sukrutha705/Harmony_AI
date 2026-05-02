import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ShieldCheck, MessageSquare, MapPin, UserCheck, Clock, Activity, FileText, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp, Building2, School, Briefcase, Landmark, Home, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const { currentUser } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-brand-light dark:bg-brand-dark transition-colors font-sans text-slate-800 dark:text-slate-200">
      <header className="h-20 px-6 flex items-center justify-between bg-brand-light/90 dark:bg-brand-darker/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-brand-dark dark:bg-brand-accent flex items-center justify-center shadow-md">
            <span className="text-brand-accent dark:text-brand-dark font-bold text-xl">H</span>
          </div>
          <span className="text-2xl font-bold text-brand-dark dark:text-white tracking-tight">Harmony AI</span>
        </div>
        <nav className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex text-brand-dark dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10">
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="gradient" asChild className="shadow-lg hover:shadow-xl transition-shadow">
            <Link to="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 lg:py-16 overflow-hidden min-h-[calc(100vh-80px)]">
        <div className="absolute inset-0 z-0">
          <img src="/bengaluru_community_bg.png" alt="Bengaluru Community" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-light/30 to-brand-light dark:via-brand-dark/50 dark:to-brand-dark"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto bg-white/50 dark:bg-brand-darker/70 backdrop-blur-lg p-8 sm:p-10 md:p-12 rounded-[3rem] border border-white/60 dark:border-white/10 shadow-2xl mt-[-2rem] md:mt-[-4rem]">
          <Badge className="mb-6 animate-fade-in-up bg-brand-dark text-white border-transparent dark:bg-brand-accent dark:text-brand-dark shadow-sm px-5 py-2 text-sm font-semibold tracking-wide">Introducing Harmony AI 1.0</Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 animate-fade-in-up text-brand-dark dark:text-white leading-[1.1]" style={{ animationDelay: '100ms' }}>
            Every Concern Matters.<br/>
            <span className="text-brand-dark dark:text-brand-accent underline decoration-brand-accent/50 decoration-8 underline-offset-4">Every Voice Counts.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-800 dark:text-slate-200 max-w-3xl mb-8 animate-fade-in-up font-semibold leading-relaxed" style={{ animationDelay: '200ms' }}>
            Harmony AI helps citizens safely report conflicts, threats, harassment, and unsafe incidents while enabling faster, transparent resolutions that build safer communities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5 animate-fade-in-up w-full sm:w-auto" style={{ animationDelay: '300ms' }}>
            <Button variant="gradient" size="lg" className="text-lg h-14 px-8 shadow-xl shadow-brand-accent/20 rounded-full" asChild>
              <Link to="/signup">Report an Incident</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg h-14 px-8 bg-white/80 dark:bg-white/10 text-brand-dark dark:text-white border-slate-300 dark:border-white/20 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-white/20 transition-colors" asChild>
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 1: What is Harmony AI */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark dark:text-white mb-6">A Smarter Way to Resolve Community Conflicts</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Harmony AI transforms the way communities handle conflicts, harassment, and safety threats. From domestic disputes to public disorder, the platform empowers citizens to report incidents confidently while helping authorities respond faster and more transparently.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">No more ignored reports.</h3>
              <p className="text-slate-600 dark:text-slate-400">Every incident is logged, tracked, and prioritized so no threat falls through the cracks.</p>
            </div>
            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">No more unclear updates.</h3>
              <p className="text-slate-600 dark:text-slate-400">Real-time status tracking keeps you informed at every step of the resolution process.</p>
            </div>
            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">No more one-sided closures.</h3>
              <p className="text-slate-600 dark:text-slate-400">Incidents are only marked resolved when you confirm the solution works and safety is restored.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50 dark:bg-brand-darker/50 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-brand-dark/5 text-brand-dark border-brand-dark/10 dark:bg-brand-accent/10 dark:text-brand-accent dark:border-brand-accent/20">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark dark:text-white">Simple for Citizens. Powerful for Authorities.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-slate-200 via-brand-accent to-slate-200 dark:from-white/10 dark:via-brand-accent/50 dark:to-white/10 -z-10"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 bg-white dark:bg-brand-dark border-4 border-slate-50 dark:border-brand-darker shadow-xl rounded-full flex items-center justify-center mb-6 text-brand-dark dark:text-brand-accent">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-4">Report an Incident Safely</h3>
              <p className="text-slate-600 dark:text-slate-400">Submit safety reports through text, voice, or evidence upload. Add photos, live location, or choose anonymous reporting to protect your identity from retaliation.</p>
            </div>
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 bg-brand-dark dark:bg-brand-accent border-4 border-slate-50 dark:border-brand-darker shadow-xl shadow-brand-dark/20 dark:shadow-brand-accent/20 rounded-full flex items-center justify-center mb-6 text-white dark:text-brand-dark">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-4">Smart Review & Action</h3>
              <p className="text-slate-600 dark:text-slate-400">Harmony AI prioritizes urgent threats using intelligent analysis and routes them directly to the right authorities for a quick response.</p>
            </div>
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 bg-white dark:bg-brand-dark border-4 border-slate-50 dark:border-brand-darker shadow-xl rounded-full flex items-center justify-center mb-6 text-brand-dark dark:text-brand-accent">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-4">Transparent Resolution</h3>
              <p className="text-slate-600 dark:text-slate-400">Track updates in real time. We ensure accountability—incidents are completely closed only after citizen confirmation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Key Features */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark dark:text-white">Built for Trust, Designed for Action</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Smart Incident Reporting', desc: 'Report threats effortlessly using voice, text, images, and live location tagging.' },
              { icon: ShieldCheck, title: 'Anonymous & Safe', desc: 'Protect your privacy and identity while still ensuring your voice is heard loud and clear without fear of retaliation.' },
              { icon: Activity, title: 'AI Priority Detection', desc: 'Violence risks and emergency escalations are identified faster using intelligent sentiment analysis.' },
              { icon: Clock, title: 'Real-Time Tracking', desc: 'See transparent updates from the moment of submission to final de-escalation.' },
              { icon: MapPin, title: 'Evidence-Based Resolution', desc: 'Upload proof and view responder actions transparently on a shared dashboard.' },
              { icon: CheckCircle2, title: 'Two-Way Confirmation', desc: 'True accountability: Incidents close only when both the authority and the citizen confirm it is resolved.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors group">
                <feature.icon className="w-8 h-8 text-brand-dark dark:text-brand-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Where It Can Be Used */}
      <section className="py-24 px-6 bg-brand-dark dark:bg-brand-darker text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Made for Every Community</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {[
              { icon: School, label: 'Colleges & Hostels' },
              { icon: Home, label: 'Apartments & Communities' },
              { icon: Briefcase, label: 'Workplaces' },
              { icon: Landmark, label: 'Public Institutions' },
              { icon: Building2, label: 'Smart Cities' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-full hover:bg-brand-accent hover:text-brand-dark hover:border-brand-accent transition-all cursor-default">
                <item.icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 & 6: Trust & Impact */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark dark:text-white mb-6">Because Accountability Matters</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Traditional reporting systems often fail due to poor communication and lack of transparency. Harmony AI rebuilds trust between citizens and peacebuilders.
            </p>
            <div className="space-y-4">
              {[
                'Clear status tracking at every step',
                'Verified evidence workflows',
                'Faster, AI-assisted responses',
                'Citizen confirmation before closure',
                'Transparent, two-way communication'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4 rounded-xl shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="font-medium text-brand-dark dark:text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 md:p-12 rounded-3xl">
            <h3 className="text-2xl font-bold text-brand-dark dark:text-white mb-8 text-center">Turning Conflict Into Resolution</h3>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: 'Safer', label: 'Communities', color: 'text-emerald-500' },
                { value: 'Faster', label: 'Action & Response', color: 'text-blue-500' },
                { value: 'Better', label: 'Transparency', color: 'text-amber-500' },
                { value: 'Stronger', label: 'Public Trust', color: 'text-brand-accent dark:text-brand-accent' }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-brand-dark border border-slate-100 dark:border-white/5 p-6 rounded-2xl text-center shadow-sm">
                  <div className={`text-2xl md:text-3xl font-extrabold mb-1 ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-brand-darker dark:to-brand-dark border-t border-slate-200 dark:border-white/5 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-dark dark:text-white mb-6">Ready to Build a Safer Community?</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
            Join a smarter, fairer way to resolve conflicts through trust and technology.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="gradient" size="lg" className="text-lg h-14 px-10 rounded-full" asChild>
              <Link to="/signup">Get Started <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg h-14 px-10 rounded-full bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-brand-dark dark:text-white hover:bg-slate-50 dark:hover:bg-white/10" asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 text-center text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-white/5">
        <p className="text-sm">© 2026 Harmony AI Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${className}`}>
      {children}
    </span>
  );
}
