require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = 8080;

app.use("/stripe", express.raw({ type: "*/*" }));
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send('Hello, Node.js!');
});
app.post("/pay", async (req, res) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1500,
        currency: "INR",
        payment_method_types: ["card"],
      });
      const clientSecret = paymentIntent.client_secret;
      res.json({ message: "Payment initiated", clientSecret });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // app.post("/cardpay", async (req, res) => {
  //   try {
  //     // Create a Customer
  //     const customer = await stripe.customers.create({
  //       source: 'tok_mastercard',
  //       email: 'paying.user@example.com',
  //     });
  
  //     // Charge the Customer instead of the card
  //     const charge = await stripe.charges.create({
  //       amount: 1000,
  //       currency: 'usd',
  //       customer: customer.id,
  //     });
  
  //     // Save the customer ID and other info in a database for later use
  //     // Example: You can save the customer ID to a variable or database for future reference
  //     const customerId = customer.id;
  //     console.log("id", customerId);
  //     // When it's time to charge the customer again, retrieve the customer ID
  //     const charge2 = await stripe.charges.create({
  //       amount: 1500, // $15.00 this time
  //       currency: 'usd',
  //       customer: customerId, // Previously stored and retrieved
  //     });
  
  //     // Respond with success message
  //     res.json({ message: "Customer created and charged successfully", customerId });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // });

  
  // app.post("/create-customer", async (req, res) => {
  //   try {
  //     // const { name, email } = req.body;
  
  //     // Create a Customer
  //     const customer = await stripe.customers.create({
  //       // name,
  //       email: 'paying.user@example.com',
  //       source: 'tok_mastercard'
  //     });
  //     console.log("Customer Object:", customer);
  //     // Display a console log message with the customer ID
  //     console.log("Customer ID:", customer.id);
  
  //     res.json({ message: "Customer created successfully", customerId: customer.id });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // });
  app.post('/payment-sheet', async (req, res) => {
    const {email = `test${Math.floor(Math.random() * 9999) + 1}@domain.com`} =
      req.body;
  
    // const stripe = new Stripe(stripeSecretKey, {
    //   apiVersion: '2024-04-10',
    //   typescript: true,
    // });
  
    const customer = await stripe.customers.create({email});
  
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: '2024-04-10'},
    );
    console.log("id",customer);
    const setupIntent = await stripe.setupIntents.create({
     customer: customer.id,
      payment_method_types: ['card']
    });
    return res.json({
      setupIntent: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  });
  app.get("/charge-customer", async (req, res) => {
    const customerId  = req.query.customerId;
  console.log("cid", customerId);
    try {
      const charge = await stripe.charges.create({
        amount:1500,
        currency:'usd',
        customer: customerId,
      });
  
      res.json({ message: "Customer charged successfully", charge });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app.post('/payment-sheets', async (req, res) => {
    // const {email = `test${Math.floor(Math.random() * 9999) + 1}@domain.com`} =
    //   req.body;
  
    // const stripe = new Stripe(stripeSecretKey, {
    //   apiVersion: '2024-04-10',
    //   typescript: true,
    // });
  
    const customer = await stripe.customers.create({email:'test8466@domain.com'});
  
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: '2024-04-10'},
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5099,
      currency: 'usd',
      payment_method_types: ['card', 'link'],
    });
    return res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  });

  app.post("/payByCustomer", async (req, res) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1500,
        currency: "INR",
        payment_method_types: ["card"],
        customer:"cus_Q22Uo0BTtOfUlv",
        payment_method:'pm_1PByQBSJIGArQAxoHyMfEkbv',
        setup_future_usage: 'on_session',
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic',
          },
        },
      });
      const clientSecret = paymentIntent.client_secret;
      res.json({ message: "Payment initiated", clientSecret });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
app.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = await stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }

  // Event when a payment is initiated
  if (event.type === "payment_intent.created") {
    console.log(`${event.data.object.metadata.name} initated payment!`);
  }
  // Event when a payment is succeeded
  if (event.type === "payment_intent.succeeded") {
    console.log(`${event.data.object.metadata.name} succeeded payment!`);
    // fulfilment
  }
  res.json({ ok: true });
});
app.get('/', (req, res) => {
      res.send('Hello, Node.js!');
  });
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));