<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  const questionLabels: Record<string, string> = {
    '1': 'Какова ваша основная цель?',
    '2': 'Как часто вы занимаетесь спортом?',
    '3': 'Сколько раз в день вы едите?',
    '4': 'Есть ли у вас пищевые аллергии?',
    '5': 'Какой тип диеты вы предпочитаете?',
    '6': 'Сколько воды вы пьете в день?',
    '7': 'Как вы оцениваете качество своего сна?',
    '8': 'Есть ли у вас хронические заболевания?',
    '9': 'Какой ваш уровень стресса?',
  };
</script>

<svelte:head>
  <title>Анкета - {data.user.name}</title>
</svelte:head>

<div class="questionnaire-container">
  <div class="header">
    <a href="/user/{data.user.id}" class="back-button">
      ← Назад к профилю
    </a>
    <div class="user-info">
      <h1>Анкета пользователя</h1>
      <div class="user-details">
        <span class="user-name">{data.user.name}</span>
        <span class="user-email">{data.user.email}</span>
      </div>
    </div>
  </div>

  <div class="content">
    {#if data.user.questionnaire}
      <div class="questionnaire-grid">
        {#each Object.entries(data.user.questionnaire) as [key, value]}
          <div class="question-card">
            <div class="question-header">
              <span class="question-number">Вопрос {key}</span>
            </div>
            <p class="question-text">{questionLabels[key] || `Вопрос ${key}`}</p>
            <div class="answer-box">
              <p class="answer-text">{value}</p>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <p>Пользователь еще не заполнил анкету</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .questionnaire-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    background: #f8f9fa;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

  .header {
    margin-bottom: 2rem;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    color: #495057;
    text-decoration: none;
    font-weight: 500;
    margin-bottom: 1rem;
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .back-button:hover {
    background-color: #e9ecef;
  }

  .user-info {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .user-info h1 {
    margin: 0 0 1rem 0;
    font-size: 1.75rem;
    color: #212529;
  }

  .user-details {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .user-name {
    font-weight: 600;
    color: #495057;
    font-size: 1rem;
  }

  .user-email {
    color: #6c757d;
    font-size: 0.875rem;
  }

  .content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .questionnaire-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .question-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #dee2e6;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .question-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .question-header {
    margin-bottom: 0.75rem;
  }

  .question-number {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #4CAF50;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    border-radius: 12px;
    letter-spacing: 0.5px;
  }

  .question-text {
    font-size: 1rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  .answer-box {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #4CAF50;
  }

  .answer-text {
    margin: 0;
    color: #495057;
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #6c757d;
  }

  .empty-state p {
    margin: 0;
    font-size: 1.125rem;
  }

  @media (max-width: 768px) {
    .questionnaire-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
