import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [author, setAuthor] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = (e) => {
    e.preventDefault()

    createBlog({
      title: title,
      author: author,
      url: url
    })

    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>Create new</h2>
      <form onSubmit={addBlog}>
        <div>
          title:<input
            data-testid="title-input"
            value={title}
            type="text"
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author:<input
            data-testid="author-input"
            value={author}
            type="text"
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          url:<input
            data-testid="url-input"
            value={url}
            type="text"
            onChange={({ target }) => setUrl(target.value)}
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default BlogForm