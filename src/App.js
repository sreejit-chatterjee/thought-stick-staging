import React from 'react';
import './App.css';
import Board from './components/Board';
import { useAuth } from './hooks/useAuth';

function App() {
  const { userId, boardId, authReady } = useAuth();

  // Hold render until session + board are confirmed to avoid flickering
  // and prevent Board from attempting DB calls without a boardId
  if (!authReady) {
    return (
      <div className="App" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FDFBF7' }}>
        <span style={{ fontFamily: 'Caveat, cursive', fontSize: '1.4rem', color: '#9A8A7A', opacity: 0.7 }}>
          loading your board…
        </span>
      </div>
    );
  }

  return (
    <div className="App">
      <Board userId={userId} boardId={boardId} />
    </div>
  );
}

export default App;
