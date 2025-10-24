<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
  import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
  import ImageIcon from '$lib/components/icons/Image.svelte';
  import Document from '$lib/components/icons/Document.svelte';
  import Eye from '$lib/components/icons/Eye.svelte';
  import Search from '$lib/components/icons/Search.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Clock from '$lib/components/icons/Clock.svelte';
  import Food from '$lib/components/icons/Food.svelte';
  import BarChart from '$lib/components/icons/BarChart.svelte';

  export let data: PageData;

  let reviewTexts: { [key: string]: string } = {};
  let loading: { [key: string]: boolean } = {};
  let extracting: { [key: string]: boolean } = {};
  let deleting: { [key: string]: boolean } = {};
  let analyzing: { [key: string]: boolean } = {};
  let expandedPosts: { [key: string]: boolean } = {};
  let showQuestionnaire = false;
  let showCreatePostForm = false;
  let creatingPost = false;

  function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getReviewText(reviewData: any): string {
    if (!reviewData) return '';
    if (typeof reviewData === 'string') return reviewData;
    if (reviewData.text) return reviewData.text;
    return JSON.stringify(reviewData);
  }

  function hasExtractedData(post: any): boolean {
    return post.extractedData && typeof post.extractedData === 'object' && post.extractedData.results;
  }

  function hasFoodAnalysis(post: any): boolean {
    return post.extractedData && typeof post.extractedData === 'object' && post.extractedData.macros;
  }

  function getStatusColor(status?: string): string {
    if (!status) return '#6c757d';
    if (status === 'normal') return '#28a745';
    if (status === 'high') return '#dc3545';
    if (status === 'low') return '#ffc107';
    return '#6c757d';
  }

  function togglePost(postId: string) {
    expandedPosts[postId] = !expandedPosts[postId];
  }
</script>

<svelte:head>
  <title>{data.user.name} - Admin Panel</title>
</svelte:head>

<div class="user-detail-container">
  <!-- Header with back button -->
  <div class="header">
    <a href="/" class="back-button">
      ← Назад к списку
    </a>
    <div class="user-info-header">
      <div class="user-info">
        <h1>{data.user.name}</h1>
        <span class="user-email">{data.user.email}</span>
      </div>
      <div class="header-actions">
        <button
          class="create-post-toggle-header"
          on:click={() => showCreatePostForm = !showCreatePostForm}
        >
          {#if showCreatePostForm}
            Отменить
          {:else}
            <Plus class="inline-icon" />
            Создать пост
          {/if}
        </button>
        {#if data.user.questionnaire}
          <button
            class="questionnaire-toggle"
            on:click={() => showQuestionnaire = !showQuestionnaire}
          >
            {showQuestionnaire ? 'Скрыть анкету' : 'Показать анкету'}
          </button>
        {/if}
      </div>
    </div>

    {#if showQuestionnaire && data.user.questionnaire}
      <div class="questionnaire-section">
        <h3 class="questionnaire-title">Анкета пользователя</h3>
        <div class="questionnaire-grid">
          {#each Object.entries(data.user.questionnaire) as [key, value]}
            <div class="questionnaire-item">
              <span class="question-id">Вопрос {key}</span>
              <span class="question-answer">{value}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if showCreatePostForm}
      <div class="create-post-section">
        <form
        method="POST"
        action="?/createPost"
        enctype="multipart/form-data"
        class="create-post-form"
        use:enhance={() => {
          creatingPost = true;

          return async ({ result, update }) => {
            creatingPost = false;

            if (result.type === 'success') {
              showCreatePostForm = false;
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
          <label for="type">Тип *</label>
          <select id="type" name="type" required disabled={creatingPost}>
            <option value="image">Фото еды</option>
            <option value="pdf">PDF анализ</option>
          </select>
        </div>

        <div class="form-group">
          <label for="file">Файл *</label>
          <input
            type="file"
            id="file"
            name="file"
            accept="image/*,application/pdf"
            required
            disabled={creatingPost}
          />
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

        <button type="submit" class="submit-post-button" disabled={creatingPost}>
          {#if creatingPost}
            <Clock class="inline-icon" />
            Создание...
          {:else}
            <Plus class="inline-icon" />
            Создать пост
          {/if}
        </button>
      </form>
      </div>
    {/if}
  </div>

  <!-- Posts List -->
  <div class="posts-section">
    {#each data.posts as post}
      <div class="post-item" class:reviewed={post.reviews.length > 0}>
        <div class="post-header" on:click={() => togglePost(post.id)}>
          <div class="post-info">
            <button class="expand-button" on:click|stopPropagation={() => togglePost(post.id)}>
              {#if expandedPosts[post.id]}
                <ChevronDown />
              {:else}
                <ChevronRight />
              {/if}
            </button>
            <span class="post-icon">
              {#if post.type === 'image'}
                <ImageIcon />
              {:else}
                <Document />
              {/if}
            </span>
            <div class="post-details">
              <strong>{post.title}</strong>
              <span class="post-meta">{formatDate(post.createdAt)} • {post.type.toUpperCase()}</span>
            </div>
          </div>
          <div class="post-actions" on:click|stopPropagation>
            {#if post.type === 'image'}
              <a href={post.content} target="_blank" class="view-link">
                <Eye class="inline-icon" />
                Посмотреть фото
              </a>
            {:else if post.type === 'pdf'}
              <a href={post.content} target="_blank" class="view-link">
                <Document class="inline-icon" />
                Открыть PDF
              </a>
            {/if}
            {#if post.reviews.length > 0}
              <span class="status-badge reviewed">
                <Check class="inline-icon" />
                Проверено
              </span>
            {:else}
              <span class="status-badge pending">
                <Clock class="inline-icon" />
                Ожидает
              </span>
            {/if}
            <form
              method="POST"
              action="?/deletePost"
              use:enhance={({ formData }) => {
                if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
                  return () => {};
                }
                formData.append('postId', post.id);
                deleting[post.id] = true;

                return async ({ result, update }) => {
                  deleting[post.id] = false;

                  if (result.type === 'failure') {
                    alert('Ошибка удаления поста: ' + (result.data?.error || 'Неизвестная ошибка'));
                  }

                  await update();
                };
              }}
            >
              <button type="submit" class="delete-post-button" disabled={deleting[post.id]}>
                {#if deleting[post.id]}
                  <Clock class="inline-icon" />
                {:else}
                  <Trash class="inline-icon" />
                {/if}
              </button>
            </form>
          </div>
        </div>

        {#if expandedPosts[post.id]}

        <!-- Preview for images -->
        {#if post.type === 'image'}
          <div class="image-gallery">
            {#if post.photos && post.photos.length > 0}
              {#each post.photos as photo}
                <div class="image-preview">
                  <img src={photo} alt={post.title} />
                </div>
              {/each}
            {:else}
              <div class="image-preview">
                <img src={post.content} alt={post.title} />
              </div>
            {/if}
          </div>

          {#if post.description}
            <div class="post-description">
              <strong>Описание:</strong>
              <p>{post.description}</p>
            </div>
          {/if}

          <!-- Analyze food button for images -->
          <form
            method="POST"
            action="?/analyzeFood"
            class="extract-form"
            use:enhance={({ formData }) => {
              console.log('=== Analyze food form submitted ===');
              console.log('Post ID:', post.id);
              formData.append('postId', post.id);
              analyzing[post.id] = true;

              return async ({ result, update }) => {
                console.log('=== Analyze food response received ===');
                console.log('Result type:', result.type);
                console.log('Result data:', result);
                analyzing[post.id] = false;

                if (result.type === 'failure') {
                  console.error('Analysis failed:', result.data);
                  alert('Ошибка анализа еды: ' + (result.data?.error || 'Неизвестная ошибка'));
                } else if (result.type === 'success') {
                  console.log('Analysis successful!');
                }

                await update();
              };
            }}
          >
            <button type="submit" class="extract-button" disabled={analyzing[post.id] || hasFoodAnalysis(post)}>
              {#if analyzing[post.id]}
                <Clock class="inline-icon" />
                Анализ еды...
              {:else if hasFoodAnalysis(post)}
                <Check class="inline-icon" />
                Еда проанализирована
              {:else}
                <Food class="inline-icon" />
                Анализировать еду
              {/if}
            </button>
          </form>

          <!-- Display food analysis data -->
          {#if hasFoodAnalysis(post)}
            <div class="extracted-data">
              <div class="extracted-header">
                <h4 class="extracted-title">
                  <Food class="inline-icon" />
                  Пищевая ценность
                </h4>
                <form
                  method="POST"
                  action="?/deleteExtractedData"
                  use:enhance={({ formData }) => {
                    console.log('=== Delete food analysis form submitted ===');
                    formData.append('postId', post.id);
                    deleting[post.id] = true;

                    return async ({ result, update }) => {
                      console.log('=== Delete response received ===');
                      console.log('Result:', result);
                      deleting[post.id] = false;

                      if (result.type === 'failure') {
                        console.error('Delete failed:', result.data);
                        alert('Ошибка удаления данных: ' + (result.data?.error || 'Неизвестная ошибка'));
                      } else if (result.type === 'success') {
                        console.log('Delete successful!');
                      }

                      await update();
                    };
                  }}
                >
                  <button type="submit" class="delete-extracted-button" disabled={deleting[post.id]}>
                    {#if deleting[post.id]}
                      <Clock class="inline-icon" />
                      Удаление...
                    {:else}
                      <Trash class="inline-icon" />
                      Удалить данные
                    {/if}
                  </button>
                </form>
              </div>

              {#if post.extractedData.foodName}
                <div class="test-info">
                  <div class="info-row">
                    <strong>Блюдо:</strong>
                    <span>{post.extractedData.foodName}</span>
                  </div>
                </div>
              {/if}

              <div class="macros-grid">
                <div class="macro-card protein">
                  <div class="macro-label">Белки</div>
                  <div class="macro-value">{post.extractedData.macros.protein}г</div>
                </div>
                <div class="macro-card carbs">
                  <div class="macro-label">Углеводы</div>
                  <div class="macro-value">{post.extractedData.macros.carbs}г</div>
                </div>
                <div class="macro-card fats">
                  <div class="macro-label">Жиры</div>
                  <div class="macro-value">{post.extractedData.macros.fats}г</div>
                </div>
                <div class="macro-card calories">
                  <div class="macro-label">Калории</div>
                  <div class="macro-value">{post.extractedData.macros.calories} ккал</div>
                </div>
              </div>

              {#if post.extractedData.summary}
                <div class="summary-box">
                  <strong>Описание:</strong>
                  <p>{post.extractedData.summary}</p>
                </div>
              {/if}
            </div>
          {/if}
        {:else if post.type === 'pdf'}
          <!-- Extract button for PDFs -->
          <form
            method="POST"
            action="?/extractPDF"
            class="extract-form"
            use:enhance={({ formData }) => {
              console.log('=== Extract form submitted ===');
              console.log('Post ID:', post.id);
              formData.append('postId', post.id);
              extracting[post.id] = true;

              return async ({ result, update }) => {
                console.log('=== Extract form response received ===');
                console.log('Result type:', result.type);
                console.log('Result data:', result);
                extracting[post.id] = false;

                if (result.type === 'failure') {
                  console.error('Extraction failed:', result.data);
                  alert('Ошибка извлечения данных: ' + (result.data?.error || 'Неизвестная ошибка'));
                } else if (result.type === 'success') {
                  console.log('Extraction successful!');
                }

                await update();
              };
            }}
          >
            <button type="submit" class="extract-button" disabled={extracting[post.id] || hasExtractedData(post)}>
              {#if extracting[post.id]}
                <Clock class="inline-icon" />
                Извлечение данных...
              {:else if hasExtractedData(post)}
                <Check class="inline-icon" />
                Данные извлечены
              {:else}
                <Search class="inline-icon" />
                Извлечь данные анализов
              {/if}
            </button>
          </form>

          <!-- Display extracted data -->
          {#if hasExtractedData(post)}
            <div class="extracted-data">
              <div class="extracted-header">
                <h4 class="extracted-title">
                  <BarChart class="inline-icon" />
                  Извлеченные данные анализов
                </h4>
                <form
                  method="POST"
                  action="?/deleteExtractedData"
                  use:enhance={({ formData }) => {
                    console.log('=== Delete extracted data form submitted ===');
                    formData.append('postId', post.id);
                    deleting[post.id] = true;

                    return async ({ result, update }) => {
                      console.log('=== Delete response received ===');
                      console.log('Result:', result);
                      deleting[post.id] = false;

                      if (result.type === 'failure') {
                        console.error('Delete failed:', result.data);
                        alert('Ошибка удаления данных: ' + (result.data?.error || 'Неизвестная ошибка'));
                      } else if (result.type === 'success') {
                        console.log('Delete successful!');
                      }

                      await update();
                    };
                  }}
                >
                  <button type="submit" class="delete-extracted-button" disabled={deleting[post.id]}>
                    {#if deleting[post.id]}
                      <Clock class="inline-icon" />
                      Удаление...
                    {:else}
                      <Trash class="inline-icon" />
                      Удалить данные
                    {/if}
                  </button>
                </form>
              </div>

              <div class="test-info">
                <div class="info-row">
                  <strong>Название теста:</strong>
                  <span>{post.extractedData.testName}</span>
                </div>
                <div class="info-row">
                  <strong>Дата:</strong>
                  <span>{post.extractedData.testDate}</span>
                </div>
                {#if post.extractedData.patientInfo}
                  {#if post.extractedData.patientInfo.name}
                    <div class="info-row">
                      <strong>Пациент:</strong>
                      <span>{post.extractedData.patientInfo.name}</span>
                    </div>
                  {/if}
                {/if}
              </div>

              {#if post.extractedData.summary}
                <div class="summary-box">
                  <strong>Краткое резюме:</strong>
                  <p>{post.extractedData.summary}</p>
                </div>
              {/if}

              <div class="results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Показатель</th>
                      <th>Значение</th>
                      <th>Норма</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each post.extractedData.results as result}
                      <tr>
                        <td class="result-name">{result.name}</td>
                        <td class="result-value">{result.value} {result.unit}</td>
                        <td class="result-range">{result.referenceRange}</td>
                        <td class="result-status">
                          <span class="status-badge" style="color: {getStatusColor(result.status)}">
                            {#if result.status === 'normal'}
                              Норма
                            {:else if result.status === 'high'}
                              Повышен
                            {:else if result.status === 'low'}
                              Понижен
                            {:else}
                              —
                            {/if}
                          </span>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {/if}
        {/if}

        <!-- Show existing reviews -->
        {#if post.reviews.length > 0}
          <div class="existing-reviews">
            <h4 class="reviews-title">История проверок ({post.reviews.length})</h4>
            {#each post.reviews as review, index}
              <div class="existing-review">
                <div class="review-content">
                  <small class="review-date">Проверка #{post.reviews.length - index} • {formatDate(review.createdAt)}</small>
                  <p>{getReviewText(review.reviewData)}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Add review form - always visible -->
        <form
          method="POST"
          action="?/addReview"
          class="review-form"
          use:enhance={({ formData }) => {
            formData.append('postId', post.id);
            loading[post.id] = true;

            return async ({ result, update }) => {
              loading[post.id] = false;
              if (result.type === 'success') {
                reviewTexts[post.id] = '';
              }
              await update();
            };
          }}
        >
          <textarea
            name="reviewText"
            bind:value={reviewTexts[post.id]}
            placeholder={post.reviews.length > 0 ? "Добавить дополнительный комментарий..." : "Введите заключение врача..."}
            required
            disabled={loading[post.id]}
            rows="3"
          ></textarea>
          <button type="submit" disabled={loading[post.id]}>
            {#if loading[post.id]}
              <Clock class="inline-icon" />
              Отправка...
            {:else if post.reviews.length > 0}
              <Plus class="inline-icon" />
              Добавить комментарий
            {:else}
              <Check class="inline-icon" />
              Отправить проверку
            {/if}
          </button>
        </form>
        {/if}
      </div>
    {/each}

    {#if data.posts.length === 0}
      <div class="empty-state">
        <p>У пользователя нет постов</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .user-detail-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    background: #f8f9fa;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

  .header {
    background: white;
    padding: 1.5rem 1.5rem 1.25rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border: 1px solid #e3e8ee;
  }

  .back-button {
    display: inline-block;
    color: #4CAF50;
    text-decoration: none;
    font-weight: 500;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    transition: color 0.15s ease;
  }

  .back-button:hover {
    color: #45a049;
  }

  .user-info h1 {
    margin: 0 0 0.25rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    letter-spacing: -0.01em;
  }

  .user-email {
    color: #6c757d;
    font-size: 0.875rem;
    font-weight: 400;
  }

  .user-info-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  .create-post-toggle-header {
    padding: 0.5rem 1rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
  }

  .create-post-toggle-header:hover {
    background: #45a049;
  }

  .questionnaire-toggle {
    padding: 0.5rem 1rem;
    background: transparent;
    color: #2196F3;
    border: 1px solid #e3e8ee;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .questionnaire-toggle:hover {
    background: #f8f9fa;
    border-color: #2196F3;
  }

  .questionnaire-section {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e3e8ee;
  }

  .questionnaire-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 1rem 0;
    letter-spacing: -0.01em;
  }

  .questionnaire-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.75rem;
  }

  .questionnaire-item {
    background: #f8f9fa;
    padding: 0.875rem 1rem;
    border-radius: 6px;
    border: 1px solid #e3e8ee;
  }

  .question-id {
    display: block;
    font-size: 0.75rem;
    color: #6c757d;
    margin-bottom: 0.375rem;
    font-weight: 500;
  }

  .question-answer {
    display: block;
    font-size: 0.875rem;
    color: #2c3e50;
    font-weight: 500;
  }

  .create-post-section {
    background: white;
    border: 1px solid #e3e8ee;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .create-post-form {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e3e8ee;
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
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid #e3e8ee;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.875rem;
    transition: border-color 0.15s ease;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #4CAF50;
  }

  .form-group textarea {
    resize: vertical;
  }

  .submit-post-button {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #4CAF50;
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

  .submit-post-button:hover:not(:disabled) {
    background: #45a049;
  }

  .submit-post-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .posts-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .post-item {
    background: white;
    border: 1px solid #e3e8ee;
    border-radius: 8px;
    padding: 1.25rem 1.5rem;
    transition: all 0.15s ease;
  }

  .post-item:hover {
    border-color: #c7cdd8;
  }

  .post-item.reviewed {
    border-color: #28a745;
    background: white;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    cursor: pointer;
  }

  .post-header:hover {
    opacity: 0.9;
  }

  .post-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .expand-button {
    background: transparent;
    border: 1px solid #e3e8ee;
    font-size: 0.625rem;
    cursor: pointer;
    padding: 0;
    color: #697386;
    transition: all 0.15s ease;
    line-height: 1;
    border-radius: 4px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .expand-button:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
    color: #2c3e50;
  }

  .post-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .view-link {
    padding: 0.375rem 0.75rem;
    background: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
    transition: all 0.15s ease;
    border: none;
    display: flex;
    align-items: center;
  }

  .view-link:hover {
    background: #0056b3;
  }

  .delete-post-button {
    padding: 0.375rem 0.625rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8125rem;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
  }

  .delete-post-button:hover:not(:disabled) {
    background: #c82333;
  }

  .delete-post-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .post-icon {
    display: flex;
    align-items: center;
    color: #6c757d;
  }

  :global(.inline-icon) {
    display: inline-block;
    vertical-align: middle;
    margin-right: 0.375rem;
  }

  .post-details strong {
    display: block;
    color: #2c3e50;
    margin-bottom: 0.25rem;
    font-weight: 600;
    font-size: 0.9375rem;
    letter-spacing: -0.01em;
  }

  .post-meta {
    font-size: 0.8125rem;
    color: #6c757d;
    font-weight: 400;
  }

  .status-badge {
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    display: flex;
    align-items: center;
  }

  .status-badge.reviewed {
    background: #d4edda;
    color: #155724;
  }

  .status-badge.pending {
    background: #fff3cd;
    color: #856404;
  }

  .existing-reviews {
    margin-top: 1rem;
  }

  .reviews-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.75rem 0;
    letter-spacing: -0.01em;
  }

  .existing-review {
    background: #e8f5e9;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 0.75rem;
    border-left: 4px solid #28a745;
  }

  .existing-review:last-child {
    margin-bottom: 1rem;
  }

  .review-content p {
    margin: 0.5rem 0 0 0;
    color: #2c3e50;
    line-height: 1.5;
    font-size: 0.875rem;
  }

  .review-date {
    color: #155724;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .image-gallery {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .image-preview {
    border-radius: 8px;
    overflow: hidden;
    background: #f8f9fa;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #e3e8ee;
  }

  .image-preview img {
    max-width: 100%;
    width: auto;
    height: auto;
    max-height: 400px;
    object-fit: contain;
    display: block;
  }

  .post-description {
    margin-top: 1rem;
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #e3e8ee;
  }

  .post-description strong {
    display: block;
    color: #6c757d;
    margin-bottom: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .post-description p {
    margin: 0;
    color: #2c3e50;
    line-height: 1.5;
    font-size: 0.875rem;
  }

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
    border-color: #4CAF50;
  }

  .review-form button {
    padding: 0.5rem 1rem;
    background: #4CAF50;
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

  .review-form button:hover:not(:disabled) {
    background: #45a049;
  }

  .review-form button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #6c757d;
    font-size: 0.9375rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e3e8ee;
  }

  .extract-form {
    margin-top: 1rem;
  }

  .extract-button {
    padding: 0.5rem 1rem;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .extract-button:hover:not(:disabled) {
    background: #1976D2;
  }

  .extract-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .extracted-data {
    margin-top: 1rem;
    background: #f8f9fa;
    padding: 1.25rem;
    border-radius: 8px;
    border: 1px solid #2196F3;
  }

  .extracted-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .extracted-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
  }

  .delete-extracted-button {
    padding: 0.375rem 0.75rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.8125rem;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
  }

  .delete-extracted-button:hover:not(:disabled) {
    background: #c82333;
  }

  .delete-extracted-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .test-info {
    background: white;
    padding: 0.875rem 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    border: 1px solid #e3e8ee;
  }

  .info-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .info-row:last-child {
    margin-bottom: 0;
  }

  .info-row strong {
    color: #6c757d;
    min-width: 110px;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .info-row span {
    color: #2c3e50;
    font-weight: 500;
    font-size: 0.8125rem;
  }

  .summary-box {
    background: #fff3cd;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    border-left: 4px solid #ffc107;
  }

  .summary-box strong {
    display: block;
    color: #856404;
    margin-bottom: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .summary-box p {
    margin: 0;
    color: #2c3e50;
    line-height: 1.5;
    font-size: 0.875rem;
  }

  .results-table {
    overflow-x: auto;
  }

  .results-table table {
    width: 100%;
    background: white;
    border-radius: 6px;
    border-collapse: collapse;
    overflow: hidden;
    border: 1px solid #e3e8ee;
  }

  .results-table th {
    background: #2196F3;
    color: white;
    padding: 0.625rem 0.75rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.75rem;
    border-bottom: 1px solid #e3e8ee;
  }

  .results-table td {
    padding: 0.75rem;
    border-bottom: 1px solid #e3e8ee;
    font-size: 0.875rem;
  }

  .results-table tbody tr:last-child td {
    border-bottom: none;
  }

  .results-table tbody tr:hover {
    background: #f8f9fa;
  }

  .result-name {
    font-weight: 500;
    color: #2c3e50;
  }

  .result-value {
    color: #2c3e50;
    font-weight: 600;
  }

  .result-range {
    color: #6c757d;
    font-size: 0.8125rem;
  }

  .result-status .status-badge {
    font-weight: 500;
    font-size: 0.75rem;
  }

  .macros-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .macro-card {
    background: white;
    padding: 1rem;
    border-radius: 6px;
    text-align: center;
    border: 2px solid;
    transition: all 0.15s ease;
  }

  .macro-card:hover {
    transform: translateY(-2px);
  }

  .macro-card.protein {
    border-color: #e91e63;
  }

  .macro-card.carbs {
    border-color: #ff9800;
  }

  .macro-card.fats {
    border-color: #4CAF50;
  }

  .macro-card.calories {
    border-color: #f44336;
  }

  .macro-label {
    font-size: 0.75rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .macro-value {
    font-size: 1.375rem;
    font-weight: 600;
    color: #2c3e50;
    letter-spacing: -0.01em;
  }

  .macro-card.protein .macro-value {
    color: #e91e63;
  }

  .macro-card.carbs .macro-value {
    color: #ff9800;
  }

  .macro-card.fats .macro-value {
    color: #4CAF50;
  }

  .macro-card.calories .macro-value {
    color: #f44336;
  }
</style>
