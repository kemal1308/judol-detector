export default function LandingPage() {
  return (
    <div className="bg-neutral text-secondary font-sans antialiased flex flex-col min-h-screen selection:bg-primary selection:text-white">
      {/* Gradient Background Section */}
      <div className="absolute top-0 w-full h-[70vh] bg-gradient-to-br from-[#f8d0c8] via-[#fae6e0] to-[#F9F6F2] -z-10"></div>
      
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2 text-primary">
          <span className="font-bold text-2xl tracking-tight">CommentBlocker</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-primary transition-colors">Features</a>
          <a href="#" className="hover:text-primary transition-colors">Pricing</a>
          <a href="#" className="hover:text-primary transition-colors">About</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 mt-8 relative">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-12">
          
          <div className="w-full md:w-1/2 flex flex-col items-start text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm mb-6 border border-white/40 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs font-medium text-gray-600">Intelligent YouTube Moderation</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-secondary leading-tight mb-6 tracking-tight">
              Blokir Otomatis Spam Judol dan Hate Comment di Channel YouTube Anda 24 Jam Nonstop
            </h1>
            
            <p className="text-gray-600 text-lg mb-10 max-w-lg leading-relaxed">
              Sistem moderasi berbasis AI yang menjaga kolom komentar Anda tetap bersih dan kredibel tanpa perlu repot. Fokus pada konten, biarkan kami yang mengurus sisanya.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <a href="http://localhost:8000/auth/youtube" className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-red-900/20 hover:bg-[#660000] hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center group">
                <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
                Mulai Gratis (Login with YouTube)
              </a>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex justify-center md:justify-end relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent blur-3xl -z-10 rounded-full w-3/4 h-3/4 self-center"></div>
            
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white max-w-md w-full relative z-10 transform hover:-translate-y-2 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center text-primary font-bold">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"/></svg>
                  Live Moderation
                </div>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-red-50/50 rounded-2xl border border-red-100 relative overflow-hidden group">
                  <img src="https://ui-avatars.com/api/?name=SpamBot&background=random" className="w-8 h-8 rounded-full shrink-0" alt="avatar" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700 mb-1">SpamBot99</div>
                    <div className="text-sm text-gray-600 line-through decoration-red-400/50">Check out my free crypto link!</div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="py-24 bg-neutral">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-secondary mb-4">Powerful Tools for Creators</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">Automate the tedious parts of community management so you can focus on creating great content.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Deteksi AI Akurat</h3>
              <p className="text-gray-500 leading-relaxed">Our sophisticated machine learning models analyze context, not just keywords, to minimize false positives and catch clever spam.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Moderasi Real-time</h3>
              <p className="text-gray-500 leading-relaxed">Comments are scanned and acted upon within milliseconds of being posted, keeping your comment section pristine 24/7.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Log & Transparansi</h3>
              <p className="text-gray-500 leading-relaxed">Full audit trails of all moderation actions. Review deleted comments, tweak AI sensitivity, and maintain total control over your channel.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="font-bold text-primary mb-4 md:mb-0">CommentBlocker</div>
          <div>&copy; 2026 CommentBlocker. All rights reserved.</div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
