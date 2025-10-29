<script lang="ts">
  import { enhance } from '$app/forms';
  import TagSelect from '$lib/components/TagSelect.svelte';
  import LoadingButton from '$lib/components/LoadingButton.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';

  interface Props {
    userId: string;
    onSuccess?: () => void;
  }

  let { userId, onSuccess }: Props = $props();
  let creatingPost = $state(false);
</script>

<div class="create-post-section">
  <form
    method="POST"
    action="?/createPost"
    enctype="multipart/form-data"
    use:enhance={() => {
      creatingPost = true;

      return async ({ result, update }) => {
        creatingPost = false;

        if (result.type === 'success') {
          onSuccess?.();
          alert('Пост успешно создан!');
        } else if (result.type === 'failure') {
          alert('Ошибка создания поста: ' + (result.data?.error || 'Неизвестная ошибка'));
        }

        await update();
      };
    }}
  >
    <div class="form-group">
      <label for="title">Название поста *</label>
      <input
        type="text"
        id="title"
        name="title"
        required
        disabled={creatingPost}
        placeholder="Например: Завтрак, 24.10.2025"
      />
    </div>

    <div class="form-group">
      <label for="file">Файл</label>
      <input
        type="file"
        id="file"
        name="file"
        accept="image/*,application/pdf"
        disabled={creatingPost}
      />
    </div>

    <div class="form-group">
      <label for="tag">Тег</label>
      <TagSelect id="tag" disabled={creatingPost} class="tag-select-form" />
    </div>

    <div class="form-group">
      <label for="description">Описание (необязательно)</label>
      <textarea
        id="description"
        name="description"
        rows="3"
        disabled={creatingPost}
        placeholder="Добавьте описание..."
      ></textarea>
    </div>

    <LoadingButton
      type="submit"
      loading={creatingPost}
      loadingText="Создание..."
      class="submit-post-button"
    >
      <Plus class="inline-icon" />
      Создать пост
    </LoadingButton>
  </form>
</div>

<style>
  .create-post-section {
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    background: white;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group :global(.tag-select-form) {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid #e3e8ee;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.875rem;
    transition: border-color 0.15s ease;
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group :global(.tag-select-form:focus) {
    outline: none;
    border-color: #3b82f6;
  }

  .form-group textarea {
    resize: vertical;
  }

  :global(.submit-post-button) {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.9375rem;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1.5rem;
  }

  :global(.submit-post-button:hover:not(:disabled)) {
    background: #1e293b;
  }

  :global(.submit-post-button:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
