import React, { useState, useEffect } from 'react';
import { 
  Rocket, Sparkles, ArrowRight, Book, Video, Mail, 
  CheckSquare, Copy, Check, X, Loader2, 
  AlertCircle, RefreshCcw, Zap, History, Trash2, ChevronDown, ChevronUp, Target, Edit3
} from 'lucide-react';

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || "GANTI_DENGAN_API_KEY_GROQ_KAMU";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const callGroq = async (messages) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model: GROQ_MODEL, max_tokens: 1024, temperature: 0.8, messages })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || response.status);
  }
  const data = await response.json();
  return data.choices[0].message.content;
};

// --- MarketStat ---
const MarketStat = ({ label, value, colorClass, desc }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-center mb-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
      <span className={`text-lg font-black ${colorClass}`}>{Number(value) || 0}<span className="text-gray-300 text-xs">/10</span></span>
    </div>
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <div className={`h-full transition-all duration-700 ${colorClass.replace('text-', 'bg-')}`} style={{ width: `${(Number(value) || 0) * 10}%` }} />
    </div>
    <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase leading-tight">{desc}</p>
  </div>
);

// --- PromptModal ---
const PromptModal = ({ idea, onClose }) => {
  const [copied, setCopied] = useState(false);

  const getDynamicPrompt = (idea) => {
    const category = idea.category.toLowerCase();
    const nicheInfo = idea.niche ? `Niche spesifik: ${idea.niche}.` : '';
    const baseInfo = `Saya ingin membuat produk digital berjudul "${idea.title}". ${nicheInfo} Target pembaca: ${idea.target || 'umum'}. Deskripsi: ${idea.desc}. Tolong buatkan draf konten lengkap dalam Bahasa Indonesia yang engaging dan actionable:`;
    if (category.includes('ebook')) return `${baseInfo}\n\n1. Buatkan struktur 12 bab Ebook yang sistematis dan menarik.\n2. Tuliskan draf isi Bab 1 secara mendalam (min. 500 kata).\n3. Berikan 3 poin kunci untuk setiap bab selanjutnya.\n4. Di setiap akhir bab, buatkan bagian "Aksi Nyata Hari Ini".\n5. Gunakan gaya bahasa naratif yang menginspirasi dan relatable.\n6. Sertakan contoh kasus nyata dari konteks Indonesia.`;
    if (category.includes('course')) return `${baseInfo}\n\n1. Buatkan kurikulum 6 Modul pelatihan video yang progresif.\n2. Pecah setiap modul menjadi 3-4 sub-materi dengan durasi estimasi.\n3. Buatkan skrip pembuka yang powerful untuk Modul 1 (min. 300 kata).\n4. Rancang worksheet praktis untuk setiap modul.\n5. Berikan saran visual, animasi, atau demo yang diperlukan.\n6. Tambahkan kuis singkat di akhir setiap modul.`;
    if (category.includes('checklist') || category.includes('tool')) return `${baseInfo}\n\n1. Buatkan checklist dengan 25-30 poin yang sangat actionable.\n2. Kelompokkan dalam 5 kategori utama.\n3. Berikan penjelasan 2-3 kalimat untuk setiap poin penting.\n4. Buatkan format template siap pakai dalam tabel.\n5. Tambahkan bagian "Tanda Kamu Sudah Berhasil".\n6. Sertakan tips "Common Mistakes to Avoid".`;
    if (category.includes('newsletter')) return `${baseInfo}\n\n1. Buatkan struktur 8 edisi pertama newsletter.\n2. Tuliskan draf lengkap Edisi #1 (min. 400 kata).\n3. Berikan headline ideas untuk setiap edisi.\n4. Rancang format yang konsisten dan mudah dibaca.\n5. Sertakan CTA yang kuat di setiap edisi.`;
    return `${baseInfo}\n\n1. Buatkan struktur konten lengkap sebanyak 10 bagian.\n2. Tuliskan draf isi bagian pertama secara detail (min. 400 kata).\n3. Berikan instruksi langkah demi langkah yang actionable.\n4. Sertakan contoh nyata dari konteks Indonesia.`;
  };

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = getDynamicPrompt(idea);
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-[2rem] sm:rounded-[3rem] w-full sm:max-w-2xl h-[90vh] sm:h-[70vh] shadow-2xl overflow-hidden flex flex-col border-t-[6px] sm:border-[8px] border-indigo-50">
        <div className="p-5 sm:p-8 border-b flex justify-between items-center bg-indigo-50/20">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 sm:p-3 rounded-2xl text-white shadow-lg"><Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /></div>
            <div>
              <h3 className="font-black text-base sm:text-xl text-slate-900 leading-none uppercase tracking-tighter">Production Prompt</h3>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 hidden sm:block">Siap Pakai di Claude / ChatGPT / Edukazo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
        </div>
        <div className="p-4 sm:p-8 bg-slate-50 flex-grow overflow-y-auto">
          <div className="bg-slate-900 text-indigo-100 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] font-mono text-[11px] sm:text-[13px] leading-relaxed relative border-2 border-indigo-500/20 shadow-inner">
            <button onClick={handleCopy} className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-indigo-600 hover:bg-indigo-500 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-xl active:scale-95 transition-all text-xs z-10">
              {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">{copied ? 'BERHASIL DISALIN' : 'SALIN PROMPT'}</span>
              <span className="sm:hidden">{copied ? '✓' : 'Salin'}</span>
            </button>
            <pre className="whitespace-pre-wrap mt-8">{getDynamicPrompt(idea)}</pre>
          </div>
        </div>
        <div className="p-4 sm:p-8 bg-white border-t flex justify-center">
          <button onClick={onClose} className="px-8 sm:px-12 py-3 sm:py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Selesai</button>
        </div>
      </div>
    </div>
  );
};

// --- HistoryPanel ---
const HistoryPanel = ({ sessions, onLoadSession, onDeleteSession, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div className="bg-white rounded-t-[2rem] sm:rounded-[3rem] w-full sm:max-w-lg h-[85vh] sm:max-h-[80vh] shadow-2xl overflow-hidden flex flex-col border-t-[6px] sm:border-[8px] border-indigo-50">
      <div className="p-5 sm:p-8 border-b flex justify-between items-center bg-indigo-50/20">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 sm:p-3 rounded-2xl text-white shadow-lg"><History className="w-4 h-4 sm:w-5 sm:h-5" /></div>
          <div>
            <h3 className="font-black text-base sm:text-xl text-slate-900 leading-none uppercase tracking-tighter">Riwayat Sesi</h3>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">{sessions.length} sesi tersimpan</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
      </div>
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-black uppercase text-sm">Belum ada riwayat</p>
          </div>
        ) : sessions.map((session) => (
          <div key={session.id} className="bg-gray-50 rounded-2xl sm:rounded-[2rem] p-5 border border-gray-100 hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-grow">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{new Date(session.id).toLocaleString('id-ID')}</p>
                <p className="text-xs font-black text-slate-700">Skill: <span className="text-indigo-600">{session.skills}</span></p>
                <p className="text-xs font-black text-slate-700">Minat: <span className="text-indigo-600">{session.interests}</span></p>
                {session.niche && <p className="text-xs font-black text-slate-700">Niche: <span className="text-emerald-600">{session.niche}</span></p>}
                <p className="text-[10px] text-gray-400 mt-1">{session.ideas.length} ide tersimpan</p>
              </div>
              <button onClick={() => onDeleteSession(session.id)} className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-400 transition-all ml-2 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => { onLoadSession(session); onClose(); }} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
              Buka Sesi Ini
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- IdeaBatch ---
const IdeaBatch = ({ batch, index, onSelectIdea }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 sm:gap-3 group">
          <div className="bg-indigo-100 text-indigo-600 px-3 sm:px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest whitespace-nowrap">Sesi #{index + 1}</div>
          <span className="text-[10px] text-gray-400 font-black uppercase truncate max-w-[120px] sm:max-w-xs">{batch.niche || batch.interests}</span>
          {collapsed ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        </button>
        <div className="flex-grow h-px bg-gray-100" />
      </div>
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {batch.ideas.map((idea, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-xl flex flex-col overflow-hidden hover:-translate-y-2 transition-all duration-500">
              <div className={`p-6 sm:p-8 bg-gradient-to-br ${i % 3 === 0 ? 'from-indigo-600 to-indigo-900 text-white' : 'from-gray-50 to-gray-100 text-indigo-600'}`}>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-4 ${i % 3 === 0 ? 'bg-white/20' : 'bg-white shadow-xl'}`}>
                  {idea.category?.toLowerCase().includes('ebook') ? <Book className="w-5 h-5 sm:w-6 sm:h-6" /> : idea.category?.toLowerCase().includes('course') ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : idea.category?.toLowerCase().includes('news') ? <Mail className="w-5 h-5 sm:w-6 sm:h-6" /> : <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full bg-black/10">{idea.category}</span>
                <h3 className="text-lg sm:text-xl font-black mt-3 leading-tight tracking-tight">{idea.title}</h3>
                <p className={`text-xs mt-2 font-medium leading-relaxed ${i % 3 === 0 ? 'text-white/70' : 'text-gray-500'}`}>{idea.desc}</p>
              </div>
              <div className="p-5 sm:p-6 flex-grow space-y-4">
                <MarketStat label="Potensi Pasar" value={idea.demand} colorClass="text-emerald-500" desc="Estimasi AI — bukan data riil" />
                <MarketStat label="Tingkat Persaingan" value={idea.competition} colorClass="text-red-500" desc="Estimasi AI — bukan data riil" />
                <p className="text-xs text-indigo-800 italic bg-indigo-50/50 p-4 rounded-2xl border-2 border-dashed border-indigo-100 leading-relaxed">"{idea.validation_reason}"</p>
              </div>
              <div className="p-5 sm:p-6 bg-gray-50 border-t">
                <button onClick={() => onSelectIdea(idea)} className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 text-sm transition-all active:scale-95 shadow-lg bg-indigo-600 text-white hover:bg-indigo-700">
                  BUAT ISI PRODUK! <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- NichePicker ---
const NichePicker = ({ niches, skills, interests, onSelect, onCustom, loading }) => {
  const [customMode, setCustomMode] = useState(false);
  const [customNiche, setCustomNiche] = useState('');
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Langkah 2 dari 2</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none italic uppercase mb-3">Pilih Niche<br/>Kamu</h2>
        <p className="text-sm text-gray-400 font-medium">Berdasarkan skill <span className="text-indigo-600 font-black">{skills}</span> dan minat <span className="text-indigo-600 font-black">{interests}</span></p>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="font-black text-gray-400 uppercase text-xs tracking-widest">Menganalisis niche terbaik...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {niches.map((niche, i) => (
              <button key={i} onClick={() => onSelect(niche.niche)} className="text-left p-4 sm:p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-indigo-400 hover:shadow-lg transition-all group active:scale-95">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xl sm:text-2xl">{niche.emoji}</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors mt-1" />
                </div>
                <p className="font-black text-slate-800 text-sm leading-tight mb-1">{niche.niche}</p>
                <p className="text-[11px] text-gray-400 font-medium">{niche.reason}</p>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-5">
            {!customMode ? (
              <button onClick={() => setCustomMode(true)} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl font-black text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                <Edit3 className="w-4 h-4" /> Saya sudah punya niche sendiri
              </button>
            ) : (
              <div className="space-y-3">
                <textarea value={customNiche} onChange={(e) => setCustomNiche(e.target.value)} className="w-full p-5 bg-white border-2 border-indigo-200 rounded-2xl focus:border-indigo-600 outline-none text-sm font-medium resize-none h-24" placeholder="Tulis niche spesifik kamu... contoh: ibu rumah tangga yang ingin bisnis online modal kecil" autoFocus />
                <button onClick={() => customNiche.trim() && onCustom(customNiche.trim())} disabled={!customNiche.trim()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all disabled:opacity-40">
                  Pakai Niche Ini →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [step, setStep] = useState('home');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [niche, setNiche] = useState('');
  const [niches, setNiches] = useState([]);
  const [loadingNiches, setLoadingNiches] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ideaspark_sessions');
      if (saved) setSessions(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const saveSession = (newSession) => {
    try {
      const updated = [newSession, ...sessions];
      setSessions(updated);
      localStorage.setItem('ideaspark_sessions', JSON.stringify(updated));
    } catch (e) {}
  };

  const deleteSession = (id) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('ideaspark_sessions', JSON.stringify(updated));
  };

  const loadSession = (session) => {
    setSkills(session.skills);
    setInterests(session.interests);
    setNiche(session.niche || '');
    setBatches([{ id: session.id, skills: session.skills, interests: session.interests, niche: session.niche, ideas: session.ideas }]);
    setStep('results');
  };

  const handleInputSubmit = async () => {
    if (!skills.trim() || !interests.trim()) return;
    setLoadingNiches(true);
    setStep('niche');
    setError(null);
    try {
      const text = await callGroq([
        { role: 'system', content: 'Kamu adalah konsultan produk digital Indonesia. Jawab HANYA dengan JSON murni, tanpa markdown.' },
        { role: 'user', content: `Berikan 6 rekomendasi niche spesifik untuk seseorang dengan skill "${skills}" dan minat "${interests}" yang ingin membuat produk digital di pasar Indonesia.\n\nJawab HANYA dengan array JSON:\n[\n  {\n    "niche": "Nama niche yang spesifik dan tajam",\n    "emoji": "🎯",\n    "reason": "Alasan singkat kenapa niche ini potensial (max 10 kata)"\n  }\n]\n\nBuat niche yang sangat spesifik, bukan generic.` }
      ]);
      const cleaned = text.replace(/```json|```/g, "").trim();
      setNiches(JSON.parse(cleaned));
    } catch (e) {
      setError("Gagal load niche. Coba lagi.");
      setStep('input');
    } finally {
      setLoadingNiches(false);
    }
  };

  const generate = async (selectedNiche) => {
    const activeNiche = selectedNiche || niche;
    if (!activeNiche) return;
    setNiche(activeNiche);
    setLoading(true);
    setError(null);
    try {
      const text = await callGroq([
        { role: 'system', content: 'Kamu adalah konsultan produk digital Indonesia. Jawab HANYA dengan JSON murni, tanpa markdown.' },
        { role: 'user', content: `Berikan 3 ide produk digital dengan judul yang menjual untuk:\n- Skill: "${skills}"\n- Minat: "${interests}"\n- Niche spesifik: "${activeNiche}"\n\nJawab HANYA dengan array JSON:\n[\n  {\n    "title": "Judul heboh dengan angka + pain point + hasil spesifik",\n    "category": "Ebook",\n    "desc": "Deskripsi singkat 1-2 kalimat",\n    "niche": "${activeNiche}",\n    "target": "Target pembaca spesifik",\n    "demand": 8,\n    "competition": 4,\n    "validation_reason": "Alasan konkret mengapa ide ini laku di Indonesia"\n  }\n]\n\nAturan judul: wajib ada angka, wajib ada pain point atau hasil spesifik.\nCategory: Ebook, Course, Checklist, Newsletter, atau Tool.` }
      ]);
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsedData = JSON.parse(cleaned);
      const newBatch = { id: Date.now(), skills, interests, niche: activeNiche, ideas: parsedData };
      setBatches(prev => [...prev, newBatch]);
      saveSession(newBatch);
      setStep('results');
    } catch (err) {
      setError("Aduh, ada masalah teknis. Coba klik lagi ya!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('home'); setBatches([]); setSkills(''); setInterests(''); setNiche(''); setNiches([]); setError(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      {/* NAVBAR */}
      <nav className="px-4 sm:px-8 py-5 sm:py-8 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <Rocket className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic">IdeaSpark</span>
        </div>
        <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-all">
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">Riwayat</span>
          {sessions.length > 0 && <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">{sessions.length}</span>}
        </button>
      </nav>

      <main className="pb-24">
        {/* HOME */}
        {step === 'home' && (
          <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-5">
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.85]">
              Skill Kamu <br/><span className="text-indigo-600 italic">Bisa Jadi Cuan.</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-500 max-w-xl mb-10 font-medium italic px-2">
              Temukan ide produk digital yang tajam, spesifik, dan tervalidasi pasar dalam hitungan detik.
            </p>
            <button onClick={() => setStep('input')} className="px-8 sm:px-14 py-4 sm:py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg sm:text-2xl hover:bg-indigo-700 transition-all shadow-2xl active:scale-95 flex items-center gap-3">
              MULAI SEKARANG <ArrowRight className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>
          </div>
        )}

        {/* INPUT */}
        {step === 'input' && (
          <div className="max-w-xl mx-auto py-8 px-4 sm:px-6">
            <button onClick={() => setStep('home')} className="mb-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">← Kembali</button>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Langkah 1 dari 2</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-none italic uppercase">Profil Kamu</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.4em]">Skill / Pengalaman</label>
                <textarea value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full p-5 sm:p-8 bg-white border-4 border-gray-50 rounded-3xl focus:border-indigo-600 outline-none h-32 sm:h-40 shadow-xl text-base sm:text-lg font-medium resize-none" placeholder="Contoh: Project management, desain grafis, memasak..."/>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.4em]">Minat / Topik</label>
                <textarea value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full p-5 sm:p-8 bg-white border-4 border-gray-50 rounded-3xl focus:border-indigo-600 outline-none h-32 sm:h-40 shadow-xl text-base sm:text-lg font-medium resize-none" placeholder="Contoh: Bisnis online, parenting, investasi..."/>
              </div>
              {error && (
                <div className="p-5 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border-2 border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-black italic">{error}</p>
                </div>
              )}
              <button onClick={handleInputSubmit} disabled={!skills.trim() || !interests.trim()} className="w-full py-5 sm:py-7 bg-indigo-600 text-white rounded-3xl font-black text-lg sm:text-xl hover:bg-indigo-700 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-40">
                <Target className="w-6 h-6" /> TEMUKAN NICHE SAYA →
              </button>
            </div>
          </div>
        )}

        {/* NICHE */}
        {step === 'niche' && (
          <NichePicker niches={niches} skills={skills} interests={interests} onSelect={(n) => generate(n)} onCustom={(n) => generate(n)} loading={loadingNiches || loading} />
        )}

        {/* RESULTS */}
        {step === 'results' && (
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
            <h2 className="text-4xl sm:text-6xl font-black mb-3 text-center tracking-tighter uppercase italic leading-none">Market Results 🔥</h2>
            <p className="text-center text-gray-400 text-xs font-black uppercase tracking-widest mb-10">
              {batches.reduce((acc, b) => acc + b.ideas.length, 0)} ide terkumpul
            </p>
            {batches.map((batch, index) => (
              <IdeaBatch key={batch.id} batch={batch} index={index} onSelectIdea={setSelectedIdea} />
            ))}
            {loading && (
              <div className="flex items-center justify-center gap-3 py-10 text-indigo-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-black uppercase text-xs tracking-widest">Generating ide baru...</span>
              </div>
            )}
            <div className="mt-8 flex justify-center">
              <button onClick={() => { setStep('niche'); handleInputSubmit(); }} disabled={loading} className="flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm hover:bg-indigo-700 transition-all shadow-xl active:scale-95 disabled:opacity-70">
                <RefreshCcw className="w-5 h-5" /> Cari Ide Lain
              </button>
            </div>
          </div>
        )}
      </main>

      {selectedIdea && <PromptModal idea={selectedIdea} onClose={() => setSelectedIdea(null)} />}
      {showHistory && <HistoryPanel sessions={sessions} onLoadSession={loadSession} onDeleteSession={deleteSession} onClose={() => setShowHistory(false)} />}
    </div>
  );
};

export default App;
