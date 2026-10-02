'use client';

// Importa os hooks do React.
// useState guarda valores que mudam na página.
// useEffect executa códigos quando a página carrega.
import { useEffect, useState } from 'react';

export default function ListasPage() {
  // Controla se o campo de criar nova lista está aparecendo.
  const [mostrarCriacao, setMostrarCriacao] = useState(false);

  // Guarda o texto digitado no nome da nova lista.
  const [nomeLista, setNomeLista] = useState('');

  // Guarda todas as listas criadas.
  const [listas, setListas] = useState([]);

  // Guarda os dados completos dos álbuns.
  //
  // Exemplo:
  //
  // {
  //   "id_do_album_1": {
  //     id: "...",
  //     name: "IGOR",
  //     images: [...]
  //   },
  //
  //   "id_do_album_2": {
  //     id: "...",
  //     name: "Blonde",
  //     images: [...]
  //   }
  // }
  //
  // Isso é necessário porque dentro das listas
  // salvamos apenas o ID do álbum.
  const [albumDetails, setAlbumDetails] = useState({});

  // Esse useEffect roda uma vez quando a página abre.
  useEffect(() => {
    // Procura no localStorage as listas salvas anteriormente.
    const savedLists = localStorage.getItem('albumLists');

    // Se existirem listas salvas...
    if (savedLists) {
      // JSON.parse transforma o texto salvo de volta
      // para um array JavaScript.
      const parsedLists = JSON.parse(savedLists);

      // Coloca as listas dentro do estado.
      setListas(parsedLists);

      // Depois busca os dados completos dos álbuns
      // que existem dentro dessas listas.
      carregarAlbuns(parsedLists);
    }
  }, []);

  // Essa função recebe todas as listas
  // e busca os dados dos álbuns na nossa API.
  async function carregarAlbuns(listasSalvas) {
    // Aqui vamos guardar todos os IDs dos álbuns.
    const ids = [];

    // Passa por cada lista.
    listasSalvas.forEach((lista) => {
      // Passa por cada álbum dentro daquela lista.
      lista.albums.forEach((albumId) => {
        // Verifica se o ID ainda não foi adicionado.
        //
        // Isso evita buscar o mesmo álbum duas vezes
        // caso ele esteja em duas listas diferentes.
        if (!ids.includes(albumId)) {
          ids.push(albumId);
        }
      });
    });

    // Aqui vamos guardar os dados completos
    // que vierem da API.
    const detalhes = {};

    // Passa por cada ID encontrado.
    for (const albumId of ids) {
      try {
        // Chama a rota que criamos para buscar
        // um álbum específico no Spotify.
        //
        // Exemplo:
        // /api/album/123456
        const response = await fetch(
          `/api/album/${albumId}`
        );

        // Transforma a resposta da API em JavaScript.
        const data = await response.json();

        // Se a resposta deu certo...
        if (response.ok) {
          // Guarda os dados usando o ID como chave.
          //
          // Exemplo:
          //
          // detalhes["123"] = dadosDoAlbum
          detalhes[albumId] = data;
        }
      } catch (error) {
        // Se acontecer algum erro na busca,
        // mostramos no console.
        console.error(
          'Erro ao carregar álbum:',
          error
        );
      }
    }

    // Depois que todos os álbuns forem carregados,
    // coloca tudo dentro do estado.
    setAlbumDetails(detalhes);
  }

  // Função chamada quando clicamos no botão "Criar".
  function criarLista() {
    // Se o nome estiver vazio, não faz nada.
    if (!nomeLista.trim()) return;

    // Cria uma nova lista.
    const novaLista = {
      // Date.now() gera um número baseado no horário atual.
      // Estamos usando isso como ID da lista.
      id: Date.now(),

      // Nome digitado pelo usuário.
      nome: nomeLista,

      // Começa sem nenhum álbum.
      albums: [],
    };

    // Cria um novo array contendo:
    // todas as listas antigas + a nova lista.
    const novasListas = [
      ...listas,
      novaLista
    ];

    // Atualiza a página.
    setListas(novasListas);

    // Salva as listas no navegador.
    //
    // localStorage só aceita texto,
    // então usamos JSON.stringify.
    localStorage.setItem(
      'albumLists',
      JSON.stringify(novasListas)
    );

    // Limpa o campo do nome.
    setNomeLista('');

    // Fecha a área de criação.
    setMostrarCriacao(false);
  }

  return (
    <main className="container py-5">

      {/* Parte superior da página */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        {/* Título */}
        <h1>Listas</h1>

        {/* Botão de + */}
        <button
          type="button"
          className="btn btn-outline-success btn-sm"

          // Ao clicar, alterna entre mostrar e esconder
          // o campo de criação.
          onClick={() =>
            setMostrarCriacao(!mostrarCriacao)
          }

          // Tamanho do botão.
          style={{
            fontSize: '22px',
            width: '40px',
            height: '40px',
          }}
        >
          +
        </button>
      </div>

      {/* Só aparece quando mostrarCriacao for true */}
      {mostrarCriacao && (
        <div className="mb-5">

          {/* Campo para digitar o nome da lista */}
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Nome da lista"

            // O valor do input vem do estado nomeLista.
            value={nomeLista}

            // Toda vez que digitar alguma coisa,
            // atualiza nomeLista.
            onChange={(event) =>
              setNomeLista(event.target.value)
            }
          />

          {/* Botão para criar a lista */}
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={criarLista}
          >
            Criar
          </button>

          {/* Botão para cancelar */}
          <button
            type="button"
            className="btn btn-secondary btn-sm ms-2"
            onClick={() => {
              // Esconde o campo.
              setMostrarCriacao(false);

              // Limpa o nome digitado.
              setNomeLista('');
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Se ainda não tiver nenhuma lista */}
      {listas.length === 0 && (
        <p>
          Você ainda não criou nenhuma lista.
        </p>
      )}

      {/* Passa por todas as listas */}
      {listas.map((lista) => {

        // Para cada ID salvo na lista,
        // tenta encontrar os dados completos daquele álbum
        // dentro de albumDetails.
        const albunsDaLista = lista.albums
          .map(
            (albumId) =>
              albumDetails[albumId]
          )

          // Remove valores vazios.
          //
          // Isso é útil enquanto algum álbum ainda
          // não terminou de carregar.
          .filter(Boolean);

        return (
          <section
            key={lista.id}
            className="mb-5"
          >

            {/* Cabeçalho de cada lista */}
            <div className="d-flex justify-content-between align-items-center mb-3">

              <div>
                {/* Nome da lista */}
                <h2>{lista.nome}</h2>

                {/* Quantidade de álbuns */}
                <p className="text-muted">

                  {lista.albums.length}{' '}

                  {/* Ajusta singular/plural */}
                  {lista.albums.length === 1
                    ? 'álbum'
                    : 'álbuns'}
                </p>
              </div>

            </div>

            {/* Caso a lista esteja vazia */}
            {lista.albums.length === 0 && (
              <p>
                Essa lista ainda está vazia.
              </p>
            )}

            {/* Se já tivermos dados de álbuns */}
            {albunsDaLista.length > 0 && (

              // Esse div funciona como nosso "carrossel".
              //
              // Ele coloca tudo horizontalmente
              // e permite rolar para os lados.
              <div
                style={{
                  // Coloca os álbuns lado a lado.
                  display: 'flex',

                  // Permite rolagem horizontal.
                  overflowX: 'auto',

                  // Espaço entre cada álbum.
                  gap: '20px',

                  // Espaço embaixo.
                  paddingBottom: '15px',
                }}
              >

                {/* Passa por todos os álbuns da lista */}
                {albunsDaLista.map(
                  (album) => (

                    // Container de cada álbum.
                    <div
                      key={album.id}
                      style={{
                        // Impede o álbum de ficar muito pequeno.
                        minWidth: '180px',

                        // Define uma largura fixa.
                        width: '180px',
                      }}
                    >

                      {/* Ao clicar na capa, abre a página do álbum */}
                      <a
                        href={`/album/${album.id}`}
                      >

                        {/* Só mostra a imagem se ela existir */}
                        {album.images?.[0] && (
                          <img
                            src={
                              album.images[0].url
                            }

                            alt={album.name}

                            width="180"
                            height="180"

                            style={{
                              // Faz a imagem preencher
                              // o quadrado corretamente.
                              objectFit: 'cover',
                            }}
                          />
                        )}
                      </a>

                      {/* Nome do álbum */}
                      <h5 className="mt-2">
                        {album.name}
                      </h5>

                      {/* Nome do artista */}
                      <p className="text-muted">

                        {album.artists
                          ?.map(
                            (artist) =>
                              artist.name
                          )
                          .join(', ')}
                      </p>

                    </div>
                  )
                )}

              </div>
            )}

            {/* Linha separando uma lista da outra */}
            <hr />

          </section>
        );
      })}

    </main>
  );
}