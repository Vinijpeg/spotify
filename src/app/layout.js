import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/NavBar';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />

        {children}
      </body>
    </html>
  );
}