import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

export default function SettingsPage() {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  
  const userId = localStorage.getItem('judol_user_id') || 'temp_user_id';

  const fetchKeywords = async () => {
    try {
      const res = await fetch(`${API_BASE}/keywords/${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      setKeywords(data);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if(!newKeyword.trim()) return;

    try {
        await fetch(`${API_BASE}/keywords/${userId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ keyword: newKeyword.trim() })
        });
        setNewKeyword('');
        fetchKeywords();
    } catch(e) {
        alert("Gagal menambahkan kata kunci.");
    }
  };

  const deleteKeyword = async (id) => {
    if(!window.confirm('Yakin ingin menghapus kata kunci ini?')) return;
    try {
        await fetch(`${API_BASE}/keywords/${id}`, { method: 'DELETE' });
        fetchKeywords();
    } catch(e) {
        alert("Gagal menghapus kata kunci.");
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-secondary mb-2">Settings</h1>
        <p className="text-gray-500">Configure moderation rules, detection sensitivity, and account preferences.</p>
      </div>

      <div className="space-y-8">
        
        {/* General Configuration */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-secondary mb-1">General Preferences</h2>
          <p className="text-sm text-gray-500 mb-6">Set up how CommentBlocker interacts with your channel.</p>
          
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-secondary mb-1">Automated Deletion</h3>
                <p className="text-xs text-gray-500">Automatically remove high-confidence spam.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-secondary mb-1">Email Notifications</h3>
                <p className="text-xs text-gray-500">Get daily summary reports.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Scan Interval (Minutes)</label>
              <input type="number" defaultValue="5" min="1" max="60" className="w-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-secondary focus:border-primary focus:bg-white focus:outline-none transition-all shadow-sm" />
            </div>
          </div>
        </div>

        {/* Custom Keywords */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-secondary mb-1">Custom Blacklist</h2>
          <p className="text-sm text-gray-500 mb-6">Add specific words or phrases that should always be flagged as spam.</p>
          
          <form onSubmit={handleAddKeyword} className="flex items-end space-x-3 max-w-xl mb-6">
            <div className="flex-1">
              <input type="text" required value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="e.g. slot gacor hari ini" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-secondary focus:border-primary focus:bg-white focus:outline-none transition-all shadow-sm" />
            </div>
            <button type="submit" className="bg-primary text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-[#660000] transition-colors">
              Add Keyword
            </button>
          </form>
          
          <div className="flex flex-wrap gap-3">
            {keywords.length === 0 ? (
                <div className="text-sm text-gray-500">Belum ada kata kunci custom.</div>
            ) : (
                keywords.map(kw => (
                    <div key={kw.id} className="flex items-center space-x-2 bg-red-50 text-primary border border-red-100 px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-sm font-semibold">{kw.keyword}</span>
                        <button onClick={() => deleteKeyword(kw.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                ))
            )}
          </div>
        </div>
        
        {/* Danger Zone */}
        <div className="bg-white border border-red-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-red-600 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-6">Irreversible account actions.</p>
          
          <button className="bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-red-100 transition-colors">
            Delete Account & Data
          </button>
        </div>
      </div>
    </div>
  );
}
