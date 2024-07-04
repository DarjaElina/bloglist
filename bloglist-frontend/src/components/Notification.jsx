const Notification = ({ notification }) => {
  if (!notification) {
    return null
  }
  const { type, message } = notification
  const styles = {
    color: type === 'success' ? 'green' : 'red',
    fontSize: '20px',
    marginBottom: '5px'
  }
  return (
    <div style={styles} >{message}</div>
  )
}

export default Notification