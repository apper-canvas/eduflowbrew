import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageHeader from '@/components/organisms/PageHeader';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import batchService from '@/services/api/batchService';
import teacherService from '@/services/api/teacherService';

const AddBatch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    teacherId: '',
    days: [],
    time: '',
    room: '',
    capacity: '',
    fees: '',
    startDate: '',
    endDate: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const subjects = [
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Biology', label: 'Biology' },
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Economics', label: 'Economics' },
    { value: 'Accounts', label: 'Accounts' },
    { value: 'Computer Science', label: 'Computer Science' }
  ];

  const weekDays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const timeSlots = [
    { value: 'morning', label: 'Morning (06:00 - 12:00)' },
    { value: 'afternoon', label: 'Afternoon (12:00 - 18:00)' },
    { value: 'evening', label: 'Evening (18:00 - 22:00)' }
  ];

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch (err) {
      toast.error('Failed to load teachers');
    } finally {
      setTeachersLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDayToggle = (day) => {
    const newDays = formData.days.includes(day)
      ? formData.days.filter(d => d !== day)
      : [...formData.days, day];
    
    handleChange('days', newDays);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Batch name is required';
    }
    
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.teacherId) {
      newErrors.teacherId = 'Teacher is required';
    }
    
    if (formData.days.length === 0) {
      newErrors.days = 'Please select at least one day';
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (!formData.room.trim()) {
      newErrors.room = 'Room is required';
    }
    
    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }
    
    if (!formData.fees || formData.fees <= 0) {
      newErrors.fees = 'Fees must be greater than 0';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const batchData = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        fees: parseFloat(formData.fees),
        teacherId: parseInt(formData.teacherId, 10),
        schedule: {
          days: formData.days,
          time: formData.time,
          timeSlot: getTimeSlot(formData.time)
        }
      };
      
      const newBatch = await batchService.create(batchData);
      toast.success('Batch created successfully!');
      navigate(`/batches/${newBatch.Id}`);
    } catch (error) {
      toast.error('Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const getTimeSlot = (time) => {
    const hour = parseInt(time.split(':')[0], 10);
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const handleCancel = () => {
    navigate('/batches');
  };

  const teacherOptions = teachers.map(teacher => ({
    value: teacher.Id.toString(),
    label: `${teacher.name} (${teacher.subjects.join(', ')})`
  }));

  return (
    <div>
      <PageHeader
        title="Create Batch"
        subtitle="Set up a new class batch with schedule and capacity"
        icon="Plus"
        breadcrumbs={['Batches', 'Create Batch']}
      />
      
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Batch Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Physics JEE Main"
                  error={errors.name}
                  icon="BookOpen"
                />
                
                <Select
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  options={subjects}
                  error={errors.subject}
                  placeholder="Select subject"
                />
                
                <div className="md:col-span-2">
                  <Select
                    label="Assigned Teacher"
                    value={formData.teacherId}
                    onChange={(e) => handleChange('teacherId', e.target.value)}
                    options={teacherOptions}
                    error={errors.teacherId}
                    placeholder={teachersLoading ? "Loading teachers..." : "Select teacher"}
                    disabled={teachersLoading}
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Days
                  </label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {weekDays.map((day) => (
                      <motion.button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 text-sm rounded-lg border transition-all ${
                          formData.days.includes(day)
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </motion.button>
                    ))}
                  </div>
                  {errors.days && (
                    <p className="text-sm text-error mt-1">{errors.days}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Time"
                    type="text"
                    value={formData.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    placeholder="e.g., 10:00-12:00"
                    error={errors.time}
                    icon="Clock"
                  />
                  
                  <Input
                    label="Room"
                    value={formData.room}
                    onChange={(e) => handleChange('room', e.target.value)}
                    placeholder="e.g., Room 101"
                    error={errors.room}
                    icon="MapPin"
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Fees */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Capacity & Fees</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', e.target.value)}
                  placeholder="Maximum students"
                  error={errors.capacity}
                  icon="Users"
                  min="1"
                />
                
                <Input
                  label="Fees"
                  type="number"
                  value={formData.fees}
                  onChange={(e) => handleChange('fees', e.target.value)}
                  placeholder="Batch fees"
                  error={errors.fees}
                  icon="IndianRupee"
                  min="0"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Duration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  error={errors.startDate}
                  icon="Calendar"
                />
                
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  error={errors.endDate}
                  icon="Calendar"
                />
              </div>
            </div>

            {/* Preview */}
            {formData.name && formData.subject && formData.days.length > 0 && formData.time && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <h3 className="font-medium text-gray-900 mb-3">Batch Preview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900 ml-2">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium text-gray-900 ml-2">{formData.subject}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Schedule:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {formData.days.join(', ')} at {formData.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {formData.capacity} students
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                loading={loading}
                icon="Plus"
              >
                Create Batch
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddBatch;