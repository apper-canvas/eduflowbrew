import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageHeader from '@/components/organisms/PageHeader';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import studentService from '@/services/api/studentService';
import batchService from '@/services/api/batchService';

const AddStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    parentPhone: '',
    address: '',
    batchIds: [],
    totalFees: 0
  });
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    calculateTotalFees();
  }, [formData.batchIds, batches]);

  const loadBatches = async () => {
    try {
      const data = await batchService.getAll();
      setBatches(data);
    } catch (err) {
      toast.error('Failed to load batches');
    } finally {
      setBatchesLoading(false);
    }
  };

  const calculateTotalFees = () => {
    const total = formData.batchIds.reduce((sum, batchId) => {
      const batch = batches.find(b => b.Id === batchId);
      return sum + (batch ? batch.fees : 0);
    }, 0);
    
    setFormData(prev => ({ ...prev, totalFees: total }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBatchToggle = (batchId) => {
    const newBatchIds = formData.batchIds.includes(batchId)
      ? formData.batchIds.filter(id => id !== batchId)
      : [...formData.batchIds, batchId];
    
    handleChange('batchIds', newBatchIds);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = 'Parent phone number is required';
    } else if (!/^\d{10}$/.test(formData.parentPhone.replace(/\D/g, ''))) {
      newErrors.parentPhone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (formData.batchIds.length === 0) {
      newErrors.batchIds = 'Please select at least one batch';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const studentData = {
        ...formData,
        feeStatus: 'pending'
      };
      
      const newStudent = await studentService.create(studentData);
      
      // Update batch enrollment counts
      for (const batchId of formData.batchIds) {
        const batch = batches.find(b => b.Id === batchId);
        if (batch) {
          await batchService.updateEnrollment(batchId, batch.enrolledCount + 1);
        }
      }
      
      toast.success('Student added successfully!');
      navigate(`/students/${newStudent.Id}`);
    } catch (error) {
      toast.error('Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/students');
  };

  return (
    <div>
      <PageHeader
        title="Add Student"
        subtitle="Enroll a new student in your coaching center"
        icon="UserPlus"
        breadcrumbs={['Students', 'Add Student']}
      />
      
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter student's full name"
                  error={errors.name}
                  icon="User"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                  error={errors.email}
                  icon="Mail"
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  error={errors.phone}
                  icon="Phone"
                />
                
                <Input
                  label="Parent's Phone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => handleChange('parentPhone', e.target.value)}
                  placeholder="Enter parent's phone number"
                  error={errors.parentPhone}
                  icon="Phone"
                />
              </div>
              
              <div className="mt-4">
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter complete address"
                  error={errors.address}
                  icon="MapPin"
                />
              </div>
            </div>

            {/* Batch Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Batch Enrollment</h2>
              
              {batchesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {batches.map((batch) => (
                      <motion.div
                        key={batch.Id}
                        whileHover={{ scale: 1.01 }}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.batchIds.includes(batch.Id)
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleBatchToggle(batch.Id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              formData.batchIds.includes(batch.Id)
                                ? 'border-primary bg-primary'
                                : 'border-gray-300'
                            }`}>
                              {formData.batchIds.includes(batch.Id) && (
                                <ApperIcon name="Check" size={12} className="text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{batch.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <ApperIcon name="BookOpen" size={14} />
                                  {batch.subject}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ApperIcon name="Clock" size={14} />
                                  {batch.schedule.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ApperIcon name="MapPin" size={14} />
                                  {batch.room}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">₹{batch.fees.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">
                              {batch.enrolledCount}/{batch.capacity} enrolled
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {errors.batchIds && (
                    <p className="text-sm text-error mt-2">{errors.batchIds}</p>
                  )}
                </>
              )}
            </div>

            {/* Fee Summary */}
            {formData.batchIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <h3 className="font-medium text-gray-900 mb-3">Fee Summary</h3>
                <div className="space-y-2">
                  {formData.batchIds.map(batchId => {
                    const batch = batches.find(b => b.Id === batchId);
                    return batch ? (
                      <div key={batchId} className="flex justify-between text-sm">
                        <span className="text-gray-600">{batch.name}</span>
                        <span className="font-medium">₹{batch.fees.toLocaleString()}</span>
                      </div>
                    ) : null;
                  })}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Fees</span>
                    <span className="text-primary">₹{formData.totalFees.toLocaleString()}</span>
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
                icon="UserPlus"
              >
                Add Student
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddStudent;