const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectDB, authMiddleware, signup, login, logout } = require('./authorisation');
const { getTheatres, renderAddTheatreForm, addTheatre, deleteTheatre } = require('./theatres');
const { getMovies, bookMovie, addMovie, deleteMovie } = require('./movies');

const PORT = process.env.PORT || 5000;
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.post('/auth/signup', signup);
app.post('/auth/login', login);
app.get('/theatres', authMiddleware, getTheatres);
app.get('/add-theatre', authMiddleware, renderAddTheatreForm);
app.post('/add-theatre', authMiddleware, addTheatre);
app.post('/movies/add', authMiddleware, addMovie);
app.get('/deleteMovie', authMiddleware, deleteMovie);
app.get('/deleteTheatre', authMiddleware, deleteTheatre);
app.get('/movies', authMiddleware, getMovies);
app.post('/book/:movieId', authMiddleware, bookMovie);
app.get('/', (req, res) => res.redirect('/signup'));
app.get('/login', (req, res) => res.render('login', { title: 'Login', specialClass: 'login-navbar', isAuthenticated: false }));
app.get('/signup', (req, res) => res.render('signup', { title: 'Signup', specialClass: 'signup-navbar', isAuthenticated: false }));
app.get('/logout', logout);
app.get('/add-movie', authMiddleware, (req, res) => {
  const theatreId = req.query.theatreId;
  res.render('addMovies', { theatreId, user: req.user });
});

connectDB().then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)));
