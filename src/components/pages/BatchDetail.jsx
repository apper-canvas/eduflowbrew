import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import PageHeader from '@/components/organisms/PageHeader';
import DataTable from '@/components/molecules/DataTable';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import batchService from '@/services/api/batchService';
import teacherService from '@/services/api/teacherService';
import studentService from '@/services/api/studentService';

const BatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBatchData();
  }, [id]);

  const loadBatchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [batchData, allStudents] = await Promise.all([
        batchService.getById(id),
        studentService.getAll()
      ]);

      setBatch(batchData);
      
      // Get batch students
      const batchStudents = allStudents.filter(student => 
        student.batchIds.includes(parseInt(id, 10))
      );
      setStudents(batchStudents);
      
      // Get teacher info
      if (batchData.teacherId) {
        try {
          const teacherData = await teacherService.getById(batchData.teacherId);
          setTeacher(teacherData);
        } catch (err) {
          console.error('Failed to load teacher:', err);
        }
      }
      
    } catch (err) {
      setError(err.message || 'Failed to load batch details');
      toast.error('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      return;
    }

    try {
      await batchService.delete(id);
      toast.success('Batch deleted successfully');
      navigate('/batches');
    } catch (err) {
      toast.error('Failed to delete batch');
    }
  };

  const studentColumns = [
    {
      key: 'name',
      label: 'Student Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-medium text-sm">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'feeStatus',
      label: 'Fee Status',
      render: (value) => (
        <Badge 
          variant={
            value === 'paid' ? 'success' : 
            value === 'pending' ? 'warning' : 'error'
          }
          size="sm"
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'paidAmount',
      label: 'Amount Paid',
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium text-gray-900">₹{value.toLocaleString()}</div>
          <div className="text-sm text-gray-500">
            of ₹{row.totalFees.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <Button
          size="sm"
          variant="ghost"
          icon="Eye"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/students/${row.Id}`);
          }}
        >
          View
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Batch Details"
          breadcrumbs={['Batches', 'Details']}
        />
        <div className="p-6">
          <SkeletonLoader count={3} />
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div>
        <PageHeader
          title="Batch Details"
          breadcrumbs={['Batches', 'Details']}
        />
        <div className="p-6">
          <ErrorState
            title="Batch not found"
            message={error || 'The batch you are looking for does not exist.'}
            onRetry={loadBatchData}
          />
        </div>
      </div>
    );
  }

  const capacityPercentage = (batch.enrolledCount / batch.capacity) * 100;
  const headerActions = [
    {
      label: 'Edit Batch',
      icon: 'Edit',
      onClick: () => navigate(`/batches/${id}/edit`),
      variant: 'outline'
    }
  ];

  return (
    <div>
      <PageHeader
        title={batch.name}
        subtitle={`${batch.subject} batch details and student roster`}
        icon="BookOpen"
        breadcrumbs={['Batches', batch.name]}
        actions={headerActions}
      />
      
      <div className="p-6 space-y-6">
        {/* Batch Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Batch Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Batch Name</label>
                  <p className="text-gray-900 font-medium">{batch.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <Badge variant="primary">{batch.subject}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teacher</label>
                  <p className="text-gray-900">{teacher ? teacher.name : 'Not Assigned'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Room</label>
                  <p className="text-gray-900">{batch.room}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Schedule</label>
                  <div className="space-y-1">
                    <p className="text-gray-900 font-medium">{batch.schedule.time}</p>
                    <p className="text-sm text-gray-600">{batch.schedule.days.join(', ')}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-gray-900">
                    {format(new Date(batch.startDate), 'dd MMM yyyy')} - {format(new Date(batch.endDate), 'dd MMM yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fees</label>
                  <p className="text-gray-900 font-semibold">₹{batch.fees.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enrollment Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Stats</h2>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {batch.enrolledCount}
                </div>
                <div className="text-sm text-gray-600">Students Enrolled</div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Capacity</span>
                  <span className="text-sm font-medium">{batch.enrolledCount}/{batch.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      capacityPercentage >= 90 ? 'bg-error' :
                      capacityPercentage >= 75 ? 'bg-warning' :
                      'bg-success'
                    }`}
                    style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2">
                  <span className={`text-sm font-medium ${
                    capacityPercentage >= 90 ? 'text-error' :
                    capacityPercentage >= 75 ? 'text-warning' :
                    'text-success'
                  }`}>
                    {Math.round(capacityPercentage)}% Full
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Seats</span>
                  <span className="font-medium text-gray-900">
                    {batch.capacity - batch.enrolledCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-medium text-secondary">
                    ₹{(batch.enrolledCount * batch.fees).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enrolled Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Enrolled Students</h2>
              <Button
                variant="primary"
                icon="Plus"
                onClick={() => navigate('/students/add')}
              >
                Add Student
              </Button>
            </div>
          </div>
          
          {students.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No students enrolled"
                description="This batch doesn't have any students yet. Start by adding students to this batch."
                icon="Users"
                actionLabel="Add Student"
                onAction={() => navigate('/students/add')}
              />
            </div>
          ) : (
            <DataTable
              data={students}
              columns={studentColumns}
              onRowClick={(student) => navigate(`/students/${student.Id}`)}
              className="border-0 shadow-none"
            />
          )}
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-red-200 p-6"
        >
          <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Delete Batch</h3>
              <p className="text-sm text-gray-600">
                Permanently delete this batch and remove it from all student records. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="danger"
              icon="Trash2"
              onClick={handleDeleteBatch}
            >
              Delete Batch
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BatchDetail;