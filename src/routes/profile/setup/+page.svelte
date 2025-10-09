<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { t } from '$lib/i18n';
  
  let profilePicture: File | null = null;
  let previewUrl = '';
  let error = '';
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
  <title>{t('profile.setup.title')}</title>
</svelte:head>

<div class="setup-container">
  <div class="setup-card">
    <h1>{t('profile.setup.heading')}</h1>
    <p>{t('profile.setup.description')}</p>
    
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    <form 
      method="POST"
      enctype="multipart/form-data"
      use:enhance={({ formElement }) => {
        loading = true;
        error = '';
        
        return async ({ result, update }) => {
          loading = false;
          
          if (result.type === 'redirect') {
            await goto(result.location);
          } else if (result.type === 'failure') {
            error = result.data?.error || t('profile.setup.setupFailed');
          }
          
          await update();
        };
      }}
    >
      <div class="picture-section">
        <div class="picture-preview">
          {#if previewUrl}
            <img src={previewUrl} alt="Profile preview" />
          {:else}
            <div class="placeholder">
              <span>Изображение не выбрано</span>
            </div>
          {/if}
        </div>
        
        <div class="picture-input">
          <label for="profilePicture" class="file-label">
            {t('profile.setup.choosePicture')}
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
          <small>{t('common.optional')} - {t('profile.setup.fileFormat')}</small>
        </div>
      </div>
      
      <div class="actions">
        <button type="submit" disabled={loading}>
          {loading ? t('profile.setup.settingUp') : t('profile.setup.completeSetup')}
        </button>
        
        <button type="button" class="skip" on:click={() => goto('/')}>
          {t('profile.setup.skipForNow')}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .setup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 2rem;
  }
  
  .setup-card {
    background: var(--bg-primary);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 520px;
    text-align: center;
    border: 1px solid var(--gray-200);
  }
  
  h1 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-weight: 700;
    font-size: 1.875rem;
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
    font-weight: 500;
    line-height: 1.6;
  }
  
  .picture-section {
    margin-bottom: 2rem;
  }
  
  .picture-preview {
    width: 150px;
    height: 150px;
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
    background-color: var(--gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .file-label {
    display: inline-block;
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
    color: white;
    padding: 0.875rem 1.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 0.5rem;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  }
  
  .file-label:hover {
    background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  }
  
  small {
    display: block;
    color: var(--text-tertiary);
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .actions {
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }
  
  button {
    padding: 0.875rem 1.75rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  button[type="submit"] {
    background: linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%);
    color: white;
    border: none;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  }
  
  button[type="submit"]:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--success-600) 0%, var(--primary-700) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  }
  
  button[type="submit"]:disabled {
    background: var(--gray-400);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .skip {
    background: none;
    color: var(--text-secondary);
    border: 1px solid var(--gray-300);
  }
  
  .skip:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
    border-color: var(--gray-400);
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
</style>