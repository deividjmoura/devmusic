import Sidebar from './Sidebar'
import Player from './Player'

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Sidebar esquerda */}
      <Sidebar />

      {/* Área principal (páginas) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 pb-32">
          {children}
        </main>
      </div>

      {/* SEU PLAYER LINDO (fixo no bottom) */}
      <Player />
    </div>
  )
}