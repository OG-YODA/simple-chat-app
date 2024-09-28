import React from 'react';
import '../styles/main.css';

function Main() {
  return (
    <div class="content">
      <h1>Welcome to Our Messenger</h1>
      <section>
        <h2>Latest News</h2>
        <ul>
          <li>Version 1.1 released - Added new features and improvements!</li>
          <li>Version 1.0 released - Initial release of the messenger!</li>
        </ul>
      </section>
      <section>
        <h2>Why Choose Our Messenger?</h2>
        <ul>
          <li>Secure and private messaging</li>
          <li>Fast and reliable communication</li>
          <li>Easy to use interface</li>
        </ul>
      </section>
    </div>
  );
}

export default Main;