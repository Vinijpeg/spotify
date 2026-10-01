import Link from 'next/link';

export default function Home() {
  return (
    <main className="container py-5">
      <section className="text-center mb-5">
        <h1>Teste</h1>

        <p>
          Descubra, avalie e organize seus álbuns favoritos.
        </p>

        <Link href="/buscar" className="btn btn-success">
          Buscar álbuns
        </Link>
      </section>

      <section className="mb-5">
        

        <div className="row">
        
            

        </div>
      </section>

      <section>
        
      </section>
    </main>
  );
}