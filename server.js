require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Price formatting helper
const fmt = n => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

//Using SendGrid transporter
const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey",
  },
});

app.post("/api/orders", async (req, res) => {
  const order = req.body;
  console.log("New order received:", JSON.stringify(order, null, 2));

  const itemsText = order.cart.map(l => `- ${l.item.name} x${l.qty} — ${fmt(l.item.price)}`).join("\n");

  const mailOptions = {
    from: "mybellisaorder@gmail.com", // sender email
    to: [order.customer.email, "juliaguxrra@gmail.com"], // user + admin
    subject: `Your Bellisa Order for ${order.customer.name}✨`,
    html: `
      <div style="font-family: 'Inter', sans-serif; background:#fdf6f0; padding:20px; color:#333;">
        <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden;">
          <div style="background:#f6c90e; padding:15px; text-align:center; font-weight:800; font-size:1.5rem; color:#fff;">Bellisa Jewelry ✨</div>
          
          <div style="padding:20px;">
            <p>Hi <strong>${order.customer.name}</strong>,</p>
            <p>Thank you for your order!</p>

            <h3 style="border-bottom:1px solid #eee; padding-bottom:5px;">Order Details</h3>
            <p><strong>Order placed:</strong> ${order.placedAt}</p>
            <p><strong>Delivery address:</strong> ${order.customer.address}</p>
            <p><strong>Payment method:</strong> ${order.customer.payment}</p>

            <h4 style="margin-top:15px;">Items:</h4>
            <ul style="padding-left:20px; margin-top:5px;">
              ${order.cart.map(l => `<li>${l.item.name} × ${l.qty} — ${fmt(l.item.price)}</li>`).join('')}
            </ul>

            <div style="margin-top:15px; border-top:1px solid #eee; padding-top:10px;">
              <p><strong>Subtotal:</strong> ${fmt(order.totals.subtotal)}</p>
              <p><strong>Delivery:</strong> ${fmt(order.totals.delivery)}</p>
              <p><strong>Tax:</strong> ${fmt(order.totals.tax)}</p>
              <p style="font-weight:700; font-size:1.1rem;">Total: ${fmt(order.totals.total)}</p>
            </div>

            <p style="margin-top:20px;">Hope you enjoy your new jewelry!<br/>— The Bellisa Team</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to user and admin!");
    res.json({ success: true, message: "Order received and email sent" });
  } catch (err) {
    console.error("Email failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(4000, () => console.log("Server running at http://localhost:4000"));
