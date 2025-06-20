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
import PaymentModal from '@/components/organisms/PaymentModal';
import ApperIcon from '@/components/ApperIcon';
import studentService from '@/services/api/studentService';
import batchService from '@/services/api/batchService';
import paymentService from '@/services/api/paymentService';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [batches, setBatches] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false });

  useEffect(() => {
    loadStudentData();
  }, [id]);

  const loadStudentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [studentData, allBatches, studentPayments] = await Promise.all([
        studentService.getById(id),
        batchService.getAll(),
        paymentService.getByStudent(id)
      ]);

      setStudent(studentData);
      
      // Get student's batches
      const studentBatches = allBatches.filter(batch => 
        studentData.batchIds.includes(batch.Id)
      );
      setBatches(studentBatches);
      setPayments(studentPayments);
      
    } catch (err) {
      setError(err.message || 'Failed to load student details');
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = () => {
    setPaymentModal({ isOpen: true });
  };

  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false });
  };

  const handlePaymentSuccess = () => {
    loadStudentData(); // Refresh all data
  };

  const handleDeleteStudent = async () => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      await studentService.delete(id);
      toast.success('Student deleted successfully');
      navigate('/students');
    } catch (err) {
      toast.error('Failed to delete student');
    }
  };

  const paymentColumns = [
    {
      key: 'receiptNo',
      label: 'Receipt',
      render: (value) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => (
        <span className="font-semibold text-secondary">₹{value.toLocaleString()}</span>
      )
    },
    {
      key: 'mode',
      label: 'Payment Mode',
      render: (value) => (
        <Badge variant="info" size="sm">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (value) => format(new Date(value), 'dd MMM yyyy')
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (value) => (
        <span className="text-sm text-gray-600">{value || '-'}</span>
      )
    }
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Student Details"
          breadcrumbs={['Students', 'Details']}
        />
        <div className="p-6">
          <SkeletonLoader count={3} />
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div>
        <PageHeader
          title="Student Details"
          breadcrumbs={['Students', 'Details']}
        />
        <div className="p-6">
          <ErrorState
            title="Student not found"
            message={error || 'The student you are looking for does not exist.'}
            onRetry={loadStudentData}
          />
        </div>
      </div>
    );
  }

  const dueAmount = student.totalFees - student.paidAmount;
  const paymentProgress = (student.paidAmount / student.totalFees) * 100;

  const headerActions = [
    {
      label: 'Record Payment',
      icon: 'CreditCard',
      onClick: openPaymentModal,
      variant: 'primary'
    },
    {
      label: 'Edit Student',
      icon: 'Edit',
      onClick: () => navigate(`/students/${id}/edit`),
      variant: 'outline'
    }
  ];

  return (
    <div>
      <PageHeader
        title={student.name}
        subtitle="Student profile and payment history"
        icon="User"
        breadcrumbs={['Students', student.name]}
        actions={headerActions}
      />
      
      <div className="p-6 space-y-6">
        {/* Student Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900 font-medium">{student.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{student.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 font-mono">{student.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Parent Phone</label>
                  <p className="text-gray-900 font-mono">{student.parentPhone}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{student.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Join Date</label>
                  <p className="text-gray-900">{format(new Date(student.joinDate), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={student.status === 'active' ? 'success' : 'error'}>
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Fee Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Fees</span>
                <span className="font-semibold text-gray-900">₹{student.totalFees.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid Amount</span>
                <span className="font-semibold text-secondary">₹{student.paidAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Due Amount</span>
                <span className={`font-semibold ${dueAmount > 0 ? 'text-error' : 'text-success'}`}>
                  ₹{dueAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Payment Progress</span>
                  <span className="text-sm font-medium">{Math.round(paymentProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-secondary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${paymentProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2">
                <Badge 
                  variant={
                    student.feeStatus === 'paid' ? 'success' : 
                    student.feeStatus === 'pending' ? 'warning' : 'error'
                  }
                  className="w-full justify-center"
                >
                  {student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1)}
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enrolled Batches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Batches</h2>
          
          {batches.length === 0 ? (
            <EmptyState
              title="No batches enrolled"
              description="This student is not enrolled in any batches yet."
              icon="BookOpen"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((batch) => (
                <motion.div
                  key={batch.Id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer"
                  onClick={() => navigate(`/batches/${batch.Id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{batch.name}</h3>
                    <Badge variant="primary" size="sm">{batch.subject}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Clock" size={14} />
                      <span>{batch.schedule.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApperIcon name="MapPin" size={14} />
                      <span>{batch.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Calendar" size={14} />
                      <span>{batch.schedule.days.join(', ')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
              {dueAmount > 0 && (
                <Button
                  variant="primary"
                  icon="Plus"
                  onClick={openPaymentModal}
                >
                  Record Payment
                </Button>
              )}
            </div>
          </div>
          
          {payments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No payment history"
                description="Payment records will appear here once payments are made."
                icon="CreditCard"
                actionLabel={dueAmount > 0 ? "Record Payment" : undefined}
                onAction={dueAmount > 0 ? openPaymentModal : undefined}
              />
            </div>
          ) : (
            <DataTable
              data={payments}
              columns={paymentColumns}
              className="border-0 shadow-none"
            />
          )}
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-red-200 p-6"
        >
          <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Delete Student</h3>
              <p className="text-sm text-gray-600">
                Permanently delete this student and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="danger"
              icon="Trash2"
              onClick={handleDeleteStudent}
            >
              Delete Student
            </Button>
          </div>
        </motion.div>
      </div>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={closePaymentModal}
        student={student}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default StudentDetail;