<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { t } from '$lib/i18n';
  
  let selectedFiles: FileList | null = null;
  let dragOver = false;
  let error = '';
  let success = '';
  let loading = false;
  
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    selectedFiles = input.files;
    validateFiles();
  }
  
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    selectedFiles = event.dataTransfer?.files || null;
    validateFiles();
  }
  
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }
  
  function handleDragLeave() {
    dragOver = false;
  }
  
  function validateFiles() {
    error = '';
    
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }
    
    for (const file of selectedFiles) {
      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        error = t('upload.errors.invalidFileType');
        return;
      }
      
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        error = `${t('common.file')} "${file.name}" ${t('upload.errors.fileTooLarge')}`;
        return;
      }
    }
  }
  
  function removeFile(index: number) {
    if (selectedFiles) {
      const filesArray = Array.from(selectedFiles);
      filesArray.splice(index, 1);
      
      // Create new FileList-like object
      const dt = new DataTransfer();
      filesArray.forEach(file => dt.items.add(file));
      selectedFiles = dt.files;
      
      validateFiles();
    }
  }
  
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
</script>

<svelte:head>
  <title>{t('upload.title')}</title>
</svelte:head>

<div class="upload-container">
  <div class="upload-card">
    <h1>{t('upload.heading')}</h1>
    <p>{t('upload.description')}</p>
    
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
        if (!selectedFiles || selectedFiles.length === 0) {
          error = t('upload.errors.noFiles');
          return;
        }
        
        loading = true;
        error = '';
        success = '';
        
        return async ({ result, update }) => {
          loading = false;
          
          if (result.type === 'redirect') {
            await goto(result.location);
          } else if (result.type === 'success') {
            success = t('upload.uploadSuccess');
            selectedFiles = null;
            // Reset form
            const fileInput = document.getElementById('files') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          } else if (result.type === 'failure') {
            error = result.data?.error || t('upload.uploadFailed');
          }
          
          await update();
        };
      }}
    >
      <!-- Drag and Drop Area -->
      <div 
        class="drop-zone" 
        class:drag-over={dragOver}
        on:drop={handleDrop}
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        role="button"
        tabindex="0"
      >
        <div class="drop-content">
          <div class="upload-icon">📁</div>
          <p><strong>{t('upload.dropZone.dropHere')}</strong> {t('upload.dropZone.orClick')}</p>
          <p class="file-types">{t('upload.dropZone.fileTypes')}</p>
          
          <input 
            type="file" 
            id="files" 
            name="files" 
            accept=".pdf,image/*"
            multiple
            on:change={handleFileSelect}
            disabled={loading}
            hidden
          />
          
          <label for="files" class="browse-button">
            {t('upload.dropZone.browseFiles')}
          </label>
        </div>
      </div>
      
      <!-- Selected Files List -->
      {#if selectedFiles && selectedFiles.length > 0}
        <div class="selected-files">
          <h3>{t('upload.selectedFiles')} ({selectedFiles.length})</h3>
          <div class="files-list">
            {#each Array.from(selectedFiles) as file, index}
              <div class="file-item">
                <div class="file-info">
                  <div class="file-icon">
                    {#if file.type === 'application/pdf'}
                      📄
                    {:else}
                      🖼️
                    {/if}
                  </div>
                  <div class="file-details">
                    <div class="file-name">{file.name}</div>
                    <div class="file-size">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <button 
                  type="button" 
                  class="remove-file" 
                  on:click={() => removeFile(index)}
                  disabled={loading}
                >
                  ✕
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- Upload Button -->
      {#if selectedFiles && selectedFiles.length > 0 && !error}
        <button type="submit" class="upload-button" disabled={loading}>
          {loading ? t('upload.uploading') : `${t('upload.uploadFiles')} (${selectedFiles.length})`}
        </button>
      {/if}
    </form>
    
    <div class="navigation">
      <a href="/">{t('upload.backToDashboard')}</a>
    </div>
  </div>
</div>

<style>
  .upload-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 2rem;
  }
  
  .upload-card {
    background: var(--bg-primary);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
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
  
  .drop-zone {
    border: 2px dashed var(--gray-300);
    border-radius: 12px;
    padding: 3rem 2rem;
    text-align: center;
    transition: all 0.2s ease;
    cursor: pointer;
    margin-bottom: 2rem;
    background-color: var(--bg-secondary);
  }
  
  .drop-zone:hover,
  .drop-zone.drag-over {
    border-color: var(--primary-500);
    background-color: var(--primary-50);
    transform: scale(1.01);
  }
  
  .drop-content {
    pointer-events: none;
  }
  
  .upload-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.8;
  }
  
  .file-types {
    font-size: 0.875rem;
    color: var(--text-tertiary);
    margin-bottom: 1rem;
    font-weight: 500;
  }
  
  .browse-button {
    display: inline-block;
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
    color: white;
    padding: 0.875rem 1.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    pointer-events: all;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  }
  
  .browse-button:hover {
    background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  }
  
  .selected-files {
    margin-bottom: 2rem;
  }
  
  .selected-files h3 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  .files-list {
    border: 2px solid var(--gray-200);
    border-radius: 8px;
    overflow: hidden;
    background: var(--bg-secondary);
  }
  
  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem;
    border-bottom: 1px solid var(--gray-300);
    transition: background-color 0.2s ease;
  }
  
  .file-item:hover {
    background-color: var(--bg-primary);
  }
  
  .file-item:last-child {
    border-bottom: none;
  }
  
  .file-info {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .file-icon {
    font-size: 1.5rem;
    margin-right: 1rem;
  }
  
  .file-details {
    flex: 1;
  }
  
  .file-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }
  
  .file-size {
    font-size: 0.875rem;
    color: var(--text-tertiary);
    font-weight: 500;
  }
  
  .remove-file {
    background: none;
    border: none;
    color: var(--error-500);
    cursor: pointer;
    padding: 0.375rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    font-weight: 600;
    font-size: 1rem;
  }
  
  .remove-file:hover:not(:disabled) {
    background-color: rgba(239, 68, 68, 0.1);
    color: var(--error-600);
    transform: scale(1.1);
  }
  
  .upload-button {
    width: 100%;
    background: linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%);
    color: white;
    padding: 1rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  }
  
  .upload-button:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--success-600) 0%, var(--primary-700) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  }
  
  .upload-button:disabled {
    background: var(--gray-400);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .navigation {
    text-align: center;
  }
  
  .navigation a {
    color: var(--primary-600);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
  }
  
  .navigation a:hover {
    color: var(--primary-700);
    text-decoration: underline;
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