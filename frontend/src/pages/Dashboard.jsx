import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V6"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const res = await api.get('/todos')
      setTodos(res.data)
    } catch {
      setError('Failed to load todos.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    setAdding(true)
    try {
      const res = await api.post('/todos', { title: newTodo.trim() })
      setTodos([res.data, ...todos])
      setNewTodo('')
    } catch {
      setError('Failed to add todo.')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (todo) => {
    try {
      const res = await api.patch(`/todos/${todo._id}`, { completed: !todo.completed })
      setTodos(todos.map(t => t._id === todo._id ? res.data : t))
    } catch {
      setError('Failed to update todo.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/todos/${id}`)
      setTodos(todos.filter(t => t._id !== id))
    } catch {
      setError('Failed to delete todo.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'done') return t.completed
    return true
  })

  const completedCount = todos.filter(t => t.completed).length
  const activeCount = todos.filter(t => !t.completed).length

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : '?'

  return (
    <div className="dashboard-layout">
      <header className="topbar">
        <div className="topbar-logo">Taska<span>.</span></div>
        <div className="topbar-right">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <span>{user?.name}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>
            <span className="greeting">Good day, </span>
            {user?.name?.split(' ')[0]}.
          </h1>
        </div>

        <div className="stats-row">
          <div className="stat-pill accent">
            <span className="num">{todos.length}</span> Total
          </div>
          <div className="stat-pill">
            <span className="num">{activeCount}</span> Active
          </div>
          <div className="stat-pill success">
            <span className="num">{completedCount}</span> Done
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>⚠</span> {error}
            <button
              onClick={() => setError('')}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}
            >×</button>
          </div>
        )}

        <form className="add-todo-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Add a new task… press Enter to save"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            maxLength={200}
          />
          <button type="submit" className="btn-add" disabled={adding || !newTodo.trim()}>
            <PlusIcon /> Add Task
          </button>
        </form>

        <div className="filter-tabs">
          {['all', 'active', 'done'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              {filter === 'done' ? '🏁' : filter === 'active' ? '✨' : '📋'}
            </span>
            <h3>
              {filter === 'done' ? 'Nothing completed yet' :
               filter === 'active' ? 'All caught up!' :
               'No tasks yet'}
            </h3>
            <p>
              {filter === 'done' ? 'Complete some tasks to see them here.' :
               filter === 'active' ? 'Add a task above to get started.' :
               'Add your first task above to get started.'}
            </p>
          </div>
        ) : (
          <div className="todo-list">
            {filtered.map(todo => (
              <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <button
                  className={`todo-check ${todo.completed ? 'checked' : ''}`}
                  onClick={() => handleToggle(todo)}
                  title={todo.completed ? 'Mark as active' : 'Mark as done'}
                />
                <span className="todo-text">{todo.title}</span>
                <span className="todo-date">{formatDate(todo.createdAt)}</span>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(todo._id)}
                  title="Delete task"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
