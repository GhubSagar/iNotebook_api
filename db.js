
//this is connection to database

const mongoose= require('mongoose');
const mongoURI= process.env.MONGO_URI

const connectToMongo= async ()=>{
      try {await mongoose.connect(mongoURI, {
      useNewUrlParser: true, // Ensure correct parsing of MongoDB connection strings
      useUnifiedTopology: true, // Use new MongoDB driver connection management engine
    });
    console.log("Connected to Mongo Successfully!");
  } catch (error) {
    console.error("Error connecting to Mongo:", error);
    // Handle connection errors gracefully (e.g., process.exit())
}
};

module.exports = connectToMongo;
