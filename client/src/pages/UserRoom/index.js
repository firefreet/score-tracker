import React, { useContext, useEffect, useRef, useState } from 'react';
import { Container, Row } from '../../components/Grid';
import RoomNav from '../../components/RoomNav';
import SubmitModal from '../../components/SubmitModal';
import API from '../../utils/API';
import RoomContext from '../../utils/RoomContext';
import GoToQModal from '../../components/GoToQModal';
import RndQstSelectors from '../../components/RndQstSelectors';

function UserRoom() {
  const answer = useRef();
  const submit = useRef();
  const { roomData, /* emit, */ 
    selectedQuestion,
    selectedRound,
    updateGoToCurr,
    goToCurrent
   } = useContext(RoomContext);
   const roomState = useContext(RoomContext);
  const [showGoTo, setShowGoTo] = useState(false);

  // hide GoToQMOdal
  const handleClose = () => {
    setShowGoTo(false);
  }

  // set flag to allow changing <select>'s option to Current Round & Q
  const goToQ = () => {
    updateGoToCurr(true,roomState);
    setShowGoTo(false);
  }

  useEffect(() => {
    if (roomData.rounds.length > 1 || roomData.rounds[0].numberOfQuestions > 1) {
      setShowGoTo(true)
    };
  }, [roomData.rounds])

  function submitAnswer() {
    const respData = {
      roomId: roomData._id,
      userName: 'Giorgio',/* to be made dynamic */
      answer: answer.current.value,
      questionNumber: selectedQuestion,
      roundNumber: selectedRound,
      points: 3
    };
    API.saveAnswer(respData).then(() => {
      // emit('new update', 'time to refresh room from DB')
    });
    // make textarea readonly
    toggleReadonly(true);
  };

  const allowSubmit = () => {
    // onChange of textarea if there is text allow sumbit, otherwise disable 
    answer.current.value !== '' ? toggleSubmit(true) : toggleSubmit(false);
  }

  // set classes and enable or disable the Submit button
  const toggleSubmit = (allowSubmit) => {
    let sub = submit.current;
    let subClass = sub.classList;
    if (!allowSubmit) {
      subClass.remove('text-body');
      subClass.add('text-muted');
      sub.setAttribute('disabled', 'true');
    } else {
      subClass.remove('text-muted');
      subClass.add('text-body');
      sub.removeAttribute('disabled')
    }
  }

  // set classes and enables or disables editing of the textarea 
  const toggleReadonly = (readOnly) => {
    let ans = answer.current;
    if (readOnly) {
      ans.setAttribute('readonly', 'true');
      ans.classList.add('bg-light', 'font-italic', 'text-muted');
      toggleSubmit(false);
    } else {
      ans.removeAttribute('readonly');
      ans.classList.remove('bg-light', 'font-italic', 'text-muted');
      if (ans.value !== '') {
        toggleSubmit(true);
      }
    }
  }

  // looks for previously answered questions and displays if exists
  function showResponse(goTo) {
    let ans = answer.current;
    let qN = selectedQuestion;
    let rN = selectedRound;
    console.log(goTo);
    if(goTo) {
      rN = roomData.rounds.length;
      qN =roomData.rounds[rN -1].numberOfQuestions;
    }
    // get index of user from the Room's participant list array
    let userIndex = roomData.participants.findIndex(element => {
      return element.name === 'Giorgio' /* to be made dynamic */
    })
    // if the user was found...
    if (userIndex !== -1) {
      // get the index of the user's answer to the selected Round & Question
      let answerIndex = roomData.participants[userIndex].responses.findIndex(element => {
        return (element.questionNumber === qN && element.roundNumber === rN)
      })
      // if the answer was found...
      if (answerIndex !== -1) {
        // display the answer
        ans.value = '';
        ans.value = roomData.participants[userIndex].responses[answerIndex].answer;
      } else {
        // answer not found for selected Round/Question
        ans.value = '';
      }
    } else {
      // user not found (so no answers yet)
      ans.value = '';
    }
    // get the current round
    let currRound = roomData.rounds.length;
    // if selected a previous round or question
    if (rN < currRound || (rN === currRound && qN < roomData.rounds[currRound - 1].numberOfQuestions)) {
      // set to read only
      toggleReadonly(true);
    } else {
      // else allow edits
      toggleReadonly(false);
    }
  }
  useEffect(()=>{
    showResponse(true);
  },[goToCurrent])
  
  useEffect(()=>{
    showResponse(false);
  },[selectedQuestion,selectedRound])



  return (
    <div>
      <RoomNav admin="false" room={roomData.roomId} round={roomData.rounds.length} question={roomData.rounds[roomData.rounds.length - 1].numberOfQuestions} />
      <Container>
        <Row>
          <label className='w-100 text-center'>Current Broadcast</label>
        </Row>
        <Row>
          <textarea rows='6' className='mx-auto w-75 bg-light' placeholder=' .... no content from game admin yet' readOnly>{roomData ? roomData.brodcast : ""}</textarea>
        </Row>
        <Row>
          <label className='mx-auto'>Your Response</label>
        </Row>
        <Row>
          <textarea ref={answer} onChange={allowSubmit} rows='6' className='mx-auto w-75' placeholder=' .... enter your answers here'></textarea>
        </Row>
        <br />
        <RndQstSelectors />
        <Row>
          <button className="px-0" style={{ width: '150px' }} onClick={() => { document.location.replace('/gamesummary') }}>
            Score Board
          </button>
          <button ref={submit} className='ml-auto btn-disabled' data-toggle='modal' data-target='#submitModal' style={{ width: '150px' }}>
            Submit Answer
          </button>
        </Row>
        <GoToQModal show={showGoTo} handleClose={handleClose} goToQ={goToQ} />
        <SubmitModal submitAnswer={submitAnswer} />
      </Container>

    </div>
  )
}

export default UserRoom;