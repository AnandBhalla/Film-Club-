const mongoose = require('mongoose');
const { Theatre } = require('./theatres');

const movieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  actors: [{ type: String, required: true }],
  poster: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  genre: { type: String, required: true },
  theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  bookedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Movie = mongoose.model('Movie', movieSchema);

const getMovies = async (req, res) => {
  try {
    const theatreId = req.query.theatreId;
    if (!theatreId || !mongoose.Types.ObjectId.isValid(theatreId)) {
      return res.status(400).send('Invalid Theatre ID');
    }

    const movies = await Movie.find({ theatreId });

    res.render('movies', {
      movies,
      isAdmin: req.user.isAdmin,
      user: req.user || null,
      theatreId,
      isAuthenticated: !!req.user,
      specialClass: req.user ? (req.user.isAdmin ? 'admin-navbar' : 'authenticated-navbar') : 'default-navbar',
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

const addMovie = async (req, res) => {
  try {
    const { name, actors, poster, releaseDate, genre, theatreId } = req.body;

    // Create a new movie
    const newMovie = new Movie({
      name,
      actors: actors.split(',').map(actor => actor.trim()),
      poster,
      releaseDate,
      genre,
      theatreId
    });

    // Save the new movie
    const savedMovie = await newMovie.save();

    // Update the theatre's movies array with the new movie ID
    await Theatre.findByIdAndUpdate(theatreId, {
      $addToSet: { movies: savedMovie._id }
    });

    // Redirect to the movies page for the theatre
    res.redirect(`/movies?theatreId=${theatreId}`);
  } catch (err) {
    console.error('Error adding movie:', err);
    res.status(500).send('Server Error');
  }
};


const bookMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const userId = req.user._id;

    await Movie.findByIdAndUpdate(movieId, { $addToSet: { bookedBy: userId } });

    res.redirect('/movies?theatreId=' + req.query.theatreId);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

const deleteMovie = async (req, res) => {
  try {
    const movieId = req.query.movieId;
    
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).send('Invalid Movie ID');
    }
    

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).send('Movie not found');
    }
    
    const theatreId = movie.theatreId;
    await Movie.findByIdAndDelete(movieId);

    await Theatre.findByIdAndUpdate(theatreId, {
      $pull: { movies: movieId }
    });

    res.redirect('/theatres');
  } catch (err) {
    console.error('Error deleting movie:', err);
    res.status(500).send('Server Error');
  }
};


module.exports = { Movie, getMovies, addMovie, bookMovie, deleteMovie };
