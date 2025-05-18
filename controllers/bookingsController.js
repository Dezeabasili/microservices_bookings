const Booking = require('../models/bookings.js')
// const User = require('./../models/users')
// const Room = require('./../models/rooms')
const createError = require('../utils/error')
const amqplib = require('amqplib');
const rabbitMQ_connection = require('../utils/producer')

const exchangeName = "topic_logs";
const exchangeType = 'topic';
const queue_name = "bookings_queue"
const routing_key = ['bookings.usersBookings.deleteMany']
let channel_bookings_producer;

const sendTask = async () => {
  const connection = await rabbitMQ_connection()
  channel_bookings_producer = await connection.createChannel();
  await channel_bookings_producer.assertExchange(exchangeName, exchangeType, {durable: false});
  console.log("Connected to rabbitMQ bookingServices")
}

sendTask();


let channel_bookings_consumer;
const binding_keys = ['auth.usersBooking.deleteMany', 'hotels.hotelsBookings.deleteMany', 'hotels.roomsBookings.deleteMany', 'auth.changeName.updateMany', 'hotels.hotelName.updateMany']

const consumeTask = async () => {
  // const connection = await amqplib.connect('amqp://localhost');
  const connection = await rabbitMQ_connection();
  channel_bookings_consumer = await connection.createChannel();
  await channel_bookings_consumer.assertExchange(exchangeName, exchangeType, {durable: false});
  await channel_bookings_consumer.assertQueue(queue_name, {durable: false});

  channel_bookings_consumer.prefetch(1);
  //console.log("Waiting for messages in bookings_queue");

  binding_keys.forEach((key) => {
    channel_bookings_consumer.bindQueue(queue_name, exchangeName, key);
  });

  channel_bookings_consumer.consume(queue_name, async msg => {
    const product = JSON.parse(msg.content.toString());
    if (msg.fields.routingKey == 'auth.usersBooking.deleteMany') {
      await Booking.deleteMany(product);
      //console.log(`routing key: ${msg.fields.routingKey}`);
      //console.log("Received product: ", JSON.stringify(product));
      // //console.log("Received product: ", JSON.stringify(msg));
    }
    if (msg.fields.routingKey == 'hotels.hotelsBookings.deleteMany') {
      await Booking.deleteMany(product);
      //console.log(`routing key: ${msg.fields.routingKey}`);
      //console.log("Received product: ", JSON.stringify(product));
      // //console.log("Received product: ", JSON.stringify(msg));
    }
    if (msg.fields.routingKey == 'hotels.roomsBookings.deleteMany') {
      await Booking.deleteMany(product);
      // check if there are other rooms and adjust their availability dates
      //console.log(`routing key: ${msg.fields.routingKey}`);
      //console.log("Received product: ", JSON.stringify(product));
      // //console.log("Received product: ", JSON.stringify(msg));
    }
    
    if (msg.fields.routingKey == 'auth.changeName.updateMany') {
      await Booking.updateMany({user: product.ref_number}, {$set: {user_name: product.name}} );
      //console.log(`routing key: ${msg.fields.routingKey}`);
      //console.log("Received product: ", JSON.stringify(product));
      // //console.log("Received product: ", JSON.stringify(msg));
    }

    if (msg.fields.routingKey == 'hotels.hotelName.updateMany') {
      await Booking.updateMany({hotel: product.ref_number}, {$set: {hotel_name: product.name}} );
      //console.log(`routing key: ${msg.fields.routingKey}`);
      //console.log("Received product: ", JSON.stringify(product));
      // //console.log("Received product: ", JSON.stringify(msg));
    }
    
      channel_bookings_consumer.ack(msg)
  }, {noAck: false})
}

consumeTask();




const getAllBookings = async (req, res, next) => {
  try {
      let queryObj = {}
      if (req.query.hotel_id) {
          queryObj.hotel = req.query.hotel_id
      }
      const bookings = await Booking.find(queryObj)
      if (!bookings) return next(createError('fail', 404, 'this user has no bookings'))

      res.status(200).json({
          number: bookings.length,
          data: bookings
      })

  } catch(err) {
      next(err)
  }
}

const getMyBookings = async (req, res, next) => {
  try {
      const bookings = await Booking.find({user: req.userInfo.id})
      // if (!bookings) return next(createError('fail', 404, 'this user has no bookings'))
      // //console.log('bookings: ', bookings)

      res.status(200).json({
          number: bookings.length,
          data: bookings
      })

  } catch(err) {
      next(err)
  }
}


const findCustomerBooking = async (req, res, next) => {
  try {
      let bookings = [];
      if (req.body.booking_id) {
         const userbooking = await Booking.findById(req.body.booking_id)
         if (!userbooking) return next(createError('fail', 404, 'the booking does not exist'))
         bookings.push(userbooking)

      } 
      // else if (req.body.email) {
      //     const user = await User.findOne({email: req.body.email})
      //     if (!user) return next(createError('fail', 404, 'this user email does not exist'))
      //     // find all the bookings for this user
      //     bookings = await Booking.find({user: user._id})
      //     if (!bookings) return next(createError('fail', 404, 'the booking does not exist'))
      // }     

      res.status(200).json({data: bookings})

  } catch (err) {

      next(err)

  }
}

const deleteBooking = async (req, res, next) => {
  try {

      const booking = await Booking.findById(req.params.booking_id)
      if (!booking) return next(createError('fail', 404, 'this booking does not exist'))
      // //console.log('booking: ', booking)

      channel_bookings_producer.publish(exchangeName, routing_key[0], Buffer.from(JSON.stringify(booking)));
      booking.bookingDetails.forEach(async roomInfo => {
        

          // const roomStyle = await Room.findOne({ "roomNumbers._id": roomInfo.room_id })
          // // //console.log('roomStyle: ', roomStyle)
          // const room = (roomStyle.roomNumbers)?.find(({ _id }) => _id == roomInfo.room_id)
          // // //console.log('room: ', room)
          // const convertedDates = room.unavailableDates?.map(eachDate => eachDate.getTime())

          // const indexOfCheckinDate = convertedDates?.indexOf((roomInfo.checkin_date).getTime())

          // if (indexOfCheckinDate >= 0) {
          //     room.unavailableDates.splice(indexOfCheckinDate, roomInfo.number_of_nights)
          // }


          // roomStyle.roomNumbers = roomStyle.roomNumbers?.map((roomNumber) => {
          //     if (roomNumber._id == roomInfo.room_id) {
          //         return {
          //             ...roomNumber,
          //             unavailableDates: [...room.unavailableDates]
          //         }
          //     } else return roomNumber
          // })


          // await Room.updateOne(
          //     { "roomNumbers._id": roomInfo.room_id },
          //     {
          //       $set: {
          //         "roomNumbers.$.unavailableDates": room.unavailableDates,
          //       },
          //     }
          //   );




          //console.log("Inside delete booking")

          await Booking.findByIdAndUpdate(req.params.booking_id, {$set: {deleted: true}})


      })

      res.status(204).json('booking has been deleted')

  } catch (err) {

      next(err)

  }



}

module.exports = { 
  deleteBooking,
  getAllBookings,
  getMyBookings,
  findCustomerBooking
}