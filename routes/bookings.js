const express = require('express')
const router = express.Router()
const bookingsController = require('./../controllers/bookingsController')
const {stripeCheckout, stripeWebHook} = require('../controllers/stripeController')
const verifyAccessToken = require('./../middlewares/verifyJWT')
const verifyRoles = require('./../middlewares/verifyRoles')


router.get('/', verifyAccessToken, verifyRoles(2030), bookingsController.getAllBookings)

router.get('/mybookings',verifyAccessToken, verifyRoles(2010), bookingsController.getMyBookings)

router.post('/findbooking', verifyAccessToken, verifyRoles(2010, 2030), bookingsController.findCustomerBooking)




router.post('/stripe/create-checkout-session', verifyAccessToken, stripeCheckout)
router.post('/stripe/stripe-webhook', express.raw({type: 'application/json'}), stripeWebHook)

router.delete('/:booking_id', verifyAccessToken, verifyRoles(2010, 2030),  bookingsController.deleteBooking)


module.exports = router