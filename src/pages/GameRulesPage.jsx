import React from 'react';

const GameRulesPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Game Rules</h1>
      
      {/* Awards Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Awards</h2>
        <div className="grid gap-3">
          <div className="award-item">• <strong>Best Costume Award</strong> (Person with highest votes in Best Costume)</div>
          <div className="award-item">• <strong>Best Actor Award</strong> (Person with highest votes in Best Actor)</div>
          <div className="award-item">• <strong>Money Bags Award</strong> (Person with the most amount of cash at end of game)</div>
          <div className="award-item">• <strong>Code Cracker Award</strong> (Person with the most amount of QR points at end of game)</div>
          <div className="award-item">• <strong>Secret Snooper Award</strong> (Person with the most amount of Secret points at end of game)</div>
          <div className="award-item">• <strong>Read 'Em and Reap Award</strong> (Person who converts the largest amount of chips converted by the end of game)</div>
          <div className="award-item">• <strong>Bingo Balls Award</strong> (Person who submits at least 5 BINGO balls)</div>
          <div className="award-item">• <strong>Slimy Suspect Award</strong> (Person with the most amount of murderer votes)</div>
        </div>
      </div>

      {/* Mini Games Section */}
      <div className="space-y-6">
        {/* Bingo Balls */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Kirby's BINGO Balls</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Objective</h3>
              <p>Find the 7 hidden BINGO Balls scattered around the basement.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
              <p>Once you find at least one BINGO Ball, you can challenge other players who also have at least one ball. They must accept the challenge.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Challenge Rules</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Select one of your BINGO Balls for the challenge</li>
                <li>Choose either "HIGH" or "LOW" for the challenge</li>
                <li>Defender selects their ball without inspecting attacker's ball</li>
                <li>Both players reveal their numbers after a countdown</li>
                <li>Winner takes the loser's ball</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Rewards</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>5 balls: $1000</li>
                <li>6 balls: $1500</li>
                <li>7 balls: $2000</li>
              </ul>
              <p className="mt-2 text-red-600">Note: Once at least 5 balls are turned in, no further rewards can be claimed.</p>
            </div>
          </div>
        </div>

        {/* QR Code Game */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">QR Code Hunt</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">How to Play</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Find and scan hidden QR codes around the room</li>
                <li>24 QR codes in total</li>
                <li>1 point per QR code</li>
                <li>25 points for solving the Secret String</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Secrets & Rumors */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Secrets & Rumors</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Character Information</h3>
              <p>Your character page contains:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>First person to approach about your secret</li>
                <li>List of characters and their associated secrets</li>
                <li>Your rumor line</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Scoring</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Each character has 3 exclusive secrets (10 points each)</li>
                <li>24 rumors shared among players (1 point each)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Poker Game */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Poker Game</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">How to Play</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Convert cash to chips through the app with Kirby</li>
                <li>Join the poker table for any poker game</li>
                <li>Use chips for bribes or betting on other activities</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Chip Values</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>White Chip: $5</div>
                <div>Red Chip: $25</div>
                <div>Blue Chip: $50</div>
                <div>Green Chip: $100</div>
                <div>Black Chip: $500</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRulesPage;