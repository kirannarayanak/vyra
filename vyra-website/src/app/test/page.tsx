export default function TestPage() {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
      minHeight: '100vh',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '2rem', color: '#06b6d4' }}>
        🚀 VYRA FUTURISTIC DESIGN TEST 🚀
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        If you can see this page, the deployment is working!
      </p>
      <p style={{ fontSize: '1rem', color: '#06b6d4' }}>
        Timestamp: {new Date().toLocaleString()}
      </p>
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(6, 182, 212, 0.1)',
        borderRadius: '10px',
        border: '1px solid #06b6d4'
      }}>
        <p>This is a test to verify that:</p>
        <ul>
          <li>✅ Vercel is deploying from GitHub</li>
          <li>✅ The new design is loading</li>
          <li>✅ CSS and styling are working</li>
        </ul>
      </div>
    </div>
  )
}
