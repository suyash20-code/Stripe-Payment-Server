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
// })

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

// app.get("/list-payment-methods", async (req, res) => {
//   try {
//     const { customerId } = req.body;
//     const paymentMethods = await stripe.paymentMethods.list({
//       customer: "cus_QJurxrOGHc9ljm",
//       type: "card",
//     });
//     res.send({ paymentMethods: paymentMethods.data });
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });
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
