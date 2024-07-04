import { useState } from 'react'

import BlogDetails from './BlogDetails'

const Blog = ({ blog, likeBlog, removeBlog }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  const btnText = isVisible ? 'hide' : 'view'

  return (
    <div style={{border: '3px solid pink', padding: '3px', margin: '4px'}}>
      {blog.title} <button onClick={() => setIsVisible(!isVisible)}>{btnText}</button>
      <br/>
      {blog.author}
      {isVisible && <BlogDetails
        removeBlog={removeBlog}
        likeBlog={likeBlog}
        blog={blog}
      />}
    </div> 
  )
}

export default Blog