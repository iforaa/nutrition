<script lang="ts">
  import { page } from '$app/stores';
  
  // Check if we're on auth pages to show different styling
  $: isAuthPage = $page.url.pathname.startsWith('/auth');
</script>

<header class="header" class:auth-page={isAuthPage}>
  <div class="container">
    <div class="brand">
      <div class="logo">
        🌿
      </div>
      <div class="brand-info">
        <h1 class="center-name">Центр питания</h1>
        <p class="specialist-name">Виктория Фалей</p>
      </div>
    </div>
    
    <div class="contact-info">
      <div class="specialty">
        Персональное питание и здоровье
      </div>
    </div>
  </div>
</header>

<style>
  .header {
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
    color: white;
    padding: 1.25rem 0;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .header.auth-page {
    position: relative;
    background: linear-gradient(135deg, var(--secondary-500) 0%, var(--secondary-600) 100%);
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .logo {
    font-size: 2.5rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
  
  .brand-info {
    display: flex;
    flex-direction: column;
  }
  
  .center-name {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    letter-spacing: 0.5px;
  }
  
  .specialist-name {
    font-size: 1.1rem;
    font-weight: 400;
    margin: 0;
    opacity: 0.9;
    font-style: italic;
  }
  
  .contact-info {
    text-align: right;
  }
  
  .specialty {
    font-size: 0.95rem;
    font-weight: 500;
    opacity: 0.95;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .container {
      flex-direction: column;
      text-align: center;
      padding: 0 1rem;
    }
    
    .contact-info {
      text-align: center;
    }
    
    .center-name {
      font-size: 1.5rem;
    }
    
    .logo {
      font-size: 2rem;
    }
    
    .specialist-name {
      font-size: 1rem;
    }
    
    .specialty {
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 480px) {
    .brand {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .center-name {
      font-size: 1.3rem;
    }
    
    .header {
      padding: 0.75rem 0;
    }
  }
</style>