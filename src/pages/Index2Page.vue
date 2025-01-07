<template>
    <q-page class="row items-center justify-evenly bg-gradient q-py-xl">
      <q-page-container>
        <!-- Hero Section -->
        <section class="q-pa-md q-py-xl">
          <div class="row items-center q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <h1 class="text-h2 text-weight-bold text-white q-mb-md">
                Transforming Businesses Through Custom Software and Solution Development
              </h1>
              <p class="text-h5 text-white-opacity q-mb-lg">
                Partner with us to build tailored solutions that meet your business needs.
              </p>
              <div class="row q-col-gutter-md">
                <div class="col-auto">
                  <q-btn unelevated style="background-color: #6a11cb;" size="lg" label="Get started now" />
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <img src="/assets/business-solutions.png" alt="Business Solutions" class="full-width" />
            </div>
          </div>
        </section>
  
        <!-- Features Section -->
        <section class="q-py-xl bg-white q-px-lg">
          <div class="text-center q-mb-xl">
            <h2 class="text-h3 text-weight-bold text-purple">What we do at Boundless Edge</h2>
          </div>
  
          <div class="row items-center q-col-gutter-lg">
            <div class="col-12 col-md-3 text-center">
              <q-card flat bordered class="q-pa-md">
                <img src="/assets/custom-product.png" alt="Custom Product Development" class="q-mb-md" />
                <h3 class="text-h6 text-weight-bold">Custom Product Development</h3>
                <p class="text-body1">
                  We design products significantly modified to address the unique challenges, goals, or opportunities of clients.
                </p>
              </q-card>
            </div>
  
            <div class="col-12 col-md-3 text-center">
              <q-card flat bordered class="q-pa-md">
                <img src="/assets/mobile-web-apps.png" alt="Mobile and Web Apps" class="q-mb-md" />
                <h3 class="text-h6 text-weight-bold">Building Mobile and Web Applications</h3>
                <p class="text-body1">
                  We build mobile and web apps that meet unique needs and allow seamless user and business interaction.
                </p>
              </q-card>
            </div>
  
            <div class="col-12 col-md-3 text-center">
              <q-card flat bordered class="q-pa-md">
                <img src="/assets/saas-solution.png" alt="SaaS Solution" class="q-mb-md" />
                <h3 class="text-h6 text-weight-bold">Scalable SaaS Solution</h3>
                <p class="text-body1">
                  We design and develop software applications that are accessible, secure, and efficient.
                </p>
              </q-card>
            </div>
  
            <div class="col-12 col-md-3 text-center">
              <q-card flat bordered class="q-pa-md">
                <img src="/assets/collaborative-project.png" alt="Collaborative Projects" class="q-mb-md" />
                <h3 class="text-h6 text-weight-bold">Open to Collaborative Projects</h3>
                <p class="text-body1">
                  We collaborate with you to bring your project to life with flexibility and adaptability.
                </p>
              </q-card>
            </div>
          </div>
        </section>
  
        <!-- Solution Section -->
        <section class="q-py-xl q-px-lg">
          <div class="row items-center q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <h2 class="text-h4 text-weight-bold text-purple q-mb-md">Revolutionize Waste Management Operations</h2>
              <p class="text-body1 q-mb-lg">
                Streamline payments, manage billing, and track debts with <strong>WastePro</strong>.
              </p>
              <div class="row q-col-gutter-md">
                <div class="col-auto">
                  <q-btn unelevated style="background-color: #1976D2;" size="lg" label="See how it works" />
                </div>
                <div class="col-auto">
                  <q-btn outline color="primary" size="lg" label="Learn more" />
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <img src="/assets/waste-management.png" alt="Waste Management" class="full-width rounded-borders" />
            </div>
          </div>
        </section>
  
        <!-- Why WastePro Section -->
        <section class="q-py-xl bg-white q-px-lg">
          <div class="text-center q-mb-xl">
            <h2 class="text-h3 text-weight-bold text-purple">Why WastePro?</h2>
          </div>
  
          <div class="row items-center q-col-gutter-xl q-py-lg">
            <div class="col-12 col-md-6 q-px-xl">
              <h3 class="text-h4 q-mb-md text-blue">Streamline Payments and Invoicing</h3>
              <p class="text-body1">
                Simplify your billing process with automated invoicing and payment tracking. Save time and reduce errors with our intuitive system.
              </p>
            </div>
            <div class="col-12 col-md-6">
              <img src="/assets/payments-ui.png" alt="Payment Tracking UI" class="rounded-borders shadow-md" />
            </div>
          </div>
  
          <div class="row items-center q-col-gutter-xl q-py-lg">
            <div class="col-12 col-md-6 order-last order-md-first">
              <img src="/assets/debts-ui.png" alt="Debt Management Process" class="rounded-borders shadow-md" />
            </div>
            <div class="col-12 col-md-6 q-px-xl">
              <h3 class="text-h4 q-mb-md text-blue">Track and Manage Debts Effortlessly</h3>
              <p class="text-body1">
                Keep track of outstanding payments and manage client relationships with our comprehensive debt management tools.
              </p>
            </div>
          </div>
        </section>
  
        <!-- Footer Section -->
        <footer class="q-py-md bg-gradient text-center text-white">
          <p>&copy; 2024 Boundless Edge. All rights reserved.</p>
        </footer>
      </q-page-container>
    </q-page>
  </template>
  
  <script setup lang="ts">
  // No additional functionality is required for this static layout
  </script>
  
  <style scoped lang="scss">
  .full-width {
    width: 100%;
    height: auto;
  }
  
  .rounded-borders {
    border-radius: 8px;
  }
  
  .bg-gradient {
    background: linear-gradient(135deg, #6a11cb, #2575fc);
  }
  
  .text-purple {
    color: #6a11cb;
  }
  
  .text-blue {
    color: #2575fc;
  }
  
  .shadow-md {
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
  }
  </style>
  