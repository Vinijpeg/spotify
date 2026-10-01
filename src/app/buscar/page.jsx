'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ratings, setRatings] = useState({});

  const searchParams = useSearchParams();
  const pesquisa = searchParams.get('q');

  useEffect(() => {
    const savedRatings = localStorage.getItem('albumRatings');

    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    }
  }, []);

  useEffect(() => {
    if (pesquisa) {
      searchAlbums(pesquisa);
    }
  }, [pesquisa]);

  async function searchAlbums(searchQuery) {
    if (!searchQuery || !searchQuery.trim()) {
      return;
    }

    setLoading(true);
    setError('');
    setAlbums([]);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na pesquisa');
      }

      setAlbums(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function rateAlbum(albumId, rating) {
    const newRatings = {
      ...ratings,
      [albumId]: rating,
    };

    setRatings(newRatings);

    localStorage.setItem(
      'albumRatings',
      JSON.stringify(newRatings)
    );
  }

  return (
    <main className="container py-5">
      {loading && <p>Buscando...</p>}

      {error && <p>{error}</p>}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
        }}
      >
        {albums.map((album) => {
          const albumRating = ratings[album.id] || 0;

          return (
            <div
              key={album.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '25px',
                width: '700px',
                borderBottom: '1px solid #ccc',
                paddingBottom: '25px',
              }}
            >
              {album.images?.[0] && (
                <a href={`/album/${album.id}`}>
                  <img
                    src={album.images[0].url}
                    alt={album.name}
                    width="180"
                  />
                </a>
              )}

              <div>
                <a
                  href={`/album/${album.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <h2>{album.name}</h2>
                </a>

                <p>
                  {album.artists
                    .map((artist) => artist.name)
                    .join(', ')}
                </p>

                <p>
                 {album.release_date?.split('-')[0]}
                </p>

            
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}