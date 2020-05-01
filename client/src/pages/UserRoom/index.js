import React, { useContext, useEffect, useRef, useState } from 'react';
import {Link} from 'react-router-dom';
import { Container, Row } from '../../components/Grid';
import RoomNav from '../../components/RoomNav';
import SubmitModal from '../../components/SubmitModal';
import API from '../../utils/API';
import RoomContext from '../../utils/RoomContext';
import GoToQModal from '../../components/GoToQModal';
import RndQstSelectors from '../../components/RndQstSelectors';

// function to establish current state references to check against as previous when state changes
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  })
  return ref.current;
}

function UserRoom() {
  const answer = useRef();
  const submit = useRef();
  const { roomState: { roomData, /* emit, */
    selectedQuestion,
    selectedRound,
    updateGoToCurr,
    goToCurrent
  },
    roomState,
    setRoomState
  } = useContext(RoomContext);
  const [showGoTo, setShowGoTo] = useState(false);
  const prevRoundQuestion = usePrevious(roomData.rounds);
  const prevRoom_Id = usePrevious(roomData._id);

  useEffect(()=>{
    answer.current.value = '';
  },[])

  useEffect(() => {
    showResponse(false);
  }, [roomData, selectedQuestion, selectedRound]);

  // hide GoToQModal
  const handleClose = () => {
    setShowGoTo(false);
  }

  // set flag to allow changing <select>'s option to Current Round & Q
  const goToQ = () => {
    // console.log('gotoQ function')
    updateGoToCurr(true, roomState);
    setShowGoTo(false);
  }

  useEffect(() => {
    const currRound = roomData.rounds.length;
    if (
      (roomData.rounds.length > 1 || roomData.rounds[0] > 1) &&
      (roomData._id !== prevRoom_Id || prevRoundQuestion.length !== currRound || prevRoundQuestion[currRound - 1] !== roomData.rounds[currRound - 1])
    ) {
      setShowGoTo(true)
    };
  }, [roomData._id, roomData.rounds])

  function submitAnswer() {
    const respData = {
      roomId: roomData._id,
      userName: roomState.participant,/* to be made dynamic */
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
    if (goTo) {
      // console.log('go to inside show response')
      rN = roomData.rounds.length;
      qN = roomData.rounds[rN - 1];
      setRoomState({ ...roomState, selectedQuestion: qN, selectedRound: rN })
    }
    // console.log(roomState.roomData.participants);
    // get index of user from the Room's participant list array
    let userIndex = roomData.participants.findIndex(element => {
      return element.name === roomState.participant
    })
    // if the user was found...
    if (userIndex !== -1) {
      // get the index of the user's answer to the selected Round & Question
      let answerIndex = roomData.participants[userIndex].responses.findIndex(element => {
        // console.log('response Question Number' +element.questionNumber)
        // console.log('response Round Number ' + element.roundNumber)
        // console.log('selected Question ' + qN)
        // console.log('selected Round ' + rN)
        return (element.questionNumber === qN && element.roundNumber === rN)
      })
      // if the answer was found...
      if (answerIndex !== -1) {
        // display the answer
        ans.value = roomData.participants[userIndex].responses[answerIndex].answer;
      }
      else {
        // answer not found for selected Round/Question
        // if also not the current round & question
        // console.log('answer not found')
        // console.log(roomState);
        if ((selectedRound !== roomData.rounds.length && selectedQuestion !== roomData.rounds[roomData.rounds.length - 1])
        || goTo)
        // blank the answer
        {
          ans.value = '';
        }

      }
    }
    else {
      // user not found (so no answers yet)
      // also confirm that the this is not the current round/question
      if (selectedRound !== roomData.rounds.length && selectedQuestion !== roomData.rounds[roomData.rounds.length - 1]) 
      // then blank it.
      { ans.value = ''; }
    }
    // get the current round
    let currRound = roomData.rounds.length;
    // if selected a previous round or question
    if (rN < currRound || (rN === currRound && qN < roomData.rounds[currRound - 1])) {
      // set to read only
      toggleReadonly(true);
    } else {
      // else allow edits
      toggleReadonly(false);
    }
  }
  // will run twice for since it gets goToCurrent is getting toggled immediately back by another component
  useEffect(() => {
    // console.log('goTo current?:' + goToCurrent);
    if(goToCurrent) {
      showResponse(true);
    }
  }, [goToCurrent])

  return (
    <div>
      <RoomNav admin="false" room={roomData.roomID} round={roomData.rounds.length} question={roomData.rounds[roomData.rounds.length - 1]} />
      <Container>
        <Row>
          <label className='w-100 text-center'>Current Broadcast</label>
        </Row>
        <Row>
          <textarea rows='6' className='mx-auto w-75 bg-light' placeholder=' .... no content from game admin yet' readOnly value={roomData ? roomData.broadcast : ""}></textarea>
        </Row>
        <Row>
          <label className='mx-auto'>{roomState.participant}'s Response</label>
        </Row>
        <Row>
          <textarea ref={answer} onChange={allowSubmit} rows='6' className='mx-auto w-75' placeholder=' .... enter your answers here'></textarea>
        </Row>
        <br />
        <RndQstSelectors />
        <Row>
          <Link to='gamesummary'>
            <button className="px-0" style={{ width: '150px' }}>
              Score Board
            </button>
          </Link>
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