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
app.get("/", (req, res) => {
  res.send("Hello, Node.js!");
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
app.post("/payment-sheet", async (req, res) => {
  // const { email = `test${Math.floor(Math.random() * 9999) + 1}@domain.com` } =
  //   req.body.email;
  console.log("emaill", req.body.email);
  const email = "email:'" + req.body.email + "'";
  const customers = await stripe.customers.search({
    query: email,
  });
  console.log("cus", customers);

  // const stripe = new Stripe(stripeSecretKey, {
  //   apiVersion: '2024-04-10',
  //   typescript: true,
  // });
  var customer = null;
  if (customers.data.length > 0) {
    customer = customers.data[0];
  } else {
    customer = await stripe.customers.create({ email: req.body.email });
  }
  // const customer = await stripe.customers.create({ email });

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2024-04-10" }
  );
  // console.log("id", customer);
  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ["card"],
  });
  return res.json({
    setupIntent: setupIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    email: req.body.email,
  });
});

app.post("/create-payment-sheet", async (req, res) => {
  // const { email = `test${Math.floor(Math.random() * 9999) + 1}@domain.com` } =
  //   req.body.email;
  // console.log("emaill", req.body.email);
  // const email = "email:'" + req.body.email + "'";
  const { email, amount } = req.body;
  const customers = await stripe.customers.search({
    query: `email:'${email}'`,
  });

  // console.log("cus", customers);

  // const stripe = new Stripe(stripeSecretKey, {
  //   apiVersion: '2024-04-10',
  //   typescript: true,
  // });
  var customer = null;
  if (customers.data.length > 0) {
    customer = customers.data[0];
  } else {
    customer = await stripe.customers.create({ email });
  }
  // const customer = await stripe.customers.create({ email });

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2024-04-10" }
  );
  // console.log("id", customer);
  // const setupIntent = await stripe.setupIntents.create({
  //   customer: customer.id,
  //   payment_method_types: ["card"],
  // });
  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.id,
    amount,
    currency: "usd",
    payment_method_types: ["card", "link"],
  });
  return res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    email,
  });
});
// app.get("/get-customer", async (req, res) => {
//   console.log("emaill", req.body.email);
//   const email = "email:'" + req.body.email + "'";
//   const customers = await stripe.customers.search({
//     query: email,
//   });
//   console.log("cus", customers);
//   var customer = null;
//   if (customers.data.length > 0) {
//     customer = customers.data[0];
//     return customer;
//   } else {
//     return null;
//   }
// });
app.get("/get-customer", async (req, res) => {
  try {
    console.log("email:", req.query.email);
    const email = `email:'${req.query.email}'`;
    const customers = await stripe.customers.search({
      query: email,
    });

    let customer = null;
    if (customers.data.length > 0) {
      customer = customers.data[0];

      // List payment methods for the customer
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customer.id,
        type: "card",
      });

      res.json({ customer, paymentMethods: paymentMethods.data });
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/create-payment-intent", async (req, res) => {
  const { amount, currency, customerId, paymentMethodId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
    });

    res.json({ success: true, paymentIntent });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/charge-customer", async (req, res) => {
  const customerId = req.query.customerId;
  console.log("cid", customerId);
  try {
    const charge = await stripe.charges.create({
      amount: 1500,
      currency: "usd",
      customer: customerId,
    });

    res.json({ message: "Customer charged successfully", charge });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// app.post("/payment-sheets", async (req, res) => {
//   // const {email = `test${Math.floor(Math.random() * 9999) + 1}@domain.com`} =
//   //   req.body;

//   // const stripe = new Stripe(stripeSecretKey, {
//   //   apiVersion: '2024-04-10',
//   //   typescript: true,
//   // });

//   const customer = await stripe.customers.create({
//     email: "test8466@domain.com",
//   });

//   const ephemeralKey = await stripe.ephemeralKeys.create(
//     { customer: customer.id },
//     { apiVersion: "2024-04-10" }
//   );
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: 5099,
//     currency: "usd",
//     payment_method_types: ["card", "link"],
//   });
//   return res.json({
//     paymentIntent: paymentIntent.client_secret,
//     ephemeralKey: ephemeralKey.secret,
//     customer: customer.id,
//   });
// });

// app.post("/payByCustomer", async (req, res) => {
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: 1500,
//       currency: "INR",
//       payment_method_types: ["card"],
//       customer:"cus_QJIb6gfuYFAf0a",
//       payment_method:'pm_1PSg0LSJIGArQAxoi2OfEqxg',
//       setup_future_usage: 'on_session',
//       payment_method_options: {
//         card: {
//           request_three_d_secure: 'automatic',
//         },
//       },
//     });
//     const clientSecret = paymentIntent.client_secret;
//     res.json({ message: "Payment initiated", clientSecret });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
// app.post("/payByCustomer", async (req, res) => {
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: 1500,
//       currency: "INR",
//       customer: "cus_QZHbUbx18a9hEs",
//       payment_method: "pm_1Pi92jSJIGArQAxoJhFbpRx9",
//       off_session: true,
//       confirm: true,
//     });

//     const clientSecret = paymentIntent.client_secret;
//     res.json({ message: "Payment initiated", clientSecret });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
app.get("/list-payment-methods", async (req, res) => {
  try {
    const { customerId } = req.body;
    const paymentMethods = await stripe.paymentMethods.list({
      customer: "cus_QJurxrOGHc9ljm",
      type: "card",
    });
    res.send({ paymentMethods: paymentMethods.data });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
// app.post("/update-card", async (req, res) => {
//   const { customerId, paymentMethodId, expMonth, expYear, cvc } = req.body;

//   try {
//     const updatedCard = await stripe.paymentMethods.update(paymentMethodId, {
//       card: {
//         exp_month: expMonth,
//         exp_year: expYear,
//         // cvc: cvc,
//       },
//     });

//     res.json({ message: "Card updated successfully", updatedCard });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
// app.get("/card-details", async (req, res) => {
//   const customerId = "cus_QJurxrOGHc9ljm";
//   const paymentMethodId = "pm_1PTH2QSJIGArQAxoQFCNTXEq";

//   try {
//     const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
//     const cardDetails = {
//       expMonth: paymentMethod.card.exp_month,
//       expYear: paymentMethod.card.exp_year,
//       brand: paymentMethod.card.brand,
//       last4: paymentMethod.card.last4,
//     };
//     res.json(cardDetails);
//   } catch (error) {
//     console.error("Error fetching card details:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

app.get("/card-details", async (req, res) => {
  const { paymentMethodId } = req.query;

  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    const cardDetails = {
      expMonth: paymentMethod.card.exp_month,
      expYear: paymentMethod.card.exp_year,
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
    };
    res.json(cardDetails);
  } catch (error) {
    console.error("Error fetching card details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/update-card-details", async (req, res) => {
  const { paymentMethodId, expMonth, expYear } = req.body;

  try {
    const updatedPaymentMethod = await stripe.paymentMethods.update(
      paymentMethodId,
      {
        card: {
          exp_month: expMonth,
          exp_year: expYear,
        },
      }
    );
    res.json({ success: true, paymentMethod: updatedPaymentMethod });
  } catch (error) {
    console.error("Error updating card details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// app.post("/add-payment-method", async (req, res) => {
//   const { cardNumber, expMonth, expYear, cvc } = req.body;
//   try {
//     const paymentMethod = await stripe.paymentMethods.create({
//       type: "card",
//       card: {
//         number: cardNumber,
//         exp_month: expMonth,
//         exp_year: expYear,
//         cvc: cvc,
//       },
//     });
//     const attachedPaymentMethod = await stripe.paymentMethods.attach(
//       paymentMethod.id,
//       {
//         customer: "cus_QJurxrOGHc9ljm",
//       }
//     );
//     res.json({
//       message: "Payment method added successfully",
//       paymentMethod: attachedPaymentMethod,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
// app.post("/stripe", async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;
//   try {
//     event = await stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: err.message });
//   }

//   // Event when a payment is initiated
//   if (event.type === "payment_intent.created") {
//     console.log(`${event.data.object.metadata.name} initated payment!`);
//   }
//   // Event when a payment is succeeded
//   if (event.type === "payment_intent.succeeded") {
//     console.log(`${event.data.object.metadata.name} succeeded payment!`);
//     // fulfilment
//   }
//   res.json({ ok: true });
// });
app.get("/", (req, res) => {
  res.send("Hello, Node.js!");
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
