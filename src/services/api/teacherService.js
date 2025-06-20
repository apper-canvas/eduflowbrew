import teachersData from '@/services/mockData/teachers.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let teachers = [...teachersData];

export const teacherService = {
  async getAll() {
    await delay(300);
    return [...teachers];
  },

  async getById(id) {
    await delay(200);
    const teacher = teachers.find(t => t.Id === parseInt(id, 10));
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    return { ...teacher };
  },

  async create(teacherData) {
    await delay(400);
    const newTeacher = {
      Id: Math.max(...teachers.map(t => t.Id), 0) + 1,
      ...teacherData,
      joinDate: new Date().toISOString().split('T')[0],
      batchIds: []
    };
    teachers.push(newTeacher);
    return { ...newTeacher };
  },

  async update(id, teacherData) {
    await delay(300);
    const index = teachers.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Teacher not found');
    }
    const updatedTeacher = {
      ...teachers[index],
      ...teacherData,
      Id: teachers[index].Id // Prevent Id modification
    };
    teachers[index] = updatedTeacher;
    return { ...updatedTeacher };
  },

  async delete(id) {
    await delay(300);
    const index = teachers.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Teacher not found');
    }
    teachers.splice(index, 1);
    return { success: true };
  },

  async getBySubject(subject) {
    await delay(200);
    const subjectTeachers = teachers.filter(t => 
      t.subjects.includes(subject)
    );
    return [...subjectTeachers];
  }
};

export default teacherService;