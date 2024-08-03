Ensure you have all the files int the same folder
models should have Conference, User and Booking 

run npm install int the terminal to run the code


nodemon Server.js will start the execution.

Use Postman to send requests to https://localhost in port 5000 
Ex : "http://localhost:5000/cancel-booking"

use the following paths for the particular usecases:
/add-conference : Example Input 
"{
    "Name": "MOTORQ",
    "Location": "Warangal",
    "Topics": "Nijeh, HAH",
    "availableSlots": 1,
    "startTime": "2024-08-03T11:34",
    "endTime": "2024-08-03T12:34"
}"     


/add-user : Example Input 
"{
    "UserId" : "DIleepe",
    "Topics" : "NIjesh, Raghava"
}"   

   
/add-booking : Example Input
"{
    "UserId": "DIleepe",
    "Name": "MOTORQ"
}"    



/cancel-booking : Example Input 
"{
    "bookingId": "66ae3a1f31f8d6eb130b3667",
    "UserId": "DIleepe"
}"     




every edge case in the above usecase has been handled as in, starttime being after endtime, UserId not being unique etc.

