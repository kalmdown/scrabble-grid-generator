import React, { useState } from 'react';
import './App.css';

interface LetterCount {
  [key: string]: number;
}

const initialLetterCounts: LetterCount = {
  'A': 217, 'B': 22, 'C': 27, 'D': 27, 'E': 126,
  'F': 3, 'G': 9, 'H': 24, 'I': 90, 'J': 21,
  'K': 19, 'L': 93, 'M': 47, 'N': 110, 'O': 54,
  'P': 8, 'Q': 1, 'R': 53, 'S': 60, 'T': 48,
  'U': 20, 'V': 18, 'W': 3, 'X': 14, 'Y': 31, 'Z': 3
};

const SQUARES_PER_PAGE = 70; // 10x7 grid
const SQUARE_SIZE = 25; // 25mm
const DEFAULT_EXTRA_SQUARES = 2;

const SCRABBLE_SCORES: { [key: string]: number } = {
  'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1,
  'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8,
  'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1,
  'P': 3, 'Q': 10, 'R': 1, 'S': 1, 'T': 1,
  'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4,
  'Z': 10
};

function App() {
  const [letterCounts, setLetterCounts] = useState<LetterCount>(initialLetterCounts);
  const [spares, setSpares] = useState<number>(DEFAULT_EXTRA_SQUARES);

  const generateLetterArray = () => {
    const letters: string[] = [];
    Object.entries(letterCounts)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort alphabetically
      .forEach(([letter, count]) => {
        const totalCount = count + spares;
        for (let i = 0; i < totalCount; i++) {
          letters.push(letter);
        }
      });
    return letters;
  };

  const generateSVG = (pageIndex: number, totalSquares: number) => {
    const squaresOnThisPage = Math.min(SQUARES_PER_PAGE, totalSquares - pageIndex * SQUARES_PER_PAGE);
    const rows = 7;
    const cols = 10;
    const pageWidthMM = 279.4; // 11 inches in mm
    const pageHeightMM = 215.9; // 8.5 inches in mm
    const startX = (pageWidthMM - (cols * SQUARE_SIZE)) / 2;
    const startY = (pageHeightMM - (rows * SQUARE_SIZE)) / 2;

    let squares = [];
    for (let i = 0; i < squaresOnThisPage; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + (col * SQUARE_SIZE);
      const y = startY + (row * SQUARE_SIZE);

      const letters = generateLetterArray();
      const letter = letters[pageIndex * SQUARES_PER_PAGE + i] || '';
      
      squares.push(
        <g key={i} transform={`translate(${x},${y})`}>
          <rect
            width={SQUARE_SIZE}
            height={SQUARE_SIZE}
            fill="rgb(231,203,155)"
            stroke="black"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          <text
            x={SQUARE_SIZE/2}
            y={SQUARE_SIZE/2}
            textAnchor="middle"
            dominantBaseline="central"
            className="letter"
            fontSize={SQUARE_SIZE * 0.6}
          >
            {letter}
          </text>
          <text
            x={SQUARE_SIZE * 0.8}
            y={SQUARE_SIZE * 0.8}
            textAnchor="middle"
            dominantBaseline="central"
            className="score"
            fontSize={SQUARE_SIZE * 0.2}
          >
            {letter ? SCRABBLE_SCORES[letter] : ''}
          </text>
        </g>
      );
    }

    return (
      <svg
        width={`${pageWidthMM}mm`}
        height={`${pageHeightMM}mm`}
        viewBox={`0 0 ${pageWidthMM} ${pageHeightMM}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {squares}
      </svg>
    );
  };

  const calculatePages = () => {
    const totalSquares = Object.entries(letterCounts).reduce((sum, [letter, count]) => {
      return sum + count + spares;
    }, 0);

    const numPages = Math.ceil(totalSquares / SQUARES_PER_PAGE);
    const pages = [];

    for (let i = 0; i < numPages; i++) {
      pages.push(
        <div key={i} className="page">
          <h2>Page {i + 1}</h2>
          {generateSVG(i, totalSquares)}
        </div>
      );
    }

    return pages;
  };

  const handleLetterCountChange = (letter: string, value: string) => {
    const count = parseInt(value) || 0;
    setLetterCounts(prev => ({
      ...prev,
      [letter]: count
    }));
  };

  return (
    <div className="App">
      <h1>Letter Grid Generator</h1>
      
      <div className="controls">
        <div className="spares-input">
          <label>
            Spares per letter:
            <input
              type="number"
              value={spares}
              onChange={(e) => setSpares(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
            />
          </label>
        </div>
        <div className="letter-inputs">
          {Object.entries(letterCounts).map(([letter, count]) => (
            <div key={letter} className="letter-input">
              <label>
                {letter}:
                <input
                  type="number"
                  value={count}
                  onChange={(e) => handleLetterCountChange(letter, e.target.value)}
                  min="0"
                />
              </label>
            </div>
          ))}
        </div>
        <button onClick={() => window.print()}>Print All Pages</button>
      </div>

      <div className="pages">
        {calculatePages()}
      </div>
    </div>
  );
}

export default App;
