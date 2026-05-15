const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nota: { type: Number, min: 0, max: 20 }
});

const gradeSheetSchema = new mongoose.Schema({
  id_disciplina: { type: mongoose.Schema.Types.ObjectId, ref: 'Discipline', required: true },
  ano_letivo: { type: String, required: true },
  epoca: { type: String, required: true },
  id_funcionario_criador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data_criacao: { type: Date, default: Date.now },
  notas: [gradeSchema]
});

module.exports = mongoose.model('GradeSheet', gradeSheetSchema);