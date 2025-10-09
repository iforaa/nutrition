<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { t } from '$lib/i18n';
  
  let email = '';
  let password = '';
  let error = '';
  let loading = false;
</script>

<svelte:head>
  <title>{t('auth.login.title')}</title>
</svelte:head>

<div class="auth-container">
  <div class="auth-card">
    <h1>{t('auth.login.heading')}</h1>
    
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    <form 
      method="POST" 
      use:enhance={({ formElement }) => {
        loading = true;
        error = '';
        
        return async ({ result, update }) => {
          loading = false;
          
          if (result.type === 'redirect') {
            await goto(result.location);
          } else if (result.type === 'failure') {
            error = result.data?.error || t('auth.login.loginFailed');
          }
          
          await update();
        };
      }}
    >
      <div class="field">
        <label for="email">{t('common.email')}</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          bind:value={email} 
          required 
          disabled={loading}
        />
      </div>
      
      <div class="field">
        <label for="password">{t('common.password')}</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          bind:value={password} 
          required 
          disabled={loading}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? t('auth.login.signingIn') : t('auth.login.signIn')}
      </button>
    </form>
    
    <p>
      {t('auth.login.noAccount')} 
      <a href="/auth/signup">{t('auth.login.signUpHere')}</a>
    </p>
  </div>
</div>

<style>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 2rem;
  }
  
  .auth-card {
    background: var(--bg-primary);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 420px;
    border: 1px solid var(--gray-200);
  }
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: var(--text-primary);
    font-size: 1.875rem;
    font-weight: 700;
  }
  
  .field {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  
  input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid var(--gray-200);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all 0.2s ease;
  }
  
  input:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    background: var(--bg-primary);
  }
  
  input:disabled {
    background-color: var(--gray-100);
    border-color: var(--gray-300);
    color: var(--text-tertiary);
    cursor: not-allowed;
  }
  
  button {
    width: 100%;
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
    color: white;
    padding: 0.875rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  }
  
  button:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  }
  
  button:disabled {
    background: var(--gray-400);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .error {
    background-color: rgba(239, 68, 68, 0.05);
    color: var(--error-600);
    padding: 0.875rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border: 1px solid rgba(239, 68, 68, 0.2);
    font-weight: 500;
  }
  
  p {
    text-align: center;
    margin-top: 2rem;
    color: var(--text-secondary);
    font-size: 0.925rem;
  }
  
  a {
    color: var(--primary-600);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
  }
  
  a:hover {
    color: var(--primary-700);
    text-decoration: underline;
  }
</style>