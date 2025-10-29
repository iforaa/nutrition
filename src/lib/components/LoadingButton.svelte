<script lang="ts">
  import Clock from '$lib/components/icons/Clock.svelte';

  interface Props {
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    loadingText?: string;
    children?: any;
    onclick?: (e: MouseEvent) => void;
  }

  let {
    loading = false,
    disabled = false,
    type = 'button',
    class: className = '',
    loadingText = 'Загрузка...',
    children,
    onclick
  }: Props = $props();

  const isDisabled = $derived(loading || disabled);
</script>

<button
  {type}
  class={className}
  disabled={isDisabled}
  on:click={onclick}
>
  {#if loading}
    <Clock class="inline-icon" />
    {loadingText}
  {:else}
    {@render children?.()}
  {/if}
</button>
