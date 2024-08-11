import { HashRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ChallengePage from './pages/ChallengePage';

function App() {
  return (
      <HashRouter>
        <div className="flex flex-col min-h-screen text-white bg-gray-900">
          <Header />
          <main className="container flex-grow px-4 py-8 mx-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/challenge/:categoryId/:challengeId" element={<ChallengePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
  );
}

export default App;
