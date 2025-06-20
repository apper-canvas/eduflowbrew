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

const Schedule = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    { label: 'Morning', key: 'morning', hours: '06:00 - 12:00' },
    { label: 'Afternoon', key: 'afternoon', hours: '12:00 - 18:00' },
    { label: 'Evening', key: 'evening', hours: '18:00 - 22:00' }
  ];

  function getCurrentWeek() {
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return firstDay;
  }

  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [batchData, teacherData] = await Promise.all([
        batchService.getAll(),
        teacherService.getAll()
      ]);
      
      setBatches(batchData);
      setTeachers(teacherData);
    } catch (err) {
      setError(err.message || 'Failed to load schedule data');
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.Id === teacherId);
    return teacher ? teacher.name : 'Unassigned';
  };

  const getClassesForDay = (day) => {
    return batches.filter(batch => batch.schedule.days.includes(day));
  };

  const getClassesForDayAndTime = (day, timeSlot) => {
    return batches.filter(batch => 
      batch.schedule.days.includes(day) && 
      batch.schedule.timeSlot === timeSlot
    );
  };

  const getConflicts = () => {
    const conflicts = [];
    
    weekDays.forEach(day => {
      timeSlots.forEach(slot => {
        const classes = getClassesForDayAndTime(day, slot.key);
        
        // Check for room conflicts
        const roomConflicts = {};
        classes.forEach(batch => {
          if (!roomConflicts[batch.room]) {
            roomConflicts[batch.room] = [];
          }
          roomConflicts[batch.room].push(batch);
        });
        
        Object.entries(roomConflicts).forEach(([room, roomBatches]) => {
          if (roomBatches.length > 1) {
            conflicts.push({
              type: 'room',
              day,
              timeSlot: slot.key,
              room,
              batches: roomBatches
            });
          }
        });
        
        // Check for teacher conflicts
        const teacherConflicts = {};
        classes.forEach(batch => {
          if (!teacherConflicts[batch.teacherId]) {
            teacherConflicts[batch.teacherId] = [];
          }
          teacherConflicts[batch.teacherId].push(batch);
        });
        
        Object.entries(teacherConflicts).forEach(([teacherId, teacherBatches]) => {
          if (teacherBatches.length > 1) {
            conflicts.push({
              type: 'teacher',
              day,
              timeSlot: slot.key,
              teacherId: parseInt(teacherId, 10),
              batches: teacherBatches
            });
          }
        });
      });
    });
    
    return conflicts;
  };

  const conflicts = getConflicts();

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
          title="Schedule"
          subtitle="Weekly class schedule overview"
          icon="Calendar"
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
          title="Schedule"
          subtitle="Weekly class schedule overview"
          icon="Calendar"
        />
        <div className="p-6">
          <ErrorState
            title="Failed to load schedule"
            message={error}
            onRetry={loadScheduleData}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle={`Weekly overview with ${batches.length} active batches`}
        icon="Calendar"
        actions={headerActions}
      />
      
      <div className="p-6 space-y-6">
        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-error/10 border border-error/20 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <ApperIcon name="AlertTriangle" size={20} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-error mb-2">
                  Schedule Conflicts Detected ({conflicts.length})
                </h3>
                <div className="space-y-1 text-sm text-error">
                  {conflicts.slice(0, 3).map((conflict, index) => (
                    <div key={index}>
                      {conflict.type === 'room' ? (
                        <span>Room {conflict.room} is double-booked on {conflict.day}</span>
                      ) : (
                        <span>{getTeacherName(conflict.teacherId)} has overlapping classes on {conflict.day}</span>
                      )}
                    </div>
                  ))}
                  {conflicts.length > 3 && (
                    <div className="text-error/70">
                      ...and {conflicts.length - 3} more conflicts
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Schedule Grid */}
        {batches.length === 0 ? (
          <EmptyState
            title="No classes scheduled"
            description="Create your first batch to start scheduling classes."
            icon="Calendar"
            actionLabel="Create Batch"
            onAction={() => navigate('/batches/add')}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-32">
                      Time Slot
                    </th>
                    {weekDays.map((day) => (
                      <th key={day} className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeSlots.map((slot) => (
                    <tr key={slot.key} className="hover:bg-gray-50">
                      <td className="px-4 py-6 text-sm font-medium text-gray-900 border-r border-gray-200">
                        <div>
                          <div className="font-semibold">{slot.label}</div>
                          <div className="text-xs text-gray-500">{slot.hours}</div>
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const dayClasses = getClassesForDayAndTime(day, slot.key);
                        const hasConflict = conflicts.some(c => 
                          c.day === day && c.timeSlot === slot.key
                        );
                        
                        return (
                          <td key={day} className={`px-4 py-6 text-sm align-top ${
                            hasConflict ? 'bg-error/5' : ''
                          }`}>
                            <div className="space-y-2">
                              {dayClasses.map((batch) => (
                                <motion.div
                                  key={batch.Id}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => navigate(`/batches/${batch.Id}`)}
                                  className={`p-3 rounded-lg cursor-pointer transition-all shadow-sm border ${
                                    hasConflict 
                                      ? 'bg-error/10 border-error/20 hover:bg-error/20' 
                                      : 'bg-primary/10 border-primary/20 hover:bg-primary/20'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-1">
                                    <h4 className="font-medium text-gray-900 text-sm truncate">
                                      {batch.name}
                                    </h4>
                                    <Badge variant="primary" size="sm">
                                      {batch.subject}
                                    </Badge>
                                  </div>
                                  
                                  <div className="space-y-1 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <ApperIcon name="Clock" size={12} />
                                      <span>{batch.schedule.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <ApperIcon name="MapPin" size={12} />
                                      <span>{batch.room}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <ApperIcon name="User" size={12} />
                                      <span className="truncate">{getTeacherName(batch.teacherId)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <ApperIcon name="Users" size={12} />
                                      <span>{batch.enrolledCount}/{batch.capacity}</span>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                              
                              {dayClasses.length === 0 && (
                                <div className="h-20 flex items-center justify-center text-gray-400">
                                  <span className="text-xs">No classes</span>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Schedule Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <ApperIcon name="Calendar" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Total Classes</h3>
            </div>
            <div className="text-2xl font-bold text-primary mb-2">
              {batches.reduce((total, batch) => total + batch.schedule.days.length, 0)}
            </div>
            <p className="text-sm text-gray-600">Classes per week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                <ApperIcon name="Users" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Peak Capacity</h3>
            </div>
            <div className="text-2xl font-bold text-secondary mb-2">
              {Math.max(...batches.map(b => b.enrolledCount), 0)}
            </div>
            <p className="text-sm text-gray-600">Students in largest class</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                conflicts.length > 0 ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
              }`}>
                <ApperIcon name={conflicts.length > 0 ? "AlertTriangle" : "CheckCircle"} size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Conflicts</h3>
            </div>
            <div className={`text-2xl font-bold mb-2 ${
              conflicts.length > 0 ? 'text-error' : 'text-success'
            }`}>
              {conflicts.length}
            </div>
            <p className="text-sm text-gray-600">
              {conflicts.length === 0 ? 'No conflicts detected' : 'Scheduling conflicts'}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;