// const express = require('express');
// const bodyParser = require('body-parser');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// const app = express();
// app.use(bodyParser.json());

// // Endpoint to create a payment intent
// app.post('/create-payment-intent', async (req, res) => {
//   try {
//     const { amount, currency } = req.body;
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency,
//     });
//     res.status(200).json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error('Error creating payment intent:', error);
//     res.status(500).json({ error: 'Failed to create payment intent' });
//   }
// });

// const PORT =  3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// // const express = require('express');
// // const app = express();
// // const port = 3000;

// // // Define a route
// // app.get('/', (req, res) => {
// //     res.send('Hello, Node.js!');
// // });

// // // Start the server
// // app.listen(port, () => {
// //     console.log(`Server is running on port ${port}`);
// // });
 let http = require("http")

 http.createServer(function (request, response){
    response.writeHead(200,{'Content-Type': 'text/plain'})
    response.end('Hello World')
 }).listen(3000)

 console.log("Server running at http://127.0.0.1:3000");

 const express = require('express');

const app = express()
const port = 3000

const PUBLISHABLE_KEY = "pk_test_51NqfJ4SJIGArQAxoTt562ovvx9vyhovKlx7fwS1ETMezyklo3PMYaLX4oS8N5apJf8iGECt4G3R66GrcCqx0S3Zv00eIdT1Rl8"
const STRIPE_SECRET_KEY = "sk_test_51NqfJ4SJIGArQAxonLCvhp1B0CFsQyCiiGSnD5vq1vpAO8OWSGAgoDR3FKtXtwwW7jmWlEMbBezvLYJv9ddeKfBD00vXvTmssL"
app.listen(port, () =>{
   console.log(`Server running at http://localhost:${port}`);
})