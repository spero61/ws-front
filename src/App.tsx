// src/App.tsx
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";

interface VoteState {
  participants: string[];
  votes: Record<string, number>;
  hasVoted: Record<string, boolean>;
  showResults: boolean;
  votingComplete: boolean;
}

const VOTE_OPTIONS = [0.5, 1, 2, 3];
const SOCKET_URL = "167.179.77.239:3001";

const App = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [voteState, setVoteState] = useState<VoteState>({
    participants: [],
    votes: {},
    hasVoted: {},
    showResults: false,
    votingComplete: false,
  });

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("voteState", (newState: VoteState) => {
      setVoteState(newState);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinVoting = () => {
    if (username && socket) {
      socket.emit("join", username);
    }
  };

  const submitVote = (value: number) => {
    if (socket) {
      socket.emit("vote", { username, value });
    }
  };

  const showResults = () => {
    if (socket) {
      socket.emit("showResults");
    }
  };

  const resetVoting = () => {
    if (socket) {
      socket.emit("resetVoting");
    }
  };

  if (!isConnected) {
    return <div className="loading">Connecting to server...</div>;
  }

  if (!username || !voteState.participants.includes(username)) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>ニックネームを入力してください</h2>
        </div>
        <div className="card-content">
          <input
            type="text"
            placeholder="ニックネーム"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
          />
          <button onClick={joinVoting} className="button primary">
            参加する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>リファインメント</h2>
      </div>
      <div className="card-content">
        <div className="section">
          <h3>参加者:</h3>
          <div className="participants-list">
            {voteState.participants.map((participant) => (
              <span
                key={participant}
                className={`participant-badge ${
                  voteState.hasVoted[participant] ? "voted" : ""
                }`}
              >
                {participant}
                {voteState.hasVoted[participant] && " ✓"}
              </span>
            ))}
          </div>
        </div>

        {!voteState.hasVoted[username] && (
          <div className="section">
            <h3>このタスクのポイントは？</h3>
            <div className="vote-options">
              {VOTE_OPTIONS.map((value) => (
                <button
                  key={value}
                  onClick={() => submitVote(value)}
                  className="button vote-button"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {voteState.votingComplete && !voteState.showResults && (
          <div className="section">
            <button onClick={showResults} className="button primary">
              結果を見る
            </button>
          </div>
        )}

        {voteState.showResults && (
          <div className="section">
            <h3>結果発表</h3>
            <div className="results-list">
              {Object.entries(voteState.votes).map(([participant, vote]) => (
                <div key={participant} className="result-item">
                  <span>{participant}:</span>
                  <span className="vote-value">{vote}</span>
                </div>
              ))}
            </div>
            <button onClick={resetVoting} className="button primary">
              リセット
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
