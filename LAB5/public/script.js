// 변수 선언
let allMovies = [];
let filteredMovies = [];
let currentIndex = 0;
const batchSize = 6;
let hasMore = true;

document.addEventListener("DOMContentLoaded", () => {
    // 영화 목록 가져오기
    fetch("/movies")
        .then(res => res.json())
        .then(data => {
            allMovies = data.map(movie => ({
                id: movie.movie_id,
                title: movie.movie_title,
                poster: movie.movie_image,
                rating: movie.movie_rate,
                releaseDate: movie.movie_release_date,
                plot: movie.movie_overview
            }));
            filteredMovies = [...allMovies];
            loadNextMovies();
            window.addEventListener('scroll', handleScroll);
        })

    // 검색 버튼 클릭 이벤트
    document.getElementById('filter-btn').addEventListener('click', () => {
        const keyword = document.getElementById('search-input').value.trim().toLowerCase();
        currentIndex = 0;
        hasMore = true;

        // 검색할 단어가 있을 경우에만 필터링
        if (keyword === '') {
            filteredMovies = [...allMovies];
        } else {
            filteredMovies = allMovies.filter(movie =>
                movie.title.toLowerCase().includes(keyword)
            );
        }

        document.getElementById('movie-list').innerHTML = '';
        loadNextMovies();
    });

    // 정렬 버튼 이벤트
    document.querySelectorAll('input[name="sort"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const sortOption = radio.value;

            filteredMovies.sort((a, b) => {
                if (sortOption === 'ratingDesc') return parseFloat(b.rating) - parseFloat(a.rating);
                else if (sortOption === 'ratingAsc') return parseFloat(a.rating) - parseFloat(b.rating);
                else if (sortOption === 'dateDesc') return new Date(b.releaseDate) - new Date(a.releaseDate);
                else if (sortOption === 'dateAsc') return new Date(a.releaseDate) - new Date(b.releaseDate);
                return 0;
            });

            currentIndex = 0;
            hasMore = true;
            document.getElementById('movie-list').innerHTML = '';
            loadNextMovies();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
});

// infinite scroll을 위한 추가 로딩
function handleScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        loadNextMovies();
    }
}

// 영화 카드 배치
function loadNextMovies() {
    if (!hasMore) return;

    const container = document.getElementById('movie-list');
    const nextBatch = filteredMovies.slice(currentIndex, currentIndex + batchSize);

    nextBatch.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        card.innerHTML = `
            <div class="title-wrapper">
                <img src="images/${movie.poster}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>⭐ 평점: ${movie.rating}</p>
                <p>📅 개봉일: ${movie.releaseDate}</p>
            </div>
            <div class="plot-wrapper" style="display: none;">
                <p style="font-size:14px; text-align:left;">${movie.plot}</p>
            </div>
        `;

        // 마우스 호버링시 줄거리 표시
        card.addEventListener('mouseenter', () => {
            card.querySelector('.title-wrapper').style.display = 'none';
            card.querySelector('.plot-wrapper').style.display = 'block';
        });

        card.addEventListener('mouseleave', () => {
            card.querySelector('.plot-wrapper').style.display = 'none';
            card.querySelector('.title-wrapper').style.display = 'block';
        });

        // 영화 클릭 시 상세 페이지로 이동
        card.addEventListener('click', () => {
            window.location.href = `/movies/${movie.id}`;
        });

        container.appendChild(card);
    });

    currentIndex += batchSize;
    if (currentIndex >= filteredMovies.length) hasMore = false;
}