const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose
  .connect('mongodb+srv://20235252:20235252@cluster0.zgqmko4.mongodb.net/it4409-bt?retryWrites=true&w=majority')
  .then(() => console.log('Mongo connected'))
  .catch(err => console.error(err));

const VuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  email: { type: String, required: true, unique: true }
});

const Vu = mongoose.model('Vu', VuSchema, 'vu.pm235252');

app.post('/api/vus', async (req, res) => {
  try {
    const vu = new Vu(req.body);
    await vu.save();
    res.status(201).json(vu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/vus', async (req, res) => {
  try {
    const vus = await Vu.find();
    res.json(vus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vus/:id', async (req, res) => {
  try {
    const vu = await Vu.findById(req.params.id);
    if (!vu) return res.status(404).json({ error: 'Not found' });
    res.json(vu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/vus/:id', async (req, res) => {
  try {
    const vu = await Vu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!vu) return res.status(404).json({ error: 'Not found' });
    res.json(vu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/vus/:id', async (req, res) => {
  try {
    const vu = await Vu.findByIdAndDelete(req.params.id);
    if (!vu) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(8000, () => {
  console.log('Server running on http://localhost:8000');
});
