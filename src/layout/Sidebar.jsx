import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <div>
      <h2>DevMusic</h2>

      <nav>
        <Link to="/">Home</Link>
        <br />
        <Link to="/search">Search</Link>
        <br />
        <Link to="/library">Library</Link>
      </nav>
    </div>
  )
}
