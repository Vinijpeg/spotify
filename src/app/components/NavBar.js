'use client';

import { useEffect } from 'react';

export default function Navbar() {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div
        className="container-fluid"
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <a className="navbar-brand me-4" href="/">
          Musicão
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" href="/">
                Álbuns
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/listas">
                Listas
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/resenhas">
                Resenhas
              </a>
            </li>

              <li className="nav-item">
              <a className="nav-link" href="/resenhas">
                Meu Perfil
              </a>
            </li>
          </ul>

          <form
            className="d-flex"
            role="search"
            action="/buscar"
            method="GET"
          >
            <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar álbum"
              name="q"
            />

            <button
              className="btn btn-outline-success"
              type="submit"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}