# 💬 Simple Chat App

**Simple Chat App** is an open-source web application designed for real-time communication between users. Built from scratch using **React** (frontend) and **Spring Boot (latest version)** (backend), this project demonstrates a full-stack implementation of user registration, friend search, and live messaging with persistent storage and WebSocket integration.

> ⚠️ This is the **first version** of the app and was developed as part of my learning journey. While it’s still under development, it already showcases several core features and a solid project architecture suitable for future extensions.

---

## 🌟 Key Features

- **🔐 User Registration & Authentication**
  - Secure sign-up process with separate password storage
  - Validations and basic error handling

- **📨 Real-Time Messaging**
  - Chat with friends using **SockJS + WebSocket**
  - Messages appear instantly without page reloads

- **🧠 Contact Management**
  - Search users by nickname or email
  - Send and receive friend requests with status tracking

- **🗂️ User Storage System**
  - Each user has a dedicated folder for:
    - Avatars
    - Notification history
    - Settings and preferences

- **🖼️ Profile Customization**
  - Avatar upload with format validation and cropping (1:1, max 512x512)
  - Profile view with dynamic content based on authentication state

- **🛎️ Notification System**
  - Custom JSON-based notification files per user
  - Planned support for in-app and system notifications with real-time delivery

---

## 🚧 Upcoming Features (Roadmap)

- ✅ Edit & delete messages  
- ✅ Read & delivery status indicators  
- ✅ Optimized chat history loading (with pagination)  
- ✅ Group chats and chat metadata  
- ✅ Improved mobile responsiveness and UI polish  
- ✅ Bugfixes and performance optimization  
- ✅ End-to-end message encryption (planned)  

---

## 🛠️ Tech Stack

| Frontend          | Backend              | Storage / Protocols     |
|-------------------|----------------------|--------------------------|
| React             | Spring Boot (Java 21) | SockJS, WebSocket (STOMP) |
| React Router      | Spring Security       | JSON file-based storage   |
| Context API       | REST API (secured)    | FileSystem per user MySQL |

---

## 📁 Folder Structure Highlights

- `/frontend` – React app with modular components and theme support
- `/backend` – Spring Boot app with REST & WebSocket controllers

---

## 🤝 Collaboration & Feedback

This project is open-source and actively maintained. As it's part of my portfolio, feedback, code reviews, and contributions are welcome!

If you're a recruiter and would like to discuss the project or learn more about my background, feel free to reach out via email or LinkedIn. I'm currently open to **Junior Developer** positions and excited to grow in a professional team environment.

---

## 📷 Preview

*(Screenshots and live demo coming soon)*

---

## 📌 Final Notes

> This project reflects both my passion for backend and frontend development and my ability to learn quickly, adapt modern tools, and build functional systems from the ground up. While the current version may have some rough edges, it sets a strong foundation for a scalable real-time application.

Thanks for checking it out!
