const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

let uri = `mongodb+srv://raghavanijesh2422:XTvkSNmHB906Ogxi@cluster0.in52z84.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const Conference = require('./models/Conference');
const User = require('./models/User');
const Bookings = require('./models/Bookings');

const addUserToWaitlist = async (conferenceName, userId) => {
  try {
    const result = await Conference.updateOne(
      { Name: conferenceName },
      { $addToSet: { waitList: userId } }
    );

    if (result.matchedCount === 0) {
      console.log('Conference not found.');
    } else {
      console.log('User added to waitlist successfully.');
    }
  } catch (error) {
    console.error('Error adding user to waitlist:', error);
  }
};

const removeUserFromWaitlist = async (conferenceName, userId) => {
  try {
    const result = await Conference.updateOne(
      { Name: conferenceName },
      { $pull: { waitList: userId } } // Remove userId from the waitList array
    );

    if (result.matchedCount === 0) {
      console.log('Conference not found.');
    } else if (result.modifiedCount === 0) {
      console.log('User was not in the waitlist.');
      return res.status(400).json({message : "User was not in the waitlist."})
    } else {
      console.log('User removed from waitlist successfully.');
    }
  } catch (error) {
    console.error('Error removing user from waitlist:', error);
  }
};
const validateConferenceData = async(data) => {
  const errors = [];
  const found = await Conference.findOne({
    Name: data.Name 
  });
  if(found) {
    errors.push('A conference with same name already exists');
  }
  if (!/^[a-zA-Z0-9\s]+$/.test(data.Name)) {
    errors.push('Name must be an alphanumeric string with spaces allowed.');
  }

  if (!/^[a-zA-Z0-9\s]+$/.test(data.Location)) {
    errors.push('Location must be an alphanumeric string with spaces allowed.');
  }

  const topicsArray = data.Topics.split(',').map(topic => topic.trim());
  if (topicsArray.length > 10) {
    errors.push('Maximum of 10 topics allowed.');
  }
  if (!topicsArray.every(topic => /^[a-zA-Z0-9\s]+$/.test(topic))) {
    errors.push('Each topic must be an alphanumeric string with spaces allowed.');
  }

  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    errors.push('Start time and end time must be valid date strings.');
  } else {
    if (startTime >= endTime) {
      errors.push('Start time must be before end time.');
    }
    const duration = (endTime - startTime) / (1000 * 60 * 60);
    if (duration > 12) {
      errors.push('Duration should not exceed 12 hours.');
    }
  }
  if (!Number.isInteger(data.availableSlots) || data.availableSlots <= 0) {
    errors.push('Available slots must be an integer greater than 0.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateUserData = async(data) => {
  const errors = [];
  const found = await User.findOne({
    UserId: data.UserId 
  });
  if(found) {
    errors.push('A User with same UserID already exists');
  }

  const topicsArray = data.Topics.split(',').map(topic => topic.trim());
  if (topicsArray.length > 50) {
    errors.push('Maximum of 50 topics allowed.');
  }
  if (!topicsArray.every(topic => /^[a-zA-Z0-9\s]+$/.test(topic))) {
    errors.push('Each topic must be an alphanumeric string with spaces allowed.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateBookingData = async(data) => {
  const errors = [];
  const user = await User.findOne({
    UserId: data.UserId 
  });
  if(!user) {
    errors.push("User doesn't exist");
  }
  const conference = await Conference.findOne({
    Name: data.Name 
  });
  if(!conference) {
    errors.push("Conference doesn't exist");
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};

const isOverlapping = (start1, end1, start2, end2) => {
  return (start1 < end2 && start2 < end1);
};

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.post("/add-conference", async (req, res) => {
  const validationResult = await validateConferenceData(req.body);
  if(validationResult.isValid === true){
      const newConference = new Conference({
        Name: req.body.Name,
        Location: req.body.Location,
        Topics: req.body.Topics,
        availableSlots: req.body.availableSlots,
        startTime: req.body.startTime,
        endTime: req.body.endTime
      });
      newConference
        .save()
        .then(() => {
          console.log("Conference Added to the database");
        })
        .catch((error) => {
          console.log(error);
        });
      res.status(200).json({message : "Conference Successfully added"});
  } else {
    console.log('Validation errors:', validationResult.errors); 
    return res.status(400).json({errors : validationResult.errors});
  }
});

app.post("/add-user", async (req, res) => {
  const validationResult = await validateUserData(req.body);
  if(validationResult.isValid === true){
      const newUser = new User({
        UserId: req.body.UserId,
        Topics : req.body.Topics      
      });
      newUser
        .save()
        .then(() => {
          console.log("User Added to the database");
        })
        .catch((error) => {
          console.log(error);
        });
      res.status(200).json({message : "User Successfully added"});
  } else {
    console.log('Validation errors:', validationResult.errors); 
    return res.status(400).json({errors : validationResult.errors});
  }
});


app.post("/add-booking", async (req, res) => {
  const validationResult = await validateBookingData(req.body);
  if(validationResult.isValid === true){
    const conference = await Conference.findOne({
      Name: req.body.Name
    });
    statuss = "Active"
    const userBookings = await Bookings.find({
      UserId: req.body.UserId
    });
    const conferenceStartTime = new Date(conference.startTime);
    const conferenceEndTime = new Date(conference.endTime);
    userBookings.forEach(booking => {
      const bookingStartTime = new Date(booking.startTime);
      const bookingEndTime = new Date(booking.endTime);
      if (isOverlapping(bookingStartTime, bookingEndTime, conferenceStartTime, conferenceEndTime)) {
        console.log('Found an overlapping booking:', booking);
        return res.status(400).json({message : "User already has a conference booked at the same time"});
      }
    });
    if(conference.availableSlots == 0){
      statuss = "Waiting";
    }
    const newBooking = new Bookings({
      UserId: req.body.UserId,
      Name : req.body.Name,
      status : statuss
    });
    await newBooking
    .save()
    .then(() => {
      console.log("Booking Added to the database");
    })
    .catch((error) => {
      console.log(error);
    });
    if(conference.availableSlots == 0){      
      await addUserToWaitlist(req.body.Name, req.body.UserId);
      return res.status(400).json({message : "Conference already full adding you to the waitlist"});
    }   
    conference.availableSlots -= 1;
    await conference.save();
    return res.status(200).json({bookingId : newBooking._id , message : "Booking Successful"});
  } else {
    console.log("Validation Errors:", validationResult.errors);
    return res.status(400).json({errors : validationResult.errors});
  }
});

app.post('/cancel-booking', async(req,res) =>{
  const Booking = await Bookings.findOne({_id : req.body.bookingId});
  if(Booking.status === "cancelled"){
    return res.status(400).json({message : "Booking Already cancelled"});
  } else if(Booking.status === "Waiting"){
    await removeUserFromWaitlist(Booking.Name, Booking.UserId);
    Booking.status = "cancelled";
    await Booking.save();
    return res.status(200).json({message : "Booking Cancelled"});
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});