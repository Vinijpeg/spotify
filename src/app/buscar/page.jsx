'use client';

// Importa o hook que lê os parâmetros da URL.
// Exemplo:
// /buscar?q=igor
//
// Aqui conseguimos pegar o "igor".
import { useSearchParams } from 'next/navigation';

// useEffect executa código em momentos específicos.
// useState guarda valores que podem mudar na tela.
import { useEffect, useState } from 'react';

export default function Home() {

  // Guarda os álbuns encontrados na busca.
  const [albums, setAlbums] = useState([]);

  // Diz se a busca está acontecendo.
  //
  // false = não está buscando
  // true = está buscando
  const [loading, setLoading] = useState(false);

  // Guarda alguma mensagem de erro.
  const [error, setError] = useState('');

  // Guarda as avaliações dos álbuns.
  //
  // Exemplo:
  //
  // {
  //   "id_do_igor": 5,
  //   "id_do_blonde": 4
  // }
  const [ratings, setRatings] = useState({});


  // Pega os parâmetros da URL.
  //
  // Exemplo:
  // /buscar?q=radiohead
  const searchParams = useSearchParams();

  // Pega especificamente o valor de "q".
  //
  // Nesse caso:
  // pesquisa = "radiohead"
  const pesquisa = searchParams.get('q');


  // Esse useEffect roda quando a página abre.
  //
  // Ele procura avaliações que já estavam salvas
  // no navegador.
  useEffect(() => {

    // Procura no localStorage algo chamado "albumRatings".
    const savedRatings = localStorage.getItem('albumRatings');

    // Se existirem avaliações salvas...
    if (savedRatings) {

      // localStorage guarda tudo como texto.
      //
      // JSON.parse transforma esse texto novamente
      // em um objeto JavaScript.
      setRatings(JSON.parse(savedRatings));
    }

  }, []);

  // [] significa:
  //
  // "rode apenas uma vez quando a página carregar"



  // Esse useEffect fica observando a variável "pesquisa".
  //
  // Se a URL mudar de:
  //
  // /buscar?q=igor
  //
  // para:
  //
  // /buscar?q=blonde
  //
  // ele executa novamente.
  useEffect(() => {

    // Só pesquisa se existir algum texto.
    if (pesquisa) {

      // Chama a função que busca os álbuns.
      searchAlbums(pesquisa);
    }

  }, [pesquisa]);



  // Função responsável por buscar os álbuns.
  //
  // searchQuery é aquilo que o usuário pesquisou.
  //
  // Exemplo:
  // "IGOR"
  async function searchAlbums(searchQuery) {

    // Se não existir pesquisa ou ela estiver vazia,
    // a função para aqui.
    if (!searchQuery || !searchQuery.trim()) {
      return;
    }

    // Ativa a mensagem "Buscando..."
    setLoading(true);

    // Limpa algum erro anterior.
    setError('');

    // Limpa resultados antigos.
    setAlbums([]);

    try {

      // Chama nossa própria API.
      //
      // Exemplo:
      //
      // /api/search?q=IGOR
      //
      // encodeURIComponent serve para deixar o texto
      // seguro para colocar dentro de uma URL.
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );

      // Converte a resposta para JavaScript.
      const data = await response.json();

      // response.ok será false se a API retornar,
      // por exemplo:
      //
      // 400
      // 404
      // 500
      if (!response.ok) {

        // Cria um erro manualmente.
        throw new Error(
          data.error || 'Erro na pesquisa'
        );
      }

      // Se deu tudo certo,
      // coloca os álbuns encontrados no estado.
      //
      // Isso faz a página renderizar os resultados.
      setAlbums(data);

    } catch (error) {

      // Mostra o erro no console do navegador.
      console.error(error);

      // Guarda a mensagem para mostrar na tela.
      setError(error.message);

    } finally {

      // finally sempre executa,
      // dando erro ou não.
      //
      // Então aqui paramos de mostrar "Buscando..."
      setLoading(false);
    }
  }



  // Essa função salva a avaliação de um álbum.
  //
  // albumId = ID do álbum no Spotify
  // rating = nota dada pelo usuário
  function rateAlbum(albumId, rating) {

    // Cria um novo objeto contendo
    // as avaliações anteriores.
    const newRatings = {

      // ...ratings copia tudo que já existia.
      ...ratings,

      // Depois atualiza/adiciona a nota
      // daquele álbum específico.
      [albumId]: rating,
    };

    // Atualiza o estado.
    setRatings(newRatings);

    // Salva no navegador.
    //
    // JSON.stringify transforma o objeto em texto,
    // porque localStorage só consegue armazenar texto.
    localStorage.setItem(
      'albumRatings',
      JSON.stringify(newRatings)
    );
  }



  // Tudo que estiver dentro do return
  // é aquilo que aparece na tela.
  return (
    <main className="container py-5">

      {/* Se loading for true, mostra essa mensagem. */}
      {loading && (
        <p>Buscando...</p>
      )}


      {/* Se existir erro, mostra ele. */}
      {error && (
        <p>{error}</p>
      )}


      {/* Container dos resultados */}
      <div
        style={{
          // Usa Flexbox.
          display: 'flex',

          // Coloca um álbum embaixo do outro.
          flexDirection: 'column',

          // Centraliza os resultados horizontalmente.
          alignItems: 'center',

          // Espaço entre os álbuns.
          gap: '30px',
        }}
      >

        {/* Passa por todos os álbuns encontrados. */}
        {albums.map((album) => {

          // Procura a avaliação desse álbum.
          //
          // Se não existir avaliação, usa 0.
          const albumRating =
            ratings[album.id] || 0;


          // Retorna o visual de cada álbum.
          return (
            <div
              // O React precisa de uma chave única
              // para cada elemento de uma lista.
              key={album.id}

              style={{
                // Coloca capa e texto lado a lado.
                display: 'flex',

                // Centraliza verticalmente.
                alignItems: 'center',

                // Espaço entre capa e informações.
                gap: '25px',

                // Largura de cada resultado.
                width: '700px',

                // Linha separando os álbuns.
                borderBottom: '1px solid #ccc',

                // Espaço antes da linha.
                paddingBottom: '25px',
              }}
            >

              {/* Verifica se o álbum possui uma imagem. */}
              {album.images?.[0] && (

                // Faz a capa ser clicável.
                //
                // Clicando nela:
                //
                // /album/ID_DO_ALBUM
                <a href={`/album/${album.id}`}>

                  <img
                    // URL da capa fornecida pelo Spotify.
                    src={album.images[0].url}

                    // Texto usado caso a imagem não carregue
                    // e também para acessibilidade.
                    alt={album.name}

                    // Largura da capa.
                    width="180"
                  />

                </a>
              )}


              {/* Informações do álbum */}
              <div>

                {/* Nome também é clicável. */}
                <a
                  href={`/album/${album.id}`}

                  style={{
                    // Remove o sublinhado do link.
                    textDecoration: 'none',

                    // Faz o link usar a mesma cor do texto.
                    color: 'inherit',
                  }}
                >

                  {/* Nome do álbum */}
                  <h2>
                    {album.name}
                  </h2>

                </a>


                {/* Artistas do álbum */}
                <p>

                  {album.artists

                    // Pega somente o nome de cada artista.
                    .map(
                      (artist) => artist.name
                    )

                    // Se existir mais de um artista,
                    // separa por vírgula.
                    .join(', ')}

                </p>


                {/* Ano de lançamento */}
                <p>

                  {
                    album.release_date
                      ?.split('-')[0]
                  }

                </p>

              </div>

            </div>
          );
        })}

      </div>

    </main>
  );
}