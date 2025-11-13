const mongoose = require('mongoose')
let db;
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();
const URL = process.env.URL;
const PORT = process.env.PORT;
const mongooseOptions = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 5,  // Maintain a minimum of 5 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};
 const connection = async()=> {
    try {
         db=await mongoose.connect(URL,mongooseOptions)
        console.log("connected to database")
        return db
    }

    catch (err) {
        console.log("error in connecting database", err)
    }
}

connection()

module.exports = db
