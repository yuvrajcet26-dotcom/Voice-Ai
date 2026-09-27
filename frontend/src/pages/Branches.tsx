import React, { useState, useEffect } from 'react';
import {
  GitFork, Plus, Edit3, Trash2, Search, Filter, BookOpen,
  Briefcase, Award, Users, IndianRupee
} from 'lucide-react';
import { api } from '../services/api';
import { Branch, Course, AcademicStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Branches: React.FC = () => {
  const { role } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    course_id: '',
    name: '',
    code: '',
    description: '',
    eligibility: '',
    intake: 60,
    fees: '₹ 1,80,000 / year',
    duration: '4 Years',
    facilities: 'Robotics lab, High voltage test bed, IoT research center',
    placement_info: 'Average package ₹ 6.5 LPA, Highest ₹ 18 LPA (TCS, Infosys, L&T, Siemens)',
    status: 'PUBLISHED' as AcademicStatus
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bData, cData] = await Promise.all([api.branches.list(), api.courses.list()]);
      setBranches(bData);
      setCourses(cData);
      if (cData.length > 0 && !formData.course_id) {
        setFormData(prev => ({ ...prev, course_id: cData[0].id }));
      }
    } catch (e) {
      console.warn('Using default branch data:', e);
      setBranches([
        {
          id: 'branch-ee',
          course_id: 'course-btech',
          name: 'Electrical Engineering',
          code: 'EE',
          description: 'Power systems, renewable energy, electric vehicle architectures and embedded microcontrollers.',
          eligibility: '10+2 with PCM (50%) + CET/JEE',
          intake: 60,
          fees: '₹ 1,80,000 per annum',
          duration: '4 Years',
          facilities: 'High Voltage Laboratory, Power Electronics & Drives Lab, EV Charging Simulation Cell',
          placement_info: 'Top Recruiters: L&T, Siemens, Tata Power, Schneider Electric. Highest: ₹ 14 LPA.',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z',
          updated_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'branch-cse',
          course_id: 'course-btech',
          name: 'Computer Engineering',
          code: 'CE',
          description: 'Algorithms, cloud computing, cyber security, full-stack software development and distributed systems.',
          eligibility: '10+2 with PCM (50%) + CET/JEE',
          intake: 120,
          fees: '₹ 2,00,000 per annum',
          duration: '4 Years',
          facilities: 'High Performance Computing Cluster, NVIDIA AI Lab, Cloud Virtualization Center',
          placement_info: 'Top Recruiters: Google, Microsoft, Amazon, Infosys, Capgemini. Highest: ₹ 24 LPA.',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z',
          updated_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'branch-it',
          course_id: 'course-btech',
          name: 'Information Technology',
          code: 'IT',
          description: 'Enterprise networks, DevOps, data analytics, cloud architecture, and web systems.',
          eligibility: '10+2 with PCM (50%) + CET/JEE',
          intake: 60,
          fees: '₹ 1,90,000 per annum',
          duration: '4 Years',
          facilities: 'Cisco Networking Lab, Enterprise Cloud Suite',
          placement_info: 'Average: ₹ 7.2 LPA. Top Recruiters: Accenture, Cognizant, Wipro.',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z',
          updated_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'branch-mech',
          course_id: 'course-btech',
          name: 'Mechanical Engineering',
          code: 'ME',
          description: 'Robotics, thermal systems, CAD/CAM automation, and additive manufacturing.',
          eligibility: '10+2 with PCM (50%) + CET/JEE',
          intake: 60,
          fees: '₹ 1,75,000 per annum',
          duration: '4 Years',
          facilities: 'CNC Machining Center, Mechatronics & Robotics Lab, Wind Tunnel',
          placement_info: 'Top Recruiters: Mahindra, Bharat Forge, Tata Motors. Highest: ₹ 12 LPA.',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z',
          updated_at: '2026-01-10T10:00:00Z'
        }
      ]);
      setCourses([
        { id: 'course-btech', school_id: 'school-stme', name: 'Bachelor of Technology (B.Tech)', code: 'B.Tech', intake: 300, status: 'PUBLISHED', created_at: '', updated_at: '' },
        { id: 'course-bba', school_id: 'school-soc', name: 'Bachelor of Business Administration (BBA)', code: 'BBA', intake: 120, status: 'PUBLISHED', created_at: '', updated_at: '' },
        { id: 'course-bpharm', school_id: 'school-spo', name: 'Bachelor of Pharmacy (B.Pharm)', code: 'B.Pharm', intake: 100, status: 'PUBLISHED', created_at: '', updated_at: '' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedBranch(null);
    setFormData({
      course_id: courses[0]?.id || '',
      name: '',
      code: '',
      description: '',
      eligibility: '10+2 with relevant subjects (min 50%)',
      intake: 60,
      fees: '₹ 1,80,000 / year',
      duration: '4 Years',
      facilities: 'State of the art labs & simulation units',
      placement_info: 'Dedicated campus placement support',
      status: 'PUBLISHED'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      course_id: branch.course_id,
      name: branch.name,
      code: branch.code,
      description: branch.description || '',
      eligibility: branch.eligibility || '',
      intake: branch.intake || 60,
      fees: branch.fees || '',
      duration: branch.duration || '4 Years',
      facilities: branch.facilities || '',
      placement_info: branch.placement_info || '',
      status: branch.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedBranch) {
        await api.branches.update(selectedBranch.id, formData);
      } else {
        await api.branches.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this branch?')) {
      try {
        await api.branches.delete(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const filtered = branches.filter(b => {
    const matchesCourse = courseFilter === 'ALL' || b.course_id === courseFilter;
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Specializations & Branch Management</h2>
          <p className="text-sm text-slate-500">
            Configure branches under STME, SOC, and SPO with seat capacity, placement stats, and lab facilities.
          </p>
        </div>

        {(role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            + Add Branch
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search branch name (Electrical, Computer, AI)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Filter by Course:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Programs</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(branch => {
          const course = courses.find(c => c.id === branch.course_id);

          return (
            <div
              key={branch.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {course ? course.code : 'Program'}
                      </span>
                      <StatusBadge status={branch.status} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{branch.name}</h3>
                    <p className="text-xs text-slate-500">Branch Code: {branch.code}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {branch.description}
                </p>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">SANCTIONED INTAKE</span>
                    <span className="font-bold text-slate-800">{branch.intake} Seats</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">TUITION FEE</span>
                    <span className="font-bold text-slate-800">{branch.fees || 'Norms apply'}</span>
                  </div>
                </div>

                {branch.facilities && (
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block text-[11px] mb-0.5">Labs & Research Facilities:</span>
                    <span className="text-slate-500">{branch.facilities}</span>
                  </div>
                )}

                {branch.placement_info && (
                  <div className="text-xs bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-emerald-900">
                    <span className="font-semibold block text-[11px] mb-0.5 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Placement Highlights:
                    </span>
                    <span>{branch.placement_info}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {(role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(branch)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {role === 'MAIN_ADMIN' && (
                    <button
                      type="button"
                      onClick={() => handleDelete(branch.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {selectedBranch ? 'Edit Branch' : 'Add New Branch / Specialization'}
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
                <label className="block font-semibold text-slate-700 mb-1">Parent Course *</label>
                <select
                  required
                  value={formData.course_id}
                  onChange={e => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Electrical Engineering"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="EE"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Intake Seats</label>
                  <input
                    type="number"
                    value={formData.intake}
                    onChange={e => setFormData({ ...formData, intake: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fees</label>
                  <input
                    type="text"
                    placeholder="₹ 1,80,000 / year"
                    value={formData.fees}
                    onChange={e => setFormData({ ...formData, fees: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Curriculum overview and focus..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Laboratories & Facilities</label>
                <input
                  type="text"
                  placeholder="High voltage lab, CAD stations, microcontrollers..."
                  value={formData.facilities}
                  onChange={e => setFormData({ ...formData, facilities: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Placement Details</label>
                <input
                  type="text"
                  placeholder="Recruiters, average and highest packages..."
                  value={formData.placement_info}
                  onChange={e => setFormData({ ...formData, placement_info: e.target.value })}
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
                  {selectedBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
