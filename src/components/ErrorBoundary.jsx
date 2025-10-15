import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Логирование ошибки
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#ffe0e0',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#d63031', marginBottom: '10px' }}>
            Что-то пошло не так
          </h2>
          <p style={{ color: '#636e72', marginBottom: '15px' }}>
            Произошла ошибка при загрузке компонента. Пожалуйста, обновите страницу.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#00b894',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Обновить страницу
          </button>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#d63031' }}>
              📋 Показать детали ошибки
            </summary>
            <pre style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              color: '#2d3436',
              border: '1px solid #dfe6e9'
            }}>
              <strong>Ошибка:</strong>{'\n'}
              {this.state.error && this.state.error.toString()}
              {'\n\n'}
              <strong>Стек вызовов:</strong>{'\n'}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
