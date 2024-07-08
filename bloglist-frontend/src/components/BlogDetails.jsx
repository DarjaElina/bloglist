import { FcLikePlaceholder } from 'react-icons/fc'
import PropTypes from 'prop-types'

const BlogDetails = ({ blog, likeBlog, removeBlog, isRemovable }) => {


  const like = () => {
    const likedBlog = {
      user: blog.user.id,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url
    }
    likeBlog(blog.id, likedBlog)
  }

  const onRemoveBlog = () => {
    removeBlog(blog.id)
  }


  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      <li>{blog.url}</li>
      <li>{blog.user.name}</li>
      <li data-testid='likes' style={{ display: 'flex', color: 'pink' }}>{blog.likes} <FcLikePlaceholder style={{ cursor: 'pointer' }} aria-label="like button" onClick={like}/></li>
      {isRemovable && <button onClick={onRemoveBlog}>remove blog</button>}
    </ul>
  )
}

BlogDetails.propTypes = {
  blog: PropTypes.object.isRequired,
  likeBlog: PropTypes.func.isRequired,
  removeBlog: PropTypes.func.isRequired
}

export default BlogDetails