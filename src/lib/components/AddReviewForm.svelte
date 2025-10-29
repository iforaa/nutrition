<script lang="ts">
  import { enhance } from '$app/forms';
  import LoadingButton from '$lib/components/LoadingButton.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Check from '$lib/components/icons/Check.svelte';

  interface Props {
    postId: string;
    hasReviews: boolean;
    loading?: boolean;
    reviewText?: string;
    onUpdate?: (text: string) => void;
    onSuccess?: () => void;
  }

  let { postId, hasReviews, loading = false, reviewText = '', onUpdate, onSuccess }: Props = $props();

  let isLoading = $state(false);
  const actualLoading = $derived(loading || isLoading);
</script>

<form
  method="POST"
  action="?/addReview"
  class="review-form"
  use:enhance={({ formData }) => {
    formData.append('postId', postId);
    isLoading = true;

    return async ({ result, update }) => {
      isLoading = false;
      if (result.type === 'success') {
        onUpdate?.('');
        onSuccess?.();
      }
      await update();
    };
  }}
>
  <textarea
    name="reviewText"
    bind:value={reviewText}
    placeholder={hasReviews ? "Добавить дополнительный комментарий..." : "Введите заключение врача..."}
    required
    disabled={actualLoading}
    rows="3"
  ></textarea>
  <LoadingButton
    type="submit"
    loading={actualLoading}
    loadingText="Отправка..."
    class="review-submit-button"
  >
    {#if hasReviews}
      <Plus class="inline-icon" />
      Добавить комментарий
    {:else}
      <Check class="inline-icon" />
      Отправить проверку
    {/if}
  </LoadingButton>
</form>

<style>
  .review-form {
    margin-top: 1rem;
  }

  .review-form textarea {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid #e3e8ee;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.875rem;
    resize: vertical;
    margin-bottom: 0.75rem;
    transition: border-color 0.15s ease;
  }

  .review-form textarea:focus {
    outline: none;
    border-color: #3b82f6;
  }

  :global(.review-submit-button) {
    padding: 0.5rem 1rem;
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
  }

  :global(.review-submit-button:hover:not(:disabled)) {
    background: #1e293b;
  }

  :global(.review-submit-button:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
