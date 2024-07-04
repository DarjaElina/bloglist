import { useState, useEffect, useRef } from 'react'
import Blog from "./Blog"
import blogService from '../services/blogs'
import Togglable from './Togglable'
import BlogForm from './BlogForm'
import Notification from './Notification'

const BlogList = () => {

  const [blogs, setBlogs] = useState([])

  const [blogNotification, setBlogNotification] = useState(null)

  const blogFormRef = useRef()
  
  useEffect(() => {
    blogService
      .getAll()
      .then(initialBlogs => setBlogs(initialBlogs))
  }, [])

  const addBlog = (blogObj) => {
    blogFormRef.current.toggleVisibility()
    blogService
      .create(blogObj)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
        setBlogNotification({type: 'success', message: `blog ${returnedBlog.title} added successfully`})
        setTimeout(() => {
          setBlogNotification(null)
        }, 5000)
      })
      .catch((exception => {
        console.log(exception)
        setBlogNotification({type: 'error', message: 'error adding blog'})
        setTimeout(() => {
          setBlogNotification(null)
        }, 5000)
      }))
  }

  const handleLike = (id, updatedBlog) => {
    blogService
      .putLike(id, updatedBlog)
      .then((updatedBlog) => {
        setBlogs(blogs.map((blog) => {
          return blog.id === updatedBlog.id ? {...blog, likes: updatedBlog.likes} : blog
        }))
      })
  }

  const removeBlog = (id) => {
    const blogToRemove = blogs.find(b => b.id === id)
    if (window.confirm(`Remove blog ${blogToRemove.title}?`))
    blogService
      .deleteBlog(id)
      .then(() => {
        setBlogs(blogs.filter((blog) => {
          return blog.id !== id
        }))
        setBlogNotification({type: 'success', message: `blog ${blogToRemove.title} removed successfully`})
        setTimeout(() => {
          setBlogNotification(null)
        }, 5000)
      })
      .catch((exception => {
        console.log(exception)
        setBlogNotification({type: 'error', message: 'error removing blog'})
        setTimeout(() => {
          setBlogNotification(null)
        }, 5000)
      }))
  }

  const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes)


  return (
    <div>
      <h2>Blogs</h2>
      <Notification notification={blogNotification}/>
      <Togglable buttonLabel="new blog" ref={blogFormRef}>
          <BlogForm createBlog={addBlog}/>
      </Togglable>
      {sortedBlogs.map(blog =>
        <Blog
          likeBlog={handleLike}
          removeBlog={removeBlog}
          key={blog.id}
          blog={blog}
        />
      )}
    </div>
  )
}

export default BlogList