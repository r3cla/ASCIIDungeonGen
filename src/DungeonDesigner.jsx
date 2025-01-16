import React, { useState } from 'react';
import { Share2, Save, Download, Shuffle, Info, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

const DungeonDesigner = () => {
  const calculateLimits = (size) => {
    const maxDoors = Math.min(4, (size - 2) * 4);
    const innerArea = (size - 2) * (size - 2);
    const maxFeatures = Math.floor(innerArea * 0.4);
    return { maxDoors, maxFeatures };
  };

  const [currentTemplate, setCurrentTemplate] = useState({
    name: 'Untitled Room',
    size: 8,
    doors: 2,
    features: 3,
    tags: ['standard']
  });

  const [savedRooms, setSavedRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [showTips, setShowTips] = useState(true);
  const [customFeatures, setCustomFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState({
    name: '',
    symbol: '',
    color: ''
  });

  const availableSymbols = ['<3', '@', '%', '^', '&', '_', '~', '='];

  const availableColors = [
    { name: 'Green', value: 'text-green-600', bg: 'bg-green-600' },
    { name: 'Blue', value: 'text-blue-600', bg: 'bg-blue-600' },
    { name: 'Cyan', value: 'text-cyan-600', bg: 'bg-cyan-600' },
    { name: 'Emerald', value: 'text-emerald-600', bg: 'bg-emerald-600' },
    { name: 'Teal', value: 'text-teal-600', bg: 'bg-teal-600' },
    { name: 'Indigo', value: 'text-indigo-600', bg: 'bg-indigo-600' },
    { name: 'Violet', value: 'text-violet-600', bg: 'bg-violet-600' },
    { name: 'Pink', value: 'text-pink-600', bg: 'bg-pink-600' }
  ];

  const generateRoom = () => {
    let newRoom = Array(currentTemplate.size).fill().map(() => Array(currentTemplate.size).fill('.'));

    // Add walls
    for (let i = 0; i < currentTemplate.size; i++) {
      newRoom[0][i] = '#';
      newRoom[currentTemplate.size - 1][i] = '#';
      newRoom[i][0] = '#';
      newRoom[i][currentTemplate.size - 1] = '#';
    }

    // Add doors with validation
    const doorPositions = [];
    while (doorPositions.length < currentTemplate.doors) {
      const pos = Math.floor(Math.random() * 4);
      const coord = 1 + Math.floor(Math.random() * (currentTemplate.size - 2));

      let doorCoord;
      switch (pos) {
        case 0: doorCoord = [0, coord]; break;
        case 1: doorCoord = [coord, currentTemplate.size - 1]; break;
        case 2: doorCoord = [currentTemplate.size - 1, coord]; break;
        case 3: doorCoord = [coord, 0]; break;
      }

      if (!doorPositions.some(([x, y]) => x === doorCoord[0] && y === doorCoord[1])) {
        doorPositions.push(doorCoord);
        newRoom[doorCoord[0]][doorCoord[1]] = '+';
      }
    }

    // Add features with balanced distribution
    const defaultFeatures = ['$', 'M', '*'];
    const features = [...defaultFeatures, ...customFeatures.map(f => f.symbol)];

    for (let i = 0; i < currentTemplate.features; i++) {
      let attempts = 0;
      while (attempts < 50) {
        const x = 1 + Math.floor(Math.random() * (currentTemplate.size - 2));
        const y = 1 + Math.floor(Math.random() * (currentTemplate.size - 2));

        const isFarEnough = !doorPositions.some(([dx, dy]) =>
          Math.abs(dx - x) + Math.abs(dy - y) < 2
        );

        if (newRoom[y][x] === '.' && isFarEnough) {
          newRoom[y][x] = features[i % features.length];
          break;
        }
        attempts++;
      }
    }

    return newRoom;
  };

  const handleSave = () => {
    if (room) {
      const newSavedRoom = {
        ...currentTemplate,
        layout: room,
        id: Date.now(),
        created: new Date().toISOString()
      };
      setSavedRooms([...savedRooms, newSavedRoom]);
    }
  };

  const handleExport = () => {
    if (room) {
      const exportData = {
        template: currentTemplate,
        layout: room,
        exported: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTemplate.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {showTips && (
        <Alert className="bg-blue-50 border-blue-200 flex items-center justify-between py-3 px-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-sm">
              Start by adjusting the room size, then add doors and features to create your perfect dungeon room.
            </AlertDescription>
          </div>
          <button
            onClick={() => setShowTips(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="flex justify-between items-center">
            <input
              type="text"
              value={currentTemplate.name}
              onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
              className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              placeholder="Room Name"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="p-2 hover:bg-gray-200 rounded transition-colors duration-200 tooltip"
                title="Save Room"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 hover:bg-gray-200 rounded transition-colors duration-200 tooltip"
                title="Export JSON"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setRoom(generateRoom())}
                className="p-2 hover:bg-gray-200 rounded transition-colors duration-200 tooltip"
                title="Generate New Layout"
              >
                <Shuffle className="w-5 h-5" />
              </button>

            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Room Size</label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="20"
                  value={currentTemplate.size}
                  onChange={(e) => {
                    const newSize = Math.min(20, Math.max(5, parseInt(e.target.value) || 5));
                    const { maxDoors, maxFeatures } = calculateLimits(newSize);
                    setCurrentTemplate({
                      ...currentTemplate,
                      size: newSize,
                      doors: Math.min(currentTemplate.doors, maxDoors),
                      features: Math.min(currentTemplate.features, maxFeatures)
                    });
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-8 top-2 text-sm text-gray-500">x{currentTemplate.size}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Doors</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={calculateLimits(currentTemplate.size).maxDoors}
                  value={currentTemplate.doors}
                  onChange={(e) => {
                    const { maxDoors } = calculateLimits(currentTemplate.size);
                    const newDoors = Math.min(maxDoors, Math.max(1, parseInt(e.target.value) || 1));
                    setCurrentTemplate({ ...currentTemplate, doors: newDoors });
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-8 top-2 text-sm text-gray-500">
                  max: {calculateLimits(currentTemplate.size).maxDoors}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Features</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={calculateLimits(currentTemplate.size).maxFeatures}
                  value={currentTemplate.features}
                  onChange={(e) => {
                    const { maxFeatures } = calculateLimits(currentTemplate.size);
                    const newFeatures = Math.min(maxFeatures, Math.max(0, parseInt(e.target.value) || 0));
                    setCurrentTemplate({ ...currentTemplate, features: newFeatures });
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-8 top-2 text-sm text-gray-500">
                  max: {calculateLimits(currentTemplate.size).maxFeatures}
                </span>
              </div>
            </div>
          </div>

          {room && (
            <div className="bg-gray-50 p-6 rounded-lg border shadow-inner">
              <div className="grid place-items-center">
                {room.map((row, i) => (
                  <div key={i} className="flex">
                    {row.map((cell, j) => {
                      const customFeature = customFeatures.find(f => f.symbol === cell);
                      const cellClass = customFeature ? customFeature.color :
                        cell === '$' ? 'text-yellow-600' :
                          cell === 'M' ? 'text-red-600' :
                            cell === '*' ? 'text-purple-600' : '';

                      return (
                        <div
                          key={`${i}-${j}`}
                          className={`w-8 h-8 flex items-center justify-center font-mono text-lg
                            ${cell === '#' ? 'bg-gray-200' : ''}
                            ${cell === '+' ? 'bg-blue-100' : ''}
                            ${cellClass}
                          `}
                          title={getTileDescription(cell)}
                        >
                          {cell}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6 pt-4 border-t">
            <div className="space-y-1">
              <div className="font-medium text-sm text-gray-700">Features</div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center font-mono bg-gray-200">#</span>
                  <span>Wall</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center font-mono">.</span>
                  <span>Floor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center font-mono bg-blue-100">+</span>
                  <span>Door</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center font-mono text-yellow-600">$</span>
                  <span>Treasure</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center font-mono text-red-600">M</span>
                  <span>Monster</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center font-mono text-purple-600">*</span>
                  <span>Special</span>
                </div>
                {customFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className={`w-6 h-6 flex items-center justify-center font-mono ${feature.color}`}>
                      {feature.symbol}
                    </span>
                    <span>{feature.name}</span>
                    <button
                      onClick={() => {
                        setCustomFeatures(customFeatures.filter((_, i) => i !== index));
                      }}
                      className="ml-auto p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-2">
                      <Plus className="w-4 h-4" />
                      <span>Add Custom Feature</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Custom Feature</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Feature Name</label>
                        <input
                          type="text"
                          value={newFeature.name}
                          onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter feature name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Symbol</label>
                        <Select
                          onValueChange={(value) => setNewFeature({ ...newFeature, symbol: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a symbol" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSymbols.map((symbol) => (
                              <SelectItem key={symbol} value={symbol}>
                                {symbol}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Color</label>
                        <Select
                          onValueChange={(value) => setNewFeature({ ...newFeature, color: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a color" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableColors.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded ${color.bg}`}></div>
                                  {color.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <button
                        onClick={() => {
                          if (newFeature.name && newFeature.symbol && newFeature.color) {
                            setCustomFeatures([...customFeatures, newFeature]);
                            setNewFeature({ name: '', symbol: '', color: '' });
                          }
                        }}
                        className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4"
                        disabled={!newFeature.name || !newFeature.symbol || !newFeature.color}
                      >
                        Add Feature
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 py-4 border-t">
        <p className="text-center text-sm text-gray-600">
          This is an open-source project. View the source code on{' '}
          <a
            href="https://github.com/yourusername/dungeon-room-designer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

const getTileDescription = (tile) => {
  const descriptions = {
    '#': 'Wall',
    '+': 'Door',
    '$': 'Treasure',
    'M': 'Monster',
    '*': 'Special Feature',
    '.': 'Empty Floor'
  };
  return descriptions[tile] || tile;
};

export default DungeonDesigner;