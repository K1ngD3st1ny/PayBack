const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (error.message && (error.message.includes('whitelist') || error.message.includes('IP'))) {
            console.error('Make sure your current IP address is whitelisted in your MongoDB Atlas Network Access settings.');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
