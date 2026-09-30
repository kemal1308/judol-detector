import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

export default function DashboardPage() {
  const [videos, setVideos] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVideoId, setNewVideoId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  
  const userId = localStorage.getItem('judol_user_id') || 'temp_user_id'; // Fallback for dev

  const fetchData = async () => {
    try {
      const [vidRes, logRes] = await Promise.all([
        fetch(`${API_BASE}/videos/${userId}`),
        fetch(`${API_BASE}/logs/${userId}`)
      ]);
      if (vidRes.ok) setVideos(await vidRes.json());
      if (logRes.ok) setLogs(await logRes.json());
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    let finalVidId = newVideoId;
    if(newVideoId.includes('v=')) {
        finalVidId = newVideoId.split('v=')[1].split('&')[0];
    } else if (newVideoId.includes('youtu.be/')) {
        finalVidId = newVideoId.split('youtu.be/')[1].split('?')[0];
    }

    try {
        await fetch(`${API_BASE}/videos`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: userId,
                video_id: finalVidId,
                title: newTitle
            })
        });
        setShowAddModal(false);
        setNewVideoId('');
        setNewTitle('');
        fetchData();
    } catch(e) {
        alert("Failed to add target.");
    }
  };

  const toggleVideo = async (id) => {
    try {
      await fetch(`${API_BASE}/videos/${id}/toggle`, { method: 'PATCH' });
      fetchVideos();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteVideo = async (id) => {
    if(!window.confirm('Are you sure you want to remove this video?')) return;
    try {
      await fetch(`${API_BASE}/videos/${id}`, { method: 'DELETE' });
      fetchVideos();
    } catch (e) {
      console.error(e);
    }
  };

  const scanNow = async () => {
    setIsScanning(true);
    try {
        await fetch(`${API_BASE}/scan`);
        fetchData();
    } catch(e) {
        alert("Gagal melakukan pemindaian manual.");
    } finally {
        setIsScanning(false);
    }
  };

  const activeCount = videos.filter(v => v.is_active).length;
  const spamDetected = logs.length;
  const commentsBlocked = logs.filter(l => l.action === 'hapus').length;

  return (
    <div className="p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
      <div className="flex justify-between items-end mb-10 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Dashboard Overview</h1>
          <p className="text-gray-500">Real-time monitoring and analytics for video content.</p>
        </div>
        <div className="flex space-x-4 items-center">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Search videos..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow w-64" />
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center shadow-lg hover:bg-[#660000] transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Stream
          </button>
          <button onClick={scanNow} disabled={isScanning} className="bg-white text-primary border border-gray-200 px-5 py-2.5 rounded-full text-sm font-semibold flex items-center shadow-sm hover:bg-gray-50 transition-colors ml-2 disabled:opacity-75">
            {isScanning ? (
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            ) : null}
            {isScanning ? 'Memindai...' : 'Pindai Sekarang'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Active Streams</div>
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-4xl font-bold text-secondary">{activeCount}</div>
            <div className="text-xs text-primary font-medium">↑ Active</div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Spam Detected</div>
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-4xl font-bold text-secondary">{spamDetected}</div>
            <div className="text-xs text-gray-500 font-medium">All Time</div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Comments Blocked</div>
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-4xl font-bold text-secondary">{commentsBlocked}</div>
            <div className="text-xs text-gray-500 font-medium">All Time</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl flex-1 flex flex-col min-h-0 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-secondary">Monitored Videos</h2>
          <a href="#" className="text-primary text-sm font-semibold hover:underline">View All →</a>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#faf9f8] text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-100 sticky top-0 z-10">
                <th className="px-6 py-4 font-bold w-1/4">VIDEO STREAM</th>
                <th className="px-6 py-4 font-bold">PLATFORM</th>
                <th className="px-6 py-4 font-bold">STATUS</th>
                <th className="px-6 py-4 font-bold">DETECTIONS</th>
                <th className="px-6 py-4 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">No videos monitored.</td>
                </tr>
              ) : (
                videos.map(v => {
                  const vidLogsCount = logs.filter(l => l.video_id === String(v.id)).length;
                  return (
                  <tr key={v.id}>
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <img src={`https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg`} alt="thumbnail" className={`w-16 h-10 object-cover rounded ${v.is_active ? 'opacity-100' : 'opacity-50'}`} />
                      <div>
                        <p className="text-sm font-bold text-secondary line-clamp-1">{v.title || v.video_id}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">ID: {v.video_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-50 border border-gray-200 text-xs text-gray-500 font-semibold"><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>YouTube</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <button onClick={() => toggleVideo(v.id)} className={`w-9 h-5 rounded-full ${v.is_active ? 'bg-primary' : 'bg-gray-300'} flex items-center transition-colors p-0.5 shadow-inner`} title="Toggle Active">
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${v.is_active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                        {v.is_active ? (
                          <span className="px-2 py-0.5 rounded-full border border-primary text-primary text-[10px] ml-2 font-bold bg-red-50">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full border border-gray-300 text-gray-400 text-[10px] ml-2 font-bold bg-gray-50">Inactive</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {v.is_active ? (
                        <span className="flex items-center text-primary font-medium text-xs"><svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"/></svg> {vidLogsCount} flagged</span>
                      ) : (
                        <span className="flex items-center text-gray-400 font-medium text-xs"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> {vidLogsCount} flagged</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteVideo(v.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </button>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 bg-[#faf9f8] rounded-b-2xl shrink-0">
          <span>Showing {videos.length} of {videos.length} active monitors</span>
        </div>
      </div>

      {/* Modal Tambah Video */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white p-8 w-full max-w-md relative z-10 rounded-2xl shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-bold text-secondary mb-2">Tambah Video</h3>
            <p className="text-sm text-gray-500 mb-8">Masukkan Video ID dari URL YouTube.</p>
            <form onSubmit={handleAddVideo}>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Video ID</label>
                  <input type="text" required value={newVideoId} onChange={(e) => setNewVideoId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-secondary focus:border-primary focus:bg-white focus:outline-none transition-all shadow-sm" placeholder="e.g. dQw4w9WgXcQ" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Title (Optional)</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-secondary focus:border-primary focus:bg-white focus:outline-none transition-all shadow-sm" placeholder="My Stream" />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-secondary hover:bg-gray-100 rounded-full transition-colors">Batal</button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold shadow-md hover:bg-[#660000] transition-colors">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
