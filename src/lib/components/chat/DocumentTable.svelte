<!-- DocumentTable.svelte -->
<script>
	import { onMount, onDestroy, createEventDispatcher } from "svelte";

	// Create a reactive variable to store the document data
	/**
	 * @type {any[]}
	 */
	let documentData = [];

	// Function to fetch documents from the server
	async function fetchDocuments() {
		try {
			// Fetch all documents from the server
			const response = await fetch("http://localhost:3000/documents");
			if (response.ok) {
				// Parse the response JSON
				documentData = await response.json();
			} else {
				console.error("Error fetching documents:", response.statusText);
			}
		} catch (error) {
			console.error("Error fetching documents:", error);
		}
	}

	// Function to delete a document
	/**
	 * @param {number} index
	 */
	async function deleteDocument(index) {
		const documentId = documentData[index]._id; // Replace "_id" with the actual MongoDB document ID field
		try {
			const response = await fetch(`/delete/${documentId}`, { method: "DELETE" });
			if (response.ok) {
				// Remove the deleted document from the documentData array
				documentData.splice(index, 1);
				// Trigger reactivity by updating the documentData array
				documentData = [...documentData];
			} else {
				console.error("Error deleting document:", response.statusText);
			}
		} catch (error) {
			console.error("Error deleting document:", error);
		}
	}

	// Event dispatcher to listen for the "documentUploaded" event
	const dispatch = createEventDispatcher();

	// Handle the "documentUploaded" event
	dispatch("documentUploaded", (/** @type {{ detail: any; }} */ event) => {
		// Add the uploaded document to the documentData array
		documentData.push(event.detail);
		// Trigger reactivity by updating the documentData array
		documentData = [...documentData];
	});

	// Call the fetchDocuments function when the component is mounted
	onMount(fetchDocuments);

	// Cleanup the click outside handler when the component is destroyed (only in the browser environment)
	onDestroy(() => {
		// Cleanup code here, if needed
	});
</script>

<!-- Render the documents in the table -->
<div>
	<table>
		<thead>
			<tr>
				<th>Doc</th>
				<th>Date</th>
				<th>Delete</th>
			</tr>
		</thead>
		<tbody>
			{#if documentData.length === 0}
				<tr>
					<td colspan="3" class="py-4 text-center"> No data available in the table </td>
				</tr>
			{:else}
				{#each documentData as document, index (document.name)}
					<tr>
						<td class="border px-3 py-2">{document.name}</td>
						<td class="border px-3 py-2">{document.date}</td>
						<td class="border px-3 py-2">
							<button on:click={() => deleteDocument(index)}>Delete</button>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
	<!-- Other content -->
</div>

<style>
	/* Add custom styles for the table cells */
	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 8px;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	th {
		background-color: #f2f2f2;
	}

	/* Darken the font color */
	td {
		color: #333; /* Darker font color */
	}

	button {
		background-color: transparent;
		border: none;
		cursor: pointer;
		color: #3490dc; /* Button color (you can adjust this as needed) */
	}
</style>
