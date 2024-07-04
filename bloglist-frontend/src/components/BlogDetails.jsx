import { FcLikePlaceholder } from "react-icons/fc";

const BlogDetails = ({ blog, likeBlog, removeBlog }) => {
  
  const like = () => {
    const likedBlog = {
      user: blog.user.id,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url
    }
    likeBlog(blog.id, likedBlog)
    console.log(blog)
  }

  console.log(JSON.parse(window.localStorage.getItem('loggedBlogappUser')).username)

  const loggedUserName = JSON.parse(window.localStorage.getItem('loggedBlogappUser')).username

  const onRemoveBlog = () => {
    removeBlog(blog.id)
  }

  return (
    <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
      <li>{blog.url}</li>
      <li>{blog.user.name}</li>
      <li style={{display: 'flex', color: 'pink'}}>{blog.likes} <FcLikePlaceholder onClick={like}/></li>
      {/* <button onClick={like} >like</button></li> */}
      {loggedUserName === blog.user.username ? <button onClick={onRemoveBlog}>remove blog</button> : null}
    </ul>
  )
}

export default BlogDetails