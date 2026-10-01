'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AlbumPage() {
  const params = useParams();
  const albumId = params.id;

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    async function loadAlbum() {
      try {
        const response = await fetch(`/api/album/${albumId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar álbum');
        }

        setAlbum(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (albumId) {
      loadAlbum();
    }
  }, [albumId]);

  useEffect(() => {
    const savedRatings = localStorage.getItem('albumRatings');

    if (savedRatings) {
      const ratings = JSON.parse(savedRatings);

      if (ratings[albumId]) {
        setRating(ratings[albumId]);
      }
    }
  }, [albumId]);

  function rateAlbum(newRating) {
    setRating(newRating);

    const savedRatings = localStorage.getItem('albumRatings');

    const ratings = savedRatings
      ? JSON.parse(savedRatings)
      : {};

    ratings[albumId] = newRating;

    localStorage.setItem(
      'albumRatings',
      JSON.stringify(ratings)
    );
  }

  if (loading) {
    return (
      <main className="container py-5">
        <p>Carregando álbum...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-5">
        <p>{error}</p>
      </main>
    );
  }

  if (!album) {
    return (
      <main className="container py-5">
        <p>Álbum não encontrado.</p>
      </main>
    );
  }

  return (
    <main className="container py-5">

      <div className="row">

        <div className="col-md-4">
          {album.images?.[0] && (
            <img
              src={album.images[0].url}
              alt={album.name}
              className="img-fluid"
            />
          )}
        </div>

        <div className="col-md-8">

          <h1>
            {album.name}{' '}
            <span className="text-muted">
              ({album.release_date?.split('-')[0]})
            </span>
          </h1>

          <h3>
            {album.artists
              .map((artist) => artist.name)
              .join(', ')}
          </h3>

          <p>
            Lançamento: {album.release_date}
          </p>

          <p>
            {album.total_tracks} músicas
          </p>

          {album.label && (
            <p>
              Gravadora: {album.label}
            </p>
          )}

          <hr />

          <h4>Sua avaliação</h4>

          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => rateAlbum(star)}
                className="btn btn-link"
                style={{
                  fontSize: '35px',
                  textDecoration: 'none',
                  padding: '2px',
                }}
              >
                {star <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p>
              Sua nota: {rating}/5
            </p>
          )}

          <div className="mt-4">
            <h4>Sua resenha</h4>

            <textarea
              className="form-control"
              rows="6"
              placeholder="Escreva o que você achou deste álbum..."
              value={review}
              onChange={(event) => setReview(event.target.value)}
            />
          </div>

          <div className="mt-4">
            <a
              href={album.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success"
            >
              Abrir no Spotify
            </a>
          </div>

        </div>
      </div>

      <hr className="my-5" />

      <h2>Faixas</h2>

      <ol className="list-group list-group-numbered">
        {album.tracks.items.map((track) => (
          <li
            key={track.id}
            className="list-group-item"
          >
            {track.name}
          </li>
        ))}
      </ol>

    </main>
  );
}