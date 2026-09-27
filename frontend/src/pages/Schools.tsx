import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Edit3, CheckCircle, Archive, Globe, Mail, Phone,
  Search, Eye, ShieldCheck, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { School, AcademicStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Schools: React.FC = () => {
  const { role } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    short_name: '',
    description: '',
    head_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    status: 'PUBLISHED' as AcademicStatus
  });

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const data = await api.schools.list();
      setSchools(data);
    } catch (e) {
      console.warn('Using default school data:', e);
      setSchools([
        {
          id: 'school-stme',
          name: 'School of Technology Management & Engineering',
          code: 'STME',
          short_name: 'STME',
          description: 'Premier engineering and technology management campus offering B.Tech, M.Tech, and specialized technology programs at SVKM Dhule.',
          head_name: 'Dr. Rahul Sharma (Dean)',
          email: 'stme.admissions@svkm.ac.in',
          phone: '+91 2562 281456',
          website: 'https://svkm-dhule.ac.in/stme',
          address: 'Behind Gurudwara, Mumbai-Agra Highway, Dhule, Maharashtra 424001',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z',
          updated_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'school-soc',
          name: 'School of Commerce',
          code: 'SOC',
          short_name: 'SOC',
          description: 'Contemporary commerce and business administration programs with industry integration (B.Com, BBA, MBA).',
          head_name: 'Dr. Sunita Deshpande (Director)',
          email: 'soc.admissions@svkm.ac.in',
          phone: '+91 2562 281458',
          website: 'https://svkm-dhule.ac.in/soc',
          address: 'SVKM Dhule Campus, Dhule, Maharashtra',
          status: 'PUBLISHED',
          created_at: '2026-01-12T11:00:00Z',
          updated_at: '2026-01-12T11:00:00Z'
        },
        {
          id: 'school-spo',
          name: 'School of Pharmacy & Technology Management',
          code: 'SPO',
          short_name: 'SPO',
          description: 'PCI approved pharmaceutical sciences institute offering B.Pharm and D.Pharm with advanced laboratory facilities.',
          head_name: 'Dr. Vikas Patil (Principal)',
          email: 'spo.admissions@svkm.ac.in',
          phone: '+91 2562 281460',
          website: 'https://svkm-dhule.ac.in/spo',
          address: 'SVKM Dhule Campus, Dhule, Maharashtra',
          status: 'PUBLISHED',
          created_at: '2026-01-15T09:30:00Z',
          updated_at: '2026-01-15T09:30:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedSchool(null);
    setFormData({
      name: '',
      code: '',
      short_name: '',
      description: '',
      head_name: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      status: 'PUBLISHED'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (school: School) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      short_name: school.short_name,
      description: school.description || '',
      head_name: school.head_name || '',
      email: school.email || '',
      phone: school.phone || '',
      website: school.website || '',
      address: school.address || '',
      status: school.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSchool) {
        await api.schools.update(selectedSchool.id, formData);
      } else {
        await api.schools.create(formData);
      }
      setIsModalOpen(false);
      loadSchools();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.schools.publish(id);
      loadSchools();
    } catch (err: any) {
      alert(err.message || 'Failed to publish');
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm('Are you sure you want to archive this school? It will no longer receive live calls.')) {
      try {
        await api.schools.delete(id);
        loadSchools();
      } catch (err: any) {
        alert(err.message || 'Failed to archive');
      }
    }
  };

  const filtered = schools.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.short_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dynamic School Management</h2>
          <p className="text-sm text-slate-500">
            Define, edit, and publish schools. Published schools are dynamically routed to by the multilingual AI voice caller system.
          </p>
        </div>

        {(role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            + Add School
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search school name, code (STME, SOC)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published (Live AI)</option>
            <option value="DRAFT">Draft</option>
            <option value="REVIEW">Under Review</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Schools Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(school => (
          <div
            key={school.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {school.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{school.name}</h3>
                    <span className="text-xs text-slate-400 font-medium">Code: {school.code}</span>
                  </div>
                </div>
                <StatusBadge status={school.status} />
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {school.description || 'No description provided.'}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                {school.head_name && (
                  <p className="flex items-center gap-1.5 font-medium text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Head: {school.head_name}</span>
                  </p>
                )}
                {school.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{school.email}</span>
                  </p>
                )}
                {school.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{school.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {(role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(school)}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                    title="Edit School"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                {school.status !== 'PUBLISHED' && (role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
                  <button
                    type="button"
                    onClick={() => handlePublish(school.id)}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1"
                    title="Publish for Live AI"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Publish
                  </button>
                )}
              </div>

              {(role === 'MAIN_ADMIN') && school.status !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => handleArchive(school.id)}
                  className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                  title="Archive School"
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit School Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {selectedSchool ? 'Edit School Details' : 'Add New University School'}
                </h3>
                <p className="text-xs text-slate-500">
                  New schools are dynamically registered in the AI knowledge engine and counselor dispatch pool.
                </p>
              </div>
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
                  <label className="block font-semibold text-slate-700 mb-1">School Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. School of Management"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">School Code (Unique) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SOM"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Short Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SOM Dhule"
                    value={formData.short_name}
                    onChange={e => setFormData({ ...formData, short_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dean / Head Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. A. K. Verma"
                    value={formData.head_name}
                    onChange={e => setFormData({ ...formData, head_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Programs Overview</label>
                <textarea
                  rows={3}
                  placeholder="Academic overview, accreditation, facilities, and university vision..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="som.admissions@svkm.ac.in"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 2562 281456"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Publishing Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as AcademicStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none"
                  >
                    <option value="PUBLISHED">PUBLISHED (Instantly active for live AI callers)</option>
                    <option value="APPROVED">APPROVED (Ready for deployment)</option>
                    <option value="REVIEW">REVIEW (Under administrative review)</option>
                    <option value="DRAFT">DRAFT (Hidden from callers)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campus Website</label>
                  <input
                    type="url"
                    placeholder="https://svkm-dhule.ac.in"
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
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
                  {selectedSchool ? 'Save Changes' : 'Create & Publish School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
