// MultiChoice.jsx

import React, { useState, useEffect } from 'react';
import ImageDisplay from './ImageDisplay';
import MultipleChoiceAnswers from './MultipleChoiceAnswers';
import fetchQuestions from './fetchAnswers';
import fetchImage from './fetchImage';
import './MultiChoice.css';

// Map of language codes to flag emoji
const languageFlags = {
  French: '🇫🇷',
  Czech: '🇨🇿',
  Turkish: '🇹🇷'
};

const APIkey = 'g6UXY6FAX2jvOSVhDEvO4HSHmZCyZ3XQ';

const App = () => {
  const [image, setImage] = useState('');
  const [answers, setAnswers] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('French');
  const [activityStarted, setActivityStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [message, setMessage] = useState('');
  const [difficulty, setDifficulty] = useState('Easy'); // New state for difficulty mode

  useEffect(() => {
    if (activityStarted) {
      const timer = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft === 0 || (difficulty === 'Easy' && score >= 30) || (difficulty === 'Normal' && score >= 65) || (difficulty === 'Expert' && score >= 100)) {
            clearInterval(timer);
            // Handle end of activity (e.g., show results)
            if (difficulty === 'Easy' && score >= 30) {
              setMessage('You won!'); // Display message for winning the Easy mode
            } else if (difficulty === 'Normal' && score >= 65) {
              setMessage('You won!'); // Display message for winning the Normal mode
            } else if (difficulty === 'Expert' && score >= 100) {
              setMessage('You won!'); // Display message for winning the Expert mode
            } else {
              setMessage('Time\'s up!'); // Display message for running out of time
            }
          } else {
            return prevTimeLeft - 1;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activityStarted, score, difficulty]);

  useEffect(() => {
    if (activityStarted) {
      fetchData();
    }
  }, [selectedLanguage, activityStarted]);

  const fetchData = async () => {
    try {
      const fetchedQuestions = await fetchQuestions();
      if (fetchedQuestions.length > 0) {
        const selectedQuestion = fetchedQuestions[Math.floor(Math.random() * fetchedQuestions.length)];
        const imageUrl = await fetchImage(selectedQuestion.english_search_term);
        setImage(imageUrl);

        const allAnswers = [...selectedQuestion.incorrect_answers[selectedLanguage.toLowerCase()], selectedQuestion.correct_answer[selectedLanguage.toLowerCase()]];
        setAnswers(shuffleArray(allAnswers)); // Shuffle the answers array
        setCorrectAnswer(selectedQuestion.correct_answer[selectedLanguage.toLowerCase()]);
      } else {
        console.error('No questions found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAnswerClick = async (selectedAnswer) => {
    if (selectedAnswer === correctAnswer) {
      setScore(score + 1);
      setMessage('CORRECT!');
    } else {
      setScore(Math.max(0, score - 1));
      setMessage('INCORRECT!');
    }
    fetchData(); // Fetch new question
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleStartActivity = (difficulty) => {
    setActivityStarted(true);
    setDifficulty(difficulty); // Set difficulty mode when activity starts
  };

  const handleRestartActivity = () => {
    setActivityStarted(false);
    setScore(0);
    setTimeLeft(60);
    setMessage('');
  };

  const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  return (
    <div className="app-container">
      <div className="language-selector">
        <button className={`language-button ${selectedLanguage === 'French' ? 'selected' : ''}`} onClick={() => handleLanguageChange('French')}>French</button>
        <button className={`language-button ${selectedLanguage === 'Czech' ? 'selected' : ''}`} onClick={() => handleLanguageChange('Czech')}>Czech</button>
        <button className={`language-button ${selectedLanguage === 'Turkish' ? 'selected' : ''}`} onClick={() => handleLanguageChange('Turkish')}>Turkish</button>
      </div>
      <div className="difficulty-selector">
        <button className={`difficulty-button ${difficulty === 'Easy' ? 'selected' : ''}`} onClick={() => handleStartActivity('Easy')}>Easy</button>
        <button className={`difficulty-button ${difficulty === 'Normal' ? 'selected' : ''}`} onClick={() => handleStartActivity('Normal')}>Normal</button>
        <button className={`difficulty-button ${difficulty === 'Expert' ? 'selected' : ''}`} onClick={() => handleStartActivity('Expert')}>Expert</button>
      </div>
      {activityStarted && (
        <div className="flag-display">{languageFlags[selectedLanguage]}</div>
      )}
      {!activityStarted ? (
        <button onClick={() => handleStartActivity('Easy')}>Start Activity</button>
      ) : (
        <>
          <ImageDisplay imageUrl={image} size="800px" /> {/* Added image display with size prop */}
          <MultipleChoiceAnswers answers={answers} handleAnswerClick={handleAnswerClick} />
          <div className="score-container">Score: {score}</div>
          <div className="timer-container">Time Left: {timeLeft}</div>
          <div className="message-container">{message}</div>
          <button onClick={handleRestartActivity}>Restart</button>
        </>
      )}
    </div>
  );
};

export default App;
