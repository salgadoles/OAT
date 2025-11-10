// create-professor-direct.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createProfessorDirect() {
    try {
        // Conectar ao MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oat-platform');
        console.log('📡 Conectado ao MongoDB...');

        // Definir schema temporário
        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            role: String,
            avatar: String,
            isActive: Boolean,
            createdAt: Date,
            updatedAt: Date
        });

        const User = mongoose.model('User', userSchema);

        // Verificar se já existe
        const existingProfessor = await User.findOne({ email: 'professor@oat.com' });
        if (existingProfessor) {
            console.log('✅ Professor já existe:');
            console.log('ID:', existingProfessor._id);
            console.log('Email:', existingProfessor.email);
            console.log('Role:', existingProfessor.role);
            return existingProfessor;
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash('professor123', 10);

        // Criar professor
        const professor = new User({
            name: 'Professor Teste',
            email: 'professor@oat.com',
            password: hashedPassword,
            role: 'professor',
            avatar: 'https://via.placeholder.com/150/0088cc/FFFFFF?text=P',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await professor.save();
        
        console.log('🎉 PROFESSOR CRIADO COM SUCESSO!');
        console.log('================================');
        console.log('📧 Email: professor@oat.com');
        console.log('🔑 Senha: professor123');
        console.log('👤 Role: professor');
        console.log('🆔 ID:', professor._id);
        console.log('================================');

        return professor;

    } catch (error) {
        console.error('💥 Erro ao criar professor:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createProfessorDirect();