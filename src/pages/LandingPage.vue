<template>
  <div class="landing-page">
    <!-- Header -->
    <header class="header">
      <nav class="container">
        <a href="#home" class="wastepro-logo">
          <div class="logo-symbol">
            <div class="arrow arrow-1"></div>
            <div class="arrow arrow-2"></div>
            <div class="arrow arrow-3"></div>
          </div>
          <span class="logo-text"
            >Waste<span class="pro-accent">Pro</span></span
          >
        </a>
        <ul class="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#screenshots">Screenshots</a></li>
          <li><a href="#onboard">Get Started</a></li>
          <li><a href="#about">About</a></li>
          <li>
            <router-link to="/auth/signin" class="app-access"
              >Access App</router-link
            >
          </li>
        </ul>
      </nav>
    </header>

    <!-- Hero Section -->
    <section id="home" class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>WastePro Platform</h1>
          <p>
            Professional Waste Management Solution for Lagos State and Beyond
          </p>
          <div class="cta-buttons">
            <a href="#onboard" class="cta-button cta-primary"
              >Get Started Today</a
            >
            <a href="#features" class="cta-button cta-secondary">Learn More</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="container">
        <h2 class="section-title">Comprehensive Waste Management Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🏢</div>
            <h3>Property Management</h3>
            <p>
              Complete property database with LGA, ward, and street
              organization. Track all properties and their waste management
              status efficiently across multiple locations.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💳</div>
            <h3>Automated Billing & Payments</h3>
            <p>
              Smart billing system with automated payment processing. Generate
              invoices, track payments in real-time, and manage billing accounts
              with zero manual intervention.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3>Payment Automation</h3>
            <p>
              Advanced automation for waste managers: auto-generate bills, send
              payment reminders, and process payments. For clients: automated
              payment scheduling and instant payment confirmations.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Multi-User Dashboard</h3>
            <p>
              Dedicated dashboards for waste operators, managers, and service
              clients with role-specific features and real-time data access.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Smart Analytics & Reporting</h3>
            <p>
              AI-powered reporting tools including payment analytics, defaulter
              predictions, collection route optimization, and operational
              performance insights.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Bank-Level Security</h3>
            <p>
              Enterprise-grade security with encrypted data transmission, secure
              payment processing, and comprehensive access controls for all user
              types.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Screenshots Section -->
    <section id="screenshots" class="screenshots">
      <div class="container">
        <h2 class="section-title">Platform Interface & Management Tools</h2>
        <div class="screenshot-grid">
          <div
            v-for="(screenshot, idx) in screenshots"
            :key="screenshot.id"
            class="screenshot-item"
            :style="
              screenshots.length === 3 && idx === 2
                ? 'grid-column: 1 / -1; justify-self: center; max-width: 400px; margin: 0 auto;'
                : ''
            "
          >
            <img
              :src="screenshot.image"
              :alt="screenshot.alt"
              style="max-width: 100%; height: auto"
            />
            <h3>{{ screenshot.title }}</h3>
            <p>{{ screenshot.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- User Types & Onboarding -->
    <section id="onboard" class="user-types">
      <div class="container">
        <h2 class="section-title">Who Can Use WastePro?</h2>
        <div class="user-cards">
          <div class="user-card">
            <h3>🏛️ Waste Operators & Managers</h3>
            <p>
              Transform your waste management operations with complete
              automation
            </p>
            <ul>
              <li>✅ Automated billing and payment processing</li>
              <li>✅ Smart property database management</li>
              <li>✅ AI-powered defaulter identification</li>
              <li>✅ Real-time payment tracking & alerts</li>
              <li>✅ Automated report generation</li>
              <li>✅ Multi-location operation support</li>
              <li>✅ Staff management and role assignments</li>
              <li>✅ Route optimization tools</li>
            </ul>
            <a
              href="mailto:dev@boundlesedge.com?subject=WastePro Onboarding Request - Waste Operator"
              class="contact-button"
            >
              Get Started with Automation
            </a>
            <p class="contact-info">Email: dev@boundlesedge.com</p>
          </div>

          <div class="user-card">
            <h3>🏠 Service Clients</h3>
            <p>Hassle-free waste management with automated payment solutions</p>
            <ul>
              <li>✅ Automatic payment scheduling</li>
              <li>✅ Instant payment confirmations</li>
              <li>✅ Real-time collection notifications</li>
              <li>✅ Complete payment history access</li>
              <li>✅ Mobile-friendly payment portal</li>
              <li>✅ Service request automation</li>
              <li>✅ Bill reminders and alerts</li>
              <li>✅ Multiple payment methods support</li>
            </ul>
            <a href="#contact-manager" class="contact-button client">
              Contact Your Waste Manager
            </a>
            <p class="contact-info">
              Reach out to your assigned Waste Manager for automated account
              setup
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about">
      <div class="container">
        <div class="about-content">
          <div class="about-text">
            <h2>About WastePro</h2>
            <p>
              WastePro is a comprehensive waste management platform developed by
              <strong>BoundlessEdge</strong> to revolutionize waste collection,
              billing, and management operations across Lagos State and beyond.
            </p>
            <p>
              Our platform combines smart automation with user-friendly design
              to deliver a complete solution for waste management organizations
              of all sizes. From small local operators to large municipal
              services, WastePro scales to meet your needs.
            </p>
            <p>
              With advanced payment automation, real-time tracking, and
              comprehensive analytics, WastePro eliminates manual processes and
              delivers operational efficiency that saves time and money.
            </p>
            <div class="stats">
              <div class="stat-item">
                <div class="stat-number">100%</div>
                <div>Automated</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">24/7</div>
                <div>Support</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">SSL</div>
                <div>Secured</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">Cloud</div>
                <div>Hosted</div>
              </div>
            </div>
          </div>

          <div
            class="about-logos"
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 2rem;
            "
          >
            <div style="display: flex; gap: 2rem; justify-content: center">
              <img
                src="/assets/lawma-logo.jpeg"
                alt="LAWMA Partnership"
                style="max-width: 180px"
              />
              <img
                src="/assets/lagos-state-logo.jpeg"
                alt="Lagos State"
                style="max-width: 180px"
              />
            </div>
            <img
              src="/assets/waste_pro_logo_220_72.png"
              alt="WastePro Logo"
              style="max-width: 220px; margin-top: 1rem"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>WastePro Platform</h3>
            <p>
              Professional waste management solution for modern organizations.
              Streamline your operations with our comprehensive platform.
            </p>
          </div>
          <div class="footer-section">
            <h3>For Waste Operators</h3>
            <p>Ready to transform your waste management operations?</p>
            <p>
              <strong>Email:</strong>
              <a href="mailto:dev@boundlesedge.com">dev@boundlesedge.com</a>
            </p>
            <p><strong>Subject:</strong> WastePro Onboarding Request</p>
          </div>
          <div class="footer-section">
            <h3>For Service Clients</h3>
            <p>Need access to your waste management account?</p>
            <p>Contact your assigned Waste Manager for:</p>
            <p>• Account setup and access</p>
            <p>• Payment inquiries</p>
            <p>• Service requests</p>
          </div>
          <div class="footer-section">
            <h3>Powered By</h3>
            <p><strong>BoundlessEdge</strong></p>
            <p><a href="https://boundlesedge.com">boundlesedge.com</a></p>
            <p>Building innovative solutions for modern challenges</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>
            &copy; 2025 WastePro by BoundlessEdge. All rights reserved. |
            Platform hosted at wasteproutils.com
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Screenshots data - only the 3 app screenshots
const screenshots = [
  {
    id: 1,
    image: '/assets/Payment_History.png',
    alt: 'Payment Interface',
    title: 'Payment Management Interface',
    description:
      'Streamlined payment processing with automated billing and real-time tracking',
  },
  {
    id: 2,
    image: '/assets/Billing_Management.png',
    alt: 'Billing Management',
    title: 'Smart Billing Management',
    description: 'Automated billing system with comprehensive payment tracking',
  },
  {
    id: 3,
    image: '/assets/Property_Management.png',
    alt: 'Property Management',
    title: 'Property Management',
    description:
      'Property management system with complete tracking and analytics',
  },
];

// Smooth scrolling for navigation links
onMounted(() => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* --- WastePro HTML Logo --- */
.wastepro-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
}

.logo-symbol {
  width: 40px;
  height: 40px;
  position: relative;
}

.logo-symbol .arrow {
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid white;
  border-top-color: transparent;
  border-left-color: transparent;
  border-radius: 50%;
}

.logo-symbol .arrow::before {
  content: '';
  position: absolute;
  right: 1px;
  top: -4px;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 12px solid white;
  transform: rotate(35deg);
}

.arrow-1 {
  transform: rotate(45deg);
}
.arrow-2 {
  transform: rotate(165deg);
}
.arrow-3 {
  transform: rotate(285deg);
}

.wastepro-logo .pro-accent {
  color: #ff6b35;
  font-weight: 800;
}
/* --- End Logo --- */

/* Header */
.header {
  background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
  color: white;
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  transition: opacity 0.3s;
}

.nav-links a:hover {
  opacity: 0.8;
}

.app-access {
  background: #ff6b35;
  padding: 8px 16px;
  border-radius: 5px;
  text-decoration: none;
  color: white;
  font-weight: bold;
  transition: background 0.3s;
}

.app-access:hover {
  background: #e55a30;
}

/* Hero Section */
.hero {
  background: linear-gradient(rgba(44, 85, 48, 0.8), rgba(74, 124, 89, 0.8)),
    url('/assets/nathan-cima-TQuq2OtLBNU-unsplash.jpg');
  background-size: cover;
  background-position: center;
  height: 100vh;
  display: flex;
  align-items: center;
  text-align: center;
  color: white;
  margin-top: 70px;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: fadeInUp 1s ease-out;
}

.hero-content p {
  font-size: 1.3rem;
  margin-bottom: 2rem;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 1s ease-out 0.4s both;
}

.cta-button {
  display: inline-block;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: bold;
  transition: transform 0.3s, box-shadow 0.3s;
}

.cta-primary {
  background: #ff6b35;
  color: white;
}

.cta-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.cta-primary:hover {
  box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
}

.cta-secondary:hover {
  background: white;
  color: #2c5530;
}

/* Features Section */
.features {
  padding: 5rem 0;
  background: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #2c5530;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2c5530, #ff6b35);
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #2c5530;
  margin-bottom: 1rem;
}

/* Waste Management Gallery */
.waste-gallery {
  padding: 5rem 0;
  background: white;
}

.gallery-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.gallery-slider {
  display: flex;
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.gallery-slide {
  min-width: 100%;
  transition: transform 0.5s ease;
  position: relative;
}

.gallery-slide img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

.slide-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 40px 30px 20px;
  text-align: center;
}

.slide-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.gallery-nav {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.nav-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ccc;
  cursor: pointer;
  transition: background 0.3s;
}

.nav-dot.active {
  background: #2c5530;
}

.gallery-arrows {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(44, 85, 48, 0.8);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s;
}

.gallery-arrows:hover {
  background: rgba(44, 85, 48, 1);
}

.gallery-prev {
  left: 20px;
}

.gallery-next {
  right: 20px;
}

/* Screenshots Section */
.screenshots {
  padding: 5rem 0;
  background: white;
}

.screenshot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
  margin-top: 3rem;
}

.screenshot-item {
  text-align: center;
}

.screenshot-item img {
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
}

.screenshot-item h3 {
  color: #2c5530;
  margin-bottom: 0.5rem;
}

/* User Types Section */
.user-types {
  padding: 5rem 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.user-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.user-card {
  background: white;
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-top: 5px solid #2c5530;
}

.user-card h3 {
  color: #2c5530;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.user-card ul {
  list-style: none;
  margin: 1.5rem 0;
}

.user-card li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.user-card li:last-child {
  border-bottom: none;
}

.contact-button {
  background: #2c5530;
  color: white;
  padding: 12px 25px;
  text-decoration: none;
  border-radius: 5px;
  display: inline-block;
  margin-top: 1rem;
  transition: background 0.3s;
}

.contact-button:hover {
  background: #4a7c59;
}

.contact-button.client {
  background: #ff6b35;
}

.contact-button.client:hover {
  background: #e55a30;
}

.contact-info {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

/* About Section */
.about {
  padding: 5rem 0;
  background: white;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.about-text h2 {
  color: #2c5530;
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
}

.about-text p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  line-height: 1.8;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2c5530;
}

.about-logos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  align-items: center;
}

.about-logos img {
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
  display: block;
  border-radius: 10px;
}

/* Footer */
.footer {
  background: #2c5530;
  color: white;
  padding: 3rem 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3 {
  margin-bottom: 1rem;
  color: #90c695;
}

.footer-section p,
.footer-section a {
  color: #ccc;
  text-decoration: none;
  line-height: 1.8;
}

.footer-section a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid #4a7c59;
  margin-top: 2rem;
  padding-top: 1rem;
  text-align: center;
  color: #999;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-content p {
    font-size: 1.1rem;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .about-content {
    grid-template-columns: 1fr;
  }

  .screenshot-grid {
    grid-template-columns: 1fr;
  }
}
</style>
