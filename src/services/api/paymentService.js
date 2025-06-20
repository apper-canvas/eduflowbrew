import paymentsData from '@/services/mockData/payments.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let payments = [...paymentsData];

export const paymentService = {
  async getAll() {
    await delay(300);
    return [...payments];
  },

  async getById(id) {
    await delay(200);
    const payment = payments.find(p => p.Id === parseInt(id, 10));
    if (!payment) {
      throw new Error('Payment not found');
    }
    return { ...payment };
  },

  async create(paymentData) {
    await delay(400);
    const receiptNo = `RCP${String(Math.max(...payments.map(p => parseInt(p.receiptNo.slice(3), 10)), 0) + 1).padStart(3, '0')}`;
    const newPayment = {
      Id: Math.max(...payments.map(p => p.Id), 0) + 1,
      ...paymentData,
      date: new Date().toISOString().split('T')[0],
      receiptNo
    };
    payments.push(newPayment);
    return { ...newPayment };
  },

  async update(id, paymentData) {
    await delay(300);
    const index = payments.findIndex(p => p.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Payment not found');
    }
    const updatedPayment = {
      ...payments[index],
      ...paymentData,
      Id: payments[index].Id // Prevent Id modification
    };
    payments[index] = updatedPayment;
    return { ...updatedPayment };
  },

  async delete(id) {
    await delay(300);
    const index = payments.findIndex(p => p.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Payment not found');
    }
    payments.splice(index, 1);
    return { success: true };
  },

  async getByStudent(studentId) {
    await delay(200);
    const studentPayments = payments.filter(p => 
      p.studentId === parseInt(studentId, 10)
    );
    return [...studentPayments];
  },

  async getPaymentSummary() {
    await delay(200);
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = payments.length;
    const recentPayments = payments
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    return {
      totalCollected,
      totalPayments,
      recentPayments: [...recentPayments]
    };
  }
};

export default paymentService;