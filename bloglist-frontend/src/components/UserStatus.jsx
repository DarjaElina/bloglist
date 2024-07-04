const UserStatus = ({ username, onLogout }) => {
  
  return (
    <div>
      {username} logged in<button onClick={onLogout}>log out</button>
    </div>
  )
}

export default UserStatus