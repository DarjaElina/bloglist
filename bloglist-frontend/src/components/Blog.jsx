import { useState } from 'react'

import BlogDetails from './BlogDetails'

const Blog = ({ blog, likeBlog, removeBlog, isRemovable }) => {
  const [isVisible, setIsVisible] = useState(false)

  const btnText = isVisible ? 'hide' : 'view'

  const style = {
    border: '3px solid pink',
    padding: '3px',
    margin: '4px'
  }

  return (
    <div data-testid="blog" className='blog' style={style}>
      <p data-testid="title" style={{ margin: 0, padding: 0 }}>{blog.title} <button onClick={() => setIsVisible(!isVisible)}>{btnText}</button></p>
      <p data-testid="author" style={{ margin: 0, padding: 0 }}>{blog.author}</p>
      {isVisible && <BlogDetails
        isRemovable={isRemovable}
        removeBlog={removeBlog}
        likeBlog={likeBlog}
        blog={blog}
      />}
    </div>
  )
}

export default Blog