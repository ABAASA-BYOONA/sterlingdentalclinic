const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'testimonials.json');

app.use(cors());
app.use(bodyParser.json());

// Helper to read testimonials from file
function readTestimonials() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

// Helper to write testimonials to file
function writeTestimonials(testimonials) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(testimonials, null, 2));
}

// Endpoint to get all testimonials
app.get('/testimonials', (req, res) => {
  const testimonials = readTestimonials();
  res.json(testimonials);
});

// Endpoint to add a new testimonial
app.post('/testimonials', (req, res) => {
  const { name, email, message, rating } = req.body;

  if (!name || !email || !message || !rating) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const testimonials = readTestimonials();

  const newTestimonial = {
    id: Date.now(),
    name,
    email,
    message,
    rating,
    date: new Date().toISOString()
  };

  testimonials.push(newTestimonial);
  writeTestimonials(testimonials);

  res.json({ message: 'Testimonial submitted successfully.', testimonial: newTestimonial });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});