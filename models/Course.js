const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  nome_cursos: { type: String, required: true, trim: true },
  disciplinas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Discipline' }]
});

module.exports = mongoose.model('Course', courseSchema);