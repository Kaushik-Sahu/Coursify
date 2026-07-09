import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * The Home page component.
 * Displays a premium, responsive full-width split hero section with interactive call-to-actions,
 * statistics counters, and a sleek dashboard mockup showcasing the platform.
 */
export function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem('type');
    if (userType === 'superadmin' || userType === 'SuperAdmin') {
      navigate('/superadmin/manage/courses', { replace: true });
    } else if (userType === 'Admin') {
      navigate('/admin/your-courses', { replace: true });
    } else if (userType === 'User') {
      navigate('/purchased', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="animate-fade-in relative min-h-[calc(100vh-4rem)] w-full flex flex-col justify-center bg-slate-900 text-white overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 -z-10 bg-slate-950"></div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"></div>
      
      {/* Glowing Ambient Blobs */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-pulse pointer-events-none animation-delay-2000"></div>

      <main className="relative z-10 px-6 lg:px-16 max-w-7xl mx-auto w-full py-12 md:py-20 flex-grow flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Column: Breathtaking Intro & CTA */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-8 animate-fade-in">
            <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-sm font-semibold text-indigo-300 shadow-sm inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
              🚀 Elevate Your Learning Journey
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white">
              Unlock Your Potential, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">
                One Course at a Time
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Coursify is your premier gateway to a world of expert-led knowledge. Join thousands of students mastering technology, design, and business with our modern platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link
                to="/courses"
                className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-center text-lg font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 hover:scale-105 hover:shadow-indigo-500/50 transition-all duration-300 active:scale-95 cursor-pointer"
              >
                Explore Courses
              </Link>
              <Link 
                to="/courses" 
                className="rounded-full bg-white/5 border border-white/10 px-8 py-4 text-center text-lg font-bold text-slate-200 hover:bg-white/10 hover:text-white hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer"
              >
                Learn more
              </Link>
            </div>
            
            {/* Trust Badges / Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 w-full">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">12K+</div>
                <div className="text-xs sm:text-sm text-slate-400">Active Students</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">50+</div>
                <div className="text-xs sm:text-sm text-slate-400">Premium Courses</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">4.9★</div>
                <div className="text-xs sm:text-sm text-slate-400">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Mockup Showcase */}
          <div className="lg:col-span-6 relative w-full flex justify-center items-center">
            {/* Glow backing */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 rounded-[2.5rem] filter blur-2xl opacity-80 -z-10 animate-pulse"></div>
            
            {/* Dashboard Mockup wrapper */}
            <div className="relative glassmorphism bg-white/5 border border-white/10 p-3 sm:p-4 rounded-[2.5rem] shadow-2xl hover:scale-[1.02] transition-transform duration-500 w-full max-w-[540px]">
              <img 
                src="/hero_dashboard.png" 
                alt="Coursify Premium Dashboard Interface" 
                className="rounded-[2rem] w-full h-auto object-cover border border-white/20"
              />
              
              {/* Floating Badge 1 */}
              <div className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 hidden sm:flex items-center gap-3 shadow-xl animate-bounce pointer-events-none" style={{ animationDuration: '4s' }}>
                <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-xl text-xl">🏆</div>
                <div>
                  <div className="text-xs text-slate-400">Expert Instruction</div>
                  <div className="text-sm font-extrabold text-white">Verified Creators</div>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute -top-6 -right-6 bg-indigo-600 border border-white/20 rounded-2xl p-4 hidden sm:flex items-center gap-3 shadow-xl animate-bounce pointer-events-none" style={{ animationDuration: '6s' }}>
                <div className="bg-white/20 text-white p-2 rounded-xl text-xl font-bold">⚡</div>
                <div>
                  <div className="text-xs text-indigo-100 font-medium">New Feature</div>
                  <div className="text-sm font-black text-white">Interactive Quizzes</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Home;
