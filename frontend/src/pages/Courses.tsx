import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Edit3, Trash2, CheckCircle, Search, Filter,
  Building, Clock, Users, IndianRupee, FileText
} from 'lucide-react';
import { api } from '../services/api';
import { Course, School, AcademicStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Courses: React.FC = () => {
  const { role } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolFilter, setSchoolFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    school_id: '',
    name: '',
    code: '',
    description: '',
    eligibility: '',
    duration: '4 Years (8 Semesters)',
    intake: 120,
    fees: '₹ 1,75,000 / year',
    admission_process: 'MHT-CET / JEE Main / Direct SVKM Entrance',
    status: 'PUBLISHED' as AcademicStatus
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cData, sData] = await Promise.all([api.courses.list(), api.schools.list()]);
      setCourses(cData);
      setSchools(sData);
      if (sData.length > 0 && !formData.school_id) {
        setFormData(prev => ({ ...prev, school_id: sData[0].id }));
      }
    } catch (e) {
      console.warn('Using default course mock data:', e);
      setCourses([
        {
          id: 'course-btech',
          school_id: 'school-stme',
          name: 'Bachelor of Technology (B.Tech)',
          code: 'B.Tech',
          description: '4-year intensive undergraduate engineering program with specialized industry tracks.',
          eligibility: '10+2 with Physics, Mathematics & Chemistry/Comp with min 50% marks + MHT-CET / JEE score.',
          duration: '4 Years',
          intake: 300,
          fees: '₹ 1,80,000 per annum',
          admission_process: 'CAP Rounds via DTE Maharashtra or Institute Level Quota',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z',
          updated_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'course-mtech',
          school_id: 'school-stme',
          name: 'Master of Technology (M.Tech)',
          code: 'M.Tech',
          description: 'Postgraduate research and applied engineering in Computer & Data Engineering.',
          eligibility: 'B.E. / B.Tech in relevant branch with min 50% + valid GATE score.',
          duration: '2 Years',
          intake: 36,
          fees: '₹ 1,40,000 per annum',
          admission_process: 'GATE / Institute entrance exam',
          status: 'PUBLISHED',
          created_at: '2026-01-10T10:00:00Z',
          updated_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'course-bba',
          school_id: 'school-soc',
          name: 'Bachelor of Business Administration (BBA)',
          code: 'BBA',
          description: '3-year modern business management degree preparing corporate leaders.',
          eligibility: '10+2 in any stream (Commerce, Science, Arts) with min 50% marks.',
          duration: '3 Years',
          intake: 120,
          fees: '₹ 1,10,000 per annum',
          admission_process: 'Merit-based admission on 12th standard marks',
          status: 'PUBLISHED',
          created_at: '2026-01-12T11:00:00Z',
          updated_at: '2026-01-12T11:00:00Z'
        },
        {
          id: 'course-bpharm',
          school_id: 'school-spo',
          name: 'Bachelor of Pharmacy (B.Pharm)',
          code: 'B.Pharm',
          description: '4-year PCI and AICTE approved pharmaceutical sciences program.',
          eligibility: '10+2 with Physics & Chemistry along with Math/Biology (min 45%) + MHT-CET.',
          duration: '4 Years',
          intake: 100,
          fees: '₹ 1,50,000 per annum',
          admission_process: 'Government Centralized Admission Process (CAP)',
          status: 'PUBLISHED',
          created_at: '2026-01-15T09:30:00Z',
          updated_at: '2026-01-15T09:30:00Z'
        }
      ]);
      setSchools([
        { id: 'school-stme', name: 'School of Technology Management & Engineering', code: 'STME', short_name: 'STME', status: 'PUBLISHED', created_at: '', updated_at: '' },
        { id: 'school-soc', name: 'School of Commerce', code: 'SOC', short_name: 'SOC', status: 'PUBLISHED', created_at: '', updated_at: '' },
        { id: 'school-spo', name: 'School of Pharmacy & Technology Management', code: 'SPO', short_name: 'SPO', status: 'PUBLISHED', created_at: '', updated_at: '' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedCourse(null);
    setFormData({
      school_id: schools[0]?.id || '',
      name: '',
      code: '',
      description: '',
      eligibility: '',
      duration: '4 Years',
      intake: 60,
      fees: '₹ 1,50,000 / year',
      admission_process: 'Entrance exam / Merit',
      status: 'PUBLISHED'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      school_id: course.school_id,
      name: course.name,
      code: course.code,
      description: course.description || '',
      eligibility: course.eligibility || '',
      duration: course.duration || '4 Years',
      intake: course.intake || 60,
      fees: course.fees || '',
      admission_process: course.admission_process || '',
      status: course.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCourse) {
        await api.courses.update(selectedCourse.id, formData);
      } else {
        await api.courses.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this course?')) {
      try {
        await api.courses.delete(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const filtered = courses.filter(c => {
    const matchesSchool = schoolFilter === 'ALL' || c.school_id === schoolFilter;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSchool && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">University Course Management</h2>
          <p className="text-sm text-slate-500">
            Define degree and diploma programs, annual intake, fee structures, and admission criteria.
          </p>
        </div>

        {(role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            + Add Course
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search course name or code (B.Tech, BBA)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Filter by School:</span>
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Schools</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(course => {
          const school = schools.find(s => s.id === course.school_id);

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {school ? school.code : 'SVKM'}
                      </span>
                      <StatusBadge status={course.status} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{course.name}</h3>
                    <p className="text-xs text-slate-500">Program Code: {course.code}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {course.description || 'Program offered at SVKM Dhule campus.'}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">DURATION</span>
                      <span className="font-semibold text-slate-800">{course.duration || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">INTAKE CAPACITY</span>
                      <span className="font-semibold text-slate-800">{course.intake} Seats</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <IndianRupee className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">ANNUAL TUITION FEE</span>
                      <span className="font-bold text-slate-800">{course.fees || 'As per norms'}</span>
                    </div>
                  </div>
                </div>

                {course.eligibility && (
                  <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    <strong className="text-amber-900 font-semibold block text-[11px] mb-0.5">Eligibility:</strong>
                    <span>{course.eligibility}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {(role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(course)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {role === 'MAIN_ADMIN' && (
                    <button
                      type="button"
                      onClick={() => handleDelete(course.id)}
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

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {selectedCourse ? 'Edit Course Details' : 'Add New Course'}
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
                <label className="block font-semibold text-slate-700 mb-1">Parent School *</label>
                <select
                  required
                  value={formData.school_id}
                  onChange={e => setFormData({ ...formData, school_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bachelor of Technology"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="B.Tech"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="4 Years"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
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
                    placeholder="₹ 1,80,000 / yr"
                    value={formData.fees}
                    onChange={e => setFormData({ ...formData, fees: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                <textarea
                  rows={2}
                  placeholder="Min percentage, required subjects, entrance test..."
                  value={formData.eligibility}
                  onChange={e => setFormData({ ...formData, eligibility: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Process</label>
                <input
                  type="text"
                  placeholder="CAP rounds, direct institute quota, or online form..."
                  value={formData.admission_process}
                  onChange={e => setFormData({ ...formData, admission_process: e.target.value })}
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
                  {selectedCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
