const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  seats: { type: Number, required: true },
  address: { type: String, required: true },
  img: { type: String, required: true },
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

const Theatre = mongoose.model('Theatre', theatreSchema);

const getTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find();
    const user = req.user || null;
    const specialClass = user ? (user.isAdmin ? 'admin-navbar' : 'authenticated-navbar') : 'default-navbar';
    res.render('theatres', { theatres, user, specialClass, state: 'theatre', isAdmin: user?.isAdmin });
  } catch (err) {
    console.error('Error fetching theatres:', err);
    res.status(500).send('Server Error');
  }
};

const renderAddTheatreForm = (req, res) => {
  res.render('addTheatre', { user: req.user || null });
};

const addTheatre = async (req, res) => {
  try {
    await new Theatre(req.body).save();
    res.redirect('/theatres');
  } catch (err) {
    console.error('Error adding theatre:', err);
    res.status(500).send('Server Error');
  }
};

const deleteTheatre = async (req, res) => {
  try {
    const theatreId = req.query.theatreId;

    if (!mongoose.Types.ObjectId.isValid(theatreId)) {
      return res.status(400).send('Invalid Theatre ID');
    }

    const result = await Theatre.findByIdAndDelete(theatreId);
    if (!result) {
      return res.status(404).send('Theatre not found');
    }

    res.redirect('/theatres');
  } catch (err) {
    console.error('Error deleting theatre:', err);
    res.status(500).send('Server Error');
  }
};

module.exports = { Theatre, getTheatres, renderAddTheatreForm, addTheatre, deleteTheatre };


//