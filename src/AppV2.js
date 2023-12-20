import { useEffect, useRef, useState } from "react";
import StarRating from "./starRating"
import { useMovies } from "./useMOvies";
import { useKey } from "./useKey";
import { useLocalStorageState } from "./useLocalStorageState";


const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);


export default function App() {
  const [query, setQuery] = useState("");

  const [selectedId, setSelectedid] = useState(null)
  const { movies, isLoading, error } = useMovies(query)
  const [watched, setWatched] = useLocalStorageState([], "watched")

  // const [watched, setWatched] = useState([]);
  // const [watched, setWatched] = useState(function () {
  //   const storedValue = localStorage.getItem("watched")
  //   return JSON.parse(storedValue)
  // });



  function handleSelectMovie(id) {
    setSelectedid((selectedId) => (id === selectedId ? null : id))
  }

  function handleCloseMovie() {
    setSelectedid(null)
  }
  function handleAddWatch(movie) {
    setWatched(watched => [...watched, movie])

    // localStorage.setItem('watched', JSON.stringify
    //   ([...watched, movie]))
  }
  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter(movie => movie.imdbId !== id))
  }



  return (
    <>
      < NavBar>
        <Logo />
        < Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> :  < MovieList movies={movies} />} */}
          {!isLoading && !error && < MovieList movies={movies} onSelectMovie={handleSelectMovie} />}
          {isLoading && < Loader />}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {
            selectedId ? <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatch}
              watched={watched}
            /> :
              <>
                < WatchedSummary watched={watched} />
                <WatchedList watched={watched} onDeleteWatched={handleDeleteWatched} />
              </>
          }
        </Box>
      </Main>
    </>
  );
}
function Loader() {
  return <p className="loader" >Loading...</p>
}
function ErrorMessage({ message }) {
  return <p className="error" ><span>⛔</span>{message}</p>
}
function NavBar({ children }) {

  return <nav className="nav-bar">{children}</nav>
}
function Logo() {
  return <div className="logo">
    <span role="img">🎬</span>
    <h1>MovieHub</h1>
  </div>
}
function Search({ query, setQuery }) {

  const inputEL = useRef(null)
  useKey("Enter", function () {
    console.log(document.activeElement, inputEL.current)
    if (document.activeElement === inputEL.current) return
    inputEL.current.focus()
    setQuery('')
  })

  return <input
    className="search"
    type="text"
    placeholder="Search movies..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    ref={inputEL}
  />
}
function NumResults({ movies }) {
  return <p className="num-results">
    Found <strong>{movies && movies.length ? movies.length : 0}</strong> results
  </p>
}
function Main({ children }) {
  return (
    <main className="main">
      {children}
    </main>
  )
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return <div className="box">
    <button
      className="btn-toggle"
      onClick={() => setIsOpen((open) => !open)}
    >
      {isOpen ? "–" : "+"}
    </button>
    {isOpen &&
      children}
  </div>
}

function MovieList({ movies, onSelectMovie }) {

  return <ul className="list list-movies">
    {movies?.map((movie) => (
      <Movie movie={movie} onSelectMovie={onSelectMovie} key={movie.imdbID} />
    ))}
  </ul>
}
function Movie({ movie, onSelectMovie }) {

  return <li onClick={() => onSelectMovie(movie.imdbID)}  >
    <img src={movie.Poster} alt={`${movie.Title} poster`} />
    <h3>{movie.Title}</h3>
    <div>
      <p>
        <span>🗓</span>
        <span>{movie.Year}</span>
      </p>
    </div>
  </li>
}


function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, serUserRating] = useState('')

  const countRef = useRef(0)

  useEffect(function () {
    if (userRating) countRef.current++;
  }, [userRating])

  const isWatched = watched.map((movie) => movie.imdbId).includes(selectedId);

  const WatchedUserRating = watched.find(movie => movie.imdbId === selectedId)?.userRating;


  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre
  } = movie

  /* eslint-disable */
  // if (imdbRating > 8) [isTop, setIsTop] = useState(true)
  const [isTop, setIsTop] = useState(imdbRating > 8)
  useEffect(function () {
    setIsTop(imdbRating > 8)
  }, [imdbRating])

  const [avgRating, setAvgRating] = useState(0)
  function handleAdd() {

    const newWatchedMovie = {
      imdbId: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
      countRatingDecision: countRef.current,
    }
    onAddWatched(newWatchedMovie);
    // onCloseMovie()
    setAvgRating(Number(imdbRating))

  }
  useKey("Escape", onCloseMovie);

  useEffect(function () {
    async function getMovieDetails() {
      setIsLoading(true)
      const res = await fetch(` http://www.omdbapi.com/?apikey=1e57fbde&s&i=${selectedId}`);
      const data = await res.json();
      setMovie(data)
      setIsLoading(false)
    }
    getMovieDetails()
  }, [selectedId])

  useEffect(function () {
    if (!title) return;
    document.title = `Movie : ${title}`

    return function () {
      document.title = 'MovieHub'
    }
  }, [title])


  return <div className="details">
    {isLoading ? <Loader /> :
      <>
        <header>
          <button className="btn-back" onClick={onCloseMovie} >&larr;</button>
          <img src={poster} alt={`Poster of ${movie}`} />
          <div className="details-overview">
            <h2>{title}</h2>
            <p>{released} &bull; {runtime}</p>
            <p>{genre}</p>
            <p><span>⭐</span>{imdbRating} IMDb rating</p>
          </div>
        </header>
        <section>
          <div className="rating">
            {!isWatched ? <>
              <StarRating maxRating={10} size={24} onSetRating={serUserRating} />

              {userRating > 0 && (<button className="btn-add" onClick={handleAdd}> + Add to list</button>)}</> : <p>You rated Movie <span> ⭐ </span>{WatchedUserRating}</p>}
          </div>
          <p><em>{plot}</em></p>
          <p>Starring : {actors}</p>
          <p>Directed By : {director}</p>
        </section>
      </>}
  </div>
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return <div className="summary">
    <h2>Movies you watched</h2>
    <div>
      <p>
        <span>#️⃣</span>
        <span>{watched.length} movies</span>
      </p>
      <p>
        <span>⭐️</span>
        <span>{avgImdbRating.toFixed(2)}</span>
      </p>
      <p>
        <span>🌟</span>
        <span>{avgUserRating.toFixed(2)}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{avgRuntime} min</span>
      </p>
    </div>
  </div>
}
function WatchedList({ watched, onDeleteWatched }) {
  return <ul className="list">
    {watched.map((movie) => (
      <WatchedMovie movie={movie} key={movie.imdbId} onDeleteWatched={onDeleteWatched} />
    ))}
  </ul>
}
function WatchedMovie({ movie, onDeleteWatched }) {
  return <li key={movie.poster} >
    <img src={movie.poster} alt={`${movie.title} poster`} />
    <h3>{movie.title}</h3>
    <div>
      <p>
        <span>⭐️</span>
        <span>{movie.imdbRating}</span>
      </p>
      <p>
        <span>🌟</span>
        <span>{movie.userRating}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{movie.runtime} min</span>
      </p>
      <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbId)} >X</button>
    </div>
  </li>
}