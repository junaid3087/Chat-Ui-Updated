<!-- ChatInput.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from "svelte";

	export let value = "";
	export let minRows = 1;
	export let maxRows: null | number = null;
	export let placeholder = "";
	export let disabled = false;

	// Approximate width from which we disable autofocus
	const TABLET_VIEWPORT_WIDTH = 768;

	let innerWidth = 0;
	let textareaElement: HTMLTextAreaElement;
	let isModalOpen = false;
	let uploadInputRef: HTMLInputElement;

	const dispatch = createEventDispatcher<{ submit: void; fileUpload: File[] }>();

	$: minHeight = `${1 + minRows * 1.5}em`;
	$: maxHeight = maxRows ? `${1 + maxRows * 1.5}em` : `auto`;

	function handleKeydown(event: KeyboardEvent) {
		// submit on enter
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			dispatch("submit");
		}
	}

	// Function to trigger the opening of the dialogue box
	function handleButtonClick(event: MouseEvent) {
		// Prevent the click event from propagating to the document-level click handler
		event.stopPropagation();

		isModalOpen = true; // Open the modal dialog
	}

	// Function to close the modal dialog
	function closeModal() {
		isModalOpen = false;
	}

	// Function to handle file selection and upload
	function handleFileUpload() {
		const input = uploadInputRef;
		if (input) input.click(); // Open the file picker
	}

	function handleFileInputChange(event: Event) {
		const inputElement = event.target as HTMLInputElement;
		const files = inputElement.files;

		if (files && files.length > 0) {
			const fileList = Array.from(files); // Corrected syntax here
			dispatch("fileUpload", fileList);
		}

		// Clear the file input value to allow selecting the same file again
		inputElement.value = "";
	}

	// Function to handle clicks outside the modal (only in the browser environment)
	function clickOutsideHandler(event: MouseEvent) {
		const modal = document.querySelector(".modal");
		if (modal && !modal.contains(event.target as Node)) {
			closeModal();
		}
	}

	onMount(() => {
		if (innerWidth > TABLET_VIEWPORT_WIDTH) {
			textareaElement.focus();
		}

		// Add the click outside handler when the component is mounted (only in the browser environment)
		if (typeof window !== "undefined") {
			window.addEventListener("click", clickOutsideHandler);
		}
	});

	onDestroy(() => {
		// Cleanup the click outside handler when the component is destroyed (only in the browser environment)
		if (typeof window !== "undefined") {
			window.removeEventListener("click", clickOutsideHandler);
		}
	});
</script>

<svelte:window bind:innerWidth />

<div class="relative min-w-0 flex-1">
	<pre
		class="scrollbar-custom invisible overflow-x-hidden overflow-y-scroll whitespace-pre-wrap break-words p-3"
		aria-hidden="true"
		style="min-height: {minHeight}; max-height: {maxHeight}">{(value || " ") + "\n"}</pre>

	<textarea
		enterkeyhint="send"
		tabindex="0"
		rows="1"
		class="scrollbar-custom absolute top-0 m-0 h-full w-full resize-none scroll-p-3 overflow-x-hidden overflow-y-scroll border-0 bg-transparent p-3 outline-none focus:ring-0 focus-visible:ring-0"
		bind:value
		bind:this={textareaElement}
		{disabled}
		on:keydown={handleKeydown}
		on:keypress
		{placeholder}
	/>

	<!-- Add back the dialogue box code -->
	<div class="modal" style="display: {isModalOpen ? 'block' : 'none'}">
		<div class="modal-content">
			<!-- Make "Upload File" text clickable -->
			<h2 style="cursor: pointer; margin-bottom: 10px;" on:click={handleFileUpload}>Upload File</h2>
			<p>PDF, DOCX, ZIP</p>
			<!-- Remove the duplicate "Upload File" button -->
		</div>
	</div>
</div>

<input
	type="file"
	id="file-upload-input"
	accept=".pdf,.doc,.docx,.txt,.zip"
	style="display: none;"
	bind:this={uploadInputRef}
	on:change={handleFileInputChange}
/>

<style>
	pre,
	textarea {
		font-family: inherit;
		box-sizing: border-box;
		line-height: 1.5;
	}

	/* Position the button on the left side outside and adjacent to the container */

	/* Smaller Modal Styles */
	.modal {
		display: none;
		position: absolute;
		top: -80px;
		left: -10%;
		transform: translateX(-50%);
		width: 200px;
		background-color: #fff;
		border: 1px solid #ccc;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		border-radius: 10px; /* Make it rounder */
		z-index: 1;
	}

	.modal-content {
		padding: 10px;
		text-align: center;
		color: #999; /* Lighter font color */
		font-weight: lighter; /* Lighter font weight */
	}
</style>
