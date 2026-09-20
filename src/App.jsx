import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Home from './pages/Home';
import WorkScreen from './pages/WorkScreen';
import Gallery from './pages/Gallery';
import Landing from './pages/Landing';
import MagazineViewer from './pages/MagazineViewer';

// No authentication: the app is open and stores its data in the Netlify backend.
function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/projects" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/work/:id" element={<WorkScreen />} />
          <Route path="/magazine/:id" element={<MagazineViewer />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
