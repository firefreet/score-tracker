import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import RoomContext from './utils/RoomContext.js';
import SelectedQuestionContext from './utils/SelectedQuestionContext';
import SelectedRoundContext from './utils/selectedRoundContext';
import API from './utils/API';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import UserRoom from './pages/UserRoom';
import AdminRoom from './pages/AdminRoom';
import RoomManager from './pages/RoomManager';
import NoMatch from './pages/NoMatch';
import Home from './pages/Home';
import GenerateRoom from './pages/GenerateRoom';
import ScoreSummary from './pages/GameSummary/index.js';
import modelRoom from './utils/modelRoom';
import RoomRedirect from './pages/RoomRedirect';
import './global.scss';

function App() {

  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [count, setCount] = useState(0);
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(1);
  const [roomState, setRoomState] = useState({
    roomData: modelRoom,
    loggedIn: decodeURIComponent(document.cookie) !== '',
    userData: null,
    participant: "",
    setUserData: (loginStatus, userObj, currentRoomState) => {
      setRoomState({ ...currentRoomState, loggedIn: loginStatus, userData: userObj })
    },
    selectedQuestion: 1,
    selectedRound: 1,
    updateSelectedQuestion: (selectedQuestion, currentRoomState) => {
      // console.log('update selected Question called')
      setRoomState({ ...currentRoomState, selectedQuestion })
    },
    updateSelectedRound: (selectedRound, currentRoomState) => {
      // console.log('update selected round called')
      setRoomState({ ...currentRoomState, selectedRound })
    }
  });

  useEffect(() => {
    const i = setInterval(async () => {
      const { roomID, participant } = JSON.parse(localStorage.getItem('roomState'));
      // console.log('in interval')
      const loc = document.location.pathname;
      setCount(count >= 1000 ? 0 : count + 1)
      if (authCheckComplete && roomID !== '' && (loc === '/userroom' || loc === '/adminroom' || loc === '/gamesummary')) {
        try {
          // console.log(new Date())
          // console.log('before set state')
          // console.log(roomID)
          const newData = await API.getRoomByCode(roomID);
          // console.log('new data =')
          // console.log(newData.data[0].participant);
          if (participant !== undefined) setRoomState({ ...roomState, roomData: newData.data[0], participant })
          else setRoomState({ ...roomState, roomData: newData.data[0] })
        }
        catch (err) {
          console.log('unable to get room: ' + roomID)
        }
      }
    }, 500);
    return () => clearInterval(i);
  }, [count]);

  // useEffect(() => {
    // console.log('roomstate in use effect of App');
    // console.log(roomState.selectedRound);
    // console.log(roomState)
  // }, [roomState])

  useEffect(() => {
    API.isAuthenticated()
      .then(res => {
        setRoomState({ ...roomState, loggedIn: true, userData: res.data })
      })
      .catch(err => {
        console.log('USER IS NOT LOGGED IN', err.response)
        setRoomState(currentState => ({ ...currentState, loggedIn: false, userData: null }));
      });
    setAuthCheckComplete(true);
  }, []);

  return (
    <Router>
      <div>
        <RoomContext.Provider value={{ roomState, setRoomState }}>
          <SelectedRoundContext.Provider value={{ selectedRound, setSelectedRound }}>
            <SelectedQuestionContext.Provider value={{ selectedQuestion, setSelectedQuestion }}>
              <Switch>
                <Route exact path='/' component={Home} />
                <Route exact path='/userroom' component={UserRoom} />
                <ProtectedRoute exact path='/adminroom' component={AdminRoom} />
                <ProtectedRoute exact path='/rooms' component={RoomManager} />
                <Route exact path='/gamesummary' component={ScoreSummary} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/login" component={Login} />
                {/* Temp route for room generation */}
                {/* <Route exact path="/genroom" component={GenerateRoom} /> */}
                <Route path="/rm/:roomCode" component={RoomRedirect} />
                <Route component={NoMatch} />
              </Switch>
            </SelectedQuestionContext.Provider>
          </SelectedRoundContext.Provider>
        </RoomContext.Provider>
      </div>
    </Router>
  );
}

export default App;
