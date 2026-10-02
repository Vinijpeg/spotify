'use client';

import { useEffect, useState } from 'react';

export default function PerfilPage() {
  const [nome, setNome] = useState('Usuário');
  const [bio, setBio] = useState('');
  const [editando, setEditando] = useState(false);

  const [ratings, setRatings] = useState({});
  const [listas, setListas] = useState([]);
  const [listenLater, setListenLater] = useState([]);

  // Dados completos dos álbuns marcados como "Ouvir mais tarde"
  const [listenLaterDetails, setListenLaterDetails] = useState([]);

  // IDs dos 3 álbuns favoritos
  const [topAlbums, setTopAlbums] = useState([
    '',
    '',
    '',
  ]);

  // Dados completos dos 3 álbuns favoritos
  const [topAlbumDetails, setTopAlbumDetails] = useState([
    null,
    null,
    null,
  ]);

  // Posição do Top 3 que está sendo editada
  const [posicaoEditando, setPosicaoEditando] = useState(null);

  // Campo da busca de álbum
  const [busca, setBusca] = useState('');

  // Resultados da busca
  const [resultadosBusca, setResultadosBusca] = useState([]);

  // Loading da busca
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    // PERFIL
    const perfilSalvo = localStorage.getItem('userProfile');

    if (perfilSalvo) {
      const perfil = JSON.parse(perfilSalvo);

      if (perfil.nome) {
        setNome(perfil.nome);
      }

      if (perfil.bio) {
        setBio(perfil.bio);
      }
    }

    // AVALIAÇÕES
    const savedRatings = localStorage.getItem('albumRatings');

    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    }

    // LISTAS
    const savedLists = localStorage.getItem('albumLists');

    if (savedLists) {
      setListas(JSON.parse(savedLists));
    }

    // OUVIR MAIS TARDE
    const savedListenLater = localStorage.getItem(
      'listenLaterAlbums'
    );

    if (savedListenLater) {
      const ids = JSON.parse(savedListenLater);

      setListenLater(ids);

      carregarListenLater(ids);
    }

    // TOP 3
    const savedTopAlbums = localStorage.getItem(
      'topAlbums'
    );

    if (savedTopAlbums) {
      const ids = JSON.parse(savedTopAlbums);

      setTopAlbums(ids);

      carregarTopAlbums(ids);
    }
  }, []);

  async function carregarTopAlbums(ids) {
    const detalhes = [];

    for (const id of ids) {
      if (!id) {
        detalhes.push(null);
        continue;
      }

      try {
        const response = await fetch(
          `/api/album/${id}`
        );

        const data = await response.json();

        if (response.ok) {
          detalhes.push(data);
        } else {
          detalhes.push(null);
        }
      } catch (error) {
        console.error(
          'Erro ao carregar álbum do Top 3:',
          error
        );

        detalhes.push(null);
      }
    }

    setTopAlbumDetails(detalhes);
  }

  async function carregarListenLater(ids) {
    const detalhes = [];

    for (const id of ids) {
      try {
        const response = await fetch(
          `/api/album/${id}`
        );

        const data = await response.json();

        if (response.ok) {
          detalhes.push(data);
        }
      } catch (error) {
        console.error(
          'Erro ao carregar álbum:',
          error
        );
      }
    }

    setListenLaterDetails(detalhes);
  }

  function salvarPerfil() {
    const perfil = {
      nome,
      bio,
    };

    localStorage.setItem(
      'userProfile',
      JSON.stringify(perfil)
    );

    setEditando(false);
  }

  async function buscarAlbuns(event) {
    event.preventDefault();

    if (!busca.trim()) {
      return;
    }

    setBuscando(true);
    setResultadosBusca([]);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(busca)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Erro ao buscar álbuns'
        );
      }

      setResultadosBusca(data);
    } catch (error) {
      console.error(error);
    } finally {
      setBuscando(false);
    }
  }

  function selecionarAlbum(album) {
    if (posicaoEditando === null) {
      return;
    }

    const novosTopAlbums = [...topAlbums];

    novosTopAlbums[posicaoEditando] = album.id;

    const novosDetalhes = [...topAlbumDetails];

    novosDetalhes[posicaoEditando] = album;

    setTopAlbums(novosTopAlbums);
    setTopAlbumDetails(novosDetalhes);

    localStorage.setItem(
      'topAlbums',
      JSON.stringify(novosTopAlbums)
    );

    setPosicaoEditando(null);
    setBusca('');
    setResultadosBusca([]);
  }

  const totalAvaliacoes = Object.keys(ratings).length;
  const totalListas = listas.length;
  const totalOuvirDepois = listenLater.length;

  return (
    <main className="container py-5">

      {/* PERFIL */}
      <section className="mb-5">

        {!editando ? (
          <>
            <h1>{nome}</h1>

            {bio ? (
              <p>{bio}</p>
            ) : (
              <p className="text-muted">
                Nenhuma bio adicionada.
              </p>
            )}

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setEditando(true)}
            >
              Editar perfil
            </button>
          </>
        ) : (
          <>
            <h2>Editar perfil</h2>

            <div className="mb-3">
              <label className="form-label">
                Nome
              </label>

              <input
                type="text"
                className="form-control"
                value={nome}
                onChange={(event) =>
                  setNome(event.target.value)
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Bio
              </label>

              <textarea
                className="form-control"
                rows="4"
                value={bio}
                placeholder="Escreva algo sobre você..."
                onChange={(event) =>
                  setBio(event.target.value)
                }
              />
            </div>

            <button
              type="button"
              className="btn btn-success"
              onClick={salvarPerfil}
            >
              Salvar
            </button>

            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => setEditando(false)}
            >
              Cancelar
            </button>
          </>
        )}

      </section>

      <hr />

      {/* TOP 3 */}
      <section className="my-5">

        <h2>Top 3 álbuns</h2>

        <div className="row mt-4">

          {[0, 1, 2].map((index) => {
            const album = topAlbumDetails[index];

            return (
              <div
                key={index}
                className="col-md-4 mb-4"
              >
                {album ? (
                  <>
                    <a
                      href={`/album/${album.id}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      {album.images?.[0] && (
                        <img
                          src={album.images[0].url}
                          alt={album.name}
                          className="img-fluid"
                        />
                      )}

                      <h4 className="mt-2">
                        #{index + 1} {album.name}
                      </h4>

                      <p>
                        {album.artists
                          ?.map(
                            (artist) => artist.name
                          )
                          .join(', ')}
                      </p>
                    </a>

                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => {
                        setPosicaoEditando(index);
                        setBusca('');
                        setResultadosBusca([]);
                      }}
                    >
                      Trocar álbum
                    </button>
                  </>
                ) : (
                  <div className="border rounded p-4">

                    <h4>
                      #{index + 1}
                    </h4>

                    <p>
                      Nenhum álbum escolhido.
                    </p>

                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={() => {
                        setPosicaoEditando(index);
                        setBusca('');
                        setResultadosBusca([]);
                      }}
                    >
                      Escolher álbum
                    </button>

                  </div>
                )}
              </div>
            );
          })}

        </div>

        {/* BUSCA PARA ESCOLHER TOP 3 */}
        {posicaoEditando !== null && (
          <div className="mt-4">

            <h3>
              Escolher álbum #{posicaoEditando + 1}
            </h3>

            <form
              onSubmit={buscarAlbuns}
              className="d-flex gap-2 mb-4"
            >
              <input
                type="text"
                className="form-control"
                placeholder="Digite o nome de um álbum ou artista"
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
              />

              <button
                type="submit"
                className="btn btn-success"
              >
                Buscar
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setPosicaoEditando(null);
                  setBusca('');
                  setResultadosBusca([]);
                }}
              >
                Cancelar
              </button>
            </form>

            {buscando && (
              <p>Buscando...</p>
            )}

            <div className="row">

              {resultadosBusca.map((album) => (
                <div
                  key={album.id}
                  className="col-6 col-md-3 col-lg-2 mb-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      selecionarAlbum(album)
                    }
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {album.images?.[0] && (
                      <img
                        src={album.images[0].url}
                        alt={album.name}
                        className="img-fluid"
                      />
                    )}

                    <h6 className="mt-2">
                      {album.name}
                    </h6>

                    <p
                      className="text-muted"
                      style={{
                        fontSize: '14px',
                      }}
                    >
                      {album.artists
                        ?.map(
                          (artist) => artist.name
                        )
                        .join(', ')}
                    </p>
                  </button>
                </div>
              ))}

            </div>

          </div>
        )}

      </section>

      <hr />

      {/* ESTATÍSTICAS */}
      <section className="my-5">

        <h2>Estatísticas</h2>

        <div className="row mt-3">

          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">

                <h3>
                  {totalAvaliacoes}
                </h3>

                <p className="mb-0">
                  Álbuns avaliados
                </p>

              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">

                <h3>
                  {totalListas}
                </h3>

                <p className="mb-0">
                  Listas
                </p>

              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">

                <h3>
                  {totalOuvirDepois}
                </h3>

                <p className="mb-0">
                  Ouvir mais tarde
                </p>

              </div>
            </div>
          </div>

        </div>

      </section>

      <hr />

      {/* OUVIR MAIS TARDE */}
      <section className="my-5">

        <h2>Ouvir mais tarde</h2>

        {listenLaterDetails.length === 0 ? (
          <p className="text-muted">
            Você ainda não adicionou nenhum álbum para ouvir mais tarde.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '20px',
              paddingBottom: '15px',
            }}
          >

            {listenLaterDetails.map((album) => (

              <div
                key={album.id}
                style={{
                  minWidth: '180px',
                  width: '180px',
                }}
              >

                <a
                  href={`/album/${album.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >

                  {album.images?.[0] && (
                    <img
                      src={album.images[0].url}
                      alt={album.name}
                      width="180"
                      height="180"
                      style={{
                        objectFit: 'cover',
                      }}
                    />
                  )}

                  <h5 className="mt-2">
                    {album.name}
                  </h5>

                  <p className="text-muted">
                    {album.artists
                      ?.map(
                        (artist) => artist.name
                      )
                      .join(', ')}
                  </p>

                </a>

              </div>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}