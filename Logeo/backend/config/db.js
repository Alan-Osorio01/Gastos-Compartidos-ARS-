// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("❌ MONGO_URI no está definido en el archivo .env");
        }
        await mongoose.connect(uri);
        console.log('✅ MongoDB conectado');
    } catch (err) {
        console.error('Error al conectar con MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
