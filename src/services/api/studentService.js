import studentsData from '@/services/mockData/students.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let students = [...studentsData];

export const studentService = {
  async getAll() {
    await delay(300);
    return [...students];
  },

  async getById(id) {
    await delay(200);
    const student = students.find(s => s.Id === parseInt(id, 10));
    if (!student) {
      throw new Error('Student not found');
    }
    return { ...student };
  },

  async create(studentData) {
    await delay(400);
    const newStudent = {
      Id: Math.max(...students.map(s => s.Id), 0) + 1,
      ...studentData,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      paidAmount: 0
    };
    students.push(newStudent);
    return { ...newStudent };
  },

  async update(id, studentData) {
    await delay(300);
    const index = students.findIndex(s => s.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Student not found');
    }
    const updatedStudent = {
      ...students[index],
      ...studentData,
      Id: students[index].Id // Prevent Id modification
    };
    students[index] = updatedStudent;
    return { ...updatedStudent };
  },

  async delete(id) {
    await delay(300);
    const index = students.findIndex(s => s.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Student not found');
    }
    students.splice(index, 1);
    return { success: true };
  },

  async getByBatch(batchId) {
    await delay(200);
    const batchStudents = students.filter(s => 
      s.batchIds.includes(parseInt(batchId, 10))
    );
    return [...batchStudents];
  },

  async searchStudents(query) {
    await delay(200);
    const lowerQuery = query.toLowerCase();
    const filtered = students.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.email.toLowerCase().includes(lowerQuery) ||
      s.phone.includes(query)
    );
    return [...filtered];
  }
};

export default studentService;