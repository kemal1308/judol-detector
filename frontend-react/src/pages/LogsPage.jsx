import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

function createKeywordRegex(keyword) {
    let kw = keyword.normalize('NFKC').toLowerCase();
    kw = kw.replace(/[^a-z0-9]/g, '');
    if (!kw) return new RegExp('^$');
    
    const leetMap = {
        'a': '[a4@]',
        'b': '[b8]',
        'e': '[e3]',
        'g': '[g9]',
        'i': '[i1!l]',
        'l': '[l1!i]',
        'o': '[o0]',
        's': '[s5$]',
        't': '[t7]'
    };
    
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    let parts = [];
    for (let i = 0; i < kw.length; i++) {
        let char = kw[i];
        parts.push(leetMap[char] || escapeRegExp(char));
    }
    
    let regexStr = parts.join('[\\W_]*');
    return new RegExp(regexStr, 'i');
}

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [videoFilter, setVideoFilter] = useState('all'); // Added video filter
  
  const userId = localStorage.getItem('judol_user_id') || 'temp_user_id';

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs/${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Extract unique videos for the dropdown
  const uniqueVideos = Array.from(new Map(logs.map(log => [log.video_id, log.video_title])).entries());

  const getFilteredLogs = () => {
    let filtered = logs;

    if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const searchRegex = createKeywordRegex(term);
        filtered = filtered.filter(log => {
            const titleMatch = log.video_title && log.video_title.toLowerCase().includes(term);
            const authorMatch = log.author && log.author.toLowerCase().includes(term);
            const normalizedComment = log.comment_text ? log.comment_text.normalize('NFKC') : '';
            const commentMatch = searchRegex.test(normalizedComment) || normalizedComment.toLowerCase().includes(term);
            return titleMatch || authorMatch || commentMatch;
        });
    }
    
    if (videoFilter !== 'all') {
        filtered = filtered.filter(log => log.video_id === videoFilter);
    }

    if (timeFilter !== 'all') {
        const days = parseInt(timeFilter);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        filtered = filtered.filter(log => {
            const logDate = new Date(log.deleted_at);
            return logDate >= cutoff;
        });
    }
    
    // Status filter mock implementation
    if (statusFilter === 'deleted') {
      filtered = filtered.filter(log => log.action === 'hapus');
    } else if (statusFilter === 'safe') {
      filtered = filtered.filter(log => log.action !== 'hapus');
    }

    filtered.sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at));
    return filtered;
  };

  const filteredLogs = getFilteredLogs();
  
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const videoKey = log.video_title || log.video_id;
    if (!acc[videoKey]) acc[videoKey] = [];
    acc[videoKey].push(log);
    return acc;
  }, {});

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    const headers = ["Timestamp", "Video Context", "Comment Text", "Author", "Confidence", "Status"];
    
    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const csvRows = filteredLogs.map(log => {
      const dateStr = log.deleted_at ? log.deleted_at.replace('T', ' ').substring(0, 16) : '';
      const status = log.action === 'hapus' ? 'Deleted' : 'Review';
      return [
        escapeCSV(dateStr),
        escapeCSV(log.video_title),
        escapeCSV(log.comment_text),
        escapeCSV('@' + log.author),
        escapeCSV(Math.round(log.confidence || 0) + '%'),
        escapeCSV(status)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `comment_logs_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Detected Spam Logs</h1>
          <p className="text-gray-500">Review and manage comments flagged by the high-confidence detection engine.</p>
        </div>
        <div className="flex space-x-3 items-center">
          <button onClick={handleExportCSV} className="bg-white text-secondary border border-gray-200 px-5 py-2.5 rounded-full text-sm font-semibold flex items-center shadow-sm hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 shadow-sm shrink-0 items-center justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search comments or authors..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors" />
        </div>
        <div className="flex flex-wrap space-x-3 gap-y-2">
          <select value={videoFilter} onChange={(e) => setVideoFilter(e.target.value)} className="bg-white border border-gray-200 text-secondary text-sm rounded-full focus:outline-none focus:border-primary block p-2 px-4 shadow-sm max-w-[200px] truncate">
            <option value="all">All Videos</option>
            {uniqueVideos.map(([id, title]) => (
                <option key={id} value={id}>{title}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-gray-200 text-secondary text-sm rounded-full focus:outline-none focus:border-primary block p-2 px-4 shadow-sm">
            <option value="all">Status: All</option>
            <option value="deleted">Deleted</option>
            <option value="safe">Safe</option>
          </select>
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="bg-white border border-gray-200 text-secondary text-sm rounded-full focus:outline-none focus:border-primary block p-2 px-4 shadow-sm">
            <option value="1">Last 24 Hours</option>
            <option value="7">Last 7 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Grouped Tables */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-6 pb-6 pr-2">
        {Object.keys(groupedLogs).length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-500 text-sm font-medium">No comments found matching criteria.</p>
          </div>
        ) : (
          Object.entries(groupedLogs).map(([videoTitle, videoLogs]) => (
            <div key={videoTitle} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden shrink-0">
              <div className="bg-[#faf9f8] px-6 py-4 border-b border-gray-100 flex items-center">
                 <div className="w-8 h-8 rounded-lg mr-3 bg-red-50 text-primary flex items-center justify-center border border-red-100 shadow-sm shrink-0">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                 </div>
                 <h2 className="text-sm font-bold text-secondary">{videoTitle}</h2>
                 <span className="ml-auto bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">{videoLogs.length} comments</span>
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                      <th className="px-6 py-3 w-40">TIMESTAMP</th>
                      <th className="px-6 py-3">COMMENT TEXT</th>
                      <th className="px-6 py-3 w-32">AUTHOR</th>
                      <th className="px-6 py-3 w-28 text-center">CONFIDENCE</th>
                      <th className="px-6 py-3 w-28 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {videoLogs.map(log => {
                      const isHapus = log.action === 'hapus';
                      const dateStr = log.deleted_at ? log.deleted_at.replace('T', ' ').substring(0, 16) : '';
                      return (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">{dateStr}</td>
                          <td className="px-6 py-4">
                            <div className="text-secondary text-sm">{log.comment_text}</div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-500">@{log.author}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center justify-center w-12 h-6 ${isHapus ? 'bg-primary' : 'bg-tertiary'} rounded-full text-xs font-bold text-white shadow-sm`}>
                              {Math.round(log.confidence || 0)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isHapus ? (
                              <span className="inline-flex items-center px-2.5 py-1 bg-red-50 border border-red-100 text-gray-500 font-medium text-[10px] rounded hover:bg-red-100 transition-colors cursor-pointer" title={log.alasan || ''}>
                                <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> 
                                Deleted
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 bg-green-50 border border-green-100 text-gray-500 font-medium text-[10px] rounded hover:bg-green-100 transition-colors cursor-pointer" title={log.alasan || ''}>
                                Review
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
