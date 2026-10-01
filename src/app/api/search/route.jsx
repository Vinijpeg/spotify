// Essa função responde requisições GET feitas para /api/search
export async function GET(request) {
  try {
    // Pega a URL completa da requisição
    // Exemplo:
    // /api/search?q=igor
    const { searchParams } = new URL(request.url);

    // Pega o valor do parâmetro "q"
    // No exemplo acima, query seria "igor"
    const query = searchParams.get('q');

    // Se não tiver nada pesquisado, retorna erro 400
    if (!query) {
      return Response.json(
        { error: 'Digite algo para pesquisar' },
        { status: 400 }
      );
    }

    // Pega as credenciais do Spotify que estão no arquivo .env.local
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    // Verifica se as credenciais realmente existem
    if (!clientId || !clientSecret) {
      // Mostra o erro no terminal do servidor
      console.error('Credenciais do Spotify não encontradas');

      // Retorna erro 500 para o navegador
      return Response.json(
        {
          error:
            'SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET não foi configurado',
        },
        { status: 500 }
      );
    }

    // O Spotify exige que o Client ID e o Client Secret
    // sejam enviados juntos em formato Base64
    //
    // Antes:
    // clientId:clientSecret
    //
    // Depois:
    // uma string codificada em Base64
    const auth = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString('base64');

    // Faz uma requisição para o Spotify pedindo um token de acesso
    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        // O Spotify exige POST para conseguir o token
        method: 'POST',

        headers: {
          // Envia nossas credenciais codificadas
          Authorization: `Basic ${auth}`,

          // Diz ao Spotify o formato dos dados enviados
          'Content-Type': 'application/x-www-form-urlencoded',
        },

        // Diz qual tipo de autenticação estamos usando
        body: 'grant_type=client_credentials',

        // Evita que o Next.js guarde essa resposta em cache
        cache: 'no-store',
      }
    );

    // Converte a resposta do Spotify para JavaScript
    const tokenData = await tokenResponse.json();

    // Verifica se aconteceu algum erro ao pedir o token
    if (!tokenResponse.ok) {
      // Mostra detalhes do erro no terminal
      console.error(
        'Erro ao pegar token do Spotify:',
        tokenData
      );

      // Retorna o erro para o frontend
      return Response.json(
        {
          error: 'Erro ao autenticar com Spotify',

          // Mostra também os detalhes retornados pelo Spotify
          details: tokenData,
        },
        {
          // Usa o mesmo código de erro que o Spotify retornou
          status: tokenResponse.status,
        }
      );
    }

    // Se deu certo, o Spotify retorna algo parecido com:
    //
    // {
    //   access_token: "...",
    //   token_type: "Bearer",
    //   expires_in: 3600
    // }
    //
    // O token que precisamos está aqui:
    const accessToken = tokenData.access_token;

    // Agora fazemos a pesquisa de álbuns de verdade
    const spotifyResponse = await fetch(
      // q = aquilo que o usuário pesquisou
      // type=album = queremos apenas álbuns
      // limit=10 = máximo de 10 resultados
      // market=BR = resultados para o mercado brasileiro
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=album&limit=10&market=BR`,
      {
        headers: {
          // Envia o token que conseguimos anteriormente
          Authorization: `Bearer ${accessToken}`,
        },

        // Também não queremos guardar a pesquisa em cache
        cache: 'no-store',
      }
    );

    // Transforma a resposta do Spotify em um objeto JavaScript
    const spotifyData = await spotifyResponse.json();

    // Verifica se aconteceu algum erro durante a pesquisa
    if (!spotifyResponse.ok) {
      // Mostra o erro no terminal
      console.error(
        'Erro na busca do Spotify:',
        spotifyData
      );

      // Retorna o erro para a página
      return Response.json(
        {
          error: 'Erro ao buscar álbuns no Spotify',
          details: spotifyData,
        },
        {
          status: spotifyResponse.status,
        }
      );
    }

    // A resposta do Spotify contém várias informações.
    //
    // spotifyData.albums.items
    //
    // é o array que contém os álbuns encontrados.
    //
    // Então enviamos apenas os álbuns para o nosso frontend.
    return Response.json(spotifyData.albums.items);

  } catch (error) {
    // Esse catch pega erros inesperados.
    //
    // Por exemplo:
    // - erro de conexão
    // - código quebrado
    // - erro ao converter JSON
    // - alguma variável inesperada

    // Mostra o erro completo no terminal
    console.error('ERRO COMPLETO:', error);

    // Retorna erro 500 para o frontend
    return Response.json(
      {
        error: 'Erro interno do servidor',

        // Retorna a mensagem específica do erro
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}