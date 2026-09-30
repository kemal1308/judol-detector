import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="bg-neutral text-secondary font-sans antialiased h-screen flex overflow-hidden selection:bg-primary selection:text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {children}
      </main>
      
      {/* Toast Notification Container can go here if managed globally, but we'll add it in App or per page if needed */}
      <div id="toast-container" className="fixed top-5 right-5 z-50 flex flex-col items-end pointer-events-none"></div>
    </div>
  );
}
