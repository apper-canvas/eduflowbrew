import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageHeader from '@/components/organisms/PageHeader';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import batchService from '@/services/api/batchService';
import teacherService from '@/services/api/teacherService';

const Batches = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBatches, setFilteredBatches] = useState([]);

  useEffect(() => {
    loadBatches();
    loadTeachers();
  }, []);

  useEffect(() => {
    filterBatches();
  }, [batches, searchQuery]);

  const loadBatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await batchService.getAll();
      setBatches(data);
    } catch (err) {
      setError(err.message || 'Failed to load batches');
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch (err) {
      console.error('Failed to load teachers:', err);
    }
  };

  const filterBatches = () => {
    if (!searchQuery) {
      setFilteredBatches(batches);
      return;
    }

    const filtered = batches.filter(batch =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.room.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBatches(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.Id === teacherId);
    return teacher ? teacher.name : 'Not Assigned';
  };

  const getCapacityColor = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const headerActions = [
    {
      label: 'Add Batch',
      icon: 'Plus',
      onClick: () => navigate('/batches/add'),
      variant: 'primary'
    }
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Batches"
          subtitle="Manage class batches and schedules"
          icon="BookOpen"
        />
        <div className="p-6">
          <SkeletonLoader count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Batches"
          subtitle="Manage class batches and schedules"
          icon="BookOpen"
        />
        <div className="p-6">
          <ErrorState
            title="Failed to load batches"
            message={error}
            onRetry={loadBatches}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Batches"
        subtitle={`${batches.length} active batches`}
        icon="BookOpen"
        actions={headerActions}
        onSearch={handleSearch}
        searchPlaceholder="Search batches..."
      />
      
      <div className="p-6">
        {filteredBatches.length === 0 && batches.length === 0 ? (
          <EmptyState
            title="No batches created"
            description="Start organizing your classes by creating your first batch."
            icon="BookOpen"
            actionLabel="Create Batch"
            onAction={() => navigate('/batches/add')}
          />
        ) : filteredBatches.length === 0 && searchQuery ? (
          <EmptyState
            title="No batches found"
            description={`No batches match your search for "${searchQuery}"`}
            icon="Search"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredBatches.map((batch, index) => (
              <motion.div
                key={batch.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/batches/${batch.Id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{batch.name}</h3>
                    <p className="text-sm text-gray-600">{getTeacherName(batch.teacherId)}</p>
                  </div>
                  <Badge variant="primary" size="sm">
                    {batch.subject}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="Calendar" size={16} />
                    <span>{batch.schedule.days.join(', ')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="Clock" size={16} />
                    <span>{batch.schedule.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="MapPin" size={16} />
                    <span>{batch.room}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ApperIcon name="Users" size={16} />
                      <span>{batch.enrolledCount}/{batch.capacity} students</span>
                    </div>
                    <Badge 
                      variant={getCapacityColor(batch.enrolledCount, batch.capacity)}
                      size="sm"
                    >
                      {Math.round((batch.enrolledCount / batch.capacity) * 100)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ApperIcon name="IndianRupee" size={16} />
                      <span>₹{batch.fees.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/batches/${batch.Id}/edit`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon="Eye"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/batches/${batch.Id}`);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        batch.enrolledCount >= batch.capacity * 0.9 ? 'bg-error' :
                        batch.enrolledCount >= batch.capacity * 0.75 ? 'bg-warning' :
                        'bg-success'
                      }`}
                      style={{ width: `${Math.min((batch.enrolledCount / batch.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Batches;