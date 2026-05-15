const mongoose = require('mongoose');

const studentFormSchema = new mongoose.Schema({
    id_aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id_curso: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    nome_completo: { type: String, required: true },
    data_nascimento: { type: Date, required: true },
    morada: { type: String, required: true },
    telefone: { type: String, required: true },
    email_contato: { type: String, required: true },
    fotografia: { type: String },          // path to uploaded file
    estado: { type: String, enum: ['rascunho', 'submetida', 'aprovada', 'rejeitada'], default: 'rascunho' },
    data_submissao: { type: Date },
    observacoes_gestor: { type: String },
    id_gestor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    data_validacao: { type: Date }
});

module.exports = mongoose.model('StudentForm', studentFormSchema);