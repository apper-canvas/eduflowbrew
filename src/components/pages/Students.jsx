import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageHeader from '@/components/organisms/PageHeader';
import DataTable from '@/components/molecules/DataTable';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import PaymentModal from '@/components/organisms/PaymentModal';
import studentService from '@/services/api/studentService';
import batchService from '@/services/api/batchService';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, student: null });

  useEffect(() => {
    loadStudents();
    loadBatches();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to load students');
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async () => {
    try {
      const data = await batchService.getAll();
      setBatches(data);
    } catch (err) {
      console.error('Failed to load batches:', err);
    }
  };

  const filterStudents = () => {
    if (!searchQuery) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery)
    );
    setFilteredStudents(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleRowClick = (student) => {
    navigate(`/students/${student.Id}`);
  };

  const openPaymentModal = (student) => {
    setPaymentModal({ isOpen: true, student });
  };

  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false, student: null });
  };

  const handlePaymentSuccess = () => {
    loadStudents(); // Refresh student data
  };

  const getBatchNames = (batchIds) => {
    return batchIds.map(id => {
      const batch = batches.find(b => b.Id === id);
      return batch ? batch.name : 'Unknown';
    }).join(', ');
  };

  const columns = [
    {
      key: 'name',
      label: 'Student Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
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
      key: 'batchIds',
      label: 'Batches',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.length > 0 ? (
            value.slice(0, 2).map((batchId, index) => {
              const batch = batches.find(b => b.Id === batchId);
              return (
                <Badge key={index} variant="primary" size="sm">
                  {batch?.name || 'Unknown'}
                </Badge>
              );
            })
          ) : (
            <span className="text-gray-400 text-sm">No batches</span>
          )}
          {value.length > 2 && (
            <Badge variant="default" size="sm">
              +{value.length - 2}
            </Badge>
          )}
        </div>
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
      key: 'totalFees',
      label: 'Total Fees',
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium text-gray-900">₹{value.toLocaleString()}</div>
          <div className="text-sm text-gray-500">
            Paid: ₹{row.paidAmount.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex gap-2">
          {row.feeStatus !== 'paid' && (
            <Button
              size="sm"
              variant="primary"
              icon="CreditCard"
              onClick={(e) => {
                e.stopPropagation();
                openPaymentModal(row);
              }}
            >
              Pay
            </Button>
          )}
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
        </div>
      )
    }
  ];

  const headerActions = [
    {
      label: 'Add Student',
      icon: 'Plus',
      onClick: () => navigate('/students/add'),
      variant: 'primary'
    }
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Students"
          subtitle="Manage student enrollment and information"
          icon="Users"
        />
        <div className="p-6">
          <SkeletonLoader count={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Students"
          subtitle="Manage student enrollment and information"
          icon="Users"
        />
        <div className="p-6">
          <ErrorState
            title="Failed to load students"
            message={error}
            onRetry={loadStudents}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${students.length} students enrolled`}
        icon="Users"
        actions={headerActions}
        onSearch={handleSearch}
        searchPlaceholder="Search students..."
      />
      
      <div className="p-6">
        {filteredStudents.length === 0 && students.length === 0 ? (
          <EmptyState
            title="No students enrolled"
            description="Start building your student database by adding your first student."
            icon="Users"
            actionLabel="Add Student"
            onAction={() => navigate('/students/add')}
          />
        ) : filteredStudents.length === 0 && searchQuery ? (
          <EmptyState
            title="No students found"
            description={`No students match your search for "${searchQuery}"`}
            icon="Search"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DataTable
              data={filteredStudents}
              columns={columns}
              onRowClick={handleRowClick}
              loading={loading}
            />
          </motion.div>
        )}
      </div>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={closePaymentModal}
        student={paymentModal.student}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Students;