const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const app = express();
const db = new sqlite3.Database("product.db");
const COMMENT_FILE = "comment.json";

// JSON 요청 처리
app.use(express.json());

// API 라우터

// 전체 영화 리스트 조회
app.get("/movies", (req, res) => {
    db.all("SELECT * FROM movies", [], (err, rows) => {
        if (err) res.status(500).send("DB Error");
        else res.json(rows);
    });
});

// 특정 영화 정보 조회
app.get("/movie/:id", (req, res) => {
    const id = parseInt(req.params.id); // 숫자로 변환 필수
    db.get("SELECT * FROM movies WHERE movie_id = ?", [id], (err, row) => {
        if (err || !row) res.status(404).send("영화를 찾을 수 없습니다.");
        else res.json(row);
    });
});

// 영화별 댓글 목록 불러오기
app.get("/comments/:movie_id", (req, res) => {
    const movieId = req.params.movie_id;
    console.log("[GET] 요청 받은 movie_id:", movieId);  // 디버깅 로그

    const commentFilePath = path.join(__dirname, COMMENT_FILE);

    // 파일 존재 여부 확인
    if (!fs.existsSync(commentFilePath)) {
        console.warn("⚠️ comment.json 파일이 존재하지 않음. 빈 파일 생성");
        fs.writeFileSync(commentFilePath, "{}");
    }

    fs.readFile(commentFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("❌ comment.json 읽기 실패:", err);
            return res.status(500).json({ error: "파일 읽기 오류" });
        }

        let allComments;
        try {
            allComments = JSON.parse(data || "{}");
        } catch (e) {
            console.error("❌ JSON 파싱 오류:", e.message);
            return res.status(500).json({ error: "잘못된 JSON 형식" });
        }

        console.log("📄 반환할 댓글 목록:", allComments[movieId] || []);
        res.json(allComments[movieId] || []);
    });
});

// 영화별 댓글 목록 저장하기
app.post("/comments/:movie_id", (req, res) => {
    const movieId = req.params.movie_id;
    const newComment = req.body.comment;

    fs.readFile(COMMENT_FILE, "utf8", (err, data) => {
        const allComments = err ? {} : JSON.parse(data || "{}");
        if (!allComments[movieId]) allComments[movieId] = [];
        allComments[movieId].push(newComment);

        fs.writeFile(COMMENT_FILE, JSON.stringify(allComments, null, 2), () => {
            res.status(201).json({ success: true });
        });
    });
});

// 상세 페이지 라우팅
app.get("/movies/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "detail.html"));
});

// 정적 파일 라우터
app.use(express.static(path.join(__dirname, "public")));

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
