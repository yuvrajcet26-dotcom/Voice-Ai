import React, { useState, useEffect } from 'react';
import {
  HelpCircle, Plus, Edit3, Trash2, Search, Filter, Globe,
  Building, CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { FAQItem, AcademicStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Faqs: React.FC = () => {
  const { role } = useAuth();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [langFilter, setLangFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    language: 'en',
    category: 'Admission',
    status: 'PUBLISHED' as AcademicStatus
  });

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      const data = await api.faqs.list();
      setFaqs(data);
    } catch (e) {
      console.warn('Using default FAQ mock items:', e);
      setFaqs([
        {
          id: 'faq-1',
          question: 'What is the eligibility for B.Tech at STME Dhule?',
          answer: 'Candidate must have passed 10+2 with Physics and Mathematics along with Chemistry or Computer Science with minimum 50% aggregate marks, and appeared for MHT-CET or JEE Main.',
          language: 'en',
          category: 'Eligibility',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'faq-2',
          question: 'एसटीएमई मध्ये बी.टेक प्रवेश प्रक्रिया कशी आहे?',
          answer: 'एसटीएमई धुळे येथे बी.टेक प्रवेश महाराष्ट्र राज्य सीईटी सेलच्या केंद्रीभूत प्रवेश प्रक्रियेद्वारे (CAP Rounds) किंवा संस्था स्तरावरील कोट्यातून होतात.',
          language: 'mr',
          category: 'Admission',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'faq-3',
          question: 'क्या विश्वविद्यालय में छात्रावास (Hostel) की सुविधा उपलब्ध है?',
          answer: 'हाँ, एसवीकेएम धुले परिसर में छात्रों और छात्राओं के लिए अलग-अलग आधुनिक हॉस्टल, वाई-फाई और शाकाहारी मेस की उत्कृष्ट सुविधा उपलब्ध है।',
          language: 'hi',
          category: 'Hostel',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'faq-4',
          question: 'Are there merit scholarships available for engineering students?',
          answer: 'Yes, SVKM provides merit-based financial scholarships to top rankers in MHT-CET and JEE Main, as well as government social welfare concessions.',
          language: 'en',
          category: 'Scholarships',
          status: 'PUBLISHED',
          created_at: '2026-01-12T10:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedFaq(null);
    setFormData({
      question: '',
      answer: '',
      language: 'en',
      category: 'Admission',
      status: 'PUBLISHED'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq: FAQItem) => {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      language: faq.language,
      category: faq.category,
      status: faq.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedFaq) {
        await api.faqs.update(selectedFaq.id, formData);
      } else {
        await api.faqs.create(formData);
      }
      setIsModalOpen(false);
      loadFaqs();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete FAQ?')) {
      try {
        await api.faqs.delete(id);
        loadFaqs();
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const filtered = faqs.filter(f => {
    const matchesLang = langFilter === 'ALL' || f.language === langFilter;
    const matchesSearch = f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLang && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Multilingual FAQ Repository</h2>
          <p className="text-sm text-slate-500">
            Common questions answered directly by the AI voicebot in English, Hindi, and Marathi.
          </p>
        </div>

        {(role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            + Add FAQ
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Globe className="w-4 h-4 text-slate-400" />
          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Languages</option>
            <option value="en">English (EN)</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="mr">Marathi (मराठी)</option>
          </select>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filtered.map(faq => (
          <div
            key={faq.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 uppercase tracking-wider">
                    {faq.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                    {faq.language === 'mr' ? 'मराठी' : faq.language === 'hi' ? 'हिंदी' : 'English'}
                  </span>
                  <StatusBadge status={faq.status} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{faq.question}</h3>
              </div>

              {(role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(faq)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {role === 'MAIN_ADMIN' && (
                    <button
                      type="button"
                      onClick={() => handleDelete(faq.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Add / Edit FAQ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {selectedFaq ? 'Edit FAQ' : 'Add New FAQ'}
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
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What is the eligibility for B.Tech?"
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Answer (Used verbatim by AI) *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="The factual answer spoken to callers..."
                  value={formData.answer}
                  onChange={e => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
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
                  {selectedFaq ? 'Update FAQ' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
