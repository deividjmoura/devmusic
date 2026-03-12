import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Layout from '@/layout/Layout'

import Home from '@/pages/Home'
import Search from '@/pages/Search'
import Library from '@/pages/Library'
import { MusicProvider } from '@/context/MusicContext'

export default function App() {
  return (
    <MusicProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </MusicProvider>
  )
}
