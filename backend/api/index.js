require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT;

const transport = {
  service: "outlook",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
};

const transporter = nodemailer.createTransport(transport);

transporter.verify((error, success) => {
  if (error) console.log(error);
  else {
    console.log("Server is ready to take messages");
  }
});

app.get("/api", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.send("<h1>anin endpoint</h1>");
});

app.get("/api/email", (req, res) => {
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.send("<p>email endpoint test</p>");
});

app.get("/api/test", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.send("<h1>test endpoint</h1>");
});

app.get("/api/emails", (req, res) => {
  const responseData = { message: "email endpoint test" };
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.json(responseData);
});

app.post("/api/email", (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: `${name} <${process.env.EMAIL}>`,
    to: process.env.EMAIL,
    subject: `New Portfolio Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send(`Error sending email: ${error.toString()}`);
    }
    res.status(200).json({ success: true });
  });
});

// app.get("/", (req, res) => {
//   res.send("<h1>anin endpoint</h1>");
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
