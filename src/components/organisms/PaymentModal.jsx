import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import paymentService from '@/services/api/paymentService';

const PaymentModal = ({ isOpen, onClose, student, onPaymentSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    mode: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentModes = [
    { value: 'cash', label: 'Cash' },
    { value: 'online', label: 'Online Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'card', label: 'Card Payment' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0';
    }
    
    if (!formData.mode) {
      newErrors.mode = 'Payment mode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payment = await paymentService.create({
        studentId: student.Id,
        amount: parseFloat(formData.amount),
        mode: formData.mode,
        remarks: formData.remarks
      });

      toast.success(`Payment recorded successfully! Receipt: ${payment.receiptNo}`);
      onPaymentSuccess?.(payment);
      onClose();
      
      // Reset form
      setFormData({ amount: '', mode: '', remarks: '' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const dueAmount = student ? student.totalFees - student.paidAmount : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                    <ApperIcon name="CreditCard" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Record Payment</h2>
                    <p className="text-sm text-gray-600">{student?.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              {student && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Fees:</span>
                      <span className="font-medium text-gray-900 ml-2">
                        ₹{student.totalFees.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Paid:</span>
                      <span className="font-medium text-gray-900 ml-2">
                        ₹{student.paidAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Due Amount:</span>
                      <span className="font-semibold text-error ml-2">
                        ₹{dueAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Payment Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="Enter amount"
                  error={errors.amount}
                  icon="IndianRupee"
                />

                <Select
                  label="Payment Mode"
                  value={formData.mode}
                  onChange={(e) => handleChange('mode', e.target.value)}
                  options={paymentModes}
                  error={errors.mode}
                  placeholder="Select payment mode"
                />

                <Input
                  label="Remarks (Optional)"
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  placeholder="Add any notes about this payment"
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    loading={loading}
                    icon="CreditCard"
                  >
                    Record Payment
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;