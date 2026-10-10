
import React, { useEffect, useMemo, useState } from "react";
import './../styles/App.css';

const App = () => {
  const [userId, setUserId] = useState("all");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const responseCache = useMemo(() => new Map(), []);
  const requestUrl = useMemo(
    () => userId === "all"
      ? "https://jsonplaceholder.typicode.com/posts"
      : `https://jsonplaceholder.typicode.com/posts?userId=${userId}`,
    [userId]
  );
  const cachedPosts = useMemo(
    () => responseCache.get(requestUrl),
    [requestUrl, responseCache]
  );

  useEffect(() => {
    let isCurrentRequest = true;

    if (cachedPosts) {
      setPosts(cachedPosts);
      setIsLoading(false);
      setError("");
      return () => {
        isCurrentRequest = false;
      };
    }

    setPosts([]);
    setIsLoading(true);
    setError("");

    fetch(requestUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("The posts could not be loaded. Please try again.");
        }
        return response.json();
      })
      .then((data) => {
        responseCache.set(requestUrl, data);
        if (isCurrentRequest) {
          setPosts(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setError("We couldn't load the posts. Check your connection and try again.");
          setIsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [cachedPosts, requestUrl, responseCache, retryCount]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Postroom home">
          <span className="wordmark-mark">P</span>
          <span>POSTROOM</span>
        </a>
        <span className="topbar-note">A small window into the public archive</span>
      </header>

      <section className="intro" id="top" aria-labelledby="page-title">
        <div className="intro-copy">
          <p className="eyebrow"><span className="status-dot" /> JSONPLACEHOLDER / POSTS</p>
          <h1 id="page-title">The open<br />conversation.</h1>
          <p className="intro-description">
            Notes, thoughts, and tiny dispatches from across the community.
          </p>
        </div>
        <div className="intro-stamp" aria-hidden="true">
          <span>PUBLIC</span>
          <strong>01</strong>
          <span>ARCHIVE</span>
        </div>
      </section>

      <section className="feed" aria-labelledby="feed-title">
        <div className="feed-toolbar">
          <div className="feed-heading">
            <h2 id="feed-title">Latest posts</h2>
            <span className="post-count">
              {isLoading ? "..." : posts.length.toString().padStart(2, "0")}
            </span>
          </div>
          <label className="filter-control">
            <span>AUTHOR</span>
            <select
              aria-label="Filter posts by author"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            >
              <option value="all">All authors</option>
              {Array.from({ length: 10 }, (_, index) => (
                <option key={index + 1} value={index + 1}>Author {index + 1}</option>
              ))}
            </select>
          </label>
        </div>

        {isLoading && (
          <div className="message-state" role="status">
            <span className="loading-indicator" />
            <span>Gathering the latest posts...</span>
          </div>
        )}

        {error && (
          <div className="message-state error-state" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="message-state">No posts found for this author.</div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <div className="post-list" aria-live="polite">
            {posts.map((post, index) => (
              <article className="post-row" key={post.id}>
                <span className="post-index">{String(index + 1).padStart(2, "0")}</span>
                <div className="post-content">
                  <div className="post-meta">
                    <span>AUTHOR {String(post.userId).padStart(2, "0")}</span>
                    <span className="meta-divider" />
                    <span>POST {String(post.id).padStart(2, "0")}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                </div>
                <span className="post-arrow" aria-hidden="true">&#8599;</span>
              </article>
            ))}
          </div>
        )}
      </section>
      <footer className="page-footer">
        <span>POSTROOM / COMMUNITY ARCHIVE</span>
        <span>DATA PROVIDED BY JSONPLACEHOLDER</span>
      </footer>
    </div>
  );
};

export default App
