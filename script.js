async function fetchMovies(endpoint) {
  try {
    var res = await fetch("https://api.themoviedb.org/3" + endpoint + "?api_key=206e70331573072b79577f43efa23e96");
    var data = await res.json();
    return data.results;
  } catch (err) {
    console.log("Fetch error:", err);
    return [];
  }
}

function createCard(movie) {
  var card = document.createElement("div");
  card.className = "card";

  var imgSrc = movie.poster_path ? "https://image.tmdb.org/t/p/w500" + movie.poster_path : "";

  card.innerHTML = "<img src='" + imgSrc + "'><h4>" + movie.title + "</h4><p>⭐ " + movie.vote_average.toFixed(1) + "</p>";

  card.addEventListener("click", function() {
    openModal(movie.id);
  });

  return card;
}

function displayMovies(movies, containerId) {
  var container = document.getElementById(containerId);
  container.innerHTML = "";
  movies.forEach(function(movie) {
    container.appendChild(createCard(movie));
  });
}

function getWatchlist() {
  return JSON.parse(localStorage.getItem("watchlist") || "[]");
}

function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
}

function saveFavorites(list) {
  localStorage.setItem("favorites", JSON.stringify(list));
}

function addWatchlist(id) {
  var list = getWatchlist();
  if (!list.includes(id)) {
    list.push(id);
    saveWatchlist(list);
    alert("Added to watchlist");
  }
  renderWatchlist();
}

function removeFromWatchlist(id) {
  var list = getWatchlist().filter(function(item) {
    return item != id;
  });
  saveWatchlist(list);
  renderWatchlist();
}

async function renderWatchlist() {
  var container = document.getElementById("watchlist");
  container.innerHTML = "";
  var list = getWatchlist();

  for (const id of list.slice(0)) {
    var res = await fetch("https://api.themoviedb.org/3/movie/" + id + "?api_key=206e70331573072b79577f43efa23e96");
    var movie = await res.json();
    var card = createCard(movie);


    var ratings = JSON.parse(localStorage.getItem("ratings") || "{}");
    var userRating = ratings[id];
    if (userRating) {
      var ratingP = card.querySelector("p");
      if (ratingP) {
        ratingP.outerHTML = "<div class='rating-row'><span>⭐ " + movie.vote_average.toFixed(1) + "</span><span class='user-rating-badge'>🎬 " + userRating + "/10</span></div>";
      }
    }

    var btn = document.createElement("button");
    btn.innerText = "Remove";
    btn.onclick = function() {
      removeFromWatchlist(movie.id);
    };

    card.appendChild(btn);
    container.appendChild(card);
  }
}

function addFavorites(id) {
  var list = getFavorites();
  if (!list.includes(id)) {
    list.push(id);
    saveFavorites(list);
    alert("Added to favorites");
  }
  renderFavorites();
}

function removeFromFavorites(id) {
  var list = getFavorites().filter(function(item) {
    return item != id;
  });
  saveFavorites(list);
  renderFavorites();
}

async function renderFavorites() {
  var container = document.getElementById("favorites");
  container.innerHTML = "";
  var list = getFavorites();

  for (const id of list.slice(0)) {
    var res = await fetch("https://api.themoviedb.org/3/movie/" + id + "?api_key=206e70331573072b79577f43efa23e96");
    var movie = await res.json();
    var card = createCard(movie);

    // Show user rating if exists
    var ratings = JSON.parse(localStorage.getItem("ratings") || "{}");
    var userRating = ratings[id];
    if (userRating) {
      var ratingP = card.querySelector("p");
      if (ratingP) {
        ratingP.outerHTML = "<div class='rating-row'><span>⭐ " + movie.vote_average.toFixed(1) + "</span><span class='user-rating-badge'>🎬 " + userRating + "/10</span></div>";
      }
    }

    var btn = document.createElement("button");
    btn.innerText = "Remove";
    btn.onclick = function() {
      removeFromFavorites(movie.id);
    };

    card.appendChild(btn);
    container.appendChild(card);
  }
}
async function openModal(id) {
  const movieRes = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=206e70331573072b79577f43efa23e96`);
  const movie = await movieRes.json();

  const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=206e70331573072b79577f43efa23e96`);
  const castData = await creditsRes.json();

  const castList = castData.cast.slice(0, 5).map(a => `<li>${a.name}</li>`).join("");
  const genreText = movie.genres.map(g => g.name).join(", ");

  const modal = document.getElementById("modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class='modal-content'>
      <h2>${movie.title}</h2>
      <p><b>Genres:</b> ${genreText}</p>
      <p>${movie.overview}</p>
      <h4>Cast:</h4><ul>${castList}</ul>
    </div>`;

  const content = modal.querySelector(".modal-content");

  const favBtn = document.createElement("button");
  favBtn.innerText = "Favorite";
  favBtn.onclick = () => addFavorites(id);

  const watchBtn = document.createElement("button");
  watchBtn.innerText = "Watchlist";
  watchBtn.onclick = () => addWatchlist(id);

  var rateBtn = document.createElement("button");
rateBtn.innerText = "Rate";
rateBtn.onclick = function(){
  var rate = prompt("Rate this movie (1-10):");
  var num = Number(rate);
  if (!rate) return;
  if (!Number.isInteger(num) || num < 1 || num > 10) {
    alert("Please enter a whole number between 1 and 10.");
    return;
  }
  var ratings = JSON.parse(localStorage.getItem("ratings") || "{}");
  ratings[id] = num;
  localStorage.setItem("ratings", JSON.stringify(ratings));
  alert("You rated this movie: " + num);
};
  

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "Close";
  closeBtn.onclick = closeModal;

  content.append(favBtn, watchBtn, rateBtn, closeBtn);

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal(){
  var modal = document.getElementById("modal");
  if(modal) modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

var modal = document.getElementById("modal");
if(modal){
  modal.addEventListener("click", function(e){
    if(e.target === modal) closeModal();
  });
}

var searchInput = document.getElementById("searchInput");
var dropdown = document.getElementById("searchDropdown");

searchInput.addEventListener("input", async function() {
  var query = searchInput.value.trim();
  if (!query) {
    dropdown.classList.add("hidden");
    dropdown.innerHTML = "";
    document.body.classList.remove("dropdown-open");
    return;
  }

  var movieRes = await fetch("https://api.themoviedb.org/3/search/movie?api_key=206e70331573072b79577f43efa23e96&query=" + query);
  var movieData = await movieRes.json();

  var personRes = await fetch("https://api.themoviedb.org/3/search/person?api_key=206e70331573072b79577f43efa23e96&query=" + query);
  var personData = await personRes.json();

  var actorMovies = [];

  for (const person of personData.results.slice(0, 3)) {
    var creditRes = await fetch("https://api.themoviedb.org/3/person/" + person.id + "/movie_credits?api_key=206e70331573072b79577f43efa23e96");
    var creditData = await creditRes.json();
    creditData.cast.forEach(function(m) {
      actorMovies.push(m);
    });
  }

  var allMovies = movieData.results.concat(actorMovies);
  var unique = [];

  allMovies.forEach(function(movie) {
    if (!unique.some(function(m) { return m.id === movie.id; })) {
      unique.push(movie);
    }
  });

  dropdown.innerHTML = "";

  unique.slice(0, 6).forEach(function(movie) {
    var div = document.createElement("div");
    div.className = "dropdown-card";

    var imgSrc = movie.poster_path ? "https://image.tmdb.org/t/p/w500" + movie.poster_path : "https://via.placeholder.com/50x75?text=No+Image";

    div.innerHTML = "<img src='" + imgSrc + "'><div class='dropdown-info'><div class='dropdown-title'>" + movie.title + "</div><div class='dropdown-rating'>⭐ " + movie.vote_average + "</div></div>";

    div.addEventListener("click", function() {
      openModal(movie.id);
      dropdown.classList.add("hidden");
      document.body.classList.remove("dropdown-open");
      searchInput.value = movie.title;
    });

    dropdown.appendChild(div);
  });

  dropdown.classList.remove("hidden");
  document.body.classList.add("dropdown-open");
});

document.addEventListener("click", function(e) {
  if (!e.target.closest(".search-container")) {
    dropdown.classList.add("hidden");
    document.body.classList.remove("dropdown-open");
  }
});

async function loadHome() {
  popular = await fetchMovies("/movie/popular");
  displayMovies(popular, "popular");

  topRated = await fetchMovies("/movie/top_rated");
  displayMovies(topRated, "topRated");

  latest = await fetchMovies("/movie/now_playing");
  displayMovies(latest, "latest");

  renderWatchlist();
  renderFavorites();
}

loadHome();