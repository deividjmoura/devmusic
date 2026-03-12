import Sidebar from './Sidebar'
import Player from './Player'

export default function Layout({ children }) {
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <Sidebar />

        <main style={{ padding: '20px' }}>{children}</main>
      </div>

      <Player />
    </div>
  )
}
