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
const DEFAULT_SQUARE_SIZE = 25; // 25mm
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
  const [squareSize, setSquareSize] = useState<number>(DEFAULT_SQUARE_SIZE);

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
    // Calculate grid dimensions
    const gridWidthMM = cols * squareSize;
    const gridHeightMM = rows * squareSize;
    
    // Add some padding around the grid
    const paddingMM = 10;
    const viewBoxWidth = gridWidthMM + (paddingMM * 2);
    const viewBoxHeight = gridHeightMM + (paddingMM * 2);
    
    // Center grid within padding
    const startX = paddingMM;
    const startY = paddingMM;

    let squares = [];

    // Define SVG defs for units

    for (let i = 0; i < squaresOnThisPage; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + (col * squareSize);
      const y = startY + (row * squareSize);

      const letters = generateLetterArray();
      const letter = letters[pageIndex * SQUARES_PER_PAGE + i] || '';
      
      squares.push(
        <g key={i} transform={`translate(${x},${y})`}>
          <rect
            width={squareSize}
            height={squareSize}
            fill="rgb(231,203,155)"
            stroke="black"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          <text
            x={squareSize/2}
            y={squareSize/2}
            textAnchor="middle"
            dominantBaseline="central"
            className="letter"
            fontSize={squareSize * 0.6}
          >
            {letter}
          </text>
          <text
            x={squareSize * 0.8}
            y={squareSize * 0.8}
            textAnchor="middle"
            dominantBaseline="central"
            className="score"
            fontSize={squareSize * 0.2}
          >
            {letter ? SCRABBLE_SCORES[letter] : ''}
          </text>
        </g>
      );
    }

    return (
      <svg
        width={`${viewBoxWidth}mm`}
        height={`${viewBoxHeight}mm`}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
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
      <h1>Scrabble Board and Pieces Generator</h1>
      
      <div className="controls">
        <div className="controls-row">
          <div className="control-input">
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
          <div className="control-input">
            <label>
              Square size (mm):
              <input
                type="number"
                value={squareSize}
                onChange={(e) => setSquareSize(Math.max(1, parseInt(e.target.value) || DEFAULT_SQUARE_SIZE))}
                min="1"
              />
            </label>
          </div>
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
        <div className="print-buttons">
          <button onClick={() => window.print()}>Print Letters</button>
          <button onClick={() => {
            // Load and render the template SVG
            fetch('/scrabble.svg')
              .then(response => response.text())
              .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                
                // Get the original SVG viewBox
                const originalSvg = svgDoc.documentElement;
                const viewBox = originalSvg.getAttribute('viewBox') || '0 0 100 100';
                
                // Get the original viewBox dimensions
                const [,, vbWidth, vbHeight] = (originalSvg.getAttribute('viewBox') || '0 0 3300 2550').split(' ').map(Number);
                const outputSquareSize = 25; // Size of each square in mm for printing
                
                // Create array of squares based on original dimensions
                const squares: string[] = [];
                for (let row = 0; row < 7; row++) {
                    for (let col = 0; col < 10; col++) {
                        const x = col * 330; // Original SVG uses 330 units per square
                        const y = row * 330;
                        squares.push(`
                            <svg viewBox="${x} ${y} 330 330" width="${outputSquareSize}mm" height="${outputSquareSize}mm">
                                <use href="#board" x="${-x}" y="${-y}"/>
                            </svg>
                        `);
                    }
                }
                
                // Set up page dimensions
                const pageWidthMM = 279.4; // 11 inches
                const pageHeightMM = 215.9; // 8.5 inches
                const printMarginMM = 12.7; // 0.5 inches
                
                // Create a new document for printing
                const printWindow = window.open('', '_blank');
                if (!printWindow) return;
                
                printWindow.document.write(`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>
                        @page {
                          size: landscape;
                          margin: ${printMarginMM}mm;
                        }
                        @media print {
                          body {
                            width: ${10 * outputSquareSize + 2 * printMarginMM}mm;
                            height: ${7 * outputSquareSize + 2 * printMarginMM}mm;
                          }
                        }
                        body {
                          margin: 0;
                          padding: 0;
                          display: flex;
                          justify-content: center;
                          align-items: flex-start;
                        }
                        .grid {
                          display: grid;
                          grid-template-columns: repeat(10, ${outputSquareSize}mm);
                          grid-template-rows: repeat(7, ${outputSquareSize}mm);
                          gap: 0;
                          page-break-inside: avoid;
                        }
                        .square-container {
                          width: ${outputSquareSize}mm;
                          height: ${outputSquareSize}mm;
                          box-sizing: border-box;
                        }
                      </style>
                    </head>
                    <body>
                      <div>
                        <svg width="0" height="0" style="position: absolute; overflow: hidden">
                          <defs>
                            <symbol id="board" viewBox="0 0 ${vbWidth} ${vbHeight}" preserveAspectRatio="xMidYMid slice">
                              ${svgText}
                            </symbol>
                          </defs>
                        </svg>
                        <div class="grid">
                          ${squares.map((square, index) => `
                            <div class="square-container" data-index="${index}">${square}</div>
                          `).join('')}
                        </div>
                      </div>
                    </body>
                  </html>
                `);
                
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => printWindow.print(), 500);
              });
          }}>Print Board Elements</button>
        </div>
      </div>

      <div className="pages">
        {calculatePages()}
      </div>
    </div>
  );
}

export default App;
