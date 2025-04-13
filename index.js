const mongoose = require('mongoose');

// Connect to MongoDB Atlas with improved timeout handling
mongoose.connect('mongodb+srv://gormi:3gUDpwBjpu6hCSbI@cluster0.nce4c7w.mongodb.net/student_management?retryWrites=true&w=majority', {
  serverSelectionTimeoutMS: 30000
})
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ Could not connect to MongoDB Atlas", err));

// Courses Collection Schema
const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  instructor: { type: String, required: true },
  credits: { type: Number, required: true }
});
courseSchema.index({ courseName: "text" });
const Course = mongoose.model('Course', courseSchema);

// Students Collection Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  createdAt: { type: Date, default: Date.now }
});
const Student = mongoose.model('Student', studentSchema);

// Create Sample Data (Student & Course)
async function createSampleData() {
  try {
    const course = new Course({
      courseName: "Math 101",
      instructor: "Dr. Sharma",
      credits: 4
    });
    await course.save();

    const student = new Student({
      name: "Gormi",
      email: "gormi@gmail.com",
      age: 20,
      enrolledCourses: [course._id]
    });
    await student.save();
    
    console.log("🎉 Sample student and course added successfully!");
  } catch (err) {
    console.error("❌ Error creating sample data", err);
  }
}

// Fetch All Students
async function fetchAllStudents() {
  try {
    const students = await Student.find();
    console.log("📋 All Students:", students);
  } catch (err) {
    console.error("❌ Error fetching all students", err);
  }
}

// Fetch Students with Enrolled Course Details using $lookup
async function fetchStudentsWithCourses() {
  try {
    const students = await Student.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses',
          foreignField: '_id',
          as: 'courses'
        }
      }
    ]);
    console.log("📚 Students with course details:", students);
  } catch (err) {
    console.error("❌ Error fetching students with course details", err);
  }
}

// Update Student Information (Change Name or Enrolled Courses)
async function updateStudentInfo() {
  try {
    const updatedStudent = await Student.updateOne(
      { email: "gormi@gmail.com" },
      { $set: { name: "Gormi" } }
    );
    console.log("✅ Student updated:", updatedStudent);
  } catch (err) {
    console.error("❌ Error updating student info", err);
  }
}

// Delete a Student by Email
async function deleteStudentByEmail(email) {
  try {
    const deletedStudent = await Student.deleteOne({ email });
    console.log("🗑️ Student deleted:", deletedStudent);
  } catch (err) {
    console.error("❌ Error deleting student", err);
  }
}

// Run the functions for demonstration
async function runApp() {
  const existingStudent = await Student.findOne({ email: "gormi@gmail.com" });
  if (existingStudent) {
    console.log('Student with this email already exists');
    return;
  }

  await createSampleData();
  await fetchAllStudents();
  await fetchStudentsWithCourses();
  
  await updateStudentInfo();
  await deleteStudentByEmail("gormi@gmail.com");
}

// Start the application
runApp();
