import React, { useState, useEffect } from 'react';
import {
  BookText, Plus, Edit3, Trash2, CheckCircle, Upload, Search,
  Filter, Globe, FileText, Building, CheckCircle2, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { KnowledgeItem, AcademicStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const KnowledgeBase: React.FC = () => {
  const { role } = useAuth();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [langFilter, setLangFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Admission',
    content: '',
    school_id: '',
    course_id: '',
    language: 'en',
    status: 'PUBLISHED' as AcademicStatus
  });

  const categories = [
    'University', 'School', 'Course', 'Branch', 'Admission',
    'Eligibility', 'Fees', 'Facilities', 'Hostel', 'Scholarships', 'Placements', 'Contact'
  ];

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const data = await api.knowledge.list();
      setItems(data);
    } catch (e) {
      console.warn('Using default knowledge items:', e);
      setItems([
        {
          id: 'kb-1',
          title: 'SVKM Global University, Dhule Overview & Accreditation',
          category: 'University',
          content: 'SVKM Global University at Dhule is a premier educational institution established by Shri Vile Parle Kelavani Mandal, offering UGC and AICTE approved programs with world-class residential and research infrastructure.',
          language: 'en',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z',
          updated_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'kb-2',
          title: 'STME B.Tech Engineering Admission & MHT-CET Cutoffs',
          category: 'Admission',
          content: 'Admissions to B.Tech at STME Dhule are conducted through Maharashtra State Common Entrance Test (MHT-CET) and JEE Main scores. Candidates must have secured minimum 50% in 10+2 PCM.',
          language: 'en',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z',
          updated_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'kb-3',
          title: 'एसटीएमई अभियांत्रिकी प्रवेश आणि पात्रता निकष (मराठी)',
          category: 'Eligibility',
          content: 'एसटीएमई धुळे येथे बी.टेक प्रथम वर्ष प्रवेशासाठी उमेदवाराने १२ वी विज्ञान (भौतिकशास्त्र, रसायनशास्त्र आणि गणित) परीक्षेत किमान ५०% गुण मिळवणे आणि एमएचटी-सीईटी किंवा जेईई परीक्षा देणे अनिवार्य आहे.',
          language: 'mr',
          status: 'PUBLISHED',
          created_at: '2026-01-12T10:00:00Z',
          updated_at: '2026-01-12T10:00:00Z'
        },
        {
          id: 'kb-4',
          title: 'एसवीकेएम बी.टेक और बीसीए फीस संरचना (हिंदी)',
          category: 'Fees',
          content: 'एसवीकेएम ग्लोबल यूनिवर्सिटी धुले में बी.टेक की वार्षिक ट्यूशन फीस लगभग ₹ 1,80,000 प्रति वर्ष है। मेधावी छात्रों के लिए छात्रवृत्ति और वित्तीय सहायता भी उपलब्ध है।',
          language: 'hi',
          status: 'PUBLISHED',
          created_at: '2026-01-14T10:00:00Z',
          updated_at: '2026-01-14T10:00:00Z'
        },
        {
          id: 'kb-5',
          title: 'On-Campus Hostel & Mess Facilities',
          category: 'Hostel',
          content: 'Separate on-campus residential hostels for boys and girls with high-speed Wi-Fi, 24/7 security, gymnasium, medical center, and hygienic vegetarian cafeteria.',
          language: 'en',
          status: 'PUBLISHED',
          created_at: '2026-01-15T10:00:00Z',
          updated_at: '2026-01-15T10:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      category: 'Admission',
      content: '',
      school_id: '',
      course_id: '',
      language: 'en',
      status: 'PUBLISHED'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KnowledgeItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      content: item.content,
      school_id: item.school_id || '',
      course_id: item.course_id || '',
      language: item.language,
      status: item.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await api.knowledge.update(selectedItem.id, formData);
      } else {
        await api.knowledge.create(formData);
      }
      setIsModalOpen(false);
      loadKnowledge();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.knowledge.publish(id);
      loadKnowledge();
    } catch (err: any) {
      alert(err.message || 'Publish failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this knowledge article?')) {
      try {
        await api.knowledge.delete(id);
        loadKnowledge();
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const filtered = items.filter(item => {
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesLang = langFilter === 'ALL' || item.language === langFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesLang && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">University Knowledge Base</h2>
          <p className="text-sm text-slate-500">
            Factual repository retrieved by the AI voice agent. Only <strong>PUBLISHED</strong> articles are served to callers.
          </p>
        </div>

        {(role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            + Add Knowledge Fact
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search verified facts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Languages (EN / HI / MR)</option>
            <option value="en">English</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="mr">Marathi (मराठी)</option>
          </select>
        </div>
      </div>

      {/* Knowledge Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                    {item.language}
                  </span>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{item.content}</p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
              <span className="text-[11px] text-slate-400">
                Updated: {new Date(item.updated_at || Date.now()).toLocaleDateString()}
              </span>

              {(role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
                <div className="flex items-center gap-1.5">
                  {item.status !== 'PUBLISHED' && (
                    <button
                      type="button"
                      onClick={() => handlePublish(item.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Publish
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {role === 'MAIN_ADMIN' && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Knowledge Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {selectedItem ? 'Edit Knowledge Fact' : 'Add Knowledge Fact'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title / Fact Heading *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STME B.Tech Electrical Engineering Fee"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Language *</label>
                  <select
                    value={formData.language}
                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="mr">Marathi (मराठी)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verified Factual Content (Used by AI) *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Exact factual information the AI voice agent should convey to callers..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Publishing Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as AcademicStatus })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none"
                >
                  <option value="PUBLISHED">PUBLISHED (Active in live AI calls)</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="DRAFT">DRAFT (Hidden from callers)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/20"
                >
                  {selectedItem ? 'Update Fact' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
