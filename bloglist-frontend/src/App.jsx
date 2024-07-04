import { useState, useEffect } from 'react'
import BlogList from './components/BlogList'
import LogInForm from './components/LogInForm'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/Togglable'
import UserStatus from './components/UserStatus'

const App = () => {
  const [user, setUser] = useState(null)
  const [loginNotification, setLoginNotification] = useState(null)

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (userObject) => {
    try {
      const user = await loginService.login(userObject)
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setLoginNotification({ type: 'success', message: 'logged in successfully' })
      setTimeout(() => {
        setLoginNotification(null)
      }, 5000)
    } catch(exception) {
      setLoginNotification({ type: 'error', message: 'wrong credentials' })
      setTimeout(() => {
        setLoginNotification(null)
      }, 5000)
    }
  }


  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  return (
    <div>
      <h2 style={{ fontSize: '32px', fontStyle: 'italic', color: 'Pink' }}>Blog List</h2>
      <Notification notification={loginNotification}/>
      {!user && <Togglable buttonLabel="log in">
        <LogInForm onLogin={handleLogin}/>
      </Togglable>}
      {user && <div>
        <UserStatus username={user.name} onLogout={handleLogout}/>
        <BlogList/>
      </div>}
    </div>
  )
}

export default App