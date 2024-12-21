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
              <h3 className="text-lg font-semibold mb-2">Challenging Another Player</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Select one of your BINGO Balls to use for the challenge</li>
                <li>Approach another player carrying at least one BINGO Ball and announce your challenge</li>
                <li>Choose either "HIGH" or "LOW" for the challenge</li>
                <li>The defending player selects one of their BINGO Balls to compete (without inspecting the attacker's ball)</li>
                <li>Both players reveal their chosen ball numbers after a countdown from 3</li>
                <li>If the attacker chooses "HIGH" and their ball's number is higher than the defender's, the attacker wins and takes the defender's ball</li>
                <li>If the defender's ball has a higher number, the defender wins and takes the attacker's ball</li>
                <li>The same rules apply for "LOW," but the lower number wins</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Example</h3>
              <div className="pl-6">
                <p>Attacker: Ball #31</p>
                <p>Defender: Ball #15</p>
                <p>If the attacker chooses "HIGH," the attacker wins because 31 {'>'} 15</p>
                <p>If the attacker chooses "LOW," the defender wins because 15 {'<'} 31</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Important Rules</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must keep all your BINGO Balls in your hand at all times until you turn in at least 5 to Kirby. No pocketing or hiding balls</li>
                <li>If you suspect someone is cheating, report it to the host. If confirmed, you'll receive all their BINGO Balls</li>
                <li>You can repeatedly challenge the same player as long as both have at least one BINGO Ball</li>
                <li>If two players challenge each other 5 times in a row and both still have BINGO Balls remaining, they must play a sudden-death game of rock-paper-scissors. The winner takes all of the opponent's BINGO Balls</li>
                <li>Collecting all 7 BINGO Balls is risky, as it will make you a target for challenges</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Rewards</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>5 balls: $1000</li>
                <li>6 balls: $1500</li>
                <li>7 balls: $2000</li>
              </ul>
              <p className="mt-2 text-red-600">Important: Once at least 5 balls are turned in, the reward is no longer available. Players must turn in all their balls at once, not incrementally.</p>
            </div>
          </div>
        </div>

        {/* QR Code Game */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">QR Code Hunt</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Important</h3>
              <p>Scanning these QR codes will unlock Round 2 Main Murder Mystery clues to help you solve the mystery, but they are not required. These clues will make solving the mystery easier.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">How to Play</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Find and scan the hidden QR codes around the room</li>
                <li>There are 24 QR codes in total</li>
                <li>You get 1 point for every QR code</li>
                <li>You get 25 points for solving the Secret String</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Rewards</h3>
              <p>The player with the highest score at the end of the game wins the Code Cracker Award.</p>
            </div>
          </div>
        </div>

        {/* Secrets & Rumors */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Secrets & Rumors</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Character Page</h3>
              <p>On your character page, you'll find:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The first person you need to approach about your secret</li>
                <li>A list of characters and the secrets you'll share with them</li>
                <li>Your rumor line</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">When Approached</h3>
              <p className="font-semibold">If another player approaches you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Check if their name is on your character page:
                  <ul className="list-disc pl-6 mt-2">
                    <li>If it matches, tell them the secret associated with their name</li>
                    <li>You can stick to the script or improvise, but include the bolded secret word</li>
                    <li>Tell them who the next two people are that they should talk to for more secrets (one has the correct secret, one just tells a rumor)</li>
                  </ul>
                </li>
                <li>If their name is NOT on your page:
                  <ul className="list-disc pl-6 mt-2">
                    <li>Tell them your rumor line instead</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Using the Bolded Secret Word</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Say it out loud within quotes</li>
                <li>Use air quotes with your hands as you speak it</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Details</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Each character has 3 exclusive secrets (10 points per secret)</li>
                <li>There are 24 rumors shared among players (1 point per rumor)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Rewards</h3>
              <p>First person to have the highest score by the end of the game wins the Secret Snooper Award.</p>
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
                <li>Convert Cash to Poker Chips:
                  <ul className="list-disc pl-6 mt-2">
                    <li>Use the app to convert your cash into poker chips by placing it in the poker pot while talking to Kirby</li>
                    <li>Speak to Kirby to exchange your dollars for chips or to convert chips back into dollars</li>
                  </ul>
                </li>
                <li>Play Poker:
                  <ul className="list-disc pl-6 mt-2">
                    <li>Join the poker table and play any poker game you like</li>
                  </ul>
                </li>
                <li>Use Chips Freely:
                  <ul className="list-disc pl-6 mt-2">
                    <li>Poker chips aren't just for poker! Use them as bribes or for betting on other activities in the game</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Poker Chip Values</h3>
              <div className="grid grid-cols-1 gap-2 pl-6">
                <div>White Chip: $5</div>
                <div>Red Chip: $25</div>
                <div>Blue Chip: $50</div>
                <div>Green Chip: $100</div>
                <div>Black Chip: $500</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Rewards</h3>
              <p>Person who converts the largest amount of chips by the end of the game wins the Read 'Em and Reap Award.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRulesPage;