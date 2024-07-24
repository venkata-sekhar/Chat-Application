import React, { useContext, useEffect } from "react";
import { Col, ListGroup, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux"; 
import { AppContext } from "../context/appContext";
import { addNotifications, resetNotifications } from "../features/userSlice";
import defaultProfilePicture from "../assets/default-profile-picture.jpg";
import "./Sidebar.css";

function Sidebar() {
    const user = useSelector((state) => state.user); 
    const newMessages = useSelector((state) => state.user?.newMessages); 
    const dispatch = useDispatch();
    const { socket, setMembers, members, setCurrentRoom, setRooms, privateMemberMsg, rooms, setPrivateMemberMsg, currentRoom } = useContext(AppContext);

    useEffect(() => {
        if (user) {
            setCurrentRoom("general");
            getRooms();
            socket.emit("join-room", "general");
            socket.emit("new-user");
        }
    }, [user]);

    socket.on("notifications", (room) => {
        dispatch(addNotifications(room));
    });

    function getRooms() {
        fetch("http://localhost:5001/rooms")
            .then((res) => res.json())
            .then((data) => setRooms(data));
    }

    socket.off("new-user").on("new-user", (payload) => {
        setMembers(payload);
    });

    socket.off("notifications").on("notifications", (room) => {
        if (currentRoom !== room) {
            dispatch(addNotifications(room));
        }
    });


    function joinRoom(room, isPublic = true) {
        if (!user) {
            return alert("Please login");
        }

        if (!isPublic) {
            setCurrentRoom(room);
        } else {
            setCurrentRoom(room);
            setPrivateMemberMsg(null);
        }

        socket.emit("join-room", room, currentRoom);

        dispatch(resetNotifications(room));
    }

    function orderIds(id1, id2) {
        return id1 > id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
    }

    function handlePrivateMemberMsg(member) {
        setPrivateMemberMsg(member);
        const roomId = orderIds(user._id, member._id);
        joinRoom(roomId, false);
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <h2>Available rooms</h2>
            <ListGroup>
            {rooms.map((room, idx) => (
    <ListGroup.Item
        key={idx}
        onClick={() => joinRoom(room)}
        active={currentRoom === room || (currentRoom && currentRoom.includes(room))}
        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
    >
        {room} {newMessages[room] && <span className="badge rounded-pill bg-primary">{newMessages[room]}</span>}
    </ListGroup.Item>
))}
            </ListGroup>
            <h2>Members</h2>
            {members.map((member) => (
                <ListGroup.Item
                    key={member._id}
                    onClick={() => handlePrivateMemberMsg(member)}
                    active={privateMemberMsg?._id === member._id}
                    style={{ cursor: "pointer" }}
                    disabled={member._id === user._id}
                >
                    <Row>
                        <Col xs={2} className="member-status">
                            <img
                                src={defaultProfilePicture}
                                className="member-status-img"
                                alt={member.name}
                            />
                            {member.status === "online" ? (
                                <i className="fas fa-circle sidebar-online-status"></i>
                            ) : (
                                <i className="fas fa-circle sidebar-offline-status"></i>
                            )}
                        </Col>
                        <Col xs={9}>
                            {member.name}
                            {member._id === user?._id && " (You)"}
                            {member.status === "offline" && " (Offline)"}
                        </Col>
                        <Col xs={1}>
                            <span className="badge rounded-pill bg-primary">{newMessages[orderIds(member._id, user._id)]}</span>
                        </Col>
                    </Row>
                </ListGroup.Item>
            ))}
        </>
    );
}

export default Sidebar;
