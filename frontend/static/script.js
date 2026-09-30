const API_BASE = 'http://localhost:8000';
let userId = null;
let allLogs = [];

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const idFromURL = params.get('user_id');
    
    // Store user ID in localStorage to share across pages
    if (idFromURL) {
        localStorage.setItem('judol_user_id', idFromURL);
        userId = idFromURL;
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        userId = localStorage.getItem('judol_user_id');
    }

    // Halaman yang boleh diakses tanpa login
    const publicPaths = ['/', '/index', '/index.html'];
    const isPublicPage = publicPaths.some(p => window.location.pathname === p || window.location.pathname.endsWith(p));

    if (!userId && !isPublicPage) {
        window.location.href = '/';
        return;
    }
    
    if (userId) {
        // Request browser notification permission
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        fetchUserInfo();
        
        if(document.getElementById('video-list')) fetchVideos();
        if(document.getElementById('log-list')) fetchLogs();
        if(document.getElementById('keyword-list')) fetchKeywords();
        
        setInterval(() => {
            if(document.getElementById('video-list')) fetchVideos();
            if(document.getElementById('log-list')) fetchLogs();
        }, 10000);
    }
});

function logout() {
    localStorage.removeItem('judol_user_id');
    window.location.href = '/';
}

async function fetchUserInfo() {
    try {
        const res = await fetch(`${API_BASE}/auth/me?user_id=${userId}`);
        const data = await res.json();
        
        // For settings page
        const emailEl = document.getElementById('setting-email');
        if(emailEl) emailEl.value = data.email;
        const channelEl = document.getElementById('setting-channel');
        if(channelEl) channelEl.value = data.youtube_channel;
    } catch(e) {
        console.error("Failed to fetch user info:", e);
    }
}

async function fetchVideos() {
    try {
        const res = await fetch(`${API_BASE}/videos/${userId}`);
        const videos = await res.json();
        
        const countEl = document.getElementById('video-count');
        if(countEl) countEl.textContent = `Showing ${videos.length} of ${videos.length} active monitors`;
        
        const list = document.getElementById('video-list');
        list.innerHTML = '';
        
        if(videos.length === 0) {
            list.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500 font-medium">No videos monitored.</td></tr>';
            return;
        }
        
        videos.forEach(v => {
                        const isAc = v.is_active;
            const toggleColor = isAc ? 'bg-primary' : 'bg-gray-300';
            const toggleCircle = isAc ? 'translate-x-4' : 'translate-x-0';
            const statusBadge = isAc ? '<span class="px-2 py-0.5 rounded-full border border-primary text-primary text-[10px] ml-2 font-bold bg-red-50">Active</span>' : '<span class="px-2 py-0.5 rounded-full border border-gray-300 text-gray-400 text-[10px] ml-2 font-bold bg-gray-50">Inactive</span>';
            const stats = isAc ? '<span class="flex items-center text-primary font-medium text-xs"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"/></svg> 12 flagged</span>' : '<span class="flex items-center text-gray-400 font-medium text-xs"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 0 flagged</span>';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 flex items-center space-x-3">
                    <img src="https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg" alt="thumbnail" class="w-16 h-10 object-cover rounded opacity-${isAc ? '100' : '50'}">
                    <div>
                        <p class="text-sm font-bold text-secondary line-clamp-1">${v.title || v.video_id}</p>
                        <p class="text-xs text-gray-500 mt-0.5 font-medium">ID: ${v.video_id}</p>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2 py-1 rounded bg-gray-50 border border-gray-200 text-xs text-gray-500 font-semibold"><svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>YouTube</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <button onclick="toggleVideo('${v.id}')" class="w-9 h-5 rounded-full ${toggleColor} flex items-center transition-colors p-0.5 shadow-inner" title="Toggle Active">
                            <div class="bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${toggleCircle}"></div>
                        </button>
                        ${statusBadge}
                    </div>
                </td>
                <td class="px-6 py-4">
                    ${stats}
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="deleteVideo('${v.id}')" class="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <svg class="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                </td>
            `;
            list.appendChild(tr);
        });
    } catch(e) {
        console.error(e);
    }
}

async function addVideo(e) {
    e.preventDefault();
    const vidId = document.getElementById('input-video-id').value.trim();
    const title = document.getElementById('input-title').value.trim();
    
    let finalVidId = vidId;
    if(vidId.includes('v=')) {
        finalVidId = vidId.split('v=')[1].split('&')[0];
    } else if (vidId.includes('youtu.be/')) {
        finalVidId = vidId.split('youtu.be/')[1].split('?')[0];
    }

    try {
        await fetch(`${API_BASE}/videos`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: userId,
                video_id: finalVidId,
                title: title
            })
        });
        document.getElementById('add-modal').classList.add('hidden');
        document.getElementById('form-add-video').reset();
        fetchVideos();
    } catch(e) {
        alert("Failed to add target.");
    }
}

async function toggleVideo(id) {
    await fetch(`${API_BASE}/videos/${id}/toggle`, { method: 'PATCH' });
    fetchVideos();
}

async function deleteVideo(id) {
    if(!confirm('Are you sure you want to remove this video?')) return;
    await fetch(`${API_BASE}/videos/${id}`, { method: 'DELETE' });
    fetchVideos();
}

async function fetchLogs() {
    try {
        const res = await fetch(`${API_BASE}/logs/${userId}`);
        const newLogs = await res.json();
        
        // Detect new logs
        if (allLogs.length > 0 && newLogs.length > allLogs.length) {
            const existingIds = new Set(allLogs.map(l => l.id));
            const freshLogs = newLogs.filter(l => !existingIds.has(l.id));
            
            freshLogs.forEach(log => {
                showNotification(log);
            });
        }
        
        allLogs = newLogs;
        applyLogFilters();
    } catch(e) {
        console.error("Gagal mengambil log:", e);
    }
}

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

function applyLogFilters() {
    const searchInput = document.getElementById('log-search-input');
    const timeFilter = document.getElementById('log-time-filter');
    if (!searchInput || !timeFilter) return;

    const searchTerm = searchInput.value.toLowerCase().trim();
    const timeVal = timeFilter.value;

    let filteredLogs = allLogs;

    // Filter by search
    if (searchTerm) {
        const searchRegex = createKeywordRegex(searchTerm);
        filteredLogs = filteredLogs.filter(log => {
            const titleMatch = log.video_title && log.video_title.toLowerCase().includes(searchTerm);
            const authorMatch = log.author && log.author.toLowerCase().includes(searchTerm);
            
            const normalizedComment = log.comment_text ? log.comment_text.normalize('NFKC') : '';
            const commentMatch = searchRegex.test(normalizedComment) || normalizedComment.toLowerCase().includes(searchTerm);
            
            return titleMatch || authorMatch || commentMatch;
        });
    }

    // Filter by time
    if (timeVal !== 'all') {
        const days = parseInt(timeVal);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.deleted_at);
            return logDate >= cutoff;
        });
    }

    renderLogs(filteredLogs);
}

function renderLogs(logs) {
    const countEl = document.getElementById('log-count');
    if(countEl) countEl.textContent = `Showing ${logs.length} comments.`;
    
    const list = document.getElementById('log-list');
    if(!list) return;
    
    list.innerHTML = '';
    
    if(logs.length === 0) {
        list.innerHTML = '<tr><td colspan="6" class="px-6 py-10 text-center text-gray-500 text-sm font-medium">No comments found matching criteria.</td></tr>';
        return;
    }
    
    // Urutkan logs berdasarkan waktu terbaru di atas
    logs.sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at));
    
    logs.forEach(log => {
        const isHapus = log.action === 'hapus';
        
        // Waktu sudah dalam format lokal dari server
        const dateStr = log.deleted_at.replace('T', ' ').substring(0, 16);
        
        const tr = document.createElement('tr');
                if(isHapus) {
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">${dateStr}</td>
                <td class="px-6 py-4 text-xs font-semibold text-secondary truncate max-w-[150px] flex items-center"><img src="https://ui-avatars.com/api/?name=Video&background=random" class="w-6 h-6 rounded mr-2">${log.video_title}</td>
                <td class="px-6 py-4">
                    <div class="text-secondary text-sm">${log.comment_text}</div>
                </td>
                <td class="px-6 py-4 text-xs font-medium text-gray-500">@${log.author}</td>
                <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center justify-center w-12 h-6 bg-primary rounded-full text-xs font-bold text-white shadow-sm">${Math.round(log.confidence)}%</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-1 bg-red-50 border border-red-100 text-gray-500 font-medium text-[10px] rounded hover:bg-red-100 transition-colors cursor-pointer" title="${log.alasan || ''}">
                        <svg class="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> 
                        Deleted
                    </span>
                </td>
            `;
        } else {
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">${dateStr}</td>
                <td class="px-6 py-4 text-xs font-semibold text-secondary truncate max-w-[150px] flex items-center"><img src="https://ui-avatars.com/api/?name=Video&background=random" class="w-6 h-6 rounded mr-2">${log.video_title}</td>
                <td class="px-6 py-4">
                    <div class="text-secondary text-sm">${log.comment_text}</div>
                </td>
                <td class="px-6 py-4 text-xs font-medium text-gray-500">@${log.author}</td>
                <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center justify-center w-12 h-6 bg-tertiary rounded-full text-xs font-bold text-white shadow-sm">${Math.round(log.confidence)}%</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-1 bg-green-50 border border-green-100 text-gray-500 font-medium text-[10px] rounded hover:bg-green-100 transition-colors cursor-pointer" title="${log.alasan || ''}">
                        Review
                    </span>
                </td>
            `;

        }
        list.appendChild(tr);
    });
}

async function fetchKeywords() {
    try {
        const res = await fetch(`${API_BASE}/keywords/${userId}`);
        const keywords = await res.json();
        
        const list = document.getElementById('keyword-list');
        list.innerHTML = '';
        
        if(keywords.length === 0) {
            list.innerHTML = '<tr><td colspan="2" class="px-6 py-8 text-center text-slate-500 text-sm">Belum ada kata kunci custom.</td></tr>';
            return;
        }
        
        keywords.forEach(kw => {
            const tr = document.createElement('tr');
                        tr.innerHTML = `
                <td class="px-6 py-4 text-sm font-semibold text-secondary">
                    <span class="bg-red-50 text-primary border border-red-100 px-3 py-1.5 rounded-lg shadow-sm">${kw.keyword}</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="deleteKeyword('${kw.id}')" class="text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                        <svg class="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </td>
            `;
            list.appendChild(tr);
        });
    } catch(e) {
        console.error("Gagal mengambil keywords:", e);
    }
}

async function addKeyword(e) {
    e.preventDefault();
    const input = document.getElementById('input-keyword');
    const keyword = input.value.trim();
    if(!keyword) return;

    try {
        await fetch(`${API_BASE}/keywords/${userId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ keyword: keyword })
        });
        input.value = '';
        fetchKeywords();
    } catch(e) {
        alert("Gagal menambahkan kata kunci.");
    }
}

async function deleteKeyword(id) {
    if(!confirm('Yakin ingin menghapus kata kunci ini?')) return;
    try {
        await fetch(`${API_BASE}/keywords/${id}`, { method: 'DELETE' });
        fetchKeywords();
    } catch(e) {
        alert("Gagal menghapus kata kunci.");
    }
}

async function scanNow() {
    const btn = document.getElementById('btn-scan');
    if(!btn) return;
    
    const originalHtml = btn.innerHTML;
    btn.innerHTML = `<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Memindai...`;
    btn.disabled = true;
    
    try {
        await fetch(`${API_BASE}/scan`);
        if(document.getElementById('video-list')) fetchVideos();
        // Force fetch logs to trigger notifications if scan found anything
        fetchLogs();
    } catch(e) {
        alert("Gagal melakukan pemindaian manual.");
    } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
    }
}

function showNotification(log) {
    const isHapus = log.action === 'hapus';
    const title = isHapus ? '🚨 Spam Dihapus!' : '💬 Komentar Aman';
    const bodyText = `Video: ${log.video_title}\n@${log.author}: ${log.comment_text}`;

    // 1. Browser Desktop Notification
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: bodyText });
    }

    // 2. UI Toast Notification
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
        toast.className = `max-w-sm w-full bg-white border ${isHapus ? 'border-primary/20 shadow-red-900/10' : 'border-green-200 shadow-green-900/10'} rounded-2xl shadow-xl pointer-events-auto flex mb-3 transform transition-all duration-300 translate-x-full`;
    
    toast.innerHTML = `
      <div class="flex-1 w-0 p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0 pt-0.5">
            ${isHapus 
                ? '<svg class="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"/></svg>' 
                : '<svg class="h-6 w-6 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
            }
          </div>
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-bold text-secondary">
              ${title}
            </p>
            <p class="mt-1 text-xs text-gray-500 truncate">
               <span class="font-semibold text-primary">@${log.author}</span>: ${log.comment_text}
            </p>
          </div>
        </div>
      </div>
    `;
    
    toast.innerHTML = `
      <div class="flex-1 w-0 p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0 pt-0.5">
            ${isHapus 
                ? '<svg class="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>' 
                : '<svg class="h-6 w-6 text-[#79E6D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
            }
          </div>
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-bold font-['Montserrat'] ${isHapus ? 'text-rose-400' : 'text-[#79E6D4]'}">
              ${title}
            </p>
            <p class="mt-1 text-xs text-slate-300 font-['JetBrains_Mono'] truncate">
               @${log.author}: ${log.comment_text}
            </p>
          </div>
        </div>
      </div>
    `;

    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);

    // Remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

