import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, BookOpen, Award, Calendar } from 'lucide-react';
import PageHeader from '@/components/organisms/PageHeader';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import { teacherService } from '@/services/api/teacherService';

function AddTeacher() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    subject: '',
    experience: '',
    joiningDate: '',
    address: '',
    emergencyContact: '',
    salary: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  const subjectOptions = [
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'economics', label: 'Economics' },
    { value: 'accountancy', label: 'Accountancy' },
    { value: 'business_studies', label: 'Business Studies' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualification is required';
    }

    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    } else if (isNaN(formData.experience) || formData.experience < 0) {
      newErrors.experience = 'Experience must be a valid number';
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await teacherService.createTeacher({
        ...formData,
        experience: parseInt(formData.experience),
        salary: formData.salary ? parseFloat(formData.salary) : null
      });
      
      navigate('/teachers');
    } catch (error) {
      console.error('Error creating teacher:', error);
      setErrors({ submit: 'Failed to create teacher. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Teacher"
        description="Add a new teacher to your institute"
        action={
          <Button
            variant="outline"
            onClick={() => navigate('/teachers')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Teachers
          </Button>
        }
      />

      <div className="bg-white rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errors.submit}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="Enter teacher's full name"
                required
              />
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                placeholder="teacher@example.com"
                required
              />
              
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                placeholder="1234567890"
                required
              />
              
              <Input
                label="Emergency Contact"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Emergency contact number"
              />
            </div>

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Complete address"
              multiline
              rows={2}
            />
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Professional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Qualification"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                error={errors.qualification}
                placeholder="e.g., M.Sc Mathematics, B.Tech"
                required
              />
              
              <Select
                label="Subject Specialization"
                value={formData.subject}
                onChange={(value) => handleInputChange('subject', value)}
                options={subjectOptions}
                error={errors.subject}
                placeholder="Select subject"
                required
              />
              
              <Input
                label="Experience (Years)"
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                error={errors.experience}
                placeholder="Years of teaching experience"
                min="0"
                required
              />
              
              <Input
                label="Joining Date"
                type="date"
                value={formData.joiningDate}
                onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                error={errors.joiningDate}
                required
              />
              
              <Input
                label="Monthly Salary (Optional)"
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                placeholder="Monthly salary amount"
                min="0"
              />
              
              <Select
                label="Status"
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/teachers')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Add Teacher
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTeacher;