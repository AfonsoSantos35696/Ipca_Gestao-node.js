const mongoose = require('mongoose');

const disciplineSchema = new mongoose.Schema({
  nome_disciplina: { type: String, required: true, unique: true, trim: true },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  }
});

module.exports = mongoose.model('Discipline', disciplineSchema);