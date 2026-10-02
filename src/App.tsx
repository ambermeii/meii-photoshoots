import { useState } from "react";
import "./App.css";
import Gallery from "./components/Gallery";

function App() {
  const [page, setPage] = useState<"home" | "photography">("home");
  const [portraitMissing, setPortraitMissing] = useState(false);
  const [branchMissing, setBranchMissing] = useState(false);
  const [logoMissing, setLogoMissing] = useState(false);

  function showHome() {
    setPage("home");
    window.scrollTo(0, 0);
  }

  function showPhotography() {
    setPage("photography");
    window.scrollTo(0, 0);
  }

  return (
    <>
      <header className="site-header">
        <button
          type="button"
          className="site-logo logo-button"
          onClick={showHome}
          aria-label="Go to home"
        >
          {logoMissing ? (
            "AM"
          ) : (
            <img
              src="/images/home/logo.png"
              alt="Amber McDonald"
              onError={() => setLogoMissing(true)}
            />
          )}
        </button>

        <nav aria-label="Main navigation">
          <button
            type="button"
            className="nav-button"
            onClick={showHome}
            aria-current={page === "home" ? "page" : undefined}
          >
            Home
          </button>

          <button
            type="button"
            className="nav-button"
            onClick={showPhotography}
            aria-current={page === "photography" ? "page" : undefined}
          >
            Photography
          </button>
        </nav>
      </header>

      <main>
        {page === "home" ? (
          <>
            <section className="intro">
              <div className="intro-copy">
                <p className="eyebrow">Welcome to my little corner</p>

                <h1>
                  Hi there!
                  <br />
                  I’m Amber.
                </h1>

                <p className="intro-description">
                  A space for my creativity, photography, and the things I’m
                  learning along the way.
                </p>

                <a className="button" href="#about">
                  Get to know me
                </a>
              </div>

              {branchMissing ? (
                <div className="hero-branch branch-fallback">
                  Your branch image goes here
                </div>
              ) : (
                <img
                  className="hero-branch"
                  src="/images/home/branch.png"
                  alt=""
                  onError={() => setBranchMissing(true)}
                />
              )}
            </section>

            <section className="photo-banner">
              <span className="banner-logo">AM</span>
              <h2>meii photoshoots</h2>
              <p>Capturing moments. Sharing stories.</p>

              <button
                type="button"
                className="button"
                onClick={showPhotography}
              >
                Explore photography
              </button>
            </section>

            <section id="about" className="about">
              <div className="portrait-frame">
                {portraitMissing ? (
                  <div className="image-placeholder">Your photo goes here</div>
                ) : (
                  <img
                    className="portrait"
                    src="/images/home/point-reyes-portrait.jpeg"
                    alt="Amber"
                    onError={() => setPortraitMissing(true)}
                  />
                )}
              </div>

              <div className="about-copy">
                <p className="eyebrow">A little about me</p>

                <h2>Creativity meets curiosity.</h2>

                <p>
                  I’m Amber, a Computer Science student at Michigan State
                  University with a minor in Business. I enjoy bringing ideas to
                  life through technology, photography, and design.
                </p>

                <a
                  className="button"
                  href="/documents/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View my résumé
                </a>
              </div>
            </section>
          </>
        ) : (
          <Gallery />
        )}
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Amber McDonald</p>

        <a href="https://www.instagram.com/meii.photoshoots/">Instagram</a>
      </footer>
    </>
  );
}

export default App;
