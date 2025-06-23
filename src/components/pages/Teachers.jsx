import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Mail, Phone, Plus, Search, Users } from "lucide-react";
import teacherService from "@/services/api/teacherService";
import SkeletonLoader from "@/components/molecules/SkeletonLoader";
import EmptyState from "@/components/molecules/EmptyState";
import DataTable from "@/components/molecules/DataTable";
import SearchBar from "@/components/molecules/SearchBar";
import StatCard from "@/components/molecules/StatCard";
import PageHeader from "@/components/organisms/PageHeader";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

function Teachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTeachers();
  }, []);

const loadTeachers = async () => {
    try {
      const data = await teacherService.getAll();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    if (!teacher) return false;
    const name = teacher.name || '';
    const email = teacher.email || '';
    const subject = teacher.subject || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           subject.toLowerCase().includes(searchTerm.toLowerCase());
  });

const teacherStats = {
    totalTeachers: teachers.length,
    activeTeachers: teachers.filter(t => t?.status === 'active').length,
    totalSubjects: [...new Set(teachers.map(t => t?.subject).filter(Boolean))].length,
    avgExperience: teachers.length > 0 ? 
      Math.round(teachers.reduce((sum, t) => sum + (t?.experience || 0), 0) / teachers.length) : 0
  };

  const columns = [
    {
      key: 'name',
      label: 'Teacher',
render: (teacher) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-medium text-sm">
              {teacher?.name ? teacher.name.split(' ').map(n => n[0] || '').join('') : '?'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{teacher?.name || 'Unknown'}</div>
            <div className="text-sm text-gray-500">{teacher?.qualification || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
render: (teacher) => (
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Mail className="w-3 h-3" />
            {teacher?.email || 'No email'}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
            <Phone className="w-3 h-3" />
            {teacher?.phone || 'No phone'}
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
render: (teacher) => (
        <Badge color="blue">{teacher?.subject || 'No subject'}</Badge>
      )
    },
    {
      key: 'experience',
      label: 'Experience',
      render: (teacher) => (
        <span className="text-gray-900">{teacher?.experience || 0} years</span>
      )
    },
    {
      key: 'batches',
      label: 'Batches',
      render: (teacher) => (
        <span className="text-gray-600">{teacher?.batchCount || 0} batches</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (teacher) => (
        <Badge color={teacher?.status === 'active' ? 'green' : 'gray'}>
          {teacher?.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description="Manage teaching staff and their assignments"
        action={
          <Button 
            onClick={() => navigate('/teachers/add')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Teachers"
          value={teacherStats.totalTeachers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Teachers"
          value={teacherStats.activeTeachers}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Subjects Taught"
          value={teacherStats.totalSubjects}
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Avg. Experience"
          value={`${teacherStats.avgExperience} years`}
          icon={BookOpen}
          color="orange"
        />
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <SearchBar
          placeholder="Search teachers by name, email, or subject..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredTeachers.length === 0 && !loading ? (
          <EmptyState
            icon="👨‍🏫"
            title="No Teachers Found"
            description={searchTerm ? "No teachers match your search criteria." : "Get started by adding your first teacher."}
            action={
              <Button onClick={() => navigate('/teachers/add')}>
                Add First Teacher
              </Button>
            }
          />
        ) : (
          <DataTable
            data={filteredTeachers}
            columns={columns}
            emptyMessage="No teachers found"
          />
        )}
      </div>
    </div>
  );
}

export default Teachers;