require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const Discipline = require('./models/Discipline');

async function setupDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado à MongoDB\n');

        console.log('=== SETUP CURSOS COM UC ===\n');

        // Dados base: curso -> UC que devem ter
        const cursosDados = [
            {
                nome: 'Redes de Computadores',
                uc: ['Redes I', 'Redes II', 'Segurança em Redes', 'Administração de Redes']
            },
            {
                nome: 'Engenharia de Teste',
                uc: ['Teste de Software', 'Qualidade de Software', 'Automatização de Testes', 'Gestão de Defeitos']
            },
            {
                nome: 'Engenharia de Teste 2',
                uc: ['Teste de Software Avançado', 'Teste de Performance', 'Teste de Segurança']
            },
            {
                nome: 'Engenharia de Teste 3',
                uc: ['Teste Manual', 'Teste Automatizado', 'Relatórios de Teste']
            },
            {
                nome: 'Curso Debug',
                uc: ['Debug I', 'Debug II', 'Troubleshooting']
            },
            {
                nome: 'redes',
                uc: ['Conceitos de Redes', 'Protocolos de Rede', 'Infraestrutura de Rede']
            }
        ];

        // 1. Criar/obter disciplinas
        console.log('📚 Criando Unidades Curriculares...\n');
        const disciplinaMap = {};
        
        for (const curso of cursosDados) {
            for (const ucNome of curso.uc) {
                if (!disciplinaMap[ucNome]) {
                    const disciplina = await Discipline.findOneAndUpdate(
                        { nome_disciplina: ucNome },
                        { nome_disciplina: ucNome },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                    disciplinaMap[ucNome] = disciplina._id.toString();
                    console.log(`✅ UC criada: ${ucNome}`);
                }
            }
        }

        // 2. Atualizar cursos com as UC
        console.log('\n📝 Associando UC aos Cursos...\n');
        
        for (const cursoDado of cursosDados) {
            const curso = await Course.findOne({ nome_cursos: cursoDado.nome });
            if (!curso) {
                console.log(`⚠️  Curso não encontrado: ${cursoDado.nome}`);
                continue;
            }

            const disciplinaIds = cursoDado.uc.map(uc => disciplinaMap[uc]);
            
            await Course.findByIdAndUpdate(
                curso._id,
                { disciplinas: disciplinaIds },
                { new: true }
            );

            console.log(`✅ ${cursoDado.nome}`);
            console.log(`   UC: ${cursoDado.uc.join(', ')}\n`);
        }

        // 3. Verificação final
        console.log('=== VERIFICAÇÃO FINAL ===\n');
        const cursosFinal = await Course.find().populate('disciplinas').sort('nome_cursos');
        
        for (const curso of cursosFinal) {
            const numUC = curso.disciplinas ? curso.disciplinas.length : 0;
            const status = numUC > 0 ? '✅' : '❌';
            console.log(`${status} ${curso.nome_cursos}`);
            console.log(`   UC: ${numUC}`);
            if (numUC > 0) {
                console.log(`   Disciplinas: ${curso.disciplinas.map(d => d.nome_disciplina).join(', ')}`);
            }
            console.log('');
        }

        console.log('✨ Setup concluído com sucesso!');
        await mongoose.connection.close();

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

setupDatabase();
