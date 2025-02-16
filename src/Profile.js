import React, {useEffect, useState } from 'react';
import doctorlogo from './images/DOCTOR1.jpg';
import "./Profile.css";
import logo from './images/MedicusLogo.PNG';
import { AudioRecorder } from 'react-audio-voice-recorder';
import { useLocation } from 'react-router-dom';

const Header = () => (
    <header className="header">
    <div className="logo">
      {/* Logo image or icon */}
      <img src={logo} alt="Medicus Logo" className="logo" />
    </div>
    <nav className="nav">
      <a href="/home" className="nav-link">Home</a>
      <a href="/home" className="nav-link">Create a Patient</a>
    </nav>
    <div className="actions">
      <button className="btn create-patient-btn">Logout</button>
      <button className="btn search-btn">
        <i className="fa fa-search"></i>
      </button>
    </div>
  </header>
);

const PatientProfile = () => {
  const [patient, setPatient] = useState(null);
  const location = useLocation();
  const data = location.state;
  useEffect(() => {
    // Assuming the patient ID is 123456
    const patientId = data.patientId;
    alert(patientId);
    fetch(`http://localhost:2006/api/patient/detail?patientId=${patientId}`)
      .then(response => response.json())
      .then(data => setPatient(data))
      .catch(error => console.error('Error fetching patient data:', error));
  }, []);

  if (!patient) {
    return <p>Loading...</p>;
  }

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="patient-profile">
      <h2>Patient Profile</h2>
      <p><strong>Name:</strong> {patient.name}</p>
      <p><strong>Patient ID:</strong> {patient.id}</p>
      <p><strong>Age:</strong> {calculateAge(patient.dob)}</p>
      <p><strong>Gender:</strong> {patient.gender || 'N/A'}</p>
      <p><strong>Location:</strong> New York</p> {/* Assuming location is static */}
      <p><strong>Date:</strong> {new Date(patient.createdDate).toLocaleDateString()}</p>
    </div>
  );
};

const Sidebar = () => (
  <aside className="sidebar">
    <div className="doctor-list">
      <p className="doctor active">Daisy Jones</p>
      <p className="doctor">Shawn Murphey</p>
    </div>
    <div className="tags">
      <span className="tag cardiology">Cardiology</span>
      <span className="tag pulmonology">Pulmonology</span>
      <span className="tag neurology">Neurology</span>
    </div>
    <div className="user-profile">
      <img src={doctorlogo} alt="Amanda" className="avatar" />
      <p className="user-name">Amanda</p>
      <a href="/profile" className="view-profile">View profile</a>
    </div>
  </aside>
);

const Message = ({ text, date, image, type, onEdit, onDelete }) => (
  <div className="message">
    <img src={doctorlogo} alt="Doctor" className="message-avatar" />
    <div className="message-content">
      {image ? <img src={image} alt="ECG" className="message-image" /> : <p>{text}</p>}
      <div className="message-meta">
        <span className="message-date">{date}</span>
        {type === "editable" && <button onClick={onEdit} className="edit-button">Edit</button>}
        {type === "deletable" && <button onClick={onDelete} className="delete-button">Delete</button>}
      </div>
    </div>
  </div>
);

const Chat = () => {
  // State to store recorded audio messages
  const [audioMessages, setAudioMessages] = useState([]);
  const[admissionid,setAdmissionid] = useState([]);
  const[message,setMessage] = useState([]);
  const location = useLocation();
  const data = location.state;
  const [messages, setMessages] = useState([]);

  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    setAdmissionid(data.admissionId);
    if (data.admissionId!=null) {
      fetch(`http://localhost:2006/api/message/messages?admissionId=${data.admissionId}`)
        .then(response => response.json())
        .then(data => 
        {
          setMessages(data)

        }
        
        
        )
        .catch(error => console.error('Error fetching messages:', error));
    }
  });
  
  // Function to handle the completion of a recording
  // const handleRecordingComplete = (blob) => {
  //   // Create a URL for the recorded audio blob
  //   const url = URL.createObjectURL(blob);

  //   // Create a new audio message object with a unique ID and the audio URL
  //   const newAudioMessage = {
  //     id: new Date().getTime(), // Unique identifier
  //     audioUrl: url,
  //     date: new Date().toLocaleString(), // Current date and time
  //   };

  //   // Update the state with the new audio message
  //   setAudioMessages((prevMessages) => [...prevMessages, newAudioMessage]);
  // };

  const sendMessage = async () => { 

    const data = new URLSearchParams();
    data.append('admissionId', admissionid);
    data.append('message', message);
    data.append('mediaType', "TEXT");

    fetch('http://localhost:2006/api/message/add/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data,
    })
    .then(response => {
      setRefreshKey(prevKey => prevKey + 1);
      setMessage("");
    })
    .then(data => {})
    .catch(error => console.error('Error:', error));



  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const blob = new Blob([file], { type: file.type });
      handleRecordingComplete(blob);
    }
  };

  const handleRecordingComplete = async (blob) => {
    // Create a URL for the recorded audio blob
    const url = URL.createObjectURL(blob);
  
    // Create a new audio message object with a unique ID and the audio URL
    const newAudioMessage = {
      id: new Date().getTime(), // Unique identifier
      audioUrl: url,
      date: new Date().toLocaleString(), // Current date and time
      transcription: '', // Placeholder for the transcription
    };
  
    // Update the state with the new audio message
    setAudioMessages((prevMessages) => [...prevMessages, newAudioMessage]);
  
    // Prepare the form data with the recorded audio blob
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm'); // Appending the audio blob with a file name
  
    try {
      // Call the API to transcribe the audio
      const response = await fetch('http://localhost:2006/api/transcribe/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log(response);
      // Parse the JSON response
      
      const data = await response.text();  // Assuming the response has a 'message' field with the transcription
      alert(data);
      setMessage(data);
      // Update the state with the transcription for the corresponding audio message
      setAudioMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newAudioMessage.id
            ? { ...msg, transcription: data.message } // Embed the transcription
            : msg
        )
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const UploadIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 386.883"><path fill-rule="nonzero" d="M377.763 115.7c-9.42 2.733-18.532 6.86-27.591 12.155-9.256 5.41-18.373 12.031-27.649 19.629l-19.849-22.742c16.721-15.527 33.187-26.464 49.108-33.514-13.06-22.39-31.538-38.532-52.418-48.549-21.339-10.238-45.242-14.171-68.507-11.922-23.123 2.234-45.56 10.619-64.123 25.025-21.451 16.646-37.775 41.521-44.034 74.469l-1.959 10.309-10.27 1.801c-27.993 4.909-49.283 18.793-62.859 36.776-7.186 9.518-12.228 20.161-14.969 31.19-2.728 10.979-3.193 22.399-1.243 33.525 3.291 18.766 13.592 36.737 31.669 50.382 5.467 4.128 11.376 7.709 17.886 10.48 6.215 2.647 13.017 4.612 20.558 5.686h78.258v30.246h-78.827l-1.891-.178c-11.099-1.413-20.982-4.186-29.914-7.99-8.994-3.829-16.989-8.65-24.264-14.142C20.256 299.753 6.183 275.02 1.628 249.05c-2.669-15.225-2.027-30.868 1.715-45.929 3.73-15.012 10.524-29.404 20.167-42.177 16.233-21.507 40.501-38.514 71.737-46.241 9.014-35.904 28.299-63.573 53.057-82.786C171.438 13.963 199.327 3.521 228.021.748c28.551-2.76 57.975 2.11 84.339 14.758 28.095 13.479 52.661 35.696 68.986 66.815 13.827-2.201 27.042-1.521 39.42 1.5 18.862 4.603 35.493 14.611 49.212 28.159 13.36 13.193 23.994 29.797 31.216 48.001 16.814 42.377 15.209 93.978-13.361 131.996-9.299 12.37-21.252 22.45-35.572 30.468-13.811 7.735-29.884 13.593-47.949 17.787l-3.368.414h-66.346V310.4h64.727c14.501-3.496 27.297-8.212 38.168-14.299 10.794-6.045 19.62-13.396 26.238-22.2 21.842-29.066 22.745-69.34 9.463-102.815-5.698-14.359-13.999-27.371-24.363-37.605-10.007-9.882-21.906-17.126-35.154-20.36-6.654-1.625-13.721-2.248-21.145-1.705l-14.769 4.284zM205.205 265.348c-5.288 6.391-14.756 7.285-21.148 1.997-6.391-5.288-7.285-14.757-1.997-21.148l59.645-72.019c5.288-6.392 14.757-7.285 21.148-1.998a15.053 15.053 0 012.707 2.921l60.072 72.279c5.287 6.359 4.42 15.802-1.939 21.09-6.359 5.287-15.801 4.42-21.089-1.939l-34.288-41.256.202 146.628c0 8.273-6.707 14.98-14.98 14.98-8.274 0-14.981-6.707-14.981-14.98l-.202-146.582-33.15 40.027z"/>
   </svg>
  );


  return (
    <div className="chat">
      {/* Existing messages */}
    {
      messages.map((message, index) => (
        <Message
        text={message.messages}
        date="16th Oct 2024 02:10:39"
        type="editable"
        onEdit={() => alert('Edit message')}
      />
        ))
      }
      

      {/* Render recorded audio messages */}
      {audioMessages.map((message) => (
        <div key={message.id} className="audio-message">
          <audio controls src={message.audioUrl}></audio>
          <p>{message.date}</p>
        </div>
      ))}

      {/* Chat input area */}
      <div className="chat-input">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          audioTrackConstraints={{
            noiseSuppression: true,
            echoCancellation: true,
          }}
          downloadOnSavePress={true}
          downloadFileExtension="webm"
        />



      <label htmlFor="file-upload" className="file-upload-label">
        <input
          id="file-upload"
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

         {/* <UploadIcon /> Upload Audio */}
        
      </label>
    


        <input type="text" 
        value={message} 
        placeholder="Type a message..."
        onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage} className="send-button">Send</button>
      </div>
    </div>
  );
};




const Profile = () => (
  <div className="profile-page">
    <Header />
    <main className="main-content">
      <div className="left-section">
        <PatientProfile />
        <Sidebar />
      </div>
      <div className="right-section">
        <Chat />
      </div>
    </main>
  </div>
);

export default Profile;
