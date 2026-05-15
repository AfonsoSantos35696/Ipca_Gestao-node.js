const mongoose = require('mongoose');

const enrollmentRequestSchema = new mongoose.Schema({
    id_aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id_curso: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    data_pedido: { type: Date, default: Date.now },
    estado: { type: String, enum: ['pendente', 'aprovado', 'rejeitado'], default: 'pendente' },
    observacoes: { type: String },
    id_funcionario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    data_decisao: { type: Date }
});

module.exports = mongoose.model('EnrollmentRequest', enrollmentRequestSchema);