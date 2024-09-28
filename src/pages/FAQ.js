import React from 'react';
import '../styles/faq.css';

function FAQ() {
  return (
    <div class="content">
      <h1>Frequently Asked Questions</h1>

      <div class="faq_block">
        <h3>General</h3>
        <ul>
          <li><a href="">What is HMessenger?</a></li>
          <li><a href="">Who is it for?</a></li>
          <li><a href="">How old is HMessenger?</a></li>
          <li><a href="">Is it available on my device?</a></li>
          <li><a href="">Do you process data requests?</a></li>
          <li><a href="">What are your thoughts on internet privacy?</a></li>
          <li><a href="">Where is HMessenger based?</a></li>
          <li><a href="">What about GDPR?</a></li>
          <li><a href="">Who are the people behind HMessenger?</a></li>
        </ul>
      </div>
      
      <div class="faq_block">
        <h3>HMessenger basics</h3>
        <ul>
          <li><a href="">Who can I message?</a></li>
          <li><a href="">Who can message me?</a></li>
          <li><a href="">Who has HMessenger?</a></li>
          <li><a href="">Inviting friends</a></li>
          <li><a href="">Can I delete my messages?</a></li>
          <li><a href="">Who can see me online?</a></li>
        </ul>
      </div>

      <div>
        <h3>General Questions</h3>
      <ul>
        <li>Q: How do I create an account?</li>
        <li>A: Click on the Sign Up button and fill in the required information.</li>
        <li>Q: Is this messenger free?</li>
        <li>A: Yes, it's completely free to use!</li>
      </ul>
      </div>
    </div>
  );
}

export default FAQ;