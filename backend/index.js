require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
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

app.use(express.static(path.join(__dirname, "frontend/public")));

app.post("/email", (req, res) => {
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
    res.redirect("/thanks");
  });
});

app.get("/thanks", (req, res) => {
  const options = {
    root: __dirname,
    headers: {
      "Content-Type": "text/html",
    },
  };
  res.status(200).sendFile("thanks.html", options, (err) => {
    if (err) {
      console.error(err);
      res.status(err.status).end();
    }
  });
});

app.get("/", (req, res) => {
  res.send("<h1>anin endpoint</h1>");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
