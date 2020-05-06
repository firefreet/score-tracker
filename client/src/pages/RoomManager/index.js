import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import RoomContext from '../../utils/RoomContext';
import API from '../../utils/API';
import { Col, Row, Container } from "../../components/Grid";
import Profile from '../../components/Profile';
import TopBar from '../../components/TopBar';

//ROOM MANAGER

function RoomManager(props) {
  const { roomState: { userData, setUserData }, roomState, setRoomState } = useContext(RoomContext);

  useEffect(() => {
    console.log();
  }, []);

  function handleNewRoom(e) {
    e.preventDefault();

    API.createRoom()
      .then(res => {
        setUserData(true, res.data, roomState);
      })
      .catch(err => {
        console.log(err);
      })
  }

  const joinRoom = async (e) => {
    const _id = e.target.getAttribute('id');
    const newRoom = await API.getRoomByCode(_id)

    localStorage.setItem('roomState', JSON.stringify({
      roomID: _id
    }));

    setRoomState({ ...roomState, roomData: newRoom.data[0] })
  }

  const toggleRoomActive = async (e) => {
    let id = e.target.id;
    let state = e.target.dataset.state === 'true' ? false : true;
    let res = await API.toggleRoomActive(state, id);
    setUserData(true, res.data, roomState);    
  }

if (userData.rooms.length === 0) {
  return (
    <div>
      <TopBar />
      <Container>
        <Row>
          <Col>
            <h3>{userData.firstName}'s Rooms</h3>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="mt-4 border px-3 py-3 text-center">
              Looks Like you Don't Have Any Open Rooms! <span role="button" className="responseIoLink" onClick={handleNewRoom}>Open Your First Room</span>
            </div>
            <div className='mt-3'>
              <button
                className="btn btn-warning btn-sm mt-3"
                onClick={handleNewRoom}
              >
                Create First Room
            </button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

if (userData.rooms.length > 0) {

  return (
    <div>
    <TopBar />
    <Container>
      <Row>
        <Col>
          <h3>{userData.firstName}'s Rooms</h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className='mt-3'>
            <table className='table table-striped table-sm'>
              <thead>
                <tr>
                  <th scope='col' className="pl-3">Room #</th>
                  <th scope='col' className="text-center">Active</th>
                  <th scope='col' className="text-right pr-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {userData.rooms.map((room,i) => (
                  <tr key={i}>
                    <td className="pl-3">{room.roomID}</td>
                    <td className="text-center">
                      <div className="custom-control custom-switch">
                        <input onChange={toggleRoomActive} type="checkbox" checked={room.active} data-state={room.active} className="custom-control-input" id={room._id} />
                        <label className="custom-control-label" htmlFor={room._id}></label>
                      </div>
                    </td>
                    <td className="text-right pr-3"><Link to="/adminroom" className="responseIoLink" onClick={joinRoom} id={room.roomID}>Enter</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="btn btn-warning btn-sm mt-3"
              onClick={handleNewRoom}
            >Create New Room</button>
          </div>
        </Col>
      </Row>
      <Profile />
    </Container>
    </div>
  )
}



};

export default RoomManager;

