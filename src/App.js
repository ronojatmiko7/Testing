import React, { useState } from 'react';
import { 
  Rocket, Sparkles, ArrowRight, Book, Video, Mail, 
  CheckSquare, Copy, Check, X, Loader2, 
  AlertCircle, RefreshCcw, Zap
} from 'lucide-react';

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || "GANTI_DENGAN_API_KEY_GROQ_KAMU";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Model terbaik di Groq, gratis

// --- KOMPONEN PENDUKUNG ---
const MarketStat = ({ label, value, colorClass, desc }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-center mb-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
      <span className={`text-xl font-black ${colorClass}`}>{Number(value) || 0}<span className="text-gray-300 text-xs">/10</span></span>
    </div>
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-700 ${colorClass.replace('text-', 'bg-')}`}
        style={{ width: `${(Number(value) || 0) * 10}%` }}
      />
    </div>
    <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase leading-tight">{desc}</p>
  </div>
);

const PromptModal = ({ idea, onClose }) => {
  const [copied, setCopied] = useState(false);

  const getDynamicPrompt = (idea) => {
    const category = idea.category.toLowerCase();
    const baseInfo = `Saya ingin membuat produk digital berjudul "${idea.title}". Deskripsi: ${idea.desc}. Tolong buatkan draf konten lengkap untuk produk ini dalam Bahasa Indonesia:`;

    if (category.includes('ebook')) {
      return `${baseInfo}\n1. Buatkan struktur 12 bab Ebook yang sistematis.\n2. Tuliskan draf isi Bab 1 secara mendalam.\n3. Berikan poin-poin kunci untuk setiap bab selanjutnya.\n4. Di setiap akhir bab, buatkan bagian "Tugas Praktis".\n5. Gunakan gaya bahasa naratif yang menginspirasi.`;
    } 
    if (category.includes('course')) {
      return `${baseInfo}\n1. Buatkan kurikulum 6 Modul pelatihan video.\n2. Pecah menjadi 3-4 sub-materi teknis.\n3. Buatkan skrip pembuka untuk Modul 1.\n4. Rancang materi praktik atau worksheet.\n5. Berikan saran aset visual atau slide.`;
    }
    if (category.includes('checklist') || category.includes('tool')) {
      return `${baseInfo}\n1. Buatkan daftar langkah-langkah yang sangat detail.\n2. Berikan penjelasan mendalam untuk setiap poin.\n3. Buatkan format template siap salin.\n4. Tambahkan bagian "Kriteria Selesai".`;
    }
    return `${baseInfo}\n1. Buatkan struktur konten lengkap sebanyak 10 bagian.\n2. Tuliskan draf isi bagian pertama secara detail.\n3. Berikan instruksi langkah demi langkah.`;
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
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl h-[70vh] shadow-2xl overflow-hidden flex flex-col border-[8px] border-indigo-50">
        <div className="p-8 border-b flex justify-between items-center bg-indigo-50/20">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg"><Zap className="w-5 h-5 fill-white" /></div>
            <div>
              <h3 className="font-black text-xl text-slate-900 leading-none uppercase tracking-tighter">Production Prompt</h3>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Khusus Konten Produk</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-8 bg-slate-50 flex-grow overflow-y-auto">
          <div className="bg-slate-900 text-indigo-100 p-8 rounded-[2rem] font-mono text-[13px] leading-relaxed relative border-2 border-indigo-500/20 shadow-inner">
            <button onClick={handleCopy} className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-xl active:scale-95 transition-all text-xs z-10">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'BERHASIL DISALIN' : 'SALIN PROMPT'}
            </button>
            <pre className="whitespace-pre-wrap mt-8">{getDynamicPrompt(idea)}</pre>
          </div>
        </div>
        <div className="p-8 bg-white border-t flex justify-center">
          <button onClick={onClose} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Selesai</button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [step, setStep] = useState('home');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [error, setError] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const generate = async () => {
    if (!skills.trim() || !interests.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 1024,
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: 'Kamu adalah konsultan produk digital untuk pasar Indonesia. Selalu jawab HANYA dengan JSON murni, tanpa markdown, tanpa penjelasan tambahan.'
            },
            {
              role: 'user',
              content: `Berikan 3 ide produk digital unik untuk seseorang dengan skill "${skills}" dan minat "${interests}".

Jawab HANYA dengan array JSON ini, tidak ada teks lain:
[
  {
    "title": "Judul Produk",
    "category": "Ebook",
    "desc": "Deskripsi singkat 1-2 kalimat",
    "demand": 8,
    "competition": 4,
    "validation_reason": "Alasan konkret mengapa ide ini punya pasar yang jelas di Indonesia"
  }
]

Aturan:
- category harus salah satu: Ebook, Course, Checklist, Newsletter, Tool
- demand dan competition adalah angka 1-10
- Buat ide yang spesifik dan realistis untuk pasar Indonesia`
            }
          ]
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("Groq API Error:", errData);
        throw new Error(`API Error: ${errData.error?.message || response.status}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      
      const cleanedText = text.replace(/```json|```/g, "").trim();
      const parsedData = JSON.parse(cleanedText);
      
      setIdeas(parsedData);
      setStep('results');
    } catch (err) {
      console.error("Error lengkap:", err);
      setError("Aduh, ada masalah teknis. Coba klik lagi ya!");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      <nav className="p-8 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setStep('home')}>
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <Rocket className="text-white w-6 h-6" />
          </div>
          <span className="text-3xl font-black tracking-tighter uppercase italic">IdeaSpark</span>
        </div>
      </nav>
      <main className="pb-32">
        {step === 'home' && (
          <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-6">
            <h1 className="text-7xl md:text-9xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.85]">Skill Kamu <br/><span className="text-indigo-600 italic">Bisa Jadi Cuan.</span></h1>
            <p className="text-xl text-slate-500 max-w-xl mb-14 font-medium italic">Temukan ide produk digital yang cuan dan tervalidasi pasar dalam hitungan detik.</p>
            <button onClick={() => setStep('input')} className="px-14 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl hover:bg-indigo-700 transition-all shadow-2xl active:scale-95 flex items-center gap-3">MULAI SEKARANG <ArrowRight className="w-7 h-7" /></button>
          </div>
        )}
        {step === 'input' && (
          <div className="max-w-xl mx-auto py-10 px-6">
            <button onClick={() => setStep('home')} className="mb-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">← Kembali</button>
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-none italic uppercase">Profil Kamu</h2>
            <div className="space-y-10">
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.4em]">Skill / Pengalaman</label>
                <textarea value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full p-8 bg-white border-4 border-gray-50 rounded-[2.5rem] focus:border-indigo-600 outline-none h-40 shadow-xl text-lg font-medium resize-none" placeholder="Tulis skill kamu..."/>
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.4em]">Minat / Topik</label>
                <textarea value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full p-8 bg-white border-4 border-gray-50 rounded-[2.5rem] focus:border-indigo-600 outline-none h-40 shadow-xl text-lg font-medium resize-none" placeholder="Apa topik favoritmu?"/>
              </div>
              {error && (
                <div className="p-6 bg-red-50 text-red-600 rounded-[2rem] flex items-center gap-4 border-2 border-red-100">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <p className="text-sm font-black italic">{error}</p>
                </div>
              )}
              <button onClick={generate} disabled={loading} className="w-full py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl hover:bg-indigo-700 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70">
                {loading ? <><Loader2 className="w-7 h-7 animate-spin" /> Lagi Mikir...</> : <><Sparkles className="w-7 h-7" /> VALIDASI 3 IDE GUE!</>}
              </button>
            </div>
          </div>
        )}
        {step === 'results' && (
          <div className="max-w-7xl mx-auto py-10 px-6">
            <h2 className="text-6xl font-black mb-12 text-center tracking-tighter uppercase italic leading-none">Market Results 🔥</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {ideas.map((idea, i) => (
                <div key={i} className="bg-white rounded-[4rem] border border-gray-100 shadow-2xl flex flex-col overflow-hidden hover:-translate-y-4 transition-all duration-500 relative">
                  <div className={`p-10 bg-gradient-to-br ${i % 3 === 0 ? 'from-indigo-600 to-indigo-900 text-white' : 'from-gray-50 to-gray-100 text-indigo-600'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${i % 3 === 0 ? 'bg-white/20' : 'bg-white shadow-xl'}`}>
                      {idea.category?.toLowerCase().includes('ebook') ? <Book /> : idea.category?.toLowerCase().includes('course') ? <Video /> : idea.category?.toLowerCase().includes('news') ? <Mail /> : <CheckSquare />}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full bg-black/10">{idea.category}</span>
                    <h3 className="text-3xl font-black mt-4 leading-tight tracking-tight">{idea.title}</h3>
                  </div>
                  <div className="p-10 flex-grow space-y-8">
                    <MarketStat label="Permintaan" value={idea.demand} colorClass="text-emerald-500" desc="Banyak orang cari ini." />
                    <MarketStat label="Kompetisi" value={idea.competition} colorClass="text-red-500" desc="Skor 10 = Padat saingan." />
                    <p className="text-sm text-indigo-800 italic bg-indigo-50/50 p-6 rounded-[2.5rem] border-2 border-dashed border-indigo-100">"{idea.validation_reason}"</p>
                  </div>
                  <div className="p-10 bg-gray-50 border-t">
                    <button onClick={() => setSelectedIdea(idea)} className="w-full py-5 rounded-[1.8rem] font-black flex items-center justify-center gap-3 text-lg transition-all active:scale-95 shadow-xl bg-indigo-600 text-white">BUAT ISI PRODUK! <ArrowRight className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-20 flex justify-center">
              <button onClick={generate} disabled={loading} className="flex items-center gap-3 px-10 py-5 bg-white border-4 border-indigo-50 text-indigo-600 rounded-[2rem] font-black hover:bg-indigo-50 transition-all shadow-xl active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />} {loading ? "Mikir..." : "Cari Ide Lain"}
              </button>
            </div>
          </div>
        )}
      </main>
      {selectedIdea && <PromptModal idea={selectedIdea} onClose={() => setSelectedIdea(null)} />}
    </div>
  );
};

export default App;
