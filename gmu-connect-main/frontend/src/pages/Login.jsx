import React, { useState, useEffect } from "react";
import "./Login.css";

function Login() {
  // Slide data: Each object has an image, heading, and text
  const slides = [
    {
      image: "/images/slide1.jpg",
      heading: "Connect with GMU Students",
      text: "Find peers with shared interests, courses, or career goals."
    },
    {
      image: "/images/slide2.jpg",
      heading: "Study Groups & Mentors",
      text: "Form or join study groups. Get help from more experienced students."
    },
    {
      image: "/images/slide3.jpg",
      heading: "Explore Courses & Events",
      text: "Discover new courses, hackathons, or campus events that help you grow."
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatically move to the next slide every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [slides.length]);

  // Handle dot click (jump to a specific slide) - auto rotation continues
  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="login-container">
      {/* LEFT COLUMN (login card) */}
      <div className="login-left">
        <div className="login-card">
          <img
            src="/images/gmu-logo.png"
            alt="GMU Logo"
            className="gmu-logo"
          />
          
          <h2>GMU Study Match</h2>
          <p>Enter your GMU credentials to find your perfect study partner!</p>
          <button className="login-button">Log in with GMU Email</button>
        </div>
      </div>

      {/* RIGHT COLUMN (slideshow area) */}
      <div className="login-right">
        <div className="slides-container">
          {/* Current Slide Image */}
          <img
            src={slides[currentSlide].image}
            alt="Slide"
            className="slide-image"
          />

          {/* Text BELOW the image */}
          <div className="slide-text">
            <h2>{slides[currentSlide].heading}</h2>
            <p>{slides[currentSlide].text}</p>
          </div>

          {/* The dots below the text */}
          <div className="dots-container">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
