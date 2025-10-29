<script lang="ts">
    import { enhance } from "$app/forms";
    import { slide } from "svelte/transition";
    import type { PageData } from "./$types";
    import "$lib/styles/table.css";
    import "$lib/styles/forms.css";
    import "$lib/styles/buttons.css";
    import "$lib/styles/cards.css";
    import "$lib/styles/extracted-data.css";
    import ChevronRight from "$lib/components/icons/ChevronRight.svelte";
    import ChevronDown from "$lib/components/icons/ChevronDown.svelte";
    import Document from "$lib/components/icons/Document.svelte";
    import Search from "$lib/components/icons/Search.svelte";
    import Trash from "$lib/components/icons/Trash.svelte";
    import Check from "$lib/components/icons/Check.svelte";
    import Plus from "$lib/components/icons/Plus.svelte";
    import Clock from "$lib/components/icons/Clock.svelte";
    import Food from "$lib/components/icons/Food.svelte";
    import BarChart from "$lib/components/icons/BarChart.svelte";
    import TagSelect from "$lib/components/TagSelect.svelte";
    import TagFilters from "$lib/components/TagFilters.svelte";
    import CreatePostForm from "$lib/components/CreatePostForm.svelte";
    import AddReviewForm from "$lib/components/AddReviewForm.svelte";

    export let data: PageData;

    let reviewTexts: { [key: string]: string } = {};
    let loading: { [key: string]: boolean } = {};
    let extracting: { [key: string]: boolean } = {};
    let deleting: { [key: string]: boolean } = {};
    let analyzing: { [key: string]: boolean } = {};
    let expandedPosts: { [key: string]: boolean } = {};
    let showCreatePostForm = false;
    let creatingPost = false;
    let selectedTags: Set<string> = new Set();
    let editingPost: { [key: string]: boolean } = {};
    let editingReview: { [key: string]: boolean } = {};
    let editPostData: {
        [key: string]: { title: string; description: string };
    } = {};
    let editReviewText: { [key: string]: string } = {};

    // Helper function to determine post type from content
    function getPostType(post: any): "image" | "pdf" | "text" {
        if (post.photos && post.photos.length > 0) return "image";
        if (post.content) {
            if (post.content.toLowerCase().endsWith(".pdf")) return "pdf";
            return "image"; // Assume other content URLs are images
        }
        return "text"; // No content = text-only post
    }

    $: filteredPosts =
        selectedTags.size === 0
            ? data.posts
            : data.posts.filter((post) => {
                  if (!post.tag) return selectedTags.has("untagged");
                  return selectedTags.has(post.tag);
              });

    function formatDate(date: string | Date): string {
        return new Date(date).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getReviewText(reviewData: any): string {
        if (!reviewData) return "";
        if (typeof reviewData === "string") return reviewData;
        if (reviewData.text) return reviewData.text;
        return JSON.stringify(reviewData);
    }

    function hasExtractedData(post: any): boolean {
        return (
            post.extractedData &&
            typeof post.extractedData === "object" &&
            post.extractedData.results
        );
    }

    function hasFoodAnalysis(post: any): boolean {
        return (
            post.extractedData &&
            typeof post.extractedData === "object" &&
            post.extractedData.macros
        );
    }

    function togglePost(postId: string) {
        expandedPosts[postId] = !expandedPosts[postId];
    }

    function toggleTag(tag: string) {
        const newTags = new Set(selectedTags);
        if (newTags.has(tag)) {
            newTags.delete(tag);
        } else {
            newTags.add(tag);
        }
        selectedTags = newTags;
    }

    async function updatePostSettings(
        postId: string,
        settings: { tag?: string | null; commentsAllowed?: boolean },
    ) {
        try {
            const response = await fetch(`/api/posts/${postId}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                throw new Error("Failed to update post settings");
            }

            // Update local data
            const postIndex = data.posts.findIndex((p) => p.id === postId);
            if (postIndex !== -1) {
                if (settings.tag !== undefined) {
                    data.posts[postIndex].tag = settings.tag;
                }
                if (settings.commentsAllowed !== undefined) {
                    data.posts[postIndex].commentsAllowed =
                        settings.commentsAllowed;
                }
            }
        } catch (error) {
            console.error("Error updating post settings:", error);
            alert("Ошибка обновления настроек поста");
        }
    }
</script>

<svelte:head>
    <title>{data.user.name} - Admin Panel</title>
</svelte:head>

<div class="user-detail-container">
    <!-- Header with back button -->
    <div class="header">
        {#if showCreatePostForm}
            <button
                class="back-button"
                on:click={() => (showCreatePostForm = false)}
            >
                ← Назад к постам
            </button>
        {:else}
            <a href="/" class="back-button"> ← Назад к списку </a>
        {/if}
    </div>

    <!-- Unified Posts Management Card -->
    <div class="posts-management-card">
        <!-- User header section -->
        <div class="card-header">
            <div class="user-info">
                <h1>{data.user.name}</h1>
                <span class="user-email">{data.user.email}</span>
            </div>
            <div class="header-actions">
                <button
                    class="create-post-toggle-header"
                    on:click={() => (showCreatePostForm = !showCreatePostForm)}
                >
                    {#if showCreatePostForm}
                        Отменить
                    {:else}
                        <Plus class="inline-icon" />
                        Создать пост
                    {/if}
                </button>
                {#if data.user.questionnaire}
                    <a
                        href="/user/{data.user.id}/questionnaire"
                        class="questionnaire-button"
                    >
                        Анкета пользователя
                    </a>
                {/if}
            </div>
        </div>

        {#if showCreatePostForm}
            <CreatePostForm
                userId={data.user.id}
                onSuccess={() => (showCreatePostForm = false)}
            />
        {/if}

        <!-- Tag Filters -->
        <TagFilters
            {selectedTags}
            onToggle={toggleTag}
            onClear={() => (selectedTags = new Set())}
        />

        <!-- Posts List -->
        <table class="data-table posts-table">
            <thead>
                <tr>
                    <th style="width: 40px;"></th>
                    <th>Название</th>
                    <th>Дата</th>
                    <th>Тег</th>
                    <th>Статус</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredPosts as post}
                    <tr
                        class="expandable-row"
                        class:expanded={expandedPosts[post.id]}
                        class:reviewed={post.reviews.length > 0}
                        on:click={() => togglePost(post.id)}
                    >
                        <td on:click|stopPropagation>
                            <button
                                class="cell-expand-button"
                                on:click={() => togglePost(post.id)}
                            >
                                {#if expandedPosts[post.id]}
                                    <ChevronDown />
                                {:else}
                                    <ChevronRight />
                                {/if}
                            </button>
                        </td>
                        <td class="cell-primary">
                            <div class="post-title-cell">
                                <strong>{post.title}</strong>
                                {#if post.description}
                                    <span class="post-description-preview"
                                        >{post.description.substring(
                                            0,
                                            60,
                                        )}{post.description.length > 60
                                            ? "..."
                                            : ""}</span
                                    >
                                {/if}
                            </div>
                        </td>
                        <td class="cell-date">{formatDate(post.createdAt)}</td>
                        <td on:click|stopPropagation>
                            <TagSelect
                                id="tag-{post.id}"
                                value={post.tag}
                                onChange={(value) =>
                                    updatePostSettings(post.id, { tag: value })}
                                class="table-tag-select"
                            />
                        </td>
                        <td>
                            {#if post.reviews.some((r) => !r.isUserComment)}
                                <span class="table-status-badge normal">
                                    <Check class="inline-icon" />
                                    Проверено
                                </span>
                            {:else}
                                <span class="table-status-badge warning">
                                    <Clock class="inline-icon" />
                                    Ожидает
                                </span>
                            {/if}
                        </td>
                        <td on:click|stopPropagation>
                            <div class="table-actions">
                                {#if getPostType(post) === "pdf" && post.content}
                                    <a
                                        href={post.content}
                                        target="_blank"
                                        class="table-action-btn primary"
                                        title="Открыть PDF"
                                    >
                                        <Document />
                                    </a>
                                {/if}
                                <form
                                    method="POST"
                                    action="?/deletePost"
                                    style="display: inline;"
                                    use:enhance={({ formData }) => {
                                        if (
                                            !confirm(
                                                "Вы уверены, что хотите удалить этот пост?",
                                            )
                                        ) {
                                            return () => {};
                                        }
                                        formData.append("postId", post.id);
                                        deleting[post.id] = true;

                                        return async ({ result, update }) => {
                                            deleting[post.id] = false;

                                            if (result.type === "failure") {
                                                alert(
                                                    "Ошибка удаления поста: " +
                                                        (result.data?.error ||
                                                            "Неизвестная ошибка"),
                                                );
                                            }

                                            await update();
                                        };
                                    }}
                                >
                                    <button
                                        type="submit"
                                        class="table-action-btn danger"
                                        disabled={deleting[post.id]}
                                        title="Удалить"
                                    >
                                        {#if deleting[post.id]}
                                            <Clock />
                                        {:else}
                                            <Trash />
                                        {/if}
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>

                    {#if expandedPosts[post.id]}
                        <tr class="detail-row">
                            <td colspan="6">
                                <div
                                    class="detail-content"
                                    transition:slide={{ duration: 200 }}
                                >
                                    <!-- Edit Post Form -->
                                    {#if editingPost[post.id]}
                                        <div class="edit-post-section">
                                            <form
                                                method="POST"
                                                action="?/updatePost"
                                                use:enhance={({ formData }) => {
                                                    formData.append(
                                                        "postId",
                                                        post.id,
                                                    );
                                                    loading[post.id] = true;

                                                    return async ({
                                                        result,
                                                        update,
                                                    }) => {
                                                        loading[post.id] =
                                                            false;
                                                        if (
                                                            result.type ===
                                                            "success"
                                                        ) {
                                                            editingPost[
                                                                post.id
                                                            ] = false;
                                                        }
                                                        await update();
                                                    };
                                                }}
                                            >
                                                <div class="form-group">
                                                    <label
                                                        for="edit-title-{post.id}"
                                                        >Название:</label
                                                    >
                                                    <input
                                                        type="text"
                                                        id="edit-title-{post.id}"
                                                        name="title"
                                                        bind:value={
                                                            editPostData[
                                                                post.id
                                                            ].title
                                                        }
                                                        required
                                                        disabled={loading[
                                                            post.id
                                                        ]}
                                                    />
                                                </div>
                                                <div class="form-group">
                                                    <label
                                                        for="edit-description-{post.id}"
                                                        >Описание:</label
                                                    >
                                                    <textarea
                                                        id="edit-description-{post.id}"
                                                        name="description"
                                                        bind:value={
                                                            editPostData[
                                                                post.id
                                                            ].description
                                                        }
                                                        rows="3"
                                                        disabled={loading[
                                                            post.id
                                                        ]}
                                                    ></textarea>
                                                </div>
                                                <div class="edit-actions">
                                                    <button
                                                        type="submit"
                                                        class="save-button"
                                                        disabled={loading[
                                                            post.id
                                                        ]}
                                                    >
                                                        {#if loading[post.id]}
                                                            <Clock
                                                                class="inline-icon"
                                                            />
                                                            Сохранение...
                                                        {:else}
                                                            Сохранить
                                                        {/if}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        class="cancel-button"
                                                        on:click={() =>
                                                            (editingPost[
                                                                post.id
                                                            ] = false)}
                                                    >
                                                        Отмена
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    {/if}

                                    <!-- Show description first if no content -->
                                    {#if post.description && !editingPost[post.id]}
                                        <div class="post-description">
                                            <strong>Описание:</strong>
                                            <p class="formatted-text">
                                                {post.description}
                                            </p>
                                        </div>
                                    {/if}

                                    <!-- Preview for images -->
                                    {#if getPostType(post) === "image" && post.content}
                                        <div class="image-gallery">
                                            {#if post.photos && post.photos.length > 0}
                                                {#each post.photos as photo}
                                                    <a
                                                        href={photo}
                                                        target="_blank"
                                                        class="image-preview clickable"
                                                    >
                                                        <img
                                                            src={photo}
                                                            alt={post.title}
                                                        />
                                                    </a>
                                                {/each}
                                            {:else}
                                                <a
                                                    href={post.content}
                                                    target="_blank"
                                                    class="image-preview clickable"
                                                >
                                                    <img
                                                        src={post.content}
                                                        alt={post.title}
                                                    />
                                                </a>
                                            {/if}
                                        </div>

                                        <!-- Display food analysis data -->
                                        {#if hasFoodAnalysis(post)}
                                            <div class="extracted-data">
                                                <div class="extracted-header">
                                                    <h4 class="extracted-title">
                                                        <Food
                                                            class="inline-icon"
                                                        />
                                                        Пищевая ценность
                                                    </h4>
                                                    <form
                                                        method="POST"
                                                        action="?/deleteExtractedData"
                                                        use:enhance={({
                                                            formData,
                                                        }) => {
                                                            formData.append(
                                                                "postId",
                                                                post.id,
                                                            );
                                                            deleting[post.id] =
                                                                true;

                                                            return async ({
                                                                result,
                                                                update,
                                                            }) => {
                                                                deleting[
                                                                    post.id
                                                                ] = false;

                                                                if (
                                                                    result.type ===
                                                                    "failure"
                                                                ) {
                                                                    alert(
                                                                        "Ошибка удаления данных: " +
                                                                            (result
                                                                                .data
                                                                                ?.error ||
                                                                                "Неизвестная ошибка"),
                                                                    );
                                                                }

                                                                await update();
                                                            };
                                                        }}
                                                    >
                                                        <button
                                                            type="submit"
                                                            class="delete-extracted-button"
                                                            disabled={deleting[
                                                                post.id
                                                            ]}
                                                        >
                                                            {#if deleting[post.id]}
                                                                <Clock
                                                                    class="inline-icon"
                                                                />
                                                                Удаление...
                                                            {:else}
                                                                <Trash
                                                                    class="inline-icon"
                                                                />
                                                                Удалить данные
                                                            {/if}
                                                        </button>
                                                    </form>
                                                </div>

                                                {#if post.extractedData.foodName}
                                                    <div class="test-info">
                                                        <div class="info-row">
                                                            <strong
                                                                >Блюдо:</strong
                                                            >
                                                            <span
                                                                >{post
                                                                    .extractedData
                                                                    .foodName}</span
                                                            >
                                                        </div>
                                                    </div>
                                                {/if}

                                                <div class="macros-grid">
                                                    <div
                                                        class="macro-card protein"
                                                    >
                                                        <div
                                                            class="macro-label"
                                                        >
                                                            Белки
                                                        </div>
                                                        <div
                                                            class="macro-value"
                                                        >
                                                            {post.extractedData
                                                                .macros
                                                                .protein}г
                                                        </div>
                                                    </div>
                                                    <div
                                                        class="macro-card carbs"
                                                    >
                                                        <div
                                                            class="macro-label"
                                                        >
                                                            Углеводы
                                                        </div>
                                                        <div
                                                            class="macro-value"
                                                        >
                                                            {post.extractedData
                                                                .macros.carbs}г
                                                        </div>
                                                    </div>
                                                    <div
                                                        class="macro-card fats"
                                                    >
                                                        <div
                                                            class="macro-label"
                                                        >
                                                            Жиры
                                                        </div>
                                                        <div
                                                            class="macro-value"
                                                        >
                                                            {post.extractedData
                                                                .macros.fats}г
                                                        </div>
                                                    </div>
                                                    <div
                                                        class="macro-card calories"
                                                    >
                                                        <div
                                                            class="macro-label"
                                                        >
                                                            Калории
                                                        </div>
                                                        <div
                                                            class="macro-value"
                                                        >
                                                            {post.extractedData
                                                                .macros
                                                                .calories} ккал
                                                        </div>
                                                    </div>
                                                </div>

                                                {#if post.extractedData.summary}
                                                    <div class="summary-box">
                                                        <strong
                                                            >Описание:</strong
                                                        >
                                                        <p>
                                                            {post.extractedData
                                                                .summary}
                                                        </p>
                                                    </div>
                                                {/if}
                                            </div>
                                        {/if}
                                    {/if}

                                    {#if getPostType(post) === "pdf" && post.content}
                                        <!-- Extract button for PDFs -->
                                        <form
                                            method="POST"
                                            action="?/extractPDF"
                                            class="extract-form"
                                            use:enhance={({ formData }) => {
                                                formData.append(
                                                    "postId",
                                                    post.id,
                                                );
                                                extracting[post.id] = true;

                                                return async ({
                                                    result,
                                                    update,
                                                }) => {
                                                    extracting[post.id] = false;

                                                    if (
                                                        result.type ===
                                                        "failure"
                                                    ) {
                                                        alert(
                                                            "Ошибка извлечения данных: " +
                                                                (result.data
                                                                    ?.error ||
                                                                    "Неизвестная ошибка"),
                                                        );
                                                    }

                                                    await update();
                                                };
                                            }}
                                        >
                                            <button
                                                type="submit"
                                                class="extract-button"
                                                disabled={extracting[post.id] ||
                                                    hasExtractedData(post)}
                                            >
                                                {#if extracting[post.id]}
                                                    <Clock
                                                        class="inline-icon"
                                                    />
                                                    Извлечение данных...
                                                {:else if hasExtractedData(post)}
                                                    <Check
                                                        class="inline-icon"
                                                    />
                                                    Данные извлечены
                                                {:else}
                                                    <Search
                                                        class="inline-icon"
                                                    />
                                                    Извлечь данные анализов
                                                {/if}
                                            </button>
                                        </form>

                                        <!-- Display extracted data -->
                                        {#if hasExtractedData(post)}
                                            <div class="extracted-data">
                                                <div class="extracted-header">
                                                    <h4 class="extracted-title">
                                                        <BarChart
                                                            class="inline-icon"
                                                        />
                                                        Извлеченные данные анализов
                                                    </h4>
                                                    <form
                                                        method="POST"
                                                        action="?/deleteExtractedData"
                                                        use:enhance={({
                                                            formData,
                                                        }) => {
                                                            formData.append(
                                                                "postId",
                                                                post.id,
                                                            );
                                                            deleting[post.id] =
                                                                true;

                                                            return async ({
                                                                result,
                                                                update,
                                                            }) => {
                                                                deleting[
                                                                    post.id
                                                                ] = false;

                                                                if (
                                                                    result.type ===
                                                                    "failure"
                                                                ) {
                                                                    alert(
                                                                        "Ошибка удаления данных: " +
                                                                            (result
                                                                                .data
                                                                                ?.error ||
                                                                                "Неизвестная ошибка"),
                                                                    );
                                                                }

                                                                await update();
                                                            };
                                                        }}
                                                    >
                                                        <button
                                                            type="submit"
                                                            class="delete-extracted-button"
                                                            disabled={deleting[
                                                                post.id
                                                            ]}
                                                        >
                                                            {#if deleting[post.id]}
                                                                <Clock
                                                                    class="inline-icon"
                                                                />
                                                                Удаление...
                                                            {:else}
                                                                <Trash
                                                                    class="inline-icon"
                                                                />
                                                                Удалить данные
                                                            {/if}
                                                        </button>
                                                    </form>
                                                </div>

                                                <div class="test-info">
                                                    <div class="info-row">
                                                        <strong
                                                            >Название теста:</strong
                                                        >
                                                        <span
                                                            >{post.extractedData
                                                                .testName}</span
                                                        >
                                                    </div>
                                                    <div class="info-row">
                                                        <strong>Дата:</strong>
                                                        <span
                                                            >{post.extractedData
                                                                .testDate}</span
                                                        >
                                                    </div>
                                                    {#if post.extractedData.patientInfo}
                                                        {#if post.extractedData.patientInfo.name}
                                                            <div
                                                                class="info-row"
                                                            >
                                                                <strong
                                                                    >Пациент:</strong
                                                                >
                                                                <span
                                                                    >{post
                                                                        .extractedData
                                                                        .patientInfo
                                                                        .name}</span
                                                                >
                                                            </div>
                                                        {/if}
                                                    {/if}
                                                </div>

                                                {#if post.extractedData.summary}
                                                    <div class="summary-box">
                                                        <strong
                                                            >Краткое резюме:</strong
                                                        >
                                                        <p>
                                                            {post.extractedData
                                                                .summary}
                                                        </p>
                                                    </div>
                                                {/if}

                                                <div
                                                    class="results-table-wrapper"
                                                >
                                                    <table
                                                        class="data-table results-table"
                                                    >
                                                        <thead>
                                                            <tr>
                                                                <th
                                                                    >Показатель</th
                                                                >
                                                                <th>Значение</th
                                                                >
                                                                <th>Норма</th>
                                                                <th>Статус</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {#each post.extractedData.results as result}
                                                                <tr>
                                                                    <td
                                                                        class="cell-primary result-name"
                                                                        >{result.name}</td
                                                                    >
                                                                    <td
                                                                        class="result-value"
                                                                        >{result.value}
                                                                        {result.unit}</td
                                                                    >
                                                                    <td
                                                                        class="cell-secondary result-range"
                                                                        >{result.referenceRange}</td
                                                                    >
                                                                    <td
                                                                        class="result-status"
                                                                    >
                                                                        <span
                                                                            class="table-status-badge {result.status ===
                                                                            'normal'
                                                                                ? 'normal'
                                                                                : result.status ===
                                                                                        'high' ||
                                                                                    result.status ===
                                                                                        'low'
                                                                                  ? 'warning'
                                                                                  : ''}"
                                                                        >
                                                                            {#if result.status === "normal"}
                                                                                Норма
                                                                            {:else if result.status === "high"}
                                                                                Повышен
                                                                            {:else if result.status === "low"}
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
                                            <h4 class="reviews-title">
                                                Обсуждение ({post.reviews
                                                    .length})
                                            </h4>
                                            {#each post.reviews as review, index}
                                                <div
                                                    class="existing-review"
                                                    class:user-comment={review.isUserComment}
                                                >
                                                    {#if editingReview[review.id]}
                                                        <form
                                                            method="POST"
                                                            action="?/updateReview"
                                                            use:enhance={({
                                                                formData,
                                                            }) => {
                                                                formData.append(
                                                                    "reviewId",
                                                                    review.id,
                                                                );
                                                                loading[
                                                                    review.id
                                                                ] = true;

                                                                return async ({
                                                                    result,
                                                                    update,
                                                                }) => {
                                                                    loading[
                                                                        review.id
                                                                    ] = false;
                                                                    if (
                                                                        result.type ===
                                                                        "success"
                                                                    ) {
                                                                        editingReview[
                                                                            review.id
                                                                        ] =
                                                                            false;
                                                                    }
                                                                    await update();
                                                                };
                                                            }}
                                                        >
                                                            <textarea
                                                                name="reviewText"
                                                                bind:value={
                                                                    editReviewText[
                                                                        review
                                                                            .id
                                                                    ]
                                                                }
                                                                rows="4"
                                                                required
                                                                disabled={loading[
                                                                    review.id
                                                                ]}
                                                                class="edit-review-textarea"
                                                            ></textarea>
                                                            <div
                                                                class="edit-actions"
                                                            >
                                                                <button
                                                                    type="submit"
                                                                    class="save-button"
                                                                    disabled={loading[
                                                                        review
                                                                            .id
                                                                    ]}
                                                                >
                                                                    {#if loading[review.id]}
                                                                        <Clock
                                                                            class="inline-icon"
                                                                        />
                                                                        Сохранение...
                                                                    {:else}
                                                                        Сохранить
                                                                    {/if}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    class="cancel-button"
                                                                    on:click={() =>
                                                                        (editingReview[
                                                                            review.id
                                                                        ] =
                                                                            false)}
                                                                >
                                                                    Отмена
                                                                </button>
                                                            </div>
                                                        </form>
                                                    {:else}
                                                        <div
                                                            class="review-content"
                                                        >
                                                            <div
                                                                class="review-header-with-actions"
                                                            >
                                                                <small
                                                                    class="review-date"
                                                                >
                                                                    {#if review.isUserComment}
                                                                        👤
                                                                    {:else}
                                                                        👨‍⚕️
                                                                    {/if}
                                                                    {review.user
                                                                        ?.name ||
                                                                        review.reviewerName}
                                                                    • {formatDate(
                                                                        review.createdAt,
                                                                    )}
                                                                </small>
                                                                {#if !review.isUserComment}
                                                                    <button
                                                                        class="edit-review-button"
                                                                        on:click={() => {
                                                                            editingReview[
                                                                                review.id
                                                                            ] =
                                                                                true;
                                                                            editReviewText[
                                                                                review.id
                                                                            ] =
                                                                                getReviewText(
                                                                                    review.reviewData,
                                                                                );
                                                                        }}
                                                                    >
                                                                        Редактировать
                                                                    </button>
                                                                {/if}
                                                            </div>
                                                            <p
                                                                style="white-space: pre-wrap;"
                                                            >
                                                                {getReviewText(
                                                                    review.reviewData,
                                                                )}
                                                            </p>
                                                        </div>
                                                    {/if}
                                                </div>
                                            {/each}
                                        </div>
                                    {/if}

                                    <!-- Add review form - always visible -->
                                    <AddReviewForm
                                        postId={post.id}
                                        hasReviews={post.reviews.length > 0}
                                        loading={loading[post.id]}
                                        bind:reviewText={reviewTexts[post.id]}
                                        onUpdate={(text) =>
                                            (reviewTexts[post.id] = text)}
                                    />
                                </div>
                            </td>
                        </tr>
                    {/if}
                {/each}
            </tbody>
        </table>

        {#if data.posts.length === 0}
            <div class="table-empty-state">
                <p>У пользователя нет постов</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .user-detail-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
        background: #f8f9fa;
        min-height: 100vh;
        font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
    }

    .header {
        margin-bottom: 1.5rem;
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
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
    }

    .back-button:hover {
        background-color: #e9ecef;
    }

    /* Posts table specific styles */
    .post-title-cell {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .post-title-cell strong {
        font-weight: 600;
        color: #0f172a;
    }

    .post-description-preview {
        font-size: 0.75rem;
        color: #64748b;
        font-weight: 400;
    }

    .table-tag-select {
        padding: 0.25rem 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        background: white;
        font-size: 0.8125rem;
        cursor: pointer;
        transition: border-color 0.15s ease;
    }

    .table-tag-select:hover {
        border-color: #94a3b8;
    }

    .table-tag-select:focus {
        outline: none;
        border-color: #2563eb;
    }

    .table-actions {
        display: flex;
        align-items: center;
        gap: 0.375rem;
    }

    :global(.inline-icon) {
        display: inline-block;
        vertical-align: middle;
        margin-right: 0.25rem;
        width: 14px;
        height: 14px;
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
        border-left: 4px solid #4caf50;
    }

    .existing-review.user-comment {
        background: #f5f5f5;
        border-left-color: #9e9e9e;
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
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .user-comment .review-date {
        color: #666;
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

    .image-preview.clickable {
        cursor: pointer;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
    }

    .image-preview.clickable:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

    .formatted-text {
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .review-header-with-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
</style>
