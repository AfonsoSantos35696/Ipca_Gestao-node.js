const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    discipline: { type: mongoose.Schema.Types.ObjectId, ref: 'Discipline', required: true },
    ano: { type: Number, required: true },
    semestre: { type: Number, required: true }
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);