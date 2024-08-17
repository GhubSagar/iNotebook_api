
//this is connection to database

const mongoose= require('mongoose');
const mongoURI= 'mongodb://localhost:27017/inotebook'



const connectToMongo= async ()=>{
      try {await mongoose.connect(mongoURI);
    console.log("Connected to Mongo Successfully!");
  } catch (error) {
    console.error("Error connecting to Mongo:", error);
    // Handle connection errors gracefully (e.g., process.exit())
}
};

module.exports = connectToMongo;
