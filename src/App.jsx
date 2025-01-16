import React from 'react';
import DungeonDesigner from './DungeonDesigner';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main>
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-8">
          ASCII Dungeon Room Generator
        </h1>
        <DungeonDesigner />
      </main>
    </div>
  );
}

export default App;