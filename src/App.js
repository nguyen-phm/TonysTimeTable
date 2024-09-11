import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormComponent from './components/formComponent';


axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const client = axios.create({
  baseURL: "http://127.0.0.1:8000/"
});

  // const [currentUser, setCurrentUser] = useState();
  // const [registrationToggle, setRegistrationToggle] = useState(false);
  // const [email, setEmail] = useState('');
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');

  // function update_form_btn() {
  //   if (registrationToggle) {
  //     document.getElementById("form_btn").innerHTML = "Register";
  //     setRegistrationToggle(false);
  //   } else {
  //     document.getElementById("form_btn").innerHTML = "Log in";
  //     setRegistrationToggle(true);
  //   }
  // }

  // function submitRegistration(e) {
  //   e.preventDefault();
  //   client.post(
  //     "/auth/signup",
  //     {
  //       email: email,
  //       username: username,
  //       password: password
  //     }
  //   ).then(function (res) {
  //     client.post(
  //       "/auth/login",
  //       {
  //         username: username,
  //         password: password
  //       }
  //     ).then(function (res) {
  //       setCurrentUser(true);
  //     });
  //   });
  // }

  // function submitLogin(e) {
  //   e.preventDefault();
  //   client.post(
  //     "/auth/login/",
  //     {
  //       username: username,
  //       password: password
  //     }
  //   ).then(function (res) {
  //     setCurrentUser(true);
  //   });
  // }

  // function submitLogout(e) {
  // }

function App() {
  return (
    <div>
    </div>
  );
};

export default App;
