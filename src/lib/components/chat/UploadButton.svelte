<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	let isModalOpen = false;
	let uploadInputRef: HTMLInputElement | null = null;
	let buttonRef: HTMLDivElement | null = null;

	// Function to trigger the opening of the dialog box
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
	async function handleFileInputChange() {
		const input = uploadInputRef;
		if (input) input.click(); // Open the file picker
	}
	async function handleFileSelection(event) {
		const inputElement = event.target;
		const files = inputElement.files;

		if (files && files.length > 0) {
			const formData = new FormData();
			formData.append("file", files[0]); // Assuming you want to upload a single file

			try {
				const response = await fetch("http://localhost:3000/upload", {
					method: "POST",
					body: formData,
				});

				if (response.ok) {
					const data = await response.json();

					if (Array.isArray(data.extractedDocuments) && data.extractedDocuments.length > 0) {
						// Log the names of all extracted documents
						data.extractedDocuments.forEach((extractedDocument) => {
							console.log("Document name:", extractedDocument.name);

							// Dispatch an event to send the uploaded document data to the document table
							dispatch("documentUploaded", extractedDocument);
							console.log("Event dispatched");
						});
					} else if (data.name) {
						// Log the name of the uploaded document
						console.log("Document name:", data.name);

						// Dispatch an event to send the uploaded document data to the document table
						dispatch("documentUploaded", data);
						console.log("Event dispatched");
					} else {
						console.error("No extracted documents found in the response.");
					}
				} else {
					console.error("Error uploading file:", response.statusText);
				}
			} catch (error) {
				console.error("Error uploading file:", error);
			}
		}

		// Clear the file input value to allow selecting the same file again
		inputElement.value = "";
	}
</script>

<div class="relative">
	<!-- "+ Upload" button -->
	<button class="btn-upload-document" on:click={handleButtonClick} bind:this={buttonRef}>
		+
	</button>
	<!-- Modal for file upload -->
	<div class="modal" style="display: {isModalOpen ? 'block' : 'none'}; top: -80px; left: 0;">
		<div class="modal-content">
			<!-- Make "Upload File" text clickable -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<h2 style="cursor: pointer; margin-bottom: 10px;" on:click={handleFileInputChange}>
				Upload File
			</h2>
			<p>PDF, DOCX, ZIP</p>
		</div>
	</div>
</div>

<input
	type="file"
	id="file-upload-input"
	accept=".pdf,.doc,.docx,.txt, .zip"
	style="display: none;"
	bind:this={uploadInputRef}
	on:change={handleFileSelection}
/>

<style>
	/* Styles for your button */
	.btn-upload-document {
		cursor: pointer;
		background-color: #3490dc;
		color: #ffffff;
		padding: 6px 10px;
		border: none;
		border-radius: 4px;
		font-size: 18px;
	}

	.btn-upload-document:hover {
		background-color: #2779bd;
	}

	/* Smaller Modal Styles */
	.modal {
		display: none;
		position: absolute;
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
