import React from 'react';

interface AdminMailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const AdminMail: React.FC<AdminMailProps> = ({ name, email, subject, message }) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '8px', maxWidth: '600px', margin: 'auto' }}>
      <h2 style={{ color: '#333' }}>New Contact Form Submission</h2>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: '0', fontWeight: 'bold' }}>From:</p>
        <p style={{ margin: '5px 0', color: '#555' }}>{name} ({email})</p>
      </div>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: '0', fontWeight: 'bold' }}>Subject:</p>
        <p style={{ margin: '5px 0', color: '#555' }}>{subject}</p>
      </div>
      <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: '0', fontWeight: 'bold' }}>Message:</p>
        <p style={{ margin: '5px 0', color: '#555' }}>{message}</p>
      </div>
    </div>
  );
};

export default AdminMail;

