export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const auth = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString('base64');

    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store',
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return Response.json(
        { error: 'Erro ao autenticar com Spotify' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.spotify.com/v1/albums/${id}?market=BR`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        cache: 'no-store',
      }
    );

    const album = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: 'Álbum não encontrado' },
        { status: response.status }
      );
    }

    return Response.json(album);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}