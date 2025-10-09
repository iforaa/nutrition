<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { getFileUrl } from '$lib/utils/file-client';
  import { t } from '$lib/i18n';
  
  export let data: PageData;
  
  let name = data.user.name;
  let profilePicture: File | null = null;
  let previewUrl = data.user.profilePicture ? getFileUrl(data.user.profilePicture) : '';
  let error = '';
  let success = '';
  let loading = false;
  
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        error = t('profile.invalidFileType');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        error = t('profile.fileTooLarge');
        return;
      }
      
      profilePicture = file;
      previewUrl = URL.createObjectURL(file);
      error = '';
    }
  }
</script>

<svelte:head>
  <title>{t('profile.title')}</title>
</svelte:head>

<div class="profile-container">
  <div class="profile-card">
    <h1>{t('profile.heading')}</h1>
    
    {#if error}
      <div class="message error">{error}</div>
    {/if}
    
    {#if success}
      <div class="message success">{success}</div>
    {/if}
    
    <form 
      method="POST"
      enctype="multipart/form-data"
      use:enhance={({ formElement }) => {
        loading = true;
        error = '';
        success = '';
        
        return async ({ result, update }) => {
          loading = false;
          
          if (result.type === 'success') {
            success = t('profile.profileUpdated');
          } else if (result.type === 'failure') {
            error = result.data?.error || t('profile.profileUpdateFailed');
          }
          
          await update();
        };
      }}
    >
      <div class="picture-section">
        <div class="picture-preview">
          {#if previewUrl}
            <img src={previewUrl} alt="Profile picture" />
          {:else}
            <div class="placeholder">
              <span>{data.user.name.charAt(0).toUpperCase()}</span>
            </div>
          {/if}
        </div>
        
        <div class="picture-input">
          <label for="profilePicture" class="file-label">
            {t('profile.changePicture')}
          </label>
          <input 
            type="file" 
            id="profilePicture" 
            name="profilePicture" 
            accept="image/*"
            on:change={handleFileSelect}
            disabled={loading}
            hidden
          />
          <small>{t('profile.setup.fileFormat')}</small>
        </div>
      </div>
      
      <div class="field">
        <label for="name">{t('auth.signup.fullName')}</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          bind:value={name} 
          required 
          disabled={loading}
        />
      </div>
      
      <div class="field">
        <label for="email">{t('common.email')}</label>
        <input 
          type="email" 
          id="email" 
          value={data.user.email}
          disabled
          readonly
        />
        <small>{t('profile.emailCannotChange')}</small>
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? t('profile.updating') : t('profile.updateProfile')}
      </button>
    </form>
  </div>
</div>

<style>
  .profile-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 2rem;
  }
  
  .profile-card {
    background: var(--bg-primary);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--gray-200);
  }
  
  h1 {
    color: var(--text-primary);
    margin-bottom: 2rem;
    text-align: center;
    font-weight: 700;
    font-size: 1.875rem;
  }
  
  .picture-section {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .picture-preview {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto 1rem;
    border: 3px solid var(--gray-300);
    transition: border-color 0.2s ease;
  }
  
  .picture-preview:hover {
    border-color: var(--primary-400);
  }
  
  .picture-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    font-weight: bold;
  }
  
  .file-label {
    display: inline-block;
    background: linear-gradient(135deg, var(--secondary-500) 0%, var(--secondary-600) 100%);
    color: white;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
  }
  
  .file-label:hover {
    background: linear-gradient(135deg, var(--secondary-600) 0%, var(--secondary-700) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
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
  
  input[readonly] {
    background-color: var(--gray-100);
    color: var(--text-tertiary);
    border-color: var(--gray-300);
  }
  
  small {
    display: block;
    color: var(--text-tertiary);
    font-size: 0.875rem;
    margin-top: 0.25rem;
    font-weight: 500;
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
    margin-top: 1rem;
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
  
  .message {
    padding: 0.875rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-weight: 500;
  }
  
  .error {
    background-color: rgba(239, 68, 68, 0.05);
    color: var(--error-600);
    border: 1px solid rgba(239, 68, 68, 0.2);
  }
  
  .success {
    background-color: rgba(16, 185, 129, 0.05);
    color: var(--success-600);
    border: 1px solid rgba(16, 185, 129, 0.2);
  }
</style>